import { Sidebar } from "@/components/Sidebar";
import { GamificationProvider } from "@/components/gamification/GamificationProvider";
import { AuthSyncProvider } from "@/components/auth/AuthSyncProvider";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  let xp = 0;
  let level = 1;

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
      });
      if (user) {
        xp = user.xp;
        level = user.level;
      }
    } catch {
      // User might not exist yet if webhook is delayed — AuthSyncProvider handles this
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AuthSyncProvider>
          <GamificationProvider initialXp={xp} initialLevel={level}>
            {children}
          </GamificationProvider>
        </AuthSyncProvider>
      </main>
    </div>
  );
}
