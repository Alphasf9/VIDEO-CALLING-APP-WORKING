import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaBookOpen, FaUsers, FaStar, FaVideo, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import api from '../api/AxiosInstance';

const HomePage = () => {
    const { user, clearUserSession } = useUser();

    const navigate = useNavigate();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentTagline, setCurrentTagline] = useState(0);
    const [stats, setStats] = useState({ users: 0, educators: 0, sessions: 0 });
    const [faqOpen, setFaqOpen] = useState(null);

    const taglines = [
        "Connect with expert educators instantly!",
        "Master new skills with personalized learning!",
        "Join live video calls for interactive sessions!",
    ];

    const testimonials = [
        { quote: "Learning Hub transformed my skills with personalized educator matches!", author: "Priya S., Learner" },
        { quote: "As an educator, I love connecting with passionate students!", author: "Dr. Rajesh K., Educator" },
        { quote: "The best platform for interactive and engaging learning!", author: "Anita M., Learner" },
    ];

    const courses = [
        { title: "Web Development Mastery", image: "https://images.unsplash.com/photo-1654618977232-a6c6dea9d1e8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8fDA%3D", desc: "Learn to build modern websites with React and Node.js." },
        { title: "Data Science Essentials", image: "https://images.unsplash.com/photo-1662638600476-d563fffbb072?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fERhdGElMjBTY2llbmNlfGVufDB8fDB8fHww", desc: "Master data analysis and machine learning with Python." },
        { title: "Graphic Design Pro", image: "https://images.unsplash.com/photo-1525972292986-69295aebf4cc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEdyYXBoaWMlMjBEZXNpZ258ZW58MHx8MHx8fDA%3D", desc: "Create stunning visuals with Adobe Creative Suite." },
    ];

    const faqs = [
        { question: "How does Learning Hub work?", answer: "Our platform connects learners with educators through AI-driven matching and live video calls." },
        { question: "Is the video call feature secure?", answer: "Yes, our Omegle-like video calls use WebRTC with end-to-end encryption for secure communication." },
        { question: "Can I join as both a learner and educator?", answer: "Absolutely! You can switch roles anytime via your profile settings." },
    ];

    useEffect(() => {
        const testimonialInterval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        const taglineInterval = setInterval(() => {
            setCurrentTagline((prev) => (prev + 1) % taglines.length);
        }, 4000);

        const statsInterval = setInterval(() => {
            setStats((prev) => ({
                users: Math.min(prev.users + 50, 10000),
                educators: Math.min(prev.educators + 10, 500),
                sessions: Math.min(prev.sessions + 100, 25000),
            }));
        }, 50);

        return () => {
            clearInterval(testimonialInterval);
            clearInterval(taglineInterval);
            clearInterval(statsInterval);
        };
    }, [testimonials.length, taglines.length]);

    const handleLogout = async () => {
        try {
            await api.post('/users/user-logout');
            clearUserSession();
            navigate('/learner/login');
        } catch (err) {
            console.error('Logout failed:', err);
            alert('Failed to logout. Please try again.');
        }
    };

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Particle Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="bg-white shadow-md p-4 fixed w-full z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src="https://videos.openai.com/vg-assets/assets%2Ftask_01k35xwt04fec9qta7pjc3ychh%2F1755767069_img_1.webp?st=2025-08-21T07%3A19%3A14Z&se=2025-08-27T08%3A19%3A14Z&sks=b&skt=2025-08-21T07%3A19%3A14Z&ske=2025-08-27T08%3A19%3A14Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=fea36edb-a052-425e-a84a-436fdce0a7b4&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=FfLuK5WdSHyeGabnDDru9h6Q2n5%2BIqvgJl%2FeaDvM4nI%3D&az=oaivgprodscus" alt="Learning Hub Logo" className="h-12" />
                        <h1 className="text-2xl font-bold text-indigo-600">Learning Hub</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!user ? (
                            <>
                                <button
                                    onClick={() => navigate('/educator/login')}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Educator Login
                                </button>
                                <button
                                    onClick={() => navigate('/learner/login')}
                                    className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-800 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Learner Login
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate(user.role === 'educator' ? '/educator/dashboard' : '/learner/dashboard')}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                                >
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-10">
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-6 animate-fade-in">
                    {user ? `Welcome Back, ${user.name}!` : 'Empower Your Future with Learning Hub'}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-8 animate-fade-in-out">
                    {user ? `Explore as a ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : taglines[currentTagline]}
                </p>
                <div className="flex space-x-4">
                    {!user ? (
                        <button
                            onClick={() => navigate('/user/signup')}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-2xl hover:shadow-3xl animate-pulse"
                        >
                            <FaRocket className="text-2xl" />
                            <span>Join Now</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(user.role === 'educator' ? '/educator/dashboard' : '/learner/dashboard')}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-800 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-2xl hover:shadow-3xl animate-pulse"
                        >
                            <FaRocket className="text-2xl" />
                            <span>Go to Dashboard</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Course Showcase Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Explore Top Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <div
                                key={index}
                                className="relative bg-indigo-50 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                            >
                                <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h3>
                                    <p className="text-gray-600">{course.desc}</p>
                                    <button
                                        onClick={() => navigate('/courses')}
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all duration-300"
                                    >
                                        Explore Course
                                    </button>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Calling Feature Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="p-6">
                        <h2 className="text-4xl font-bold mb-4">Live Video Calls Like Omegle</h2>
                        <p className="text-lg mb-6">
                            Experience seamless, face-to-face learning with our Omegle-inspired video calling feature. Connect instantly with educators or learners for real-time, interactive sessions tailored to your goals.
                        </p>
                        <button
                            onClick={() => navigate(user ? '/lobby' : '/user/signup')}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-800 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                            <FaVideo className="text-xl" />
                            <span>Start Video Learning</span>
                        </button>
                    </div>
                    <div className="relative p-6">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-xl p-4 transform rotate-3">
                            <div className="bg-black h-64 rounded-lg flex items-center justify-center text-white">
                                <FaVideo className="text-6xl animate-pulse" />
                                <span className="ml-4 text-xl font-bold">Live Video Session</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-yellow-400 h-64 rounded-lg opacity-20 transform -rotate-3"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-indigo-50 rounded-2xl shadow-lg">
                        <h3 className="text-5xl font-bold text-gray-800">{stats.users.toLocaleString()}+</h3>
                        <p className="text-lg text-gray-600 mt-2">Active Users</p>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-2xl shadow-lg">
                        <h3 className="text-5xl font-bold text-gray-800">{stats.educators.toLocaleString()}+</h3>
                        <p className="text-lg text-gray-600 mt-2">Expert Educators</p>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-2xl shadow-lg">
                        <h3 className="text-5xl font-bold text-gray-800">{stats.sessions.toLocaleString()}+</h3>
                        <p className="text-lg text-gray-600 mt-2">Learning Sessions</p>
                    </div>
                </div>
            </section>

            {/* Community Spotlight Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Vibrant Community</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`p-6 bg-white text-gray-800 rounded-2xl shadow-xl transform transition-all duration-300 ${index === currentTestimonial ? 'scale-105 border-2 border-yellow-400' : 'opacity-80'
                                    }`}
                            >
                                <FaStar className="text-3xl text-yellow-400 mb-4 mx-auto" />
                                <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                                <p className="text-sm font-bold text-indigo-600">{testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-indigo-50 rounded-2xl shadow-lg overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-4 text-left text-lg font-bold text-gray-800 flex items-center justify-between"
                                >
                                    <span>{faq.question}</span>
                                    <FaQuestionCircle className={`text-indigo-600 transform transition-transform duration-300 ${faqOpen === index ? 'rotate-180' : ''}`} />
                                </button>
                                {faqOpen === index && (
                                    <div className="p-4 text-gray-600 animate-fade-in">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
                    <p className="text-lg mb-8">Join thousands of learners and educators revolutionizing education with live video connections!</p>
                    <button
                        onClick={() => navigate(user ? '/lobby' : '/user/signup')}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-800 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-2xl hover:shadow-3xl transform hover:scale-105 animate-pulse"
                    >
                        <FaRocket className="text-2xl" />
                        <span>{user ? 'Join the Lobby' : 'Get Started'}</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white shadow-md p-4 text-center text-gray-500 text-sm">
                <p>© 2025 Learning Hub. All rights reserved.</p>
                <p className="mt-2">
                    Made with ❤️ by{' '}
                    <a
                        href="mailto:developerhaseeb1234@gmail.com"
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Mohd Haseeb Ali
                    </a>
                </p>
            </footer>

            <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        @keyframes fade-in-out {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default HomePage;