"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Notification {
  _id: string
  sender: {
    _id: string
    name: string
    avatar: string
  }
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: any
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("")
  const [userOfferings, setUserOfferings] = useState<any[]>([])
  const router = useRouter()

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      
      setLoading(true)
      
      const [notificationsResponse, countResponse] = await Promise.all([
        fetch("http://localhost:3001/api/notifications?limit=10", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }),
        fetch("http://localhost:3001/api/notifications/unread-count", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      ])
      
      if (notificationsResponse.ok && countResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        const countData = await countResponse.json()
        
        setNotifications(notificationsData.notifications)
        setUnreadCount(countData.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      
      const response = await fetch("http://localhost:3001/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        // Update local state
        setUnreadCount(0)
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({
            ...notification,
            read: true
          }))
        )
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }
  
  // Load notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Function to open the accept trade dialog
  const openAcceptTradeDialog = async (notification: Notification) => {
    setSelectedNotification(notification)
    
    // Get the offered items from the notification data
    const offeredItems = notification.data?.offeredItems || []
    console.log("Offered items from sender:", offeredItems)
    
    if (offeredItems.length === 0) {
      toast({
        title: "No items available",
        description: "The user didn't offer any items to trade",
        variant: "destructive"
      })
      return
    }
    
    // Set the offered items and select the first one by default
    setUserOfferings(offeredItems)
    if (offeredItems.length > 0) {
      const firstItem = offeredItems[0]
      const firstItemId = typeof firstItem === 'string' ? firstItem : 
                         (firstItem._id ? firstItem._id.toString() : null)
      
      if (firstItemId) {
        setSelectedOfferingId(firstItemId)
        setAcceptDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Invalid item data",
          variant: "destructive"
        })
      }
    }
  }
  
  // Function to open the confirm trade dialog
  const openConfirmTradeDialog = async (notification: Notification) => {
    setSelectedNotification(notification)
    setConfirmDialogOpen(true)
  }
  
  // Function to open the chat page
  const openChatDialog = async (notification: Notification) => {
    console.log("Opening chat for notification:", notification.type, notification._id)
    setSelectedNotification(notification)
    
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.log("No auth token found")
        return
      }
      
      const chatId = notification.data?.chatId
      console.log("Chat ID from notification:", chatId)
      
      if (!chatId) {
        toast({
          title: "Error",
          description: "Chat ID not found in notification",
          variant: "destructive"
        })
        return
      }
      
      // Mark notification as read
      const markReadResponse = await fetch(`http://localhost:3001/api/notifications/${notification._id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!markReadResponse.ok) {
        console.error("Failed to mark notification as read")
      }
      
      // Close the dropdown
      setOpen(false)
      
      // Redirect to the chat page with the chat ID
      router.push(`/dashboard/messages?chatId=${chatId}`)
    } catch (error) {
      console.error("Error opening chat:", error)
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive"
      })
    }
  }
  
  // Debug function to manually create a test trade confirmation
  const createTestTradeConfirmation = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      
      // First create a test notification
      const notificationResponse = await fetch(`http://localhost:3001/api/notifications/test/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (notificationResponse.ok) {
        const notificationData = await notificationResponse.json()
        
        toast({
          title: "Test Notification Created",
          description: "Now confirm the trade to create a chat"
        })
        
        // Refresh notifications
        fetchNotifications()
      } else {
        toast({
          title: "Error",
          description: "Failed to create test notification",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating test notification:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }
  
  // Handle trade request acceptance
  const handleAcceptTrade = async () => {
    if (!selectedNotification || !selectedOfferingId) {
      toast({
        title: "Error",
        description: "Please select an offering to trade",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log("Accepting trade request for notification:", selectedNotification)
      
      // Get user data from local storage
      const token = localStorage.getItem("authToken")
      console.log("Token:", token ? "Found" : "Not found")
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to accept trade requests",
          variant: "destructive"
        })
        return
      }
      
      console.log("Selected offering ID:", selectedOfferingId)
      
      const requestBody = {
        notificationId: selectedNotification._id,
        selectedItemId: selectedOfferingId
      }
      console.log("Request body:", requestBody)
      
      // Accept the trade request
      const response = await fetch("http://localhost:3001/api/notifications/accept-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)
      
      if (response.ok) {
        toast({
          title: "Trade Accepted",
          description: `You've accepted the trade request from ${selectedNotification.sender.name}.`
        })
        
        // Close the dialog
        setAcceptDialogOpen(false)
        setSelectedNotification(null)
        
        // Refresh notifications
        fetchNotifications()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to accept trade request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error accepting trade request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }
  
  // Handle trade confirmation
  const handleConfirmTrade = async () => {
    if (!selectedNotification) {
      toast({
        title: "Error",
        description: "No notification selected",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log("Confirming trade request for notification:", selectedNotification)
      
      // Get user data from local storage
      const token = localStorage.getItem("authToken")
      console.log("Token:", token ? "Found" : "Not found")
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to confirm trade requests",
          variant: "destructive"
        })
        return
      }
      
      const requestBody = {
        notificationId: selectedNotification._id
      }
      
      // Send confirmation to the API
      const response = await fetch("http://localhost:3001/api/notifications/confirm-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log("Confirm trade response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Trade confirmed successfully:", data)
        
        // Close dialog
        setConfirmDialogOpen(false)
        
        // Close dropdown
        setOpen(false)
        
        // Show success message
        toast({
          title: "Trade Confirmed",
          description: "You can now chat with your trade partner"
        })
        
        // Navigate to the new chat
        if (data.chatId) {
          console.log("Navigating to new chat:", data.chatId)
          router.push(`/dashboard/messages?chatId=${data.chatId}`)
        } else {
          console.error("No chatId returned from API")
        }
      } else {
        let errorMessage = "Failed to confirm trade"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON
          const errorText = await response.text().catch(() => "")
          if (errorText) {
            console.error("Error response text:", errorText)
          }
        }
        
        console.error("Failed to confirm trade:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error confirming trade:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }
  
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Mark all as read
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={createTestTradeConfirmation} className="text-xs">
                Create Test
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`flex items-start gap-3 rounded-md p-2 ${notification.read ? '' : 'bg-muted'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.sender?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{notification.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      
                      {/* Special handling for trade requests */}
                      {notification.type === 'barter_request' && !notification.read && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 text-xs" onClick={() => openAcceptTradeDialog(notification)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {/* Special handling for trade acceptances */}
                      {notification.type === 'barter_accepted' && !notification.read && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 text-xs" onClick={() => openConfirmTradeDialog(notification)}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {/* Special handling for trade confirmations and messages */}
                      {(notification.type === 'trade_confirmed' || notification.type === 'message' || notification.type === 'barter_completed') && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 text-xs" onClick={() => openChatDialog(notification)}>
                            View Chat
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Accept Trade Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Trade Request</DialogTitle>
            <DialogDescription>
              Choose which of {selectedNotification?.sender?.name}'s offerings you want in exchange for your {selectedNotification?.data?.requestedOffering?.title}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedNotification && (
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedNotification.sender?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedNotification.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedNotification.sender?.name} wants your {selectedNotification.data?.requestedOffering?.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.data?.requestedOffering?.description || "No description provided"}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select what you want to receive in exchange:
              </label>
              <Select value={selectedOfferingId} onValueChange={setSelectedOfferingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose one of their offerings" />
                </SelectTrigger>
                <SelectContent>
                  {userOfferings.map((offering) => (
                    <SelectItem key={offering._id || offering} value={offering._id || offering}>
                      {offering.title || 'Unknown Item'} {offering.description ? `- ${offering.description.substring(0, 30)}...` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptTrade}>
              Accept Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Trade Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade</DialogTitle>
            <DialogDescription>
              {selectedNotification?.sender?.name} has accepted your trade request. They want your {selectedNotification?.data?.selectedItem?.title} in exchange for their {selectedNotification?.data?.requestedOffering?.title}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedNotification && (
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedNotification.sender?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedNotification.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">Trade Details</h4>
                  <p className="text-sm">
                    <span className="font-medium">You give:</span> {selectedNotification.data?.selectedItem?.title}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">You receive:</span> {selectedNotification.data?.requestedOffering?.title}
                  </p>
                </div>
              </div>
            )}
            
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                By confirming this trade, you agree to exchange the items mentioned above. After confirmation, you'll be able to chat with {selectedNotification?.sender?.name} to arrange the exchange.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTrade}>
              Confirm Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 