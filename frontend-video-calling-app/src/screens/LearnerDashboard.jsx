"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import api from "../api/AxiosInstance"
import { useNavigate } from "react-router-dom"
import {
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaBookOpen,
  FaChartLine,
  FaRocket,
  FaCheck,
  FaTimes,
  FaLightbulb,
  FaQuoteLeft,
  FaKey,
  FaCrown,
  FaSearch,
  FaStar,
  FaGraduationCap,
  FaUsers,
  FaTrophy,
  FaBars,
  FaHome,
  FaCog,
  FaHistory,
} from "react-icons/fa"
import { useEducator } from "../context/EducatorContext"
import { useSocket } from "../context/SocketContext"
import { useRoom } from "../context/RoomContext"
import UserSessions from "./UserSessions"
import SearchEducator from "./SearchEducator"
import TopRatedEducators from "./TopRatedEducators"

const LearnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { user, clearUserSession, setUser } = useUser()
  const navigate = useNavigate()
  const socket = useSocket()
  const [bioInput, setBioInput] = useState(user?.bio || "")
  const [topicsInput, setTopicsInput] = useState(user?.topics?.join(", ") || "")
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "")
  const [loading, setLoading] = useState(false)
  const { setEducator } = useEducator()
  const [isSearching, setIsSearching] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [connectionRequest, setConnectionRequest] = useState(null)
  const { setRoomId } = useRoom()
  const [recentRoomId, setRecentRoomId] = useState()
  const [query, setQuery] = useState("")

  const loadingMessages = [
    "Scanning for top educators...",
    "Matching your topics and interests...",
    "Connecting with the best experts...",
    "Analyzing compatibility...",
    "Preparing your perfect learning match...",
  ]

  const inspirationalQuotes = [
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
    {
      text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
      author: "Brian Herbert",
    },
  ]

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  socket.onAny((event, ...args) => {
    console.log("📡 Got event:", event, args)
  })

  const realRoomId = localStorage.getItem("roomId")
  useEffect(() => {
    if (realRoomId) {
      setRecentRoomId(realRoomId)
    }
  }, [realRoomId])

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % inspirationalQuotes.length)
    }, 10000)
    return () => clearInterval(quoteInterval)
  }, [inspirationalQuotes.length])

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log("Socket connected on learner dashboard:", socket.id)

      if (user?.userId) {
        socket.emit("user:register", { userId: user.userId })
      }

      console.log("🟢 Attaching listener for connection request")
      const handleConnectionRequest = ({ from }) => {
        console.log("🟢 Connection request received from educator", from)
        alert(`You have a connection request from educator ${from}`)
      }

      socket.on("connection-request-by-learner", handleConnectionRequest)

      return () => {
        socket.off("connection-request-by-learner", handleConnectionRequest)
      }
    }

    if (socket.connected) {
      handleConnect()
    } else {
      socket.once("connect", handleConnect)
    }
  }, [socket, user?.userId])

  useEffect(() => {
    socket.on("join-educator-room", ({ educatorId, learnerId, roomId, userId }) => {
      console.log("✅ Received educator room invite", { educatorId, learnerId, roomId })
      setRoomId(roomId)
      alert(`You will be redirected to room ${roomId}`)
      setConnectionRequest({ educatorId, learnerId, roomId })
      navigate("/lobby", { state: { userId } })
    })
  }, [navigate, socket, setRoomId])

  useEffect(() => {
    let interval
    if (isSearching) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isSearching, loadingMessages.length])

  useEffect(() => {
    if (user && socket) {
      socket.emit("update-availability", {
        userId: user.userId,
        socketId: socket.id,
        status: "online",
      })
    }
  }, [socket, user])

  useEffect(() => {
    if (!socket) return

    const handler = ({ educatorId, learnerId, roomId }) => {
      console.log("✅ Received educator room invite", { educatorId, learnerId, roomId })
      setConnectionRequest({ educatorId, learnerId, roomId })
    }

    socket.on("join-educator-room", handler)

    return () => {
      socket.off("join-educator-room", handler)
    }
  }, [socket])

  const handleAcceptRequest = () => {
    if (!connectionRequest) return

    console.log(`✅ Accepted connection request from educator ${connectionRequest.educatorId}`)
    const roomId = connectionRequest.roomId
    setConnectionRequest(null)

    navigate(`/room/${roomId}`)
  }

  const handleRejectRequest = () => {
    console.log(`Rejected connection request from educator ${connectionRequest.educatorId}`)
    setConnectionRequest(null)
  }

  const handleLogout = async () => {
    try {
      await api.post("/users/user-logout")
      clearUserSession()
      navigate("/")
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
      setUser(data.user)
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
      const { data } = await api.post("/matches/match/learner-to-educator", {
        learnerId: user.userId,
        topics: user.topics,
      })
      setEducator(data)
      navigate("/educator-details")
    } catch (err) {
      console.error("Error while searching educator:", err)
      alert("Failed to find educator. Try again.")
      setIsSearching(false)
    }
  }

  const welcomeMessage =
    user?.role === "educator"
      ? "Join the Learning Lobby to share your expertise with eager learners. Connect and inspire through your skills!"
      : "Dive into the Learning Lobby to connect with expert educators. Explore your interests and boost your skills!"

  // Determine premium badge color based on premium plan
  const getPremiumBadgeColor = () => {
    switch (user?.premiumPlan) {
      case "Educator Pro":
        return "from-yellow-400 to-yellow-600"
      case "Institution Elite":
        return "from-purple-500 to-purple-700"
      case "Basic":
        return "from-blue-400 to-blue-600"
      default:
        return ""
    }
  }

  if (isSearching) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center backdrop-blur-sm bg-card/80 rounded-3xl p-12 border border-border shadow-2xl">
          <div className="relative mb-8">
            <FaRocket className="text-8xl mb-6 animate-bounce mx-auto text-primary" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-30 animate-pulse"></div>
          </div>

          <h2 className="text-4xl font-bold mb-6 text-card-foreground">Finding Your Perfect Match</h2>

          <div className="mb-8">
            <p className="text-xl text-muted-foreground animate-fade-in-out font-medium">
              {loadingMessages[currentMessageIndex]}
            </p>
          </div>

          <div className="w-80 h-3 bg-muted rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-progress rounded-full shadow-lg"></div>
          </div>

          <div className="mt-6 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-out {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .animate-fade-in-out {
            animation: fade-in-out 2s infinite;
          }
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          .animate-progress {
            animation: progress 2s linear infinite;
          }
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Connection Request Modal */}
      {connectionRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scale-in border border-border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaBookOpen className="text-primary-foreground text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">New Connection Request</h2>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
            </div>

            <p className="text-muted-foreground mb-8 text-center leading-relaxed">
              You've received a connection request from Educator{" "}
              <span className="font-bold text-primary">{connectionRequest.educatorId}</span>. Ready to embark on your
              learning journey?
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleRejectRequest}
                className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-2xl hover:bg-destructive/90 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaTimes className="text-lg" />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptRequest}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaCheck className="text-lg" />
                <span>Accept & Join</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border shadow-2xl z-30 transition-all duration-300 ${sidebarOpen ? "w-72" : "w-20"}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center space-x-3 ${!sidebarOpen && "justify-center"}`}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FaGraduationCap className="text-primary-foreground text-xl" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-sidebar-foreground">Learning Hub</h1>
                  <p className="text-xs text-muted-foreground">Discover • Learn • Grow</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-sidebar-accent rounded-xl transition-colors duration-200"
            >
              <FaBars className="text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { icon: FaHome, label: "Dashboard", active: true },
              { icon: FaBookOpen, label: "My Courses" },
              { icon: FaChartLine, label: "Progress" },
              { icon: FaUsers, label: "Educators" },
              { icon: FaHistory, label: "Sessions" },
              { icon: FaCog, label: "Settings" },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <item.icon className="text-lg flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* User Profile in Sidebar */}
          {sidebarOpen && (
            <div className="mt-8 p-4 bg-sidebar-accent/50 rounded-2xl border border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-sidebar-border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <FaUserCircle className="text-primary-foreground text-2xl" />
                    </div>
                  )}
                  {user?.isPremium && <FaCrown className="absolute -top-1 -right-1 text-yellow-500 text-sm" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sidebar-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <header
        className={`fixed top-0 right-0 bg-card/80 backdrop-blur-xl border-b border-border shadow-lg z-20 transition-all duration-300 ${sidebarOpen ? "left-72" : "left-20"}`}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-card-foreground">Dashboard</h2>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.availability === "online"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  user?.availability === "online" ? "bg-primary animate-pulse" : "bg-muted-foreground"
                }`}
              ></div>
              {user?.availability === "online" ? "Online" : "Offline"}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search educators or topics..."
                className="pl-10 pr-4 py-2 w-80 rounded-xl border border-input bg-input/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground text-sm" />
            </div>

            <SearchEducator query={query} />

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground font-medium rounded-xl hover:bg-destructive/90 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className={`transition-all duration-300 pt-20 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        <div className="p-6 space-y-6">
          {/* Welcome Banner */}
          <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name}!</h1>
                  <p className="text-primary-foreground/80 text-lg">{welcomeMessage}</p>
                </div>
                <div className="flex space-x-2 text-2xl">
                  <FaRocket className="animate-bounce" />
                  <FaStar className="animate-pulse" />
                  <FaGraduationCap className="animate-bounce animation-delay-500" />
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="inline-flex items-center px-8 py-3 bg-white/20 backdrop-blur-sm text-primary-foreground font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 space-x-3 border border-white/20"
              >
                <FaRocket className="text-xl" />
                <span>Join Learning Lobby</span>
              </button>
            </div>
          </section>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Management Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio Section */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                    <FaBookOpen className="text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Professional Bio</h3>
                    <p className="text-sm text-muted-foreground">Share your story and goals</p>
                  </div>
                </div>

                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full border border-input rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-input/50 resize-none min-h-[120px] placeholder:text-muted-foreground"
                  placeholder="Share your professional background, passions, and learning goals..."
                />

                <button
                  onClick={() => updateUserDetails("bio")}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FaEdit />
                  <span>{loading ? "Updating..." : "Update Bio"}</span>
                </button>
              </div>

              {/* Topics Section */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mr-3">
                    <FaLightbulb className="text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Topics of Interest</h3>
                    <p className="text-sm text-muted-foreground">What do you want to learn?</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  className="w-full border border-input rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-input/50 placeholder:text-muted-foreground"
                  placeholder="AI Ethics, Quantum Computing, Sustainable Development..."
                />

                {user?.topics && user.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent/20 text-accent-foreground font-medium rounded-full text-sm border border-accent/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => updateUserDetails("topics")}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FaEdit />
                  <span>{loading ? "Updating..." : "Update Topics"}</span>
                </button>
              </div>

              {/* Skills Section (Educators Only) */}
              {user?.role === "educator" && (
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mr-3">
                      <FaTrophy className="text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">Your Expertise & Skills</h3>
                      <p className="text-sm text-muted-foreground">What can you teach others?</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full border border-input rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-input/50 placeholder:text-muted-foreground"
                    placeholder="Leadership, Data Analysis, Public Speaking..."
                  />

                  {user?.skills && user.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary/20 text-secondary-foreground font-medium rounded-full text-sm border border-secondary/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => updateUserDetails("skills")}
                    disabled={loading}
                    className="mt-4 px-6 py-2 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FaEdit />
                    <span>{loading ? "Updating..." : "Update Skills"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar - Stats and Info */}
            <div className="space-y-6">
              {/* Account Stats */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                  <FaChartLine className="text-primary mr-3" />
                  Account Insights
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Created", value: user?.createdAt ? formatDate(user.createdAt) : "N/A", icon: FaUsers },
                    { label: "Updated", value: user?.updatedAt ? formatDate(user.updatedAt) : "N/A", icon: FaEdit },
                    { label: "User ID", value: user?.userId || "N/A", icon: FaKey },
                    ...(user?.isPremium
                      ? [
                          { label: "Premium Plan", value: user?.premiumPlan || "N/A", icon: FaCrown },
                          {
                            label: "Premium Expires",
                            value: user?.premiumExpiresAt ? formatDate(user.premiumExpiresAt) : "N/A",
                            icon: FaTrophy,
                          },
                        ]
                      : []),
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center">
                        <item.icon className="text-muted-foreground mr-2 text-sm" />
                        <span className="text-muted-foreground text-sm font-medium">{item.label}:</span>
                      </div>
                      <span className="text-foreground text-sm font-semibold truncate max-w-32">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspirational Quote */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                  <FaLightbulb className="text-accent mr-3" />
                  Daily Inspiration
                </h3>
                <div className="relative">
                  <FaQuoteLeft className="text-accent/60 text-xl mb-3" />
                  <p className="text-foreground italic text-sm leading-relaxed mb-3">
                    {inspirationalQuotes[currentQuoteIndex].text}
                  </p>
                  <p className="text-right text-muted-foreground text-xs font-semibold">
                    — {inspirationalQuotes[currentQuoteIndex].author}
                  </p>
                </div>
              </div>

              {/* Premium Status */}
              {user?.isPremium ? (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                    <FaCrown className="text-yellow-500 mr-3" />
                    Premium Features
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Priority Matching with Top Educators",
                      "Access to Exclusive Webinars",
                      "Advanced Analytics Dashboard",
                      ...(user?.premiumPlan === "Educator Pro" ? ["Enhanced Educator Tools"] : []),
                      ...(user?.premiumPlan === "Institution Elite" ? ["Institutional Admin Access"] : []),
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <FaCheck className="text-primary text-sm flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaCrown className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Upgrade to Premium</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Unlock exclusive features and accelerate your learning journey
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sessions Section */}
          <section className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
            {user.isPremium ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                    <FaChartLine className="text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">Learning Sessions</h2>
                    <p className="text-sm text-muted-foreground">Track your progress and achievements</p>
                  </div>
                </div>
                <UserSessions userId={user.userId} recentRoomId={recentRoomId} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaCrown className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-card-foreground">Unlock Premium Analytics</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Access detailed session analysis, progress tracking, and personalized learning insights with a Premium
                  subscription.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 space-x-2"
                >
                  <FaCrown />
                  <span>Upgrade to Premium</span>
                </button>
              </div>
            )}
          </section>

          {/* Top Rated Educators */}
          <section className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mr-3">
                <FaStar className="text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Top Rated Educators</h2>
                <p className="text-sm text-muted-foreground">Connect with the best in your field</p>
              </div>
            </div>
            <TopRatedEducators />
          </section>
        </div>
      </main>

      {/* Enhanced Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 3s;
        }
        @keyframes scale-in {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}

export default LearnerDashboard
