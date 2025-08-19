import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Lobby from './screens/Lobby'
import Room from './screens/Room'
import LearnerSignup from './screens/LearnerSignup'
import Checkauth from './protected/CheckAuth'
import LearnerLandingPage from './screens/LearnerLandingPage'
import LearnerLogin from './screens/LearnerLogin'
import LearnerDashboard from './screens/LearnerDashboard'
import Connecting from './screens/Connecting'

function App() {


  return (
    <>
      <div className='App'>
        <Routes>
          <Route path='/lobby' element={<Lobby />} />
          <Route path='/room/:roomId' element={<Room />} />
          <Route path='/user/signup' element={<LearnerSignup />} />
          <Route path="/learner/login" element={<LearnerLogin />} />
          <Route path='/learner/upload-profile-photo' element={
            <Checkauth protectedRoute={true}>
              <LearnerLandingPage />
            </Checkauth>
          } />
          <Route path="/learner/dashboard"
            element={<Checkauth protectedRoute={true}>
              <LearnerDashboard />
            </Checkauth>} />



          <Route path="/educator-details"
            element={<Checkauth protectedRoute={true}>
              <Connecting />
            </Checkauth>} />
        </Routes>


      </div>

    </>
  )
}

export default App
