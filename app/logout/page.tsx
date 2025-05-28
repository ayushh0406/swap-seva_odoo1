"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })
        
        if (response.ok) {
          // Clear any client-side storage if needed
          localStorage.removeItem("user")
          sessionStorage.removeItem("user")
          
          toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
          })
        } else {
          throw new Error("Logout failed")
        }
      } catch (error) {
        console.error("Logout error:", error)
        toast({
          title: "Logout failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      } finally {
        // Always redirect to login page
        router.push("/login")
      }
    }
    
    handleLogout()
  }, [router, toast])
  
  return null
} 