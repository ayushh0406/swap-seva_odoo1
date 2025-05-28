"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Filter, List, MapPin, MessageSquare, Search, Sliders, Shield } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function MapPage() {
  const [view, setView] = useState("map")
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  // Sample barter listings data
  const listings = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Yoga Classes 🧘‍♀️",
      needs: "Web Development 💻",
      location: "Andheri, Mumbai",
      distance: "0.8 km",
      coordinates: { x: 30, y: 40 },
      verified: true,
    },
    {
      id: 2,
      name: "Raj Patel",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Graphic Design 🎨",
      needs: "Guitar Lessons 🎸",
      location: "Bandra, Mumbai",
      distance: "2.3 km",
      coordinates: { x: 50, y: 60 },
      verified: true,
    },
    {
      id: 3,
      name: "Ananya Desai",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Home-cooked Meals 🍲",
      needs: "Fitness Training 💪",
      location: "Juhu, Mumbai",
      distance: "3.5 km",
      coordinates: { x: 70, y: 30 },
      verified: false,
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Carpentry 🔨",
      needs: "Cooking Lessons 🍳",
      location: "Dadar, Mumbai",
      distance: "5.1 km",
      coordinates: { x: 40, y: 70 },
      verified: true,
    },
    {
      id: 5,
      name: "Neha Gupta",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "English Tutoring 📚",
      needs: "Photography 📷",
      location: "Powai, Mumbai",
      distance: "7.2 km",
      coordinates: { x: 60, y: 50 },
      verified: false,
    },
    {
      id: 6,
      name: "Arjun Mehta",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Financial Consulting 💼",
      needs: "Home Renovation 🏠",
      location: "Pune, Maharashtra",
      distance: "148 km",
      coordinates: { x: 20, y: 20 },
      verified: true,
    },
    {
      id: 7,
      name: "Kavita Reddy",
      avatar: "/placeholder.svg?height=64&width=64",
      offers: "Content Writing ✍️",
      needs: "Video Editing 🎬",
      location: "Bangalore, Karnataka",
      distance: "980 km",
      coordinates: { x: 80, y: 80 },
      verified: true,
    },
  ]

  const handleMessage = (name: string) => {
    toast({
      title: "Chat Initiated",
      description: `You can now chat with ${name} about the barter.`,
    })
    // In a real app, this would navigate to the chat page
  }

  const handleMarkerClick = (id: number) => {
    toast({
      title: "Listing Selected",
      description: `Viewing details for ${listings.find((l) => l.id === id)?.name}'s barter offer.`,
    })
    // In a real app, this would show a popup or details panel
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Barter Map</h1>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={setView} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search by skill, item, or location..." className="pl-8" />
            </div>
            <Button>Search</Button>
          </div>

          {showFilters && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Sliders className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <CardDescription>Narrow down barter opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="skills">Skills & Expertise</SelectItem>
                        <SelectItem value="goods">Physical Goods</SelectItem>
                        <SelectItem value="digital">Digital Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Distance</Label>
                    <div className="pt-2">
                      <Slider defaultValue={[10]} max={1000} step={10} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Local</span>
                        <span>Nationwide</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Trust Score</Label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Score</SelectItem>
                        <SelectItem value="70">70+</SelectItem>
                        <SelectItem value="80">80+</SelectItem>
                        <SelectItem value="90">90+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Verification</Label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Status</SelectItem>
                        <SelectItem value="verified">Verified Users Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="rounded-lg border">
          <TabsContent value="map" className="m-0">
            <div className="relative h-[600px] w-full bg-muted">
              {/* This would be a Google Maps or similar component in a real app */}
              <div className="h-full w-full bg-[url('/placeholder.svg?height=600&width=1000')] bg-cover bg-center">
                {/* Map markers */}
                {listings.map((listing) => (
                  <Button
                    key={listing.id}
                    variant="outline"
                    className="absolute rounded-full bg-background p-0 shadow-md hover:bg-background"
                    style={{
                      left: `${listing.coordinates.x}%`,
                      top: `${listing.coordinates.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => handleMarkerClick(listing.id)}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${listing.verified ? "border-blue-500" : "border-primary"} bg-background`}
                    >
                      <MapPin className={`h-5 w-5 ${listing.verified ? "text-blue-500" : "text-primary"}`} />
                    </div>
                  </Button>
                ))}

                {/* Selected marker popup - would be dynamic in a real app */}
                <Card className="absolute left-[50%] top-[60%] w-64 translate-x-[-50%] shadow-lg">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Image
                        src={listings[0].avatar || "/placeholder.svg"}
                        alt={listings[0].name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold">{listings[0].name}</h3>
                          {listings[0].verified && <Shield className="h-3 w-3 text-blue-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {listings[0].location} • {listings[0].distance}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Offers:</span> {listings[0].offers}
                          </p>
                          <p>
                            <span className="font-medium">Needs:</span> {listings[0].needs}
                          </p>
                        </div>
                        <Button size="sm" className="mt-2 w-full gap-1" onClick={() => handleMessage(listings[0].name)}>
                          <MessageSquare className="h-3 w-3" />
                          Chat Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="m-0">
            <div className="divide-y">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-start gap-4 p-4">
                  <Image
                    src={listing.avatar || "/placeholder.svg"}
                    alt={listing.name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold">{listing.name}</h3>
                          {listing.verified && <Shield className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {listing.location} • {listing.distance}
                        </div>
                      </div>
                      <Badge variant="outline">{listing.distance}</Badge>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm">
                      <div className="rounded-md bg-muted px-2 py-1">
                        <p>
                          <span className="font-medium">Offers:</span> {listing.offers}
                        </p>
                      </div>
                      <div className="rounded-md bg-muted px-2 py-1">
                        <p>
                          <span className="font-medium">Needs:</span> {listing.needs}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" className="gap-1" onClick={() => handleMessage(listing.name)}>
                        <MessageSquare className="h-3 w-3" />
                        Chat Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  )
}

// Helper component for the filter section
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium">{children}</div>
}

