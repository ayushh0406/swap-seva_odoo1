import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, Clock, Handshake, TrendingUp, MessageSquare, Shield, Star, User, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"



export default function DashboardPage() {
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <Badge variant="outline" className="ml-2 gap-1">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          </div>
          <p className="text-muted-foreground">Here's what's happening with your barter activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85/100</div>
              <p className="text-xs text-muted-foreground">+10 points this month</p>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[85%] rounded-full bg-primary"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">2 pending confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">From 3 different users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Trusted Providers</CardTitle>
              <CardDescription>People with highest trust scores in our community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="User Avatar"
                    width={64}
                    height={64}
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
                      <Button size="sm" variant="default">
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="User Avatar"
                    width={64}
                    height={64}
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
                      <Button size="sm" variant="default">
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Link href="/trusted-providers">
                    <Button variant="outline" className="gap-1">
                      View All Trusted Providers <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest barter interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Handshake className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Trade Completed with Amit Shah</p>
                    <p className="text-xs text-muted-foreground">You exchanged Web Development for Home-cooked Meals</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message from Neha Gupta</p>
                    <p className="text-xs text-muted-foreground">Regarding your Photography Services</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Trust Score Increased</p>
                    <p className="text-xs text-muted-foreground">You gained 5 points after completing a trade</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Handshake className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Trade Request from Vikram Singh</p>
                    <p className="text-xs text-muted-foreground">Offering Carpentry for your Cooking Lessons</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

