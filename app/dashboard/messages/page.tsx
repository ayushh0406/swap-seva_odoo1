"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, ChevronRight, ImageIcon, Mic, Search, Send, Shield } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [messageText, setMessageText] = useState("")
  const { toast } = useToast()

  // Sample chat data
  const chats = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "That sounds great! When can we meet?",
      time: "2:30 PM",
      unread: 2,
      online: true,
      trade: {
        offering: "Yoga Classes 🧘‍♀️",
        requesting: "Web Development 💻",
      },
    },
    {
      id: 2,
      name: "Raj Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "I can help with your logo design",
      time: "Yesterday",
      unread: 0,
      online: false,
      trade: {
        offering: "Graphic Design 🎨",
        requesting: "Guitar Lessons 🎸",
      },
    },
    {
      id: 3,
      name: "Ananya Desai",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "The food will be ready by 6 PM",
      time: "Yesterday",
      unread: 0,
      online: true,
      trade: {
        offering: "Home-cooked Meals 🍲",
        requesting: "Fitness Training 💪",
      },
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "I'll bring my tools on Saturday",
      time: "Monday",
      unread: 0,
      online: false,
      trade: {
        offering: "Carpentry 🔨",
        requesting: "Cooking Lessons 🍳",
      },
    },
    {
      id: 5,
      name: "Neha Gupta",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can you help with my English essay?",
      time: "3/15/2025",
      unread: 0,
      online: false,
      trade: {
        offering: "English Tutoring 📚",
        requesting: "Photography 📷",
      },
    },
  ]

  // Sample messages for the selected chat
  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hi there! I saw that you're offering web development services. I'm a yoga instructor and I need help building a simple website for my studio.",
      time: "2:15 PM",
    },
    {
      id: 2,
      sender: "me",
      text: "Hello! Yes, I can definitely help with that. What kind of features are you looking for on your website?",
      time: "2:18 PM",
    },
    {
      id: 3,
      sender: "other",
      text: "I need a homepage with class schedules, instructor bios, and a contact form. Maybe a simple booking system if possible?",
      time: "2:22 PM",
    },
    {
      id: 4,
      sender: "me",
      text: "That sounds doable! I can create a responsive website with all those features. In exchange, I'd love to learn yoga. I've been wanting to start for a while now.",
      time: "2:25 PM",
    },
    {
      id: 5,
      sender: "other",
      text: "Perfect! I offer beginner classes on Mondays and Wednesdays at 6 PM. How about I give you 10 private sessions in exchange for the website?",
      time: "2:28 PM",
    },
    {
      id: 6,
      sender: "me",
      text: "That's a great offer! I can start working on your website this weekend.",
      time: "2:29 PM",
    },
    {
      id: 7,
      sender: "other",
      text: "That sounds great! When can we meet to discuss the details?",
      time: "2:30 PM",
    },
  ]

  const selectedChatData = chats.find((chat) => chat.id === selectedChat)

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    // In a real app, this would send the message to the API
    toast({
      title: "Message Sent",
      description: "Your message has been delivered.",
    })

    setMessageText("")
  }

  const handleInitiateTrade = () => {
    toast({
      title: "Trade Initiated",
      description: "A smart contract has been created for this barter. Waiting for confirmation.",
    })
  }

  return (
    <div className="container h-[calc(100vh-4rem)] py-6">
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Messages</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search messages..." className="w-[250px] pl-8" />
          </div>
        </div>

        <div className="grid h-full grid-cols-1 gap-6 overflow-hidden md:grid-cols-[300px_1fr]">
          <Card className="h-full">
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="divide-y">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50 ${
                        selectedChat === chat.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={chat.avatar} alt={chat.name} />
                          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{chat.name}</h3>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <span className="font-medium">Trade:</span>
                          <span className="truncate">
                            {chat.trade.offering} ↔️ {chat.trade.requesting}
                          </span>
                        </div>
                      </div>
                      {chat.unread > 0 && <Badge className="ml-auto">{chat.unread}</Badge>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            {selectedChatData && (
              <>
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedChatData.avatar} alt={selectedChatData.name} />
                      <AvatarFallback>{selectedChatData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{selectedChatData.name}</h2>
                        {selectedChatData.online && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Offering: {selectedChatData.trade.offering}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span>Requesting: {selectedChatData.trade.requesting}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleInitiateTrade} className="gap-1">
                    <Shield className="h-4 w-4" />
                    Initiate Trade
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-muted/50">
                        Today
                      </Badge>
                    </div>

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                              message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {message.time}
                            {message.sender === "me" && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* AI Scam Detection Warning - This would be conditional in a real app */}
                    <div className="flex justify-center">
                      <div className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm text-amber-600">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Potential Scam Warning</span>
                        </div>
                        <p className="mt-1">
                          Be cautious about sharing personal information. Always use our secure trade system.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <ImageIcon className="h-4 w-4" />
                      <span className="sr-only">Attach image</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Mic className="h-4 w-4" />
                      <span className="sr-only">Voice message</span>
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="pr-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

