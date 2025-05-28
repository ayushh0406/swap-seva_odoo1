"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Filter, Search, MessageSquare, ShoppingBag, PlusCircle } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Item interface
interface GoodsItem {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userLocation: string
  userTrustScore: number
  itemName: string
  itemCategory: string
  condition: "new" | "like new" | "good" | "fair" | "poor"
  description: string
  images: string[]
  estimatedValue: string
  lookingFor: string
  completedTrades: number
}

export default function GoodsBarterPage() {
  const [items, setItems] = useState<GoodsItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GoodsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  
  // Trade request state
  const [selectedItem, setSelectedItem] = useState<GoodsItem | null>(null)
  
  // Add a state to control the dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Fetch items data from the backend database
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true)
        
        // Get user data from local storage
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("authToken")
        
        if (!storedUser || !token) {
          toast({
            title: "Authentication required",
            description: "Please log in to access the marketplace",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        // Get all users with goods offerings from their profile
        const response = await fetch("http://localhost:3001/api/users?hasGoodOfferings=true", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch goods data")
        }
        
        const data = await response.json()
        
        // Transform user offerings data into expected GoodsItem format
        const goodsItems: GoodsItem[] = []
        
        data.users.forEach(user => {
          const goodsOfferings = user.offerings.filter(offering => offering.type === 'good')
          
          goodsOfferings.forEach(offering => {
            goodsItems.push({
              id: offering._id || `offering-${Math.random().toString(36).substr(2, 9)}`,
              userId: user._id,
              userName: user.name,
              userAvatar: user.avatar || "/placeholder.svg?height=80&width=80",
              userLocation: user.location?.address || "Location not specified",
              userTrustScore: user.trustScore || 80,
              itemName: offering.title,
              itemCategory: offering.category || "Other",
              condition: offering.condition || "good",
              description: offering.description || "No description provided",
              images: offering.images?.length > 0 ? offering.images : ["/placeholder.svg?height=200&width=300"],
              estimatedValue: offering.estimatedValue || "Price not specified",
              lookingFor: offering.lookingFor || "Open to offers",
              completedTrades: user.completedTrades || 0
            })
          })
        })
        
        setItems(goodsItems)
        setFilteredItems(goodsItems)
      } catch (error) {
        console.error("Error fetching goods items:", error)
        toast({
          title: "Error loading goods",
          description: "We couldn't load the marketplace items. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchItems()
  }, [])
  
  // Filter items based on search query, category and condition
  useEffect(() => {
    let result = items
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        item => 
          item.itemName.toLowerCase().includes(query) ||
          item.userName.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.userLocation.toLowerCase().includes(query) ||
          item.lookingFor.toLowerCase().includes(query)
      )
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(item => item.itemCategory === selectedCategory)
    }
    
    // Apply condition filter
    if (selectedCondition !== "all") {
      result = result.filter(item => item.condition === selectedCondition)
    }
    
    setFilteredItems(result)
  }, [searchQuery, selectedCategory, selectedCondition, items])
  
  // Function to handle connecting with an item owner
  const handleConnect = (item: GoodsItem) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }
  
  // Function to send a trade request
  const sendTradeRequest = async () => {
    console.log("sendTradeRequest called", selectedItem)
    if (!selectedItem) {
      console.log("No item selected")
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
        recipientId: selectedItem.userId,
        skillId: selectedItem.id
      })
      
      // Send connection request with all user goods
      const response = await fetch("http://localhost:3001/api/users/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedItem.userId,
          skillId: selectedItem.id // We're reusing the same endpoint for both skills and goods
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
        description: `Your request was sent to ${selectedItem.userName} for the ${selectedItem.itemName}. You'll be notified when they respond.`,
      })
      
      // Close the dialog
      setDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Send connection request error:", error)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to send the request. Please try again later.",
        variant: "destructive",
      })
    }
  }
  
  // Get unique categories and conditions for filters
  const categories = ["all", ...new Set(items.map(item => item.itemCategory))]
  const conditions = ["all", "new", "like new", "good", "fair", "poor"]
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goods Barter</h1>
            <p className="text-muted-foreground">Trade physical items with other users in your community</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                List My Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>List a New Item for Trade</DialogTitle>
                <DialogDescription>
                  Add details about your item to find potential trading partners
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input id="itemName" placeholder="What are you offering?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemCategory">Category</Label>
                    <Select>
                      <SelectTrigger id="itemCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Item condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your item in detail - brand, model, age, any special features or flaws" 
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
                  <Input id="estimatedValue" placeholder="Approximate market value" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lookingFor">What are you looking for?</Label>
                  <Textarea 
                    id="lookingFor" 
                    placeholder="Describe what you'd like to trade this item for" 
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Images</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-2">
                      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                        <PlusCircle className="h-6 w-6" />
                        <span>Add Photo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>List Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, users, or locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[150px]">
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
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition === "all" ? "Any Condition" : condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Items grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-[200px] w-full rounded-md" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-lg font-medium">No items found matching your criteria</p>
                <p className="text-center text-muted-foreground">Try adjusting your search or filters</p>
                <Button variant="outline" className="mt-4">List Your Own Item</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                    <div className="relative h-[200px] w-full overflow-hidden">
                      <Image
                        src={item.images[0]}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-white text-primary">{item.condition}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{item.itemName}</h3>
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {item.userTrustScore}/100
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Image
                              src={item.userAvatar}
                              alt={item.userName}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{item.userName}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.userLocation}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Est. Value: {item.estimatedValue}</span>
                          <span className="text-xs text-muted-foreground">{item.completedTrades} trades completed</span>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Looking for: <span className="text-primary">{item.lookingFor}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full" onClick={() => handleConnect(item)}>
                                Make Offer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Make an Offer for {selectedItem?.itemName}</DialogTitle>
                                <DialogDescription>
                                  Send a trade request to {selectedItem?.userName}. You'll be able to chat once they accept.
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedItem && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="relative h-[120px] overflow-hidden rounded-md">
                                      <Image
                                        src={selectedItem.images[0]}
                                        alt={selectedItem.itemName}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{selectedItem.itemName}</h4>
                                      <p className="text-sm text-muted-foreground">{selectedItem.description.substring(0, 100)}...</p>
                                      <p className="mt-1 text-sm font-medium">Est. Value: {selectedItem.estimatedValue}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Select your item to offer</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose one of your listed items" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="item1">Laptop (Est. ₹35,000)</SelectItem>
                                        <SelectItem value="item2">Bluetooth Speakers (Est. ₹8,000)</SelectItem>
                                        <SelectItem value="item3">Fitness Watch (Est. ₹12,000)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Additional notes</Label>
                                    <Textarea placeholder="Add any other details about your offer..." rows={3} />
                                  </div>
                                </div>
                              )}
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={sendTradeRequest}>
                                  Send Offer
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