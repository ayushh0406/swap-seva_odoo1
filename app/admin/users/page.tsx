"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Ban, 
  Shield,
  ArrowLeft,
  Filter
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface User {
  _id: string
  name: string
  email: string
  avatar: string
  role: string
  isBanned: boolean
  banReason?: string
  bannedAt?: string
  bannedBy?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  offerings: Array<{
    type: string
    title: string
    description: string
  }>
}

interface Pagination {
  current: number
  total: number
  totalUsers: number
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    role: "",
    isBanned: "",
    hasOfferings: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filters])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })

      if (searchTerm) params.append("search", searchTerm)
      if (filters.role) params.append("role", filters.role)
      if (filters.isBanned !== "") params.append("isBanned", filters.isBanned)
      if (filters.hasOfferings !== "") params.append("hasOfferings", filters.hasOfferings)

      const response = await fetch(`http://localhost:3001/api/admin/users?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:3001/api/admin/users/${selectedUser._id}/ban`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isBanned: true,
          banReason: banReason.trim()
        })
      })

      if (!response.ok) {
        throw new Error("Failed to ban user")
      }

      toast({
        title: "Success",
        description: "User banned successfully",
      })

      setIsBanDialogOpen(false)
      setBanReason("")
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleUnbanUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:3001/api/admin/users/${selectedUser._id}/ban`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isBanned: false
        })
      })

      if (!response.ok) {
        throw new Error("Failed to unban user")
      }

      toast({
        title: "Success",
        description: "User unbanned successfully",
      })

      setIsUnbanDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>
        <Badge variant="secondary">
          {pagination?.totalUsers || 0} total users
        </Badge>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Role</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.isBanned}
                onChange={(e) => setFilters({ ...filters, isBanned: e.target.value })}
              >
                <option value="">All Users</option>
                <option value="false">Active</option>
                <option value="true">Banned</option>
              </select>
            </div>
            
            <div>
              <Label>Offerings</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.hasOfferings}
                onChange={(e) => setFilters({ ...filters, hasOfferings: e.target.value })}
              >
                <option value="">All Users</option>
                <option value="true">Has Offerings</option>
                <option value="false">No Offerings</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Showing {users.length} of {pagination?.totalUsers || 0} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {user.role === 'admin' && (
                        <Badge variant="destructive">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.isBanned && (
                        <Badge variant="destructive">
                          <Ban className="h-3 w-3 mr-1" />
                          Banned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                      {user.offerings.length > 0 && (
                        <span className="ml-2">
                          • {user.offerings.length} offering{user.offerings.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                    {user.isBanned && user.banReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Reason: {user.banReason}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <>
                      {user.isBanned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsUnbanDialogOpen(true)
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsBanDialogOpen(true)
                          }}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.current} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current === 1}
                  onClick={() => setCurrentPage(pagination.current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current === pagination.total}
                  onClick={() => setCurrentPage(pagination.current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? This action can be reversed later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Reason for ban</Label>
              <Textarea
                id="banReason"
                placeholder="Enter the reason for banning this user..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim()}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Dialog */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedUser?.name}? They will be able to access the platform again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnbanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnbanUser}>
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 