import { useEffect, useRef, useState } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const APP_ID = 1234567890; // Replace with your App ID
const SERVER_SECRET = "your-server-secret"; // Replace with your Server Secret
const ROOM_ID = "testRoom";
const USER_ID = "user_" + Math.floor(Math.random() * 1000);

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [zegoClient, setZegoClient] = useState(null);

  useEffect(() => {
    const zg = new ZegoExpressEngine(APP_ID, SERVER_SECRET);
    setZegoClient(zg);

    zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
      if (updateType === "ADD") {
        await zg.startPlayingStream(streamList[0].streamID, remoteVideoRef.current);
      }
    });

    return () => {
      zg.logoutRoom(ROOM_ID);
      zg.destroyEngine();
    };
  }, []);

  const startCall = async () => {
    await zegoClient.loginRoom(ROOM_ID, "token", { userID: USER_ID, userName: USER_ID });
    const localStream = await zegoClient.createStream();
    localVideoRef.current.srcObject = localStream;
    await zegoClient.startPublishingStream(USER_ID, localStream);
  };

  return (
    <div>
      <h2>ZegoCloud Video Call</h2>
      <button onClick={startCall}>Start Call</button>
      <div>
        <video ref={localVideoRef} autoPlay playsInline style={{ width: "300px" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
      </div>
    </div>
  );
};

export default VideoCall;
