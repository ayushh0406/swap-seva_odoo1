"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const userStr = localStorage.getItem("user")

      if (!token || !userStr) {
        toast({
          title: "Authentication Required",
          description: "Please login to access admin panel",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Parse user data
      const userData: User = JSON.parse(userStr)

      // Check if user is admin
      if (userData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      // Verify token with backend
      console.log("Verifying token with backend...")
      const response = await fetch("http://localhost:3001/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      console.log("Auth response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Auth error:", errorText)
        throw new Error("Token invalid")
      }

      const data = await response.json()
      console.log("Auth data:", data)
      
      if (data.user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      setUser(data.user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Auth check failed:", error)
      toast({
        title: "Authentication Failed",
        description: "Please login again",
        variant: "destructive",
      })
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("authToken")
                localStorage.removeItem("user")
                router.push("/login")
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>
        {children}
      </main>
    </div>
  )
} 