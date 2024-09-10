import './App.css'
import { Outlet } from 'react-router-dom'
import SocketContextProvider from './context/SockentProvider'

function App() {

  return (
    <SocketContextProvider>
      <div className='bg-zinc-900 text-white w-full h-screen flex justify-center items-center'>
        <div>
          <Outlet />
        </div>
      </div>
    </SocketContextProvider>
  )
}

export default App
