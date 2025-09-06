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
import HomePage from './screens/LandingPage'
import EducatorDashboard from './screens/EducatorDashboard'
import EducatorLogin from './screens/EducatorLogin'
import CheckAuthForEducator from './protected/CheckAuthForEducator'
import MatchedLearner from './screens/MatchedLearner'
import MatchedEducator from './screens/MatchedEducator'
import ForgotPassword from './screens/ForgotPassword'
import CheckUser from './protected/CheckRole'
import PaymentPage from './screens/PaymentPage'

function App() {


  return (
    <>
      <div className='App'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/lobby' element={<Lobby />} />
          <Route path='/room/:roomId' element={<Room />} />
          <Route path='/user/signup' element={<LearnerSignup />} />
          <Route path="/learner/login" element={<LearnerLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/learner/upload-profile-photo' element={
            <Checkauth protectedRoute={true}>
              <LearnerLandingPage />
            </Checkauth>
          } />
          <Route path="/learner/dashboard"
            element={<Checkauth protectedRoute={true}>
              <CheckUser>
                <LearnerDashboard />
              </CheckUser>
            </Checkauth>} />



          <Route path="/educator-details"
            element={<Checkauth protectedRoute={true}>
              <MatchedEducator />
            </Checkauth>} />


          <Route path="/educator/dashboard"
            element={<CheckAuthForEducator protectedRoute={true}>
              <EducatorDashboard />
            </CheckAuthForEducator>} />

          <Route path="/educator/login" element={<EducatorLogin />} />


          <Route path="/matched/learner"
            element={<CheckAuthForEducator protectedRoute={true}>
              <MatchedLearner />
            </CheckAuthForEducator>} />


          <Route path="/make-payment" element={
            <Checkauth protectedRoute={true}>
              <PaymentPage />
            </Checkauth>
          } />

        </Routes>


      </div>

    </>
  )
}

export default App
