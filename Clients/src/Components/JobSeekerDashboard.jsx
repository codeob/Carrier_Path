import React from 'react'
import { Outlet } from 'react-router-dom'
import UserNavbar from './JobSeekerNavbar'


function JobSeekerNavbar() {
  return (
     <div className="min-h-screen  flex flex-col">
      <UserNavbar />
      <div className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  )
}

export default JobSeekerNavbar