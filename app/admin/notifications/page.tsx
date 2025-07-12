"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  History, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface NotificationHistory {
  _id: string
  title: string
  message: string
  priority: string
  sender: {
    name: string
    email: string
  }
  createdAt: string
  data: {
    isPlatformMessage: boolean
    sentBy: string
  }
}

export default function AdminNotifications() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [expiresAt, setExpiresAt] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotificationHistory()
  }, [])

  const fetchNotificationHistory = async () => {
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

      const response = await fetch("http://localhost:3001/api/admin/notifications/history", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch notification history: ${response.status}`)
      }

      const data = await response.json()
      setNotificationHistory(data.notifications)
    } catch (error) {
      console.error("Error fetching notification history:", error)
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
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

      const response = await fetch("http://localhost:3001/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          priority,
          expiresAt: expiresAt || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send notification")
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: `Notification sent to ${data.sentTo} users`,
      })

      // Reset form
      setTitle("")
      setMessage("")
      setPriority("medium")
      setExpiresAt("")

      // Refresh history
      fetchNotificationHistory()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      case 'low':
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="default">Medium</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Notifications</h1>
          <p className="text-muted-foreground">Send messages to all users on the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Platform-Wide Message
              </CardTitle>
              <CardDescription>
                This message will be sent to all users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="expiresAt" className="text-sm font-medium">
                    Expires At (Optional)
                  </label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-blue-700">
                  This notification will be sent to all users and will appear in their notification center.
                </p>
              </div>

              <Button 
                onClick={sendNotification} 
                disabled={isSending || !title.trim() || !message.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to All Users
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>
                View all platform-wide notifications sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="h-6 w-6 animate-spin mr-2" />
                  <p>Loading notification history...</p>
                </div>
              ) : notificationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notificationHistory.map((notification) => (
                    <div key={notification._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(notification.priority)}
                          <h3 className="font-medium">{notification.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="outline">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Sent by {notification.sender.name}</span>
                        <span>•</span>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 