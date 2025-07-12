"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogIn, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      console.log("Attempting login with:", { email, isAdminLogin });
      
      // For debugging - test if the server is responding at all
      try {
        const testResponse = await fetch("http://localhost:3001/api/auth/status", {
          method: "GET",
          mode: "cors",
          headers: {
            "Accept": "application/json"
          }
        });
        console.log("Server status check:", testResponse.status, await testResponse.text());
      } catch (testError) {
        console.error("Server connection test failed:", testError);
      }
      
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
  
      console.log("Login response status:", response.status);
      const data = await response.json()
      console.log("Login response data:", data);
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
  
      // Store user data in localStorage for client-side access if needed
      localStorage.setItem("authToken", data.token);

      localStorage.setItem("user", JSON.stringify({
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: data.user.role
      }))
  
      toast({
        title: "Login successful!",
        description: isAdminLogin ? "Welcome to Admin Panel." : "Welcome back to SwapSeva.",
      })
  
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to connect to the server. Please make sure the backend is running.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminToggle = () => {
    setIsAdminLogin(!isAdminLogin)
    if (!isAdminLogin) {
      setEmail('admin@admin.com')
      setPassword('admin123')
    } else {
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="SwapSeva Logo"
              width={48}
              height={48}
              className="rounded-md"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isAdminLogin ? "Admin Login" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdminLogin 
              ? "Enter admin credentials to access the admin panel"
              : "Enter your credentials to sign in to your account"
            }
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isAdminLogin && <Shield className="h-5 w-5 text-red-500" />}
                {isAdminLogin ? "Admin Sign In" : "Sign In"}
              </CardTitle>
              <CardDescription>
                {isAdminLogin 
                  ? "Enter admin email and password to sign in"
                  : "Enter your email and password to sign in"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={isAdminLogin ? "admin@admin.com" : "john@example.com"}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isAdminLogin && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder={isAdminLogin ? "admin123" : ""}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"} 
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleAdminToggle}
              >
                {isAdminLogin ? "Switch to User Login" : "Switch to Admin Login"}
                <Shield className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {!isAdminLogin && (
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

