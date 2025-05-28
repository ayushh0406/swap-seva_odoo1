"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsRight } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleComplete = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profile completed!",
        description: "Welcome to SwapSeva. Let's find your first barter match.",
      })
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-10">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to SwapSeva</h1>
          <p className="text-sm text-muted-foreground">Let's set up your profile to find the best barter matches</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Tell us about yourself so others know who they're bartering with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us a bit about yourself..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" placeholder="e.g., Teacher, Engineer, Artist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languages">Languages Spoken</Label>
              <Input id="languages" placeholder="e.g., Hindi, English, Tamil" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerings">What skills and goods can you offer?</Label>
              <Textarea id="offerings" placeholder="e.g., Guitar playing, Home-cooked meals, Web development, Used books" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerImage">Image (Optional)</Label>
              <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-4">
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="Upload"
                    width={100}
                    height={100}
                    className="rounded-md"
                  />
                  <Button variant="outline" size="sm">
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="kolkata">Kolkata</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleComplete} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? "Completing..." : "Complete Profile"}
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

