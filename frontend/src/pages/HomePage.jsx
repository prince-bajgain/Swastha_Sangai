import React from 'react'
import { Outlet } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className='bg-background w-screen h-screen'>
        <Outlet />
    </div>
  )
}

export default HomePage