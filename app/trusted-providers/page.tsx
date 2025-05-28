"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, MapPin, Award, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TrustedProvidersPage() {
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Trusted Providers</h1>
            <p className="text-muted-foreground">Connect with our most reliable community members</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Providers</CardTitle>
            <CardDescription>Find the right match for your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="search">Search by Name or Skill</label>
                <Input id="search" placeholder="e.g. Yoga, Web Design, etc." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="location">Location</label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="kolkata">Kolkata</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="trustScore">Minimum Trust Score</label>
                <Select defaultValue="80">
                  <SelectTrigger id="trustScore">
                    <SelectValue placeholder="Select minimum score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70+</SelectItem>
                    <SelectItem value="80">80+</SelectItem>
                    <SelectItem value="90">90+</SelectItem>
                    <SelectItem value="95">95+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-4" variant="default">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Providers</TabsTrigger>
            <TabsTrigger value="near-me">Near Me</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            <TabsTrigger value="most-active">Most Active</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Provider 1 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Rahul Kapoor</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          98/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Mumbai, Maharashtra</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Yoga, Photography, Web Design
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 47
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider 2 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Meera Iyer</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          95/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Delhi, NCR</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Financial Consulting, Cooking, Language Tutoring
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 39
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider 3 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Arjun Nair</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          93/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Bangalore, Karnataka</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Mobile App Development, Music Production, Digital Marketing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 31
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider 4 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Priya Sharma</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          92/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Pune, Maharashtra</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Yoga Instruction, Health Coaching, Ayurvedic Consultation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 28
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider 5 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Vikram Singh</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          90/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Chennai, Tamil Nadu</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Carpentry, Furniture Repair, Home Renovation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 25
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider 6 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=80&width=80"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Ananya Desai</h3>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          89/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Hyderabad, Telangana</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Top Skills:</span> Graphic Design, Illustration, Brand Identity
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Completed Trades:</span> 22
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="default" className="w-full">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="near-me">
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enable Location Services</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                To see providers near you, please enable location services in your browser.
              </p>
              <Button>
                Enable Location
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="top-rated">
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Top Rated Providers</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                This content is being populated. Check back soon!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="most-active">
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Most Active Providers</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                This content is being populated. Check back soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 