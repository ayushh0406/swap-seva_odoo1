"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowDownUp, CheckCircle2, Clock, Copy, Shield, Wallet } from "lucide-react"
import { useState } from "react"

export default function WalletPage() {
  const [walletAddress] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Wallet & Trades</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connected Wallet</CardTitle>
            <CardDescription>
              Your Ethereum/Polygon wallet for secure barter transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-sm">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </p>
                  <p className="text-xs text-muted-foreground">Metamask • Ethereum Network</p>
                </div>
              </div>
              <Button variant="outline">
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

