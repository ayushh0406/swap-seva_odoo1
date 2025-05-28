// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { ArrowDownUp, CheckCircle2, Clock, Copy, Shield, Wallet } from "lucide-react"
// import { useToast } from "@/components/ui/use-toast"

// export default function WalletPage() {
//   const [walletAddress] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
//   const { toast } = useToast()
  
//   const handleCopyAddress = () => {
//     navigator.clipboard.writeText(walletAddress)
//     toast({
//       title: "Address Copied",
//       description: "Wallet address copied to clipboard.",
//     })
//   }

//   const handleDisconnect = () => {
//     toast({
//       title: "Wallet Disconnected",
//       description: "Your wallet has been disconnected.",
//     })
//     // In a real app, this would disconnect the wallet
//   }

//   // Sample transaction data
//   const transactions = [
//     {
//       id: 1,
//       type: "Trade Confirmation",
//       with: "Priya Sharma",
//       date: "Today, 2:30 PM",
//       status: "completed",
//       txHash: "0x3a4e...8f9d",
//     },
//     {
//       id: 2,
//       type: "Trade Initiation",
//       with: "Raj Patel",
//       date: "Yesterday, 5:15 PM",
//       status: "pending",
//       txHash: "0x7b2d...4e1c",
//     },
//     {
//       id: 3,
//       type: "Trade Confirmation",
//       with: "Ananya Desai",
//       date: "Mar 15, 2025",
//       status: "completed",
//       txHash: "0x9c5f...2a7b",
//     },
//     {
//       id: 4,
//       type: "Trade Cancellation",
//       with: "Vikram Singh",
//       date: "Mar 10, 2025",
//       status: "cancelled",
//       txHash: "0x1d8e...6f3a",
//     },
//   ]

//   // Sample active trades
//   const activeTrades = [
//     {
//       id: 1,
//       with: "Priya Sharma",
//       offering: "Web Development 💻",
//       receiving: "Yoga Classes 🧘‍♀️",
//       status: "confirmed",
//       date: "Started Mar 18, 2025",
//     },
//     {
//       id: 2,
//       with: "Raj Patel",
//       offering: "Guitar Lessons 🎸",
//       receiving: "Graphic Design 🎨",
//       status: "pending",
//       date: "Initiated Mar 20, 2025",
//     },
//     {
//       id: 3,
//       with: "Neha Gupta",
//       offering: "Photography 📷",
//       receiving: "English Tutoring 📚",
//       status: "in_progress",
//       date: "Started Mar 15, 2025",
//     },
//   ]

//   return (
//     <div className="container py-6">
//       <div className="flex flex-col gap-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold">Wallet & Trades</h1>
//         </div>
        
//         <div className="grid gap-6 md:grid-cols-[1fr_300px]">
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Connected Wallet</CardTitle>
//                 <CardDescription>
//                   Your Ethereum/Polygon wallet for secure barter transactions
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="rounded-full bg-primary/10 p-2">
//                       <Wallet className="h-5 w-5 text-primary" />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-1">
//                         <p className="font-mono text-sm">
//                           {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
//                         </p>
//                         <Button 
//                           variant="ghost" 
//                           size="icon" 
//                           className="h-6 w-6"
//                           onClick={handleCopyAddress}
//                         >
//                           <Copy className="h-3 w-3" />
//                           <span className="sr-only">Copy address</span>
//                         </Button>
//                       </div>
//                       <p className="text-xs text-muted-foreground">Metamask • Ethereum Network</p>
//                     </div>
//                   </div>
//                   <Button variant="outline" onClick={handleDisconnect}>
//                     Disconnect
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
            
//             <Tabs defaultValue="active">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="active">Active Trades</TabsTrigger>
//                 <TabsTrigger value="history">Transaction History</TabsTrigger>
//               </TabsList>
//               <TabsContent value="active">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Active Barter Trades</CardTitle>
//                     <CardDescription>
//                       Your ongoing barter agreements secured by smart contracts
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {activeTrades.map((trade) => (
//                         <div key={trade.id} className="rounded-lg border p-4">
//                           <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                             <div>
//                               <div className="flex items-center gap-2">
//                                 <h3 className="font-semibold">Trade with {trade.with}</h3>
//                                 <Badge 
//                                   variant="outline" 
//                                   className={`
//                                     ${trade.status === "confirmed" ? "bg-green-500/10 text-green-500" : ""}
//                                     ${trade.status === "pending" ? "bg-amber-500/10 text-amber-500" : ""}
//                                     ${trade.status === "in_progress" ? "bg-blue-500/10 text-blue-500" : ""}
//                                   `}
//                                 >
//                                   {trade.status === "confirmed" && "Confirmed"}
//                                   {trade.status === "pending" && "Pending"}
//                                   {trade.status === "in_progress" && "In Progress"}
//                                 </Badge>
//                               </div>
//                               <p className="text-xs text-muted-foreground">{trade.date}</p>
//                             </div>
//                             <Button variant="outline" size="sm" className="gap-1">
//                               <Shield className="h-3 w-3" />
//                               View Contract
//                             </Button>
//                           </div>
//                           <div className="mt-3 flex items-center gap-2 text-sm">
//                             <div className="rounded-md bg-muted px-2 py-1">
//                               <p>You offer: {trade.offering}</p>
//                             </div>
//                             <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
//                             <div className="rounded-md bg-muted px-2 py-1">
//                               <p>You receive: {trade.receiving}</p>
//                             </div>
//                           </div>
//                           <div className="mt-3 flex justify-end gap-2">
//                             {trade.status === "pending" && (
//                               <>
//                                 <Button size="sm" variant="destructive">
//                                   Decline
//                                 </Button>
//                                 <Button size="sm">
//                                   Accept
//                                 </Button>
//                               </>
//                             )}
//                             {trade.status === "in_progress" && (
//                               <Button size="sm">
//                                 Mark as Complete
//                               </Button>
//                             )}
//                             {trade.status === "confirmed" && (
//                               <Button size="sm" variant="outline" className="gap-1">
//                                 <CheckCircle2 className="h-3 w-3" />
//                                 Completed
//                               </Button>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//               <TabsContent value="history">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Transaction History</CardTitle>
//                     <CardDescription>
//                       Your blockchain transaction history for barter trades
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {transactions.map((tx) => (
//                         <div key={tx.id} className="flex items-center justify-between rounded-lg border p-4">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <div 
//                                 className={`rounded-full p-1 
//                                   ${tx.status === "completed" ? "bg-green-500/10" : ""}
//                                   ${tx.status === "pending" ? "bg-amber-500/10" : ""}
//                                   ${tx.status === "cancelled" ? "bg-red-500/10" : ""}
//                                 `}
//                               >
//                                 {tx.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
//                                 {tx.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
//                                 {tx.status === "cancelled" && <ArrowDownUp className="h-4 w-4 text-red-500" />}
//                               </div>
//                               <h3 className="font-medium">{tx.type}</h3>
//                             </div>
//                             <p className="text-sm text-muted-foreground">With {tx.with}</p>
//                             <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
//                               <p>{tx.date}</p>
//                               <span>•</span>
//                               <div className="flex items-center gap-1">
//                 \

