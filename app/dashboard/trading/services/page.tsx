"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Filter, Search, MessageSquare, Clock, PlusCircle, Calendar, CheckCircle } from "lucide-react"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

// Service interface
interface ServiceOffer {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userLocation: string
  userTrustScore: number
  serviceTitle: string
  serviceCategory: string
  hourlyRate: string
  estimatedHours: number
  description: string
  availability: string[]
  skills: string[]
  portfolio: string[]
  completedProjects: number
}

export default function ServicesBarterPage() {
  const [services, setServices] = useState<ServiceOffer[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRateRange, setSelectedRateRange] = useState<[number, number]>([0, 5000])
  
  // Trade request state
  const [selectedService, setSelectedService] = useState<ServiceOffer | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [storageType, setStorageType] = useState<"local" | "blockchain">("local")
  
  // Fetch services data - in a real app, this would be an API call
  useEffect(() => {
    // Simulate API call with timeout
    const fetchServices = async () => {
      try {
        // In a real app, this would be an API fetch
        setTimeout(() => {
          // Mock data
          const mockServices: ServiceOffer[] = [
            {
              id: "service-1",
              userId: "user-1",
              userName: "Amit Desai",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Mumbai, Maharashtra",
              userTrustScore: 98,
              serviceTitle: "Web Development",
              serviceCategory: "Development",
              hourlyRate: "₹1,500",
              estimatedHours: 10,
              description: "Full-stack web developer specializing in React, Node.js, and MongoDB. I can build responsive websites, web applications, and ecommerce solutions.",
              availability: ["Weekdays", "Evenings"],
              skills: ["React", "Node.js", "MongoDB", "TypeScript", "Responsive Design"],
              portfolio: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
              completedProjects: 24
            },
            {
              id: "service-2",
              userId: "user-2",
              userName: "Neha Sharma",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Bangalore, Karnataka",
              userTrustScore: 96,
              serviceTitle: "Graphic Design",
              serviceCategory: "Design",
              hourlyRate: "₹1,200",
              estimatedHours: 5,
              description: "Professional graphic designer with expertise in brand identity, logo design, social media graphics, and marketing materials.",
              availability: ["Weekends", "Evenings"],
              skills: ["Photoshop", "Illustrator", "Logo Design", "Brand Identity", "Print Design"],
              portfolio: ["/placeholder.svg?height=200&width=300"],
              completedProjects: 37
            },
            {
              id: "service-3",
              userId: "user-3",
              userName: "Rajesh Patel",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Ahmedabad, Gujarat",
              userTrustScore: 94,
              serviceTitle: "Financial Consulting",
              serviceCategory: "Finance",
              hourlyRate: "₹2,500",
              estimatedHours: 3,
              description: "Certified financial advisor offering services in investment planning, tax optimization, retirement planning, and wealth management.",
              availability: ["Weekdays", "Mornings"],
              skills: ["Financial Planning", "Investment Analysis", "Tax Planning", "Retirement Planning"],
              portfolio: ["/placeholder.svg?height=200&width=300"],
              completedProjects: 18
            },
            {
              id: "service-4",
              userId: "user-4",
              userName: "Priya Mehta",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Delhi, NCR",
              userTrustScore: 92,
              serviceTitle: "Content Writing",
              serviceCategory: "Writing",
              hourlyRate: "₹800",
              estimatedHours: 8,
              description: "Professional content writer specializing in blog posts, articles, website copy, and social media content. SEO optimization included.",
              availability: ["Weekdays", "Weekends", "Flexible"],
              skills: ["SEO Writing", "Blog Posts", "Copywriting", "Research", "Editing"],
              portfolio: ["/placeholder.svg?height=200&width=300"],
              completedProjects: 52
            },
            {
              id: "service-5",
              userId: "user-5",
              userName: "Vikram Kapoor",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Pune, Maharashtra",
              userTrustScore: 95,
              serviceTitle: "Mobile App Development",
              serviceCategory: "Development",
              hourlyRate: "₹1,800",
              estimatedHours: 15,
              description: "Experienced mobile app developer with expertise in React Native and Flutter. I create cross-platform applications with stunning UI and performance.",
              availability: ["Weekdays", "Evenings"],
              skills: ["React Native", "Flutter", "iOS", "Android", "API Integration"],
              portfolio: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
              completedProjects: 16
            },
            {
              id: "service-6",
              userId: "user-6",
              userName: "Aisha Khan",
              userAvatar: "/placeholder.svg?height=80&width=80",
              userLocation: "Hyderabad, Telangana",
              userTrustScore: 93,
              serviceTitle: "Social Media Marketing",
              serviceCategory: "Marketing",
              hourlyRate: "₹1,000",
              estimatedHours: 10,
              description: "Social media marketing expert offering strategy development, content planning, and campaign management for growth and engagement.",
              availability: ["Weekdays", "Flexible"],
              skills: ["Strategy", "Content Creation", "Analytics", "Paid Advertising", "Community Management"],
              portfolio: ["/placeholder.svg?height=200&width=300"],
              completedProjects: 28
            },
          ]
          
          setServices(mockServices)
          setFilteredServices(mockServices)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching services:", error)
        setIsLoading(false)
      }
    }
    
    fetchServices()
  }, [])
  
  // Filter services based on search query, category, and rate range
  useEffect(() => {
    let result = services
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        service => 
          service.serviceTitle.toLowerCase().includes(query) ||
          service.userName.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.userLocation.toLowerCase().includes(query) ||
          service.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(service => service.serviceCategory === selectedCategory)
    }
    
    // Apply rate range filter
    result = result.filter(service => {
      const rate = parseInt(service.hourlyRate.replace(/[^\d]/g, ''))
      return rate >= selectedRateRange[0] && rate <= selectedRateRange[1]
    })
    
    setFilteredServices(result)
  }, [searchQuery, selectedCategory, selectedRateRange, services])
  
  // Function to handle connecting with a service provider
  const handleConnect = (service: ServiceOffer) => {
    setSelectedService(service)
  }
  
  // Function to send a service request
  const sendServiceRequest = () => {
    if (!selectedService) return
    
    // In a real app, this would be an API call to send the notification
    // For now, we'll just show a toast
    toast({
      title: "Service Request Sent!",
      description: `Your request was sent to ${selectedService.userName} for ${selectedService.serviceTitle}. You'll be notified when they respond.`,
    })
    
    // Reset the selected service
    setSelectedService(null)
  }
  
  // Get unique categories for filters
  const categories = ["all", ...new Set(services.map(service => service.serviceCategory))]
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Services Barter</h1>
            <p className="text-muted-foreground">Exchange professional services with others in your community</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Offer My Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>List a New Service</DialogTitle>
                <DialogDescription>
                  Add details about the service you can provide to find potential clients or trading partners
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceTitle">Service Title</Label>
                    <Input id="serviceTitle" placeholder="What service do you offer?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceCategory">Category</Label>
                    <Select>
                      <SelectTrigger id="serviceCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Writing">Writing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                    <Input id="hourlyRate" type="number" placeholder="Your hourly rate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Typical Project Hours</Label>
                    <Input id="estimatedHours" type="number" placeholder="Average hours needed" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your service in detail - your expertise, what you offer, and what makes your service unique" 
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Flexible"].map((time) => (
                      <Badge key={time} variant="outline" className="cursor-pointer hover:bg-secondary">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    <Input className="w-full" placeholder="Add skills (comma separated)" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Portfolio Samples</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-2">
                      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                        <PlusCircle className="h-6 w-6" />
                        <span>Add Sample</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Storage Preference</Label>
                  <RadioGroup defaultValue="local">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="local-storage" />
                      <Label htmlFor="local-storage">Local Storage (Traditional)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blockchain" id="blockchain-storage" />
                      <Label htmlFor="blockchain-storage">Blockchain Storage (Secure)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>List Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, skills, providers..."
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Services</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <Label>Hourly Rate Range (₹)</Label>
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, 5000]}
                        max={5000}
                        step={100}
                        onValueChange={(value) => setSelectedRateRange(value as [number, number])}
                      />
                      <div className="flex items-center justify-between pt-2 text-sm">
                        <span>₹{selectedRateRange[0]}</span>
                        <span>₹{selectedRateRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Flexible"].map((time) => (
                        <Badge key={time} variant="outline" className="cursor-pointer hover:bg-secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="w-full">Reset Filters</Button>
                  <DialogClose asChild>
                    <Button className="w-full">Apply Filters</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Services grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-lg font-medium">No services found matching your criteria</p>
                <p className="text-center text-muted-foreground">Try adjusting your search or filters</p>
                <Button variant="outline" className="mt-4">Offer Your Own Service</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{service.serviceTitle}</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {service.userTrustScore}/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Image
                            src={service.userAvatar}
                            alt={service.userName}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{service.userName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{service.userLocation}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {service.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {service.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {skill}
                            </Badge>
                          ))}
                          {service.skills.length > 3 && (
                            <Badge variant="secondary" className="font-normal">
                              +{service.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{service.hourlyRate}/hr</span>
                            <span className="text-muted-foreground">• ~{service.estimatedHours}hrs</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{service.completedProjects} projects completed</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Available:</span>
                          {service.availability.map((time, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-normal">
                              {time}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full" onClick={() => handleConnect(service)}>
                                Request Service
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Request {service.serviceTitle}</DialogTitle>
                                <DialogDescription>
                                  Send a service request to {service.userName}. You'll be able to discuss details once they accept.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="mb-2 font-medium">{service.serviceTitle}</h4>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{service.hourlyRate}/hr</span>
                                    <span className="text-muted-foreground">• Estimated {service.estimatedHours} hours</span>
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground">{service.description.substring(0, 150)}...</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Project Description</Label>
                                  <Textarea placeholder="Describe your project needs..." rows={4} />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Preferred Start Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Select a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarComponent
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Budget (Optional)</Label>
                                  <Input placeholder="Your total budget for this project" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>What would you offer in return?</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="payment">Direct Payment</SelectItem>
                                      <SelectItem value="service">My Own Service</SelectItem>
                                      <SelectItem value="goods">Physical Goods</SelectItem>
                                      <SelectItem value="combination">Combination</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Storage Preference</Label>
                                  <RadioGroup value={storageType} onValueChange={(value: "local" | "blockchain") => setStorageType(value)}>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="local" id="local" />
                                      <Label htmlFor="local">Local Storage (Traditional)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="blockchain" id="blockchain" />
                                      <Label htmlFor="blockchain">Blockchain Storage (Secure)</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={sendServiceRequest}>Send Request</Button>
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