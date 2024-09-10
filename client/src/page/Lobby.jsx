import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SockentProvider'
import { useNavigate } from 'react-router-dom'

function LobbyScreen() {

    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")
    const socket = useSocket()
    const navigate = useNavigate()

    console.log(socket)

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        socket.emit("room-join", { email, room })

    }, [email, room, socket])

    const handleJoinRoom = useCallback(({ email, room }) => {
        navigate(`/room/${room}`)
    }, [navigate])

    useEffect(() => {
        socket.on("room-join", handleJoinRoom)
        return () => {
            socket.off("room-join", handleJoinRoom)
        }
    }, [socket, handleJoinRoom])

    return (
        <>
            <h1>Lobby</h1>
            <br />
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                {' '}
                <input className='text-black' type='email' id='email' onChange={e => setEmail(e.target.value)} placeholder='email@example.com' />
                <br />
                <br />
                <label htmlFor="room">room</label>
                {' '}
                <input className='text-black' type="text" onChange={e => setRoom(e.target.value)} id='room' />
                <br />
                <br />
                <button className='bg-zinc-700 text-white h-10 rounded-xl w-36' type="submit">Join</button>
            </form>
        </>
    )
}

export default LobbyScreen