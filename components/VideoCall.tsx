"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react"
import { io, Socket } from "socket.io-client"
import Peer from "simple-peer"
import { SOCKET_URL } from "@/lib/api-config"

type VideoCallProps = {
  isOpen: boolean
  onClose: () => void
  chatId: string
  recipientId: string
  callType: "video" | "audio"
  isIncoming?: boolean
  callerId?: string
}

export default function VideoCall({
  isOpen,
  onClose,
  chatId,
  recipientId,
  callType,
  isIncoming = false,
  callerId
}: VideoCallProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio")
  
  const myVideo = useRef<HTMLVideoElement>(null)
  const userVideo = useRef<HTMLVideoElement>(null)
  const connectionRef = useRef<Peer.Instance | null>(null)
  const socketRef = useRef<Socket | null>(null)
  
  useEffect(() => {
    // Connect to socket server
    const token = localStorage.getItem("authToken")
    if (!token) return
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    })
    
    // Initialize media based on call type
    const constraints = {
      video: callType === "video",
      audio: true
    }
    
    // Get user media
    navigator.mediaDevices.getUserMedia(constraints)
      .then((currentStream) => {
        setStream(currentStream)
        
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream
        }
        
        // If it's an incoming call, don't initialize a call
        if (!isIncoming) {
          // Initiate call
          socketRef.current.emit("initiate-call", {
            to: recipientId,
            callType
          })
          
          // Wait for the other user to accept
          socketRef.current.on("call-accepted", ({ from, callType: acceptedCallType }) => {
            if (from === recipientId) {
              console.log("Call accepted by recipient, initializing peer connection")
              initializeCall()
            }
          })
          
          // Handle call rejection
          socketRef.current.on("call-rejected", ({ from }) => {
            if (from === recipientId) {
              console.log("Call rejected by recipient")
              endCall()
            }
          })
          
          // Handle when recipient is busy
          socketRef.current.on("user-busy", ({ from }) => {
            if (from === recipientId) {
              console.log("Recipient is busy")
              endCall()
            }
          })
        } else {
          // Listen for incoming signals
          socketRef.current.on("call-signal", ({ from, signal }) => {
            if (from === callerId) {
              console.log("Received signal from caller")
              answerCall(signal)
            }
          })
        }
      })
      .catch(error => {
        console.error("Error accessing media devices:", error)
      })
    
    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      
      if (connectionRef.current) {
        connectionRef.current.destroy()
      }
    }
  }, [callType, isIncoming, callerId])
  
  const initializeCall = () => {
    if (!stream || !socketRef.current) return
    
    // Create peer connection
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    })
    
    // When we have a signal to send
    peer.on("signal", (data) => {
      socketRef.current?.emit("call-signal", {
        to: recipientId,
        signal: data,
        callType
      })
    })
    
    // When we receive their stream
    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream
      }
    })
    
    // Handle when peer closes connection
    peer.on("close", () => {
      endCall()
    })
    
    // Handle errors
    peer.on("error", (err) => {
      console.error("Peer connection error:", err)
      endCall()
    })
    
    connectionRef.current = peer
  }
  
  const answerCall = (incomingSignal: any) => {
    if (!stream || !socketRef.current) return
    
    setCallAccepted(true)
    
    // Create peer connection
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    })
    
    // When we have a signal to send back
    peer.on("signal", (data) => {
      socketRef.current?.emit("call-signal", {
        to: callerId,
        signal: data,
        callType
      })
    })
    
    // When we receive their stream
    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream
      }
    })
    
    // Handle when peer closes connection
    peer.on("close", () => {
      endCall()
    })
    
    // Handle errors
    peer.on("error", (err) => {
      console.error("Peer connection error:", err)
      endCall()
    })
    
    // Signal to the initiator that we're ready to connect
    peer.signal(incomingSignal)
    
    connectionRef.current = peer
  }
  
  const endCall = () => {
    setCallEnded(true)
    
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    // Close peer connection
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }
    
    // Notify the other user that call has ended
    socketRef.current?.emit("call-ended", {
      to: isIncoming ? callerId : recipientId
    })
    
    // Close the dialog
    onClose()
  }
  
  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }
  
  const toggleVideo = () => {
    if (stream && callType === "video") {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isIncoming ? "Incoming Call" : "Outgoing Call"}
            {callType === "video" ? " (Video)" : " (Audio)"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={myVideo}
              muted
              autoPlay
              playsInline
              className={`w-full h-40 object-cover ${isVideoOff || callType === "audio" ? "hidden" : ""}`}
            />
            {(isVideoOff || callType === "audio") && (
              <div className="w-full h-40 flex items-center justify-center bg-gray-900 text-white">
                <span className="text-lg font-medium">You</span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
              You {isMuted ? "(Muted)" : ""}
            </span>
          </div>
          
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={userVideo}
              autoPlay
              playsInline
              className={`w-full h-40 object-cover ${!callAccepted ? "hidden" : ""}`}
            />
            {!callAccepted && (
              <div className="w-full h-40 flex items-center justify-center bg-gray-900 text-white">
                <span className="text-lg font-medium">Connecting...</span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
              Recipient
            </span>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className={isMuted ? "bg-red-100 text-red-500" : ""}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          {callType === "video" && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVideo}
              className={isVideoOff ? "bg-red-100 text-red-500" : ""}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </Button>
          )}
          
          <Button variant="destructive" size="icon" onClick={endCall}>
            <Phone size={20} className="rotate-135" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 