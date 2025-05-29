import { Home, User, Bell, LogOut, Search, MessageSquare } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"
import { NotificationBell } from "./notification-bell"
import { ChatNavigation } from "./chat-navigation"

const navItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Explore",
    href: "/dashboard/explore",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userId")
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-card">
        <div className="h-14 border-b flex items-center px-4">
          <span className="font-semibold">Mumbai Swap</span>
        </div>
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:pl-64 flex-1">
        {/* Top bar */}
        <div className="h-14 border-b flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="md:hidden font-semibold">Mumbai Swap</div>
          <div className="flex items-center gap-2">
            <ChatNavigation />
            <NotificationBell />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
} 