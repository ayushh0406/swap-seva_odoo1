"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Filter, Search, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// User skill offer type
interface SkillOffer {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userLocation: string
  userTrustScore: number
  skillName: string
  skillCategory: string
  experience: string
  description: string
  completedTrades: number
}

export default function SkillsBarterPage() {
  const [skills, setSkills] = useState<SkillOffer[]>([])
  const [filteredSkills, setFilteredSkills] = useState<SkillOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Trade request state
  const [selectedSkill, setSelectedSkill] = useState<SkillOffer | null>(null)
  const [storageType, setStorageType] = useState<"local" | "blockchain">("local")
  
  // Add a state to control the dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Fetch skills data from backend database
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true)
        
        // Get user data from local storage
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("authToken")
        
        if (!storedUser || !token) {
          toast({
            title: "Authentication required",
            description: "Please log in to access the skills marketplace",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        // Get all users with skill offerings from their profile
        const response = await fetch("http://localhost:3001/api/users?hasSkillOfferings=true", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch skills data")
        }
        
        const data = await response.json()
        
        // Transform user offerings data into expected SkillOffer format
        const skillOffers: SkillOffer[] = []
        
        data.users.forEach(user => {
          const skillOfferings = user.offerings.filter(offering => offering.type === 'skill')
          
          skillOfferings.forEach(offering => {
            skillOffers.push({
              id: offering._id || `skill-${Math.random().toString(36).substr(2, 9)}`,
              userId: user._id,
              userName: user.name,
              userAvatar: user.avatar || "/placeholder.svg?height=80&width=80",
              userLocation: user.location?.address || "Location not specified",
              userTrustScore: user.trustScore || 80,
              skillName: offering.title,
              skillCategory: offering.category || "Other",
              experience: offering.experience || "Not specified",
              description: offering.description || "No description provided",
              completedTrades: user.completedTrades || 0
            })
          })
        })
        
        setSkills(skillOffers)
        setFilteredSkills(skillOffers)
      } catch (error) {
        console.error("Error fetching skills:", error)
        toast({
          title: "Error loading skills",
          description: "We couldn't load the skills marketplace. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSkills()
  }, [])
  
  // Filter skills based on search query and category
  useEffect(() => {
    let result = skills
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        skill => 
          skill.skillName.toLowerCase().includes(query) ||
          skill.userName.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.userLocation.toLowerCase().includes(query)
      )
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(skill => skill.skillCategory === selectedCategory)
    }
    
    setFilteredSkills(result)
  }, [searchQuery, selectedCategory, skills])
  
  // Function to handle connecting with a skill provider
  const handleConnect = (skill: SkillOffer) => {
    setSelectedSkill(skill)
    setDialogOpen(true)
  }
  
  // Function to send a trade request
  const sendTradeRequest = async () => {
    console.log("sendTradeRequest called", selectedSkill)
    if (!selectedSkill) {
      console.log("No skill selected")
      return
    }
    
    try {
      const token = localStorage.getItem("authToken")
      console.log("Token:", token ? "Found" : "Not found")
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to send connection requests",
          variant: "destructive"
        })
        return
      }
      
      console.log("Sending request to:", `http://localhost:3001/api/users/connect`)
      console.log("Request data:", {
        recipientId: selectedSkill.userId,
        skillId: selectedSkill.id
      })
      
      // Send connection request with all user skills
      const response = await fetch("http://localhost:3001/api/users/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedSkill.userId,
          skillId: selectedSkill.id
        })
      })
      
      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const data = await response.json()
        console.error("Error response:", data)
        throw new Error(data.message || "Failed to send request")
      }
      
      const data = await response.json()
      console.log("Success response:", data)
      
      toast({
        title: "Trade Request Sent!",
        description: `Your request was sent to ${selectedSkill.userName} for ${selectedSkill.skillName}. You'll be notified when they respond.`,
      })
      
      // Close the dialog
      setDialogOpen(false)
      setSelectedSkill(null)
    } catch (error) {
      console.error("Send connection request error:", error)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to send the request. Please try again later.",
        variant: "destructive",
      })
    }
  }
  
  // Get unique categories for filter
  const categories = ["all", ...new Set(skills.map(skill => skill.skillCategory))]
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skills Barter</h1>
            <p className="text-muted-foreground">Find and connect with skilled individuals for your needs</p>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills, names, or locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Skills grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-20 w-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-lg font-medium">No skills found matching your criteria</p>
                <p className="text-center text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSkills.map((skill) => (
                  <Card key={skill.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Image
                          src={skill.userAvatar}
                          alt={skill.userName}
                          width={80}
                          height={80}
                          className="rounded-md"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{skill.userName}</h3>
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {skill.userTrustScore}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{skill.userLocation}</span>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {skill.skillName} <span className="text-muted-foreground">({skill.experience})</span>
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {skill.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Completed Trades:</span> {skill.completedTrades}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="w-full" onClick={() => handleConnect(skill)}>
                                  Connect
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Request Trade with {selectedSkill?.userName}</DialogTitle>
                                  <DialogDescription>
                                    Send a trade request for {selectedSkill?.skillName}. All your skills will be automatically shared with {selectedSkill?.userName} for them to choose from.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedSkill && (
                                  <div className="space-y-4 py-4">
                                    <div className="flex items-start gap-4">
                                      <Image
                                        src={selectedSkill.userAvatar}
                                        alt={selectedSkill.userName}
                                        width={60}
                                        height={60}
                                        className="rounded-md"
                                      />
                                      <div>
                                        <h4 className="font-medium">{selectedSkill.skillName}</h4>
                                        <p className="text-sm text-muted-foreground">{selectedSkill.description}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="rounded-md bg-muted p-3">
                                      <p className="text-sm">
                                        <span className="font-medium">Note:</span> When you send this request, all your skills will be shared with {selectedSkill.userName}. They will be able to select which skill they want in exchange.
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={sendTradeRequest}>
                                    Send Request
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button size="sm" variant="outline" className="w-full gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 