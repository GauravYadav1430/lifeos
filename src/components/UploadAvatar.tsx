"use client"

import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

export function UploadAvatar({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  return (
    <CldUploadWidget 
      uploadPreset="lifeos_avatars" // Configure this in Cloudinary dashboard
      onSuccess={(result) => {
        if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
          onUploadSuccess(result.info.secure_url)
        }
      }}
    >
      {({ open }) => {
        return (
          <Button variant="outline" size="sm" onClick={() => open()} className="gap-2">
            <Camera className="w-4 h-4" />
            Update Avatar
          </Button>
        )
      }}
    </CldUploadWidget>
  )
}
