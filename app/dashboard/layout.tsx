"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Home, LogOut, Map, MessageSquare, Settings, Menu, UserCircle2, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { NotificationBell } from "../../components/notification-bell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if current path is trading related
  const isTradingPath = pathname?.includes('/dashboard/trading')

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    
    if (!storedUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive"
      })
      router.push("/login")
      return
    }
    
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router, toast])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex h-full flex-col gap-4 py-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt="SwapSeva Logo"
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                    <span className="text-xl font-bold">SwapSeva</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Home className="h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/trading/skills">
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start gap-2 ${pathname === '/dashboard/trading/skills' ? 'bg-accent' : ''}`}
                      >
                        <Briefcase className="h-5 w-5" />
                        Skills Barter
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/messages">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                      </Button>
                    
                    </Link>
                    <Link href="/dashboard/settings">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-auto">
                    <Link href="/logout">
                      <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
                        <LogOut className="h-5 w-5" />
                        Logout
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard">
              <div className="flex items-center gap-2">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="SwapSeva Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="text-xl font-bold hidden md:inline">SwapSeva</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ModeToggle />
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r px-4 md:flex">
          <div className="flex flex-col gap-1 py-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/dashboard/trading/skills">
              <Button 
                variant="ghost" 
                className={`w-full justify-start gap-2 ${pathname === '/dashboard/trading/skills' ? 'bg-accent' : ''}`}
              >
                <Briefcase className="h-5 w-5" />
                Skills Barter
              </Button>
            </Link>
            
            <Link href="/dashboard/messages">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </Button>
            </Link>
            
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
            
            <div className="mt-auto flex flex-col gap-1 py-2">
              <Link href="/logout">
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
