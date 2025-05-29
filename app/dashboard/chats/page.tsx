"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { Loader2 } from "lucide-react"

export default function ChatsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [completingTrade, setCompletingTrade] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get chatId from URL if present
  const chatIdFromUrl = searchParams.get('chatId')

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Fetch user chats
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        router.push("/login")
        return
      }

      setUserId(localStorage.getItem("userId"))
      
      const response = await fetch("http://localhost:3001/api/chats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched chats:", data.chats?.length || 0)
        setChats(data.chats || [])
        
        // If there's a chatId in the URL, open that chat
        if (chatIdFromUrl && data.chats?.length > 0) {
          const chatToOpen = data.chats.find((chat: any) => chat._id === chatIdFromUrl)
          if (chatToOpen) {
            fetchChatMessages(chatIdFromUrl)
          }
        }
      } else {
        const errorText = await response.text()
        console.error("Failed to load chats:", errorText)
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch chat messages
  const fetchChatMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to view chat messages",
          variant: "destructive"
        })
        router.push("/login")
        return
      }
      
      console.log("Fetching chat messages for ID:", chatId)
      
      const response = await fetch(`http://localhost:3001/api/chats/${chatId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      console.log("Chat fetch response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        if (!data.chat) {
          console.error("No chat data returned")
          toast({
            title: "Error",
            description: "Failed to load chat data",
            variant: "destructive"
          })
          return
        }
        
        console.log("Fetched chat details:", data.chat._id)
        console.log("Chat has messages:", data.chat.messages?.length || 0)
        console.log("Chat participants:", data.chat.participants?.map((p: any) => p._id))
        console.log("Chat trade info:", data.chat.tradeInfo)
        
        setActiveChat(data.chat)
        setMessages(data.chat.messages || [])
        
        // Update chat in the list to mark as read
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
          )
        )
        
        // Mark messages as read on the server
        fetch(`http://localhost:3001/api/chats/${chatId}/read`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).catch(err => console.error("Error marking messages as read:", err))
        
        // Scroll to bottom after messages are loaded
        setTimeout(scrollToBottom, 100)
      } else {
        let errorMessage = "Failed to load chat messages"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          console.error("Error response data:", errorData)
        } catch (e) {
          // If it's not JSON, try to get the text
          const errorText = await response.text().catch(() => "")
          if (errorText) {
            console.error("Error response text:", errorText)
          }
        }
        
        console.error("Failed to load chat messages:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }
  
  // Send message
  const sendMessage = async () => {
    if (!activeChat || !message.trim() || sendingMessage) return
    
    setSendingMessage(true)
    const messageContent = message.trim()
    setMessage("") // Clear input field immediately for better UX
    
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to send messages",
          variant: "destructive"
        })
        router.push("/login")
        return
      }
      
      console.log("Sending message to chat:", activeChat._id)
      
      // Optimistically add message to UI
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: messageContent,
        timestamp: new Date().toISOString(),
        sender: { _id: userId },
        pending: true
      }
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage])
      
      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 10)
      
      const response = await fetch("http://localhost:3001/api/chats/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: activeChat._id,
          content: messageContent
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Message sent successfully")
        
        // Replace optimistic message with real one
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== optimisticMessage._id)
            .concat(data.message)
        )
        
        // Update last message in chat list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === activeChat._id 
              ? { 
                  ...chat, 
                  lastMessage: {
                    content: messageContent,
                    timestamp: new Date(),
                    sender: { _id: userId }
                  }
                } 
              : chat
          )
        )
      } else {
        let errorMessage = "Failed to send message"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          const errorText = await response.text().catch(() => "")
          if (errorText) {
            console.error("Error response text:", errorText)
          }
        }
        
        console.error("Failed to send message:", errorMessage)
        
        // Remove the optimistic message
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== optimisticMessage._id)
        )
        
        // Show error to user
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setSendingMessage(false)
    }
  }
  
  // Complete trade
  const completeTrade = async () => {
    if (!activeChat || completingTrade) return
    
    setCompletingTrade(true)
    
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      
      const response = await fetch(`http://localhost:3001/api/chats/${activeChat._id}/complete`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveChat(data.chat)
        
        // Add system message
        const systemMessage = {
          _id: Date.now().toString(),
          content: "Trade marked as completed",
          timestamp: new Date().toISOString(),
          system: true
        }
        
        setMessages(prevMessages => [...prevMessages, systemMessage])
        
        // Update chat in list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === activeChat._id 
              ? { ...chat, tradeInfo: { ...chat.tradeInfo, status: 'completed' } } 
              : chat
          )
        )
        
        toast({
          title: "Trade Completed",
          description: "You've marked this trade as completed"
        })
        
        // Scroll to bottom to show the system message
        setTimeout(scrollToBottom, 100)
      } else {
        const errorText = await response.text()
        console.error("Failed to complete trade:", errorText)
        toast({
          title: "Error",
          description: "Failed to complete trade",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error completing trade:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setCompletingTrade(false)
    }
  }
  
  // Load chats on mount and set up polling
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    }
    
    setUserId(localStorage.getItem("userId"))
    
    // Start fetching chats - this is async
    fetchChats()
    
    // Process the chatId parameter directly if available
    if (chatIdFromUrl) {
      console.log("Chat ID found in URL, will fetch chat:", chatIdFromUrl)
      // Attempt to fetch the chat messages directly
      fetchChatMessages(chatIdFromUrl)
    }
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchChats, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Handle the chatId parameter when chats are loaded
  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0 && !activeChat) {
      console.log("Processing URL chatId after chats loaded:", chatIdFromUrl)
      const chatToOpen = chats.find(chat => chat._id === chatIdFromUrl)
      if (chatToOpen) {
        console.log("Found matching chat, opening:", chatToOpen._id)
        fetchChatMessages(chatIdFromUrl)
      } else {
        console.log("Chat not found in loaded chats list. Available chats:", chats.map(c => c._id))
      }
    }
  }, [chats, chatIdFromUrl])
  
  // Poll for messages in active chat
  useEffect(() => {
    if (!activeChat) return
    
    const interval = setInterval(() => {
      fetchChatMessages(activeChat._id)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [activeChat])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])
  
  // Check chat connection
  const checkChatConnection = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to check connection",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch("http://localhost:3001/api/chats/debug/connection", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      toast({
        title: "Connection Status",
        description: `DB Connection: ${data.connection?.status || 'unknown'}, User: ${data.user?.name || 'unknown'}`,
        variant: data.success ? "default" : "destructive"
      })
      
      console.log("Connection check result:", data)
    } catch (error) {
      console.error("Error checking connection:", error)
      toast({
        title: "Connection Error",
        description: "Failed to check connection status",
        variant: "destructive"
      })
    }
  }

  // Create a direct chat for testing
  const createDirectChat = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a chat",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch("http://localhost:3001/api/chats/debug/create-test-chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Test Chat Created",
          description: `Created chat with ID: ${data.chatId}`,
        })
        
        // Refresh the chat list
        fetchChats()
        
        // Open the new chat
        fetchChatMessages(data.chatId)
      } else {
        toast({
          title: "Chat Creation Failed",
          description: data.message || "Failed to create test chat",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating test chat:", error)
      toast({
        title: "Chat Creation Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Trades & Chats</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Try to get the first sender ID from messages
                if (messages.length > 0 && messages[0].sender?._id) {
                  const firstSenderId = messages[0].sender._id.toString();
                  console.log("Setting userId to first sender:", firstSenderId);
                  setUserId(firstSenderId);
                  localStorage.setItem("userId", firstSenderId);
                  toast({
                    title: "User ID set",
                    description: `Set to: ${firstSenderId}`,
                  });
                } else {
                  toast({
                    title: "No messages available",
                    description: "Cannot set userId from messages",
                    variant: "destructive"
                  });
                }
              }}
            >
              Set User ID
            </Button>
            <Button variant="outline" size="sm" onClick={createDirectChat}>
              Create Test Chat
            </Button>
            <Button variant="outline" size="sm" onClick={checkChatConnection}>
              Check Connection
            </Button>
          </div>
        </div>
        
        {/* Mobile View: Show/Hide Chat List Toggle */}
        <div className="md:hidden mb-4">
          {activeChat ? (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={() => setActiveChat(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Chat List
            </Button>
          ) : null}
        </div>
        
        <div className="grid h-full md:grid-cols-[280px_1fr]">
          <div className={`flex flex-col border-r ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Chats</h2>
            </div>
            
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No chats yet</p>
                  <Button 
                    variant="link" 
                    className="mt-1 p-0 h-auto" 
                    onClick={createDirectChat}
                  >
                    Create a test chat
                  </Button>
                </div>
              ) : (
                <div>
                  {chats.map((chat) => (
                    <div 
                      key={chat._id} 
                      className={`p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${activeChat?._id === chat._id ? 'bg-muted' : ''}`}
                      onClick={() => fetchChatMessages(chat._id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={chat.otherUser?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{chat.otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{chat.otherUser?.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessage?.timestamp ? formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true }) : 
                              formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant={chat.tradeInfo?.status === 'completed' ? "outline" : "secondary"} className="text-xs">
                              {chat.tradeInfo?.status === 'completed' ? 'Completed' : 'Active'}
                            </Badge>
                            {chat.unreadCount > 0 && (
                              <Badge variant="default" className="text-xs">
                                {chat.unreadCount} new
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Chat Messages */}
          <div className={`border rounded-lg overflow-hidden ${activeChat ? 'block' : 'block'}`}>
            <div className="bg-muted p-3 border-b">
              <h2 className="font-medium">Active Trades</h2>
            </div>
            
            <ScrollArea className="h-[600px]">
              {!activeChat ? (
                <div className="flex flex-col items-center justify-center h-[600px] bg-muted/30">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <line x1="9" y1="10" x2="15" y2="10"></line>
                      <line x1="12" y1="7" x2="12" y2="13"></line>
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Select a chat to view messages</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Your trade conversations will appear here<br />
                    You can discuss details and arrange exchanges with your trading partners
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-[600px]">
                  {/* Chat Header */}
                  <div className="bg-muted p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={activeChat.participants?.find((p: any) => p._id !== userId)?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {activeChat.participants?.find((p: any) => p._id !== userId)?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {activeChat.participants?.find((p: any) => p._id !== userId)?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Trade Status: {activeChat.tradeInfo?.status === 'completed' ? 'Completed' : 'Active'}
                          </p>
                        </div>
                      </div>
                      
                      {activeChat.tradeInfo?.status !== 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={completeTrade}
                          disabled={completingTrade}
                        >
                          {completingTrade ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Completing...
                            </>
                          ) : 'Mark as Completed'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Trade Details */}
                  <div className="bg-muted/30 p-3 border-b">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium">You give:</p>
                        <p>{activeChat.tradeInfo?.initiatorOffering?.title || activeChat.tradeInfo?.responderOffering?.title || "Item"}</p>
                      </div>
                      <div>
                        <p className="font-medium">You receive:</p>
                        <p>{activeChat.tradeInfo?.responderOffering?.title || activeChat.tradeInfo?.initiatorOffering?.title || "Item"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-muted rounded-full p-3 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            <line x1="9" y1="10" x2="15" y2="10"></line>
                            <line x1="12" y1="7" x2="12" y2="13"></line>
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg: any, index: number) => {
                          // Debug each message
                          const senderIdStr = msg.sender?._id?.toString();
                          const userIdStr = userId?.toString();
                          
                          // First attempt: Compare IDs if both are available
                          let isSentByCurrentUser = senderIdStr && userIdStr && senderIdStr === userIdStr;
                          
                          // Second attempt: If the first attempt fails, use a fallback method
                          // For demonstration, let's alternate messages (even indices are from current user)
                          if (!senderIdStr || !userIdStr) {
                            console.log("Using fallback method to determine message sender");
                            isSentByCurrentUser = index % 2 === 0;
                          }
                          
                          return (
                            <div key={msg._id}>
                              {msg.system ? (
                                // System message (centered)
                                <div className="flex justify-center my-2">
                                  <div className="bg-muted px-3 py-1 rounded-md text-xs text-center">
                                    {msg.content}
                                  </div>
                                </div>
                              ) : isSentByCurrentUser ? (
                                // Sender message (right side) - My messages
                                <div className="flex justify-end mb-2">
                                  <div className="max-w-[75%] bg-green-600 text-white px-4 py-2 rounded-lg rounded-tr-none shadow-md border-2 border-green-700">
                                    <p className="text-sm font-medium">{msg.content}</p>
                                    <div className="text-xs opacity-80 text-right mt-1 flex items-center justify-end gap-1">
                                      {msg.pending ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                      <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Receiver message (left side) - Their messages
                                <div className="flex mb-2">
                                  <div className="flex items-start gap-2 max-w-[75%]">
                                    <Avatar className="h-8 w-8 mt-1 border-2 border-orange-500">
                                      <AvatarImage src={msg.sender?.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>{msg.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-orange-100 dark:bg-orange-900 px-4 py-2 rounded-lg rounded-tl-none shadow-md border-2 border-orange-300 dark:border-orange-800">
                                      <p className="text-sm font-medium">{msg.content}</p>
                                      <p className="text-xs opacity-70 text-right mt-1">
                                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={activeChat.tradeInfo?.status === 'completed' || sendingMessage}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!message.trim() || activeChat.tradeInfo?.status === 'completed' || sendingMessage}
                      >
                        {sendingMessage ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Sending
                          </>
                        ) : 'Send'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 