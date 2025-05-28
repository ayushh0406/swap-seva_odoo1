"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, PlusCircle, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Basic info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  
  // Skills management
  const [skills, setSkills] = useState<Array<{title: string, description: string, level: string}>>([])
  const [currentSkill, setCurrentSkill] = useState({title: '', description: '', level: 'beginner'})
  
  // Goods management
  const [goods, setGoods] = useState<Array<{title: string, description: string, condition: string}>>([])
  const [currentGood, setCurrentGood] = useState({title: '', description: '', condition: 'good'})

  // Add a skill to the skills list
  const addSkill = () => {
    if (currentSkill.title.trim() === '') return
    
    setSkills([...skills, { ...currentSkill }])
    setCurrentSkill({title: '', description: '', level: 'beginner'})
  }

  // Remove a skill from the list
  const removeSkill = (index: number) => {
    const updatedSkills = [...skills]
    updatedSkills.splice(index, 1)
    setSkills(updatedSkills)
  }

  // Add a good to the goods list
  const addGood = () => {
    if (currentGood.title.trim() === '') return
    
    setGoods([...goods, { ...currentGood }])
    setCurrentGood({title: '', description: '', condition: 'good'})
  }

  // Remove a good from the list
  const removeGood = (index: number) => {
    const updatedGoods = [...goods]
    updatedGoods.splice(index, 1)
    setGoods(updatedGoods)
  }

  const handleSignup = async () => {
    setIsLoading(true)
    
    // Convert skills and goods to offerings format for backend
    const offerings = [
      ...skills.map(skill => ({
        type: 'skill',
        title: skill.title,
        description: skill.description,
        skillLevel: skill.level
      })),
      ...goods.map(good => ({
        type: 'good',
        title: good.title,
        description: good.description,
        condition: good.condition
      }))
    ]
    
    // Simplify the user data to match expected format
    const userData = {
      name,
      email,
      password,
      city,
      location: city ? {
        type: "Point",
        coordinates: [0, 0], // Default coordinates
        address: city
      } : undefined,
      offerings: offerings
    }

    try {
      console.log("Attempting signup with:", JSON.stringify(userData));
      
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
      
      const response = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData)
      })

      console.log("Signup response status:", response.status);
      const data = await response.json()
      console.log("Signup response data:", data);

      if (response.ok) {
        // Store user data in localStorage
        if (data.user && data.token) {
          // Store auth token for future authenticated requests
          localStorage.setItem("authToken", data.token);
          
          // Store user details
          localStorage.setItem("user", JSON.stringify({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar
          }));
        }
        
        toast({
          title: "Signup Successful!",
          description: "Your account has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Signup Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the server. Please make sure the backend is running.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-10">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
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
          <h1 className="text-2xl font-semibold tracking-tight">Create your SwapSeva account</h1>
          <p className="text-sm text-muted-foreground">Join India's largest barter community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">City</Label>
              <Input 
                id="location" 
                placeholder="Mumbai" 
                value={city}
                onChange={(e) => setCity(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-3 border p-3 rounded-md">
              <h3 className="font-medium">Skills You Can Offer</h3>
              
              {/* Display added skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                      {skill.title} ({skill.level})
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full p-0 ml-1" 
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add new skill form */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="skillName">Skill Name</Label>
                    <Input
                      id="skillName"
                      placeholder="e.g., Guitar playing"
                      value={currentSkill.title}
                      onChange={(e) => setCurrentSkill({...currentSkill, title: e.target.value})}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="skillLevel">Level</Label>
                    <Select 
                      value={currentSkill.level} 
                      onValueChange={(value) => setCurrentSkill({...currentSkill, level: value})}
                    >
                      <SelectTrigger id="skillLevel">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="skillDescription">Skill Details</Label>
                  <Textarea
                    id="skillDescription"
                    placeholder="Describe your skill, experience level, etc."
                    value={currentSkill.description}
                    onChange={(e) => setCurrentSkill({...currentSkill, description: e.target.value})}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2" 
                  onClick={addSkill}
                  disabled={!currentSkill.title.trim()}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            </div>

            {/* Goods Section */}
            <div className="space-y-3 border p-3 rounded-md">
              <h3 className="font-medium">Goods You Can Offer</h3>
              
              {/* Display added goods */}
              {goods.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {goods.map((good, index) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                      {good.title} ({good.condition})
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full p-0 ml-1" 
                        onClick={() => removeGood(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add new good form */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="goodName">Item Name</Label>
                    <Input
                      id="goodName"
                      placeholder="e.g., Used books"
                      value={currentGood.title}
                      onChange={(e) => setCurrentGood({...currentGood, title: e.target.value})}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="goodCondition">Condition</Label>
                    <Select 
                      value={currentGood.condition} 
                      onValueChange={(value) => setCurrentGood({...currentGood, condition: value})}
                    >
                      <SelectTrigger id="goodCondition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="goodDescription">Item Details</Label>
                  <Textarea
                    id="goodDescription"
                    placeholder="Describe the item, quantity, etc."
                    value={currentGood.description}
                    onChange={(e) => setCurrentGood({...currentGood, description: e.target.value})}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2" 
                  onClick={addGood}
                  disabled={!currentGood.title.trim()}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

