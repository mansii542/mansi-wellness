"use client";
import { useState } from 'react';
import { 
    FaUserMd, FaRobot, FaUserSecret, FaChartLine, FaSignOutAlt, 
    FaComments, FaBars, FaTimes 
} from 'react-icons/fa';

export default function CounselorLayout({ 
    user, 
    onLogout, 
    activeTab, 
    setActiveTab, 
    currentTheme, 
    setTheme, 
    children 
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- THEME CONFIGURATION (Matches Student Side) ---
    const themes = {
        happy:  { bg: 'bg-yellow-50',  primary: 'text-yellow-600', border: 'border-yellow-200', sidebar: 'bg-yellow-900', button: 'bg-yellow-500' },
        sad:    { bg: 'bg-blue-50',    primary: 'text-blue-600',   border: 'border-blue-200',   sidebar: 'bg-slate-900',  button: 'bg-blue-600' }, // Default
        angry:  { bg: 'bg-red-50',     primary: 'text-red-600',    border: 'border-red-200',    sidebar: 'bg-red-900',    button: 'bg-red-600' },
        calm:   { bg: 'bg-teal-50',    primary: 'text-teal-600',   border: 'border-teal-200',   sidebar: 'bg-teal-900',   button: 'bg-teal-600' },
        fear:   { bg: 'bg-purple-50',  primary: 'text-purple-600', border: 'border-purple-200', sidebar: 'bg-purple-900', button: 'bg-purple-600' },
    };

    const t = themes[currentTheme] || themes.sad; // Default to 'sad' (Blue/Professional) if undefined

    // --- NAVIGATION ITEMS ---
    const navItems = [
        { id: 'STUDENT_CHAT', label: 'Student Queue', icon: <FaComments /> },
        { id: 'GRAPH',        label: 'Wellness Analytics', icon: <FaChartLine /> },
        { id: 'AI_CHAT',      label: 'My AI Assistant', icon: <FaRobot /> },
        { id: 'PEER_CHAT',    label: 'Anonymous Peer Chat', icon: <FaUserSecret /> },
    ];

    return (
        <div className={`flex h-screen w-full ${t.bg} transition-colors duration-500 font-sans overflow-hidden`}>
            
            {/* --- SIDEBAR --- */}
            <aside className={`${t.sidebar} text-white w-72 flex-shrink-0 flex flex-col shadow-2xl transition-colors duration-500 z-30`}>
                
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                            <FaUserMd size={20} className="text-white"/>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-wide">MANSI Clinical</h1>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest">Professional Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 font-medium ${
                                activeTab === item.id 
                                ? 'bg-white text-gray-900 shadow-lg translate-x-1' 
                                : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${t.button} flex items-center justify-center font-bold shadow-lg ring-2 ring-white/20`}>
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">Dr. {user?.name}</p>
                            <p className="text-xs text-white/50">Psychologist</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white transition-all font-bold text-sm"
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                
                {/* TOP HEADER (Mood/Theme Switcher) */}
                <header className="h-20 bg-white border-b border-gray-100 flex justify-between items-center px-8 shadow-sm flex-shrink-0 z-20">
                    <h2 className={`text-xl font-bold ${t.primary}`}>
                        {navItems.find(i => i.id === activeTab)?.label}
                    </h2>

                    {/* MOOD EMOJIS */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase px-2">Set Ambience:</span>
                        {[
                            { id: 'happy', emoji: '😊' },
                            { id: 'calm',  emoji: '😌' },
                            { id: 'sad',   emoji: '😔' },
                            { id: 'angry', emoji: '😤' },
                            { id: 'fear',  emoji: '😨' }
                        ].map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => setTheme(mood.id)}
                                className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-all hover:scale-110 ${
                                    currentTheme === mood.id ? 'bg-white shadow-md scale-110 ring-2 ring-gray-200' : 'hover:bg-gray-200 grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
                                }`}
                            >
                                {mood.emoji}
                            </button>
                        ))}
                    </div>
                </header>

                {/* DYNAMIC PAGE CONTENT */}
                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    );
}