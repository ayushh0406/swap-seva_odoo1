"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, PhoneOff, Video } from "lucide-react"
import { io, Socket } from "socket.io-client"
import VideoCall from "./VideoCall"
import { SOCKET_URL } from "@/lib/api-config"

type IncomingCallProps = {
  onAccept: (callerId: string, callType: "video" | "audio") => void
  onReject: () => void
}

export default function IncomingCallHandler({ onAccept, onReject }: IncomingCallProps) {
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerAvatar: string;
    callType: "video" | "audio";
  } | null>(null)
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [showVideoCall, setShowVideoCall] = useState(false)
  
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return
    
    // Connect to socket server
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    })
    
    setSocket(newSocket)
    
    // Listen for incoming calls
    newSocket.on("incoming-call", ({ from, to, name, avatar, callType }) => {
      const currentUserId = localStorage.getItem("userId");
      console.log("[INCOMING CALL] Event received:", { from, to, name, avatar, callType });
      console.log("[INCOMING CALL] currentUserId:", currentUserId);
      if (to !== currentUserId) {
        console.log("[INCOMING CALL] Not for this user, ignoring.");
        return;
      }
      console.log("[INCOMING CALL] Showing accept dialog for this user.");
      
      // Play ringtone
      const audio = new Audio("/sounds/ringtone.mp3")
      audio.loop = true
      audio.play().catch(err => console.error("Error playing ringtone:", err))
      
      // Save audio instance to stop it later
      const audioInstance = audio
      
      // Set incoming call data
      setIncomingCall({
        callerId: from,
        callerName: name,
        callerAvatar: avatar,
        callType: callType
      })
      
      // Auto-reject after 30 seconds if not answered
      const timeoutId = setTimeout(() => {
        handleReject()
      }, 30000)
      
      // Cleanup function
      return () => {
        clearTimeout(timeoutId)
        audioInstance.pause()
        audioInstance.currentTime = 0
      }
    })
    
    // Listen for call cancellation
    newSocket.on("call-cancelled", () => {
      setIncomingCall(null)
    })
    
    return () => {
      newSocket.disconnect()
    }
  }, [])
  
  const handleAccept = () => {
    if (incomingCall) {
      // Set up video call component
      setShowVideoCall(true)
      
      // Notify caller that we accepted
      socket?.emit("call-accepted", {
        to: incomingCall.callerId,
        callType: incomingCall.callType
      })
      
      // Callback for parent component
      onAccept(incomingCall.callerId, incomingCall.callType)
    }
  }
  
  const handleReject = () => {
    if (incomingCall) {
      // Notify caller that we rejected
      socket?.emit("call-rejected", {
        to: incomingCall.callerId
      })
      
      setIncomingCall(null)
      
      // Callback for parent component
      onReject()
    }
  }
  
  const handleCallEnded = () => {
    setShowVideoCall(false)
    setIncomingCall(null)
  }
  
  if (showVideoCall && incomingCall) {
    return (
      <VideoCall
        isOpen={true}
        onClose={handleCallEnded}
        chatId=""
        recipientId={incomingCall.callerId}
        callType={incomingCall.callType}
        isIncoming={true}
        callerId={incomingCall.callerId}
      />
    )
  }
  
  return (
    <Dialog open={!!incomingCall} onOpenChange={(open) => !open && handleReject()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Incoming {incomingCall?.callType === "video" ? "Video" : "Audio"} Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={incomingCall?.callerAvatar || "/placeholder.svg"} />
            <AvatarFallback>{incomingCall?.callerName.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-medium">{incomingCall?.callerName}</h3>
            <p className="text-sm text-muted-foreground">is calling you...</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={handleReject}>
            <PhoneOff size={24} />
          </Button>
          
          <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600" onClick={handleAccept}>
            {incomingCall?.callType === "video" ? <Video size={24} /> : <Phone size={24} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 