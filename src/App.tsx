import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Profile from './pages/Profile'
import EventManager from './pages/EventManager'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/event-manager" element={<EventManager />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App 