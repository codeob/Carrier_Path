import React from 'react'
import { Outlet } from 'react-router-dom'
import RecruiterSidebar from '../Components/RecruiterSidebar'

function RecruiterDashboard() {
  return (
   <div className="min-h-screen  flex">
      <RecruiterSidebar />
      <div className="flex-1 py-6  sm:px-6 lg:px-8 md:ml-56 lg:ml-64 xl:ml-64">
        <Outlet />
      </div>
    </div>
  )
}

export default RecruiterDashboard