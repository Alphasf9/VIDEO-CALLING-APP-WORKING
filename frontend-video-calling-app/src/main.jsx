import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { EducatorProvider } from './context/EducatorContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EducatorProvider>
      <UserProvider>
        <BrowserRouter>
          <SocketProvider>
            <App />
          </SocketProvider>
        </BrowserRouter>
      </UserProvider>
    </EducatorProvider>
  </StrictMode>,
)
