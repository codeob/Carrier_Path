import React from 'react'
import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home'
import RecruiterAuth from './Components/RecruiterSignup'
import RecruiterDashboard from './Pages/RecruiterDashboard'
import JobSeekerDashboard from './Components/JobSeekerDashboard'
import JobSeekerSignup from './Components/JobSeekerSignup'
import ViewPost from './Pages/ViewPost'
import CreateJob from './Pages/CreateJob'
import JobList from './Pages/JobList'
import Applications from './Pages/Applications'
import Analytics from './Pages/Analytics'
import AvailableJob from './Pages/AvailableJob'
import Notifications from './Pages/Notifications'


function App() {
  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/'>
      <Route index element={<Home />} />
      <Route path='/recruiter/signup' element={<RecruiterAuth />} />
      <Route path='/jobseeker/signup' element={<JobSeekerSignup
      />} />
      <Route path='/recruiter/dashboard' element={<RecruiterDashboard />}>
        <Route index element={<ViewPost />} />
        <Route path="viewPost" element={<ViewPost />} />
        <Route path="CreateJobs" element={<CreateJob />} />
        <Route path="JobList" element={<JobList />} />
        <Route path="Applications" element={<Applications />} />
        <Route path="Analytics" element={<Analytics />} />

      </Route>
      {/* <Route path='/jobseeker/dashboard' element={<JobSeekerNavbar/>}> */}
      <Route path='/jobseeker/dashboard' element={<JobSeekerDashboard />}>
      <Route index element={<AvailableJob />} />
      <Route path="availableJobs" element={<AvailableJob />} />
      <Route path="notifications" element={<Notifications />} />
      </Route>
    </Route>
  ))
  return (
    <RouterProvider router={router} />
  )
}

export default App