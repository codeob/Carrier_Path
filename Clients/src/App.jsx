import React from 'react'
import { createRoutesFromElements, Route, createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from './Pages/Home'
import RecruiterAuth from './Components/RecruiterSignup'
import RecruiterDashboard from './Pages/RecruiterDashboard'
import JobSeekerNavbar from './Components/JobSeekerNavbar'
import JobSeekerSignup from './Components/JobSeekerSignup'

function App() {
  const router= createBrowserRouter(createRoutesFromElements(
     <Route path='/'>
      <Route index element={<Home/>}/>
      <Route path='/recruiter/signup' element={<RecruiterAuth/>}/>
      <Route path='/jobseeker/signup' element={<JobSeekerSignup
      />}/>
      <Route path='/recruiter/dashboard' element={<RecruiterDashboard/>}>
        
      </Route>
      <Route path='/jobseeker/dashboard' element={<JobSeekerNavbar/>}/>
     </Route>
  ))
  return (
    <RouterProvider router={router}/>
  )
}

export default App