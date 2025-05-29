"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Community</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mumbai Swap Community</CardTitle>
            <CardDescription>
              Connect with other members of the barter community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Community Features Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're working on exciting community features to help you connect with other members.
              </p>
              <Button>Get Notified When Live</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
