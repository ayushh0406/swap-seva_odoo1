"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MessageSquare } from "lucide-react"

export function ChatNavigation() {
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch user chats
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      
      setLoading(true)
      const response = await fetch( `https://swapsewa-backend-1.onrender.com/api/chats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
        
        // Calculate total unread count
        const totalUnread = data.chats.reduce((acc: number, chat: any) => {
          return acc + (chat.unreadCount || 0)
        }, 0)
        
        setUnreadCount(totalUnread)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // Navigate to a chat
  const navigateToChat = (chatId: string) => {
    router.push(`/dashboard/chats?chatId=${chatId}`)
  }
  
  // Load chats on mount and set up polling
  useEffect(() => {
    fetchChats()
    
    // Poll for new chats/messages every 20 seconds
    const interval = setInterval(fetchChats, 20000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Chats</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-medium">Your Chats</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/dashboard/chats')}
            className="text-xs"
          >
            View All
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-muted rounded-full p-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="12" y1="7" x2="12" y2="13"></line>
                </svg>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No active chats<br />
                Confirm trades to start chatting
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {chats.map((chat) => (
                <div 
                  key={chat._id} 
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-muted cursor-pointer"
                  onClick={() => navigateToChat(chat._id)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={chat.otherUser?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{chat.otherUser?.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessage?.timestamp ? 
                          formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true }) : 
                          formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant={chat.tradeInfo?.status === 'completed' ? "outline" : "secondary"} className="text-[10px] px-1 py-0">
                        {chat.tradeInfo?.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="text-[10px] px-1 py-0">
                          {chat.unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
} 