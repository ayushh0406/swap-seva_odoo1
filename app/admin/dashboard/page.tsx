"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Handshake, 
  Shield, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  Activity
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalTrades: number
  totalMatches: number
  pendingTrades: number
  pendingMatches: number
  completedTrades: number
  completedMatches: number
  confirmedTrades: number
  bannedUsers: number
  totalSkills: number
  totalInterests: number
}

interface RecentActivity {
  users: Array<{
    _id: string
    name: string
    email: string
    createdAt: string
  }>
  trades: Array<{
    _id: string
    participants: Array<{
      _id: string
      name: string
      email: string
    }>
    tradeInfo: {
      status: string
    }
    createdAt: string
  }>
  matches: Array<{
    _id: string
    status: string
    users: Array<{
      _id: string
      name: string
      email: string
    }>
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("authToken")
      console.log("Token:", token ? "Present" : "Missing")
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      console.log("Fetching dashboard stats...")
      const response = await fetch("http://localhost:3001/api/admin/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Dashboard data:", data)
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform and monitor activity</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/notifications">Send Platform Message</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to User Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/logout">Logout</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTrades || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time trades created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Trades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTrades || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending and confirmed trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bannedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Suspended accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity?.users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/admin/users">View All Users</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Recent Trades
                </CardTitle>
                <CardDescription>Latest trade activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity?.trades.map((trade) => (
                    <div key={trade._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {trade.participants.map(p => p.name).join(" ↔ ")}
                        </p>
                        <Badge variant={
                          trade.tradeInfo.status === 'completed' ? 'default' :
                          trade.tradeInfo.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {trade.tradeInfo.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/admin/trades">View All Trades</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild>
                  <Link href="/admin/users">View All Users</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/users/banned">Banned Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Management</CardTitle>
              <CardDescription>Monitor and manage platform matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild>
                  <Link href="/admin/matches">All Matches</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/matches?status=pending">Pending Matches</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/matches?status=completed">Completed Matches</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and moderate user content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild>
                  <Link href="/admin/moderation/offerings">Review Offerings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/notifications">Send Platform Message</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate and download platform reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild>
                  <Link href="/admin/reports">Generate Reports</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/reports?type=user_activity">User Activity Report</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/reports?type=swap_stats">Swap Statistics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 