import { Sidebar } from 'lucide-react'
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../component/Sidebar'

const Layout = () => {
  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30">
      
      <main className="flex-1 overflow-auto">
        <div className="p-4 pt-16 sm:p-6 sm:p-6 lg:p8 max-w-400 mx-auto">
          <Outlet/>
          <Sidebar/>
        </div>
      </main>
    </div>
  )
}

export default Layout
