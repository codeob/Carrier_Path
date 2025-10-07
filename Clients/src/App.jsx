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
import FormOptions from './Components/FormOptions'
import Cvscan from './Pages/Cvscan'
import CvRater from './Pages/CvRater'
import CVviewer from './Pages/CVviewer'

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/'>
      <Route index element={<Home />} />

      {/* Auth routes (aliases for consistency across codebase) */}
      <Route path='/recruiter/signup' element={<RecruiterAuth />} />
      <Route path='/recruiter/auth' element={<RecruiterAuth />} />
      <Route path='/form' element={<FormOptions/>} />
      <Route path='/Cvscan' element={<Cvscan/>} />

      <Route path='/jobseeker/signup' element={<JobSeekerSignup />} />
      <Route path='/jobseeker/auth' element={<JobSeekerSignup />} />
      <Route path='/user/auth' element={<JobSeekerSignup />} />

      {/* Recruiter dashboard */}
      <Route path='/recruiter/dashboard' element={<RecruiterDashboard />}>
        <Route index element={<ViewPost />} />
        <Route path='viewPost' element={<ViewPost />} />
        {/* Support both CreateJob and CreateJobs paths */}
        <Route path='CreateJob' element={<CreateJob />} />
        <Route path='CreateJobs' element={<CreateJob />} />
        <Route path='JobList' element={<JobList />} />
        <Route path='Applications' element={<Applications />} />
        <Route path='Analytics' element={<Analytics />} />
      </Route>

      {/* Jobseeker dashboard */}
      <Route path='/jobseeker/dashboard' element={<JobSeekerDashboard />}>
        <Route index element={<AvailableJob />} />
        <Route path='availableJobs' element={<AvailableJob />} />
        <Route path='notifications' element={<Notifications />} />
        <Route path='cvRater' element={<CvRater/>} />
        <Route path='cvviewer' element={<CVviewer/>} />
      </Route>
    </Route>
  ))
  return (
    <RouterProvider router={router} />
  )
}

export default App
