"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  UserCircle2,
  Shield,
  MapPin,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

export default function MatchesPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { toast } = useToast()

  // Sample match data
  const matches = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=300&width=300",
      matchPercentage: 98,
      offers: "Yoga Classes 🧘‍♀️",
      needs: "Web Development 💻",
      location: "Andheri, Mumbai",
      bio: "Certified yoga instructor with 5 years of experience. Looking for someone to help build my yoga studio website.",
      trustScore: 95,
      verified: true,
    },
    {
      id: 2,
      name: "Raj Patel",
      avatar: "/placeholder.svg?height=300&width=300",
      matchPercentage: 95,
      offers: "Graphic Design 🎨",
      needs: "Guitar Lessons 🎸",
      location: "Bandra, Mumbai",
      bio: "Professional graphic designer specializing in branding and UI/UX. Always wanted to learn guitar!",
      trustScore: 88,
      verified: true,
    },
    {
      id: 3,
      name: "Ananya Desai",
      avatar: "/placeholder.svg?height=300&width=300",
      matchPercentage: 92,
      offers: "Home-cooked Meals 🍲",
      needs: "Fitness Training 💪",
      location: "Juhu, Mumbai",
      bio: "I love cooking traditional Indian cuisine and can prepare weekly meal plans. Looking for a fitness trainer to help me get in shape.",
      trustScore: 90,
      verified: false,
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=300&width=300",
      matchPercentage: 89,
      offers: "Carpentry 🔨",
      needs: "Cooking Lessons 🍳",
      location: "Dadar, Mumbai",
      bio: "Skilled carpenter with 10+ years of experience. Can build or fix anything! Want to learn how to cook basic meals.",
      trustScore: 93,
      verified: true,
    },
    {
      id: 5,
      name: "Neha Gupta",
      avatar: "/placeholder.svg?height=300&width=300",
      matchPercentage: 87,
      offers: "English Tutoring 📚",
      needs: "Photography 📷",
      location: "Powai, Mumbai",
      bio: "English teacher with a Cambridge certification. Looking for someone to take professional photos for my tutoring website.",
      trustScore: 91,
      verified: false,
    },
  ]

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? matches.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === matches.length - 1 ? 0 : prevIndex + 1))
  }

  const handleLike = () => {
    toast({
      title: "Match Liked!",
      description: `You liked ${matches[currentIndex].name}'s barter offer. We'll notify them!`,
    })
    handleNext()
  }

  const handleDislike = () => {
    toast({
      title: "Match Skipped",
      description: "We'll show you different matches next time.",
    })
    handleNext()
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing Matches",
      description: "Finding new barter opportunities for you...",
    })
    // In a real app, this would fetch new matches from the API
    setTimeout(() => {
      toast({
        title: "New Matches Found!",
        description: "We've found 5 new potential barter partners for you.",
      })
    }, 1500)
  }

  const handleMessage = () => {
    toast({
      title: "Chat Initiated",
      description: `You can now chat with ${matches[currentIndex].name} about the barter.`,
    })
    // In a real app, this would navigate to the chat page
  }

  const currentMatch = matches[currentIndex]

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Recommended Matches</h1>
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Matches
          </Button>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden">
            <div className="relative h-80 w-full">
              <Image
                src={currentMatch.avatar || "/placeholder.svg"}
                alt={currentMatch.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{currentMatch.name}</h2>
                      {currentMatch.verified && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm opacity-90">
                      <MapPin className="h-3 w-3 mr-1" />
                      {currentMatch.location}
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Sparkles className="h-3 w-3" />
                    {currentMatch.matchPercentage}% Match
                  </Badge>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Trust Score: {currentMatch.trustScore}/100</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevious} className="rounded-full">
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Previous</span>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} of {matches.length}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full">
                      <ChevronRight className="h-5 w-5" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium">Offers: {currentMatch.offers}</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium">Needs: {currentMatch.needs}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{currentMatch.bio}</p>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" size="lg" className="rounded-full gap-2" onClick={handleDislike}>
                    <ThumbsDown className="h-5 w-5" />
                    Skip
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full gap-2" onClick={handleMessage}>
                    <MessageSquare className="h-5 w-5" />
                    Message
                  </Button>
                  <Button variant="default" size="lg" className="rounded-full gap-2" onClick={handleLike}>
                    <ThumbsUp className="h-5 w-5" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {matches.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`h-2 w-2 rounded-full p-0 ${index === currentIndex ? "bg-primary" : "bg-muted"}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <span className="sr-only">Go to match {index + 1}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

