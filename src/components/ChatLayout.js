"use client";

import { useState, useMemo } from 'react';
import { 
    FaRobot, FaUserMd, FaSignOutAlt, FaBars, FaTimes, 
    FaChartLine, FaChalkboardTeacher, FaStethoscope, 
    FaRegClock, FaEnvelopeOpenText, FaIdCard
} from 'react-icons/fa';

// --- Mood Definitions ---
const MOODS_DEFINITIONS = [
    { emoji: '😃', mood: 'Joy', primary: 'teal', priority: 'Normal' },
    { emoji: '😌', mood: 'Calm', primary: 'sky', priority: 'Normal' },
    { emoji: '😥', mood: 'Sad', primary: 'purple', priority: 'Critical' },
    { emoji: '😠', mood: 'Anger', primary: 'rose', priority: 'Critical' },
    { emoji: '😟', mood: 'Anxious', primary: 'blue', priority: 'Critical' },
];
const EMERGENCY_MOOD = { emoji: '🚨', mood: 'Emergency', primary: 'red', priority: 'Emergency' };

// Tailwind Color Mapping
const COLOR_MAP = {
    teal: { pageBg: 'bg-teal-50', sidebarBg: 'bg-teal-800', navbarBg: 'bg-teal-100', activeItem: 'bg-teal-600', text: 'text-teal-700', border: 'border-teal-200' },
    sky: { pageBg: 'bg-sky-50', sidebarBg: 'bg-sky-800', navbarBg: 'bg-sky-100', activeItem: 'bg-sky-600', text: 'text-sky-700', border: 'border-sky-200' },
    purple: { pageBg: 'bg-purple-50', sidebarBg: 'bg-purple-800', navbarBg: 'bg-purple-100', activeItem: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200' },
    rose: { pageBg: 'bg-rose-50', sidebarBg: 'bg-rose-800', navbarBg: 'bg-rose-100', activeItem: 'bg-rose-600', text: 'text-rose-700', border: 'border-rose-200' },
    blue: { pageBg: 'bg-blue-50', sidebarBg: 'bg-blue-800', navbarBg: 'bg-blue-100', activeItem: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200' },
    red: { pageBg: 'bg-red-100', sidebarBg: 'bg-red-900', navbarBg: 'bg-red-200', activeItem: 'bg-red-700', text: 'text-red-800', border: 'border-red-300' },
};

export default function ChatLayout({ 
    role,           
    user,           
    instituteName,  
    onLogout,       
    activeTab,      // Passed from page.js
    setActiveTab,   // Passed from page.js
    children        // The content from page.js (THIS IS THE FIX)
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentMood, setCurrentMood] = useState(MOODS_DEFINITIONS[1]); // Default: Calm

    const theme = useMemo(() => COLOR_MAP[currentMood.primary] || COLOR_MAP.teal, [currentMood.primary]);

    // Define Sidebar Items based on Role
    const getMenuItems = () => {
        switch(role) {
            case 'student':
                return [
                    { id: 'AI', label: 'AI Support Chat', icon: <FaRobot /> },
                    { id: 'COUNSELOR', label: 'Public Counselor List', icon: <FaUserMd /> },
                    { id: 'PROFILE', label: 'My Profile', icon: <FaIdCard /> }
                ];
            case 'teacher':
                return [
                    { id: 'AI', label: 'Staff Wellness AI', icon: <FaRobot /> },
                    { id: 'COUNSELOR', label: 'Consult Psychologist', icon: <FaChalkboardTeacher /> }
                ];
            case 'psychologist':
                return [
                    { id: 'QUEUE', label: 'Counseling Inbox', icon: <FaEnvelopeOpenText /> },
                    { id: 'GRAPH', label: 'Wellness Analytics', icon: <FaChartLine /> },
                    { id: 'AI', label: 'Counselor Assistant', icon: <FaStethoscope /> }
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${theme.pageBg}`}>
            
            {/* --- SIDEBAR --- */}
            <aside className={`w-64 flex-shrink-0 flex flex-col transition-all duration-300 z-30 ${isMobileMenuOpen ? 'fixed h-full' : 'hidden'} md:relative md:flex ${theme.sidebarBg} text-white shadow-xl`}>
                <div className="h-16 flex items-center justify-between px-6 bg-black/10 shadow-sm">
                    <h1 className="text-xl font-extrabold tracking-wider">MANSI AI</h1>
                    <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><FaTimes /></button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold
                                ${activeTab === item.id 
                                    ? `bg-white text-gray-900 shadow-lg transform scale-105` 
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-600 hover:text-white transition-colors text-sm font-bold">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className={`h-16 shadow-sm border-b flex items-center justify-between px-4 md:px-6 z-10 transition-colors duration-500 ${theme.navbarBg} ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 ${theme.text}`}><FaBars size={24}/></button>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Portal</span>
                            <h2 className={`text-sm md:text-lg font-bold ${theme.text} truncate max-w-[150px] md:max-w-md`}>{instituteName}</h2>
                        </div>
                    </div>

                    {/* Mood Selector */}
                    <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-full backdrop-blur-sm border border-white/50">
                        {[...MOODS_DEFINITIONS, EMERGENCY_MOOD].map((m) => (
                            <button
                                key={m.mood}
                                onClick={() => setCurrentMood(m)}
                                className={`p-1.5 rounded-full transition-all text-lg hover:scale-125 ${currentMood.mood === m.mood ? 'bg-white shadow-sm ring-2 ring-offset-1 ring-gray-200' : 'opacity-60 hover:opacity-100'}`}
                                title={m.mood}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-700">{user?.name}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold uppercase ${currentMood.priority === 'Emergency' ? 'bg-red-500' : theme.activeItem}`}>{role}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${theme.activeItem}`}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* CRITICAL: Just Render Children. NO ConfidentialChat Component! */}
                <div className="flex-1 overflow-hidden relative p-0">
                    {children}
                </div>
            </main>
        </div>
    );
}