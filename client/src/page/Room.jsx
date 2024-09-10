import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SockentProvider'
import ReactPlayer from "react-player";
import peer from '../utils/peer';

// 2nd change
function RoomPage() {
  const socket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  if (remoteStream) {
    console.log("\n\n\n")
    console.log("Remote Stream Tracks", remoteStream.getTracks());
    console.log("\n\n\n")
  }


  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User ${email} joined the room`)
    setRemoteSocketId(id)
  }, [])

  const handleCallUser = useCallback(async () => {
    console.log("Calling user", remoteSocketId)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    const offer = await peer.getOffer()
    socket.emit("call-user", { to: remoteSocketId, offer })
    setMyStream(stream)
  }, [remoteSocketId, socket])


  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    setMyStream(stream)
    console.log("Incoming call from", from, offer)
    const ans = await peer.getAnswer(offer)
    socket.emit("call-accepted", { to: from, ans });

  }, [socket])

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(async ({ from, ans }) => {
    console.log("Call accepted from", from, ans)
    peer.setLocalDescription(ans);
    sendStreams()

  }, [sendStreams])

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer()
    socket.emit("peer-negotiation-needed", { offer, to: remoteSocketId })
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [handleNegotiationNeeded])

  const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer)
    socket.emit("perr-negotiation-done", { to: from, ans });
  }, [socket]);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans)
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, [])


  useEffect(() => {
    socket.on("room-joined", handleUserJoined)
    socket.on("incoming-call", handleIncomingCall)
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-negotiation-needed", handleNegoNeedIncomming)
    socket.on("peer-negotiation-final", handleNegoNeedFinal)

    return () => {
      socket.off("room-joined", handleUserJoined)
      socket.off("incoming-call", handleIncomingCall)
      socket.off("call-accepted", handleCallAccepted)
      socket.off("peer-negotiation-needed", handleNegoNeedIncomming)
      socket.off("peer-negotiation-final", handleNegoNeedFinal)

    }
  }, [handleUserJoined, handleIncomingCall, handleCallAccepted, socket, handleNegoNeedIncomming, handleNegoNeedFinal])


  return (
    <div>
      <h1 className='text-5xl font-semibold ' >Room</h1>
      {
        remoteSocketId ? (
          < div>
            <p>Remote user connected with id: {remoteSocketId}</p>
            <button onClick={handleCallUser}>CaLL</button>
          </div>
        ) : (
          <p>Waiting for remote user to connect</p>
        )
      }
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {
        myStream && (
          <>
            <h1>My Stream</h1>
            <ReactPlayer
              playing
              // muted
              height="100px"
              width="200px"
              url={myStream}
            />
          </>
        )
      }
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <video
            playsInline
            autoPlay
            muted={false} // Set to false if you want audio
            ref={(videoElement) => {
              if (videoElement && !videoElement.srcObject) {
                videoElement.srcObject = remoteStream;  // Directly assign the MediaStream
              }
            }}
            width="400"
            height="300"
          ></video>
        </>
      )}


    </div>
  )
}

// changes

export default RoomPage