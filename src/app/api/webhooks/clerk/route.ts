import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    const wh = new Webhook(SIGNING_SECRET)
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new NextResponse('Error: Verification error', { status: 400 })
  }

  const { id } = evt.data
  const eventType = evt.type

  // --- USER CREATED ---
  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name, image_url } = evt.data

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new NextResponse('Error: Missing required user data', { status: 400 })
    }

    const email = email_addresses[0].email_address
    const name = `${first_name || ''} ${last_name || ''}`.trim()

    try {
      // Idempotent upsert — retry-safe
      await prisma.user.upsert({
        where: { id: id },
        update: {
          email,
          name,
          avatarUrl: image_url,
        },
        create: {
          id: id,
          email,
          name,
          avatarUrl: image_url,
          onboardingComplete: false,
        },
      })
      console.log(`[Webhook] User ${id} created/synced successfully.`)
    } catch (error) {
      console.error('[Webhook] Error syncing user to database:', error)
      return new NextResponse('Error: Database sync failed', { status: 500 })
    }
  }

  // --- USER UPDATED ---
  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, image_url } = evt.data

    if (!id) {
      return new NextResponse('Error: Missing user ID', { status: 400 })
    }

    const email = email_addresses?.[0]?.email_address
    const name = `${first_name || ''} ${last_name || ''}`.trim()

    try {
      await prisma.user.upsert({
        where: { id: id },
        update: {
          ...(email && { email }),
          name,
          avatarUrl: image_url,
        },
        create: {
          id: id,
          email: email || '',
          name,
          avatarUrl: image_url,
          onboardingComplete: false,
        },
      })
      console.log(`[Webhook] User ${id} updated successfully.`)
    } catch (error) {
      console.error('[Webhook] Error updating user in database:', error)
      return new NextResponse('Error: Database update failed', { status: 500 })
    }
  }

  // --- USER DELETED ---
  if (eventType === 'user.deleted') {
    if (!id) {
      return new NextResponse('Error: Missing user ID', { status: 400 })
    }

    try {
      await prisma.user.delete({ where: { id } })
      console.log(`[Webhook] User ${id} deleted successfully.`)
    } catch {
      // User might not exist in our DB yet — that's fine
      console.log(`[Webhook] User ${id} not found for deletion, skipping.`)
    }
  }

  return new NextResponse('Webhook processed', { status: 200 })
}
