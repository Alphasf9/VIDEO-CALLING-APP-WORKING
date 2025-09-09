"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useEducator } from "../context/EducatorContext"
import api from "../api/AxiosInstance"
import {
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaBookOpen,
  FaChartLine,
  FaRocket,
  FaUsers,
  FaVideo,
  FaStar,
  FaCheck,
  FaTimes,
  FaLightbulb,
  FaQuoteLeft,
  FaBars,
  FaHome,
  FaCog,
  FaGraduationCap,
  FaCalendarAlt,
  FaComments,
  FaSearch,
  FaBell,
  FaAward,
  FaTrophy,
} from "react-icons/fa"
import { useSocket } from "../context/SocketContext"
import { useRoom } from "../context/RoomContext"
import SessionDetails from "./SessionDetails"
import UserSessions from "./UserSessions"
import SearchLearners from "./SearchLearner"
import TopRatedLearners from "./TopRatedLearners"

const EducatorDashboard = () => {
  const { educator: user, setEducator } = useEducator()
  const navigate = useNavigate()
  const socket = useSocket()
  const [bioInput, setBioInput] = useState(user?.bio || "")
  const [topicsInput, setTopicsInput] = useState(user?.topics?.join(", ") || "")
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "")
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [connectionRequest, setConnectionRequest] = useState(null)
  const [recentRoomId, setRecentRoomId] = useState()
  const [query, setQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  const { setRoomId } = useRoom()

  const searchMessages = [
    "Finding the best learners for you...",
    "Analyzing interests and skills...",
    "Connecting with eager students...",
    "Matching your expertise perfectly...",
    "Preparing your teaching lobby...",
  ]

  const inspirationalQuotes = [
    {
      text: "The best teachers are those who show you where to look, but don't tell you what to see.",
      author: "Alexandra K. Trenfor",
    },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
    { text: "Teaching is the greatest act of optimism.", author: "Colleen Wilcox" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  ]

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "analytics", label: "Analytics", icon: FaChartLine },
    { id: "students", label: "Students", icon: FaUsers },
    { id: "sessions", label: "Sessions", icon: FaVideo },
    { id: "profile", label: "Profile", icon: FaGraduationCap },
    { id: "calendar", label: "Calendar", icon: FaCalendarAlt },
    { id: "messages", label: "Messages", icon: FaComments },
    { id: "settings", label: "Settings", icon: FaCog },
  ]

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % inspirationalQuotes.length)
    }, 10000)
    return () => clearInterval(quoteInterval)
  }, [inspirationalQuotes.length])

  function generateRoomId(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let roomId = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      roomId += chars[randomIndex]
    }
    return roomId
  }

  useEffect(() => {
    let interval
    if (isSearching) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % searchMessages.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isSearching, searchMessages.length])

  useEffect(() => {
    if (user && socket) {
      socket.emit("update-availability", {
        userId: user.userId,
        socketId: socket.id,
        status: "online",
        educatorId: user.userId,
      })

      return () => {
        socket.off("connection-request-by-learner")
      }
    }
  }, [socket, user])

  useEffect(() => {
    if (!socket) return

    const handleConnectionRequest = ({ from }) => {
      console.log(`We got a connection request from learner ${from}`)
      setConnectionRequest({ from })
    }

    socket.on("connection-request-by-educator", handleConnectionRequest)

    return () => {
      socket.off("connection-request-by-educator", handleConnectionRequest)
    }
  }, [socket])

  const handleAcceptRequest = () => {
    console.log(`Accepted connection request from ${connectionRequest.from}`)
    const room = generateRoomId()
    setRoomId(room)
    navigate("/lobby", { state: { userId: user.email } })
    socket.emit("educator-accepted-room", {
      educatorId: user.userId,
      learnerId: connectionRequest.from,
      roomId: room,
      userId: user.email,
    })

    setConnectionRequest(null)
  }

  const realRoomId = localStorage.getItem("roomId")
  useEffect(() => {
    if (realRoomId) {
      setRecentRoomId(realRoomId)
    }
  }, [realRoomId])

  const handleRejectRequest = () => {
    console.log(`Rejected connection request from ${connectionRequest.from}`)
    setConnectionRequest(null)
  }

  const handleLogout = async () => {
    try {
      await api.post("/users/user-logout")
      setEducator(null)
      navigate("/educator/login")
    } catch (err) {
      console.error("Logout failed:", err)
      alert("Failed to logout. Please try again.")
    }
  }

  const updateUserDetails = async (field) => {
    try {
      setLoading(true)
      const payload = {}
      if (field === "bio") payload.bio = bioInput
      if (field === "topics") payload.topics = topicsInput.split(",").map((t) => t.trim())
      if (field === "skills") payload.skills = skillsInput.split(",").map((t) => t.trim())

      const { data } = await api.patch("/users/update-user-deatils", payload)
      setEducator(data.user)
      alert("Profile updated successfully!")
    } catch (err) {
      console.error("Update failed:", err)
      alert("Failed to update profile. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfileClick = () => {
    alert("Your profile cannot be edited once set. Contact support for assistance.")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const { data } = await api.post("/matches/match/educator-to-learner", {
        educatorId: user.userId,
        skills: user.skills,
      })
      setEducator(data)
      navigate("/matched/learner")
    } catch (err) {
      console.error("Error while searching learner:", err)
      alert("Failed to find learners. Try again.")
      setIsSearching(false)
    }
  }

  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
        <div className="relative z-10 text-center">
          <FaRocket className="text-6xl mb-6 text-primary animate-bounce" />
          <h2 className="text-3xl font-bold mb-4 text-foreground">Finding Your Perfect Learners...</h2>
          <p className="text-xl mb-8 text-muted-foreground animate-pulse">{searchMessages[currentMessageIndex]}</p>
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Connection Request Modal */}
      {connectionRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
              <FaUsers className="text-primary" />
              New Connection Request
            </h2>
            <p className="text-muted-foreground mb-6">
              You've received a connection request from Learner{" "}
              <span className="font-semibold text-primary">{connectionRequest.from}</span>. Ready to inspire and teach?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleRejectRequest}
                className="px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Decline
              </button>
              <button
                onClick={handleAcceptRequest}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaCheck />
                Accept & Join
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <img src="/logo2.png" alt="Platform Logo" className="h-8 w-8 rounded-lg" />
                <h1 className="text-lg font-bold text-sidebar-foreground">EduHub Pro</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent/10 text-sidebar-foreground transition-colors"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                  }`}
                >
                  <item.icon className="text-lg" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl || "/placeholder.svg"}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
            ) : (
              <FaUserCircle className="text-3xl text-primary" />
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-card-foreground capitalize">{activeSection}</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search learners..."
                  className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground w-80"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors relative">
                <FaBell className="text-lg" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 🚀</h1>
                  <p className="text-lg opacity-90 mb-6">Ready to inspire and educate your students today?</p>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    <FaRocket />
                    Find Learners
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <FaUsers className="text-2xl text-primary" />
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">45</h3>
                  <p className="text-muted-foreground">Students Taught</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <FaVideo className="text-2xl text-accent" />
                    <span className="text-sm text-muted-foreground">Sessions</span>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">78</h3>
                  <p className="text-muted-foreground">Completed</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <FaAward className="text-2xl text-chart-3" />
                    <span className="text-sm text-muted-foreground">Rating</span>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">4.9</h3>
                  <p className="text-muted-foreground">Average Score</p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <FaTrophy className="text-2xl text-chart-4" />
                    <span className="text-sm text-muted-foreground">Hours</span>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">120</h3>
                  <p className="text-muted-foreground">Teaching Time</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                    <FaLightbulb className="text-accent" />
                    Teaching Inspiration
                  </h3>
                  <div className="relative">
                    <FaQuoteLeft className="absolute top-0 left-0 text-muted-foreground/30 text-2xl" />
                    <p className="text-muted-foreground italic pl-8 mb-2">
                      {inspirationalQuotes[currentQuoteIndex].text}
                    </p>
                    <p className="text-right text-muted-foreground text-sm font-medium">
                      - {inspirationalQuotes[currentQuoteIndex].author}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-xl font-bold text-card-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FaVideo className="text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">Session with John D.</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FaStar className="text-accent" />
                      <div>
                        <p className="font-medium text-card-foreground">Received 5-star rating</p>
                        <p className="text-sm text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "profile" && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <div className="flex items-center gap-6 mb-6">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-primary"
                    />
                  ) : (
                    <FaUserCircle className="text-8xl text-primary" />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-card-foreground">{user?.name}</h2>
                    <p className="text-muted-foreground text-lg">{user?.email}</p>
                    <p className="text-primary font-semibold capitalize">{user?.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleEditProfileClick}
                  className="px-6 py-3 bg-muted text-muted-foreground rounded-lg cursor-not-allowed flex items-center gap-2"
                >
                  <FaEdit />
                  Edit Profile (Contact Support)
                </button>
              </div>

              {/* Bio Section */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <FaBookOpen className="text-primary" />
                  Professional Bio
                </h3>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-input min-h-[120px] resize-y"
                  placeholder="Share your teaching expertise and experience..."
                />
                <button
                  onClick={() => updateUserDetails("bio")}
                  disabled={loading}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FaEdit />
                  {loading ? "Updating..." : "Update Bio"}
                </button>
              </div>

              {/* Topics Section */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold text-card-foreground mb-4">Teaching Topics</h3>
                <input
                  type="text"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  className="w-full border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-input"
                  placeholder="Enter topics separated by commas..."
                />
                <button
                  onClick={() => updateUserDetails("topics")}
                  disabled={loading}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FaEdit />
                  {loading ? "Updating..." : "Update Topics"}
                </button>
                {user?.topics && user.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold text-card-foreground mb-4">Skills & Expertise</h3>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-input"
                  placeholder="Enter skills separated by commas..."
                />
                <button
                  onClick={() => updateUserDetails("skills")}
                  disabled={loading}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FaEdit />
                  {loading ? "Updating..." : "Update Skills"}
                </button>
                {user?.skills && user.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-accent/10 text-accent font-medium rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "sessions" && (
            <div className="space-y-6">
              {user.isPremium ? (
                <>
                  {recentRoomId ? (
                    <SessionDetails sessionId={recentRoomId} userId={user.userId} />
                  ) : (
                    <div className="bg-card rounded-xl p-12 border border-border text-center">
                      <FaVideo className="text-5xl text-muted-foreground mb-4 mx-auto" />
                      <h3 className="text-2xl font-bold text-card-foreground mb-2">No Recent Sessions</h3>
                      <p className="text-muted-foreground mb-6">Start teaching to see your session history here.</p>
                      <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FaRocket />
                        Find Learners
                      </button>
                    </div>
                  )}
                  <UserSessions userId={user.userId} recentRoomId={recentRoomId} />
                </>
              ) : (
                <div className="bg-card rounded-xl p-12 border border-border text-center">
                  <FaTrophy className="text-5xl text-accent mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold text-card-foreground mb-4">Unlock Premium Features</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Get detailed session analytics, student engagement metrics, and advanced teaching tools with
                    Premium.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    <FaRocket />
                    Upgrade to Premium
                  </a>
                </div>
              )}
            </div>
          )}

          {activeSection === "students" && (
            <div className="space-y-6">
              <SearchLearners query={query} />
              <TopRatedLearners />
            </div>
          )}

          {/* Other sections can be added here */}
          {!["dashboard", "profile", "sessions", "students"].includes(activeSection) && (
            <div className="bg-card rounded-xl p-12 border border-border text-center">
              <FaCog className="text-5xl text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">This section is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default EducatorDashboard
