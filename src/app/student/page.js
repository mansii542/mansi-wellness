"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatLayout from "@/components/ChatLayout";
import StudentProfileTab from "@/components/StudentProfileTab";
import RiskQuestionnaire from "@/components/RiskQuestionnaire";
import { FaPaperPlane, FaUserMd, FaSpinner, FaCircle, FaRobot } from 'react-icons/fa';

export default function StudentChatPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [instituteName, setInstituteName] = useState('Loading...');
    const [activeTab, setActiveTab] = useState('AI'); 
    
    const [counselors, setCounselors] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showQuiz, setShowQuiz]     = useState(false);
    const [riskProfile, setRiskProfile] = useState(null);

    // AI Chat state
    const [aiMessages, setAiMessages] = useState([
        { role: 'assistant', content: `Hi there! I\'m MANSI, your AI wellness companion. How are you feeling today? 😊` }
    ]);
    const [aiInput, setAiInput] = useState('');
    
    const chatEndRef = useRef(null);

    // 1. Auth & Load Data
    useEffect(() => {
        const storedUser = localStorage.getItem("studentUser");
        if (storedUser) {
            console.log("RAW LOCAL STORAGE USER:", storedUser); // DEBUG LOG
            const u = JSON.parse(storedUser);
            
            // NORMALIZATION: Try to find a valid ID
            const validId = u._id || u.usn || u.id || u.userId;
            
            if (!validId) {
                console.error("NO VALID ID FOUND IN USER OBJECT:", u);
                alert("Login Error: Your account has no ID. Please register again.");
                localStorage.removeItem("studentUser");
                router.push("/student/login");
                return;
            }

            // Force the ID into the object so we can use it easily later
            u._id = validId;
            setUser(u);
            setInstituteName(u.instituteName || "Campus Portal");

            if (u.instituteId) {
                fetch(`/api/institute/counselors?instituteId=${u.instituteId}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("API COUNSELORS RECEIVED:", data); // DEBUG LOG
                        setCounselors(data.counselors || []);
                    })
                    .catch(err => console.error("Counselor load error:", err));
            }

            // Check risk profile — show questionnaire if not yet completed
            fetch(`/api/student/risk-profile?studentId=${validId}`)
                .then(r => r.json())
                .then(d => {
                    if (!d.profile) setShowQuiz(true);
                    else setRiskProfile(d.profile);
                })
                .catch(() => {});
        } else {
            router.push("/student/login"); 
        }
    }, [router]);

    // 2. Fetch Messages
    const fetchMessages = useCallback(async (sessionId) => {
        if (!sessionId) return;
        try {
            const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (err) { console.error(err); }
    }, []);

    // 3. Polling
    useEffect(() => {
        if (!activeSession) return;
        fetchMessages(activeSession._id);
        const interval = setInterval(() => fetchMessages(activeSession._id), 3000);
        return () => clearInterval(interval);
    }, [activeSession, fetchMessages]);

    // 4. Scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    // 5. Start Chat (AGGRESSIVE DEBUGGING)
    const handleStartChat = async (targetCounselor) => {
        console.log("CLICKED COUNSELOR OBJECT:", targetCounselor); // DEBUG LOG

        // 1. Get My ID
        const myId = user._id || user.usn || user.id;

        // 2. Get Target ID
        const targetId = targetCounselor._id || targetCounselor.id || targetCounselor.userId;

        console.log("FINAL EXTRACTED IDs -> MyID:", myId, " | TargetID:", targetId);

        if (!myId) {
            alert("Error: I don't know who YOU are. Please Logout/Login.");
            return;
        }
        if (!targetId) {
            alert("Error: That counselor has no ID in the database.");
            return;
        }

        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    starterId: myId, 
                    counselorId: targetId 
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                console.log("SESSION CREATED:", data);
                setActiveSession(data.session);
                fetchMessages(data.session._id);
            } else {
                console.error("SERVER REJECTED SESSION:", data);
                alert("Chat Failed: " + (data.message || "Server Error"));
            }
        } catch (err) { console.error("Start chat error", err); }
    };

    // 6. Send Message (Counselor)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        setIsSending(true);

        const myId = user._id || user.usn;

        try {
            if (activeTab === 'COUNSELOR' && activeSession) {
                const res = await fetch('/api/chat/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        sessionId: activeSession._id, 
                        senderId: myId, 
                        content: messageInput 
                    }),
                });

                if (res.ok) {
                    setMessageInput('');
                    fetchMessages(activeSession._id); 
                }
            }
        } catch (err) { console.error(err); }
        finally { setIsSending(false); }
    };

    // 7. Send AI Message
    const sendAiMessage = async (e) => {
        e.preventDefault();
        if (!aiInput.trim() || isSending) return;

        const userMessage = { role: 'user', content: aiInput };
        const updatedMessages = [...aiMessages, userMessage];
        setAiMessages(updatedMessages);
        setAiInput('');
        setIsSending(true);

        // Add a loading placeholder
        setAiMessages(prev => [...prev, { role: 'assistant', content: null, loading: true }]);

        try {
            const res = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.filter(m => !m.loading),
                    role: 'student',
                }),
            });
            const data = await res.json();
            const reply = data.message || 'Sorry, I could not respond right now. Please try again.';
            setAiMessages(prev => [
                ...prev.filter(m => !m.loading),
                { role: 'assistant', content: reply }
            ]);
        } catch (err) {
            setAiMessages(prev => [
                ...prev.filter(m => !m.loading),
                { role: 'assistant', content: 'Connection error. Please check your internet and try again.' }
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("studentUser");
        router.push("/");
    };

    if (!user) return <div className="p-10 text-center text-blue-600 font-bold animate-pulse">Loading...</div>;

    return (
        <>
        {showQuiz && (
            <RiskQuestionnaire
                user={user}
                onComplete={(profile) => { setRiskProfile(profile); setShowQuiz(false); }}
            />
        )}
        <ChatLayout role="student" user={user} instituteId={user.instituteId} instituteName={instituteName} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
            
            {activeTab === 'AI' && (
                <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
                            <FaRobot className="text-white" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">MANSI AI Companion</h3>
                            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                                <FaCircle size={6} /> Online
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
                        {aiMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow">
                                        <FaRobot className="text-white" size={12} />
                                    </div>
                                )}
                                <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                                }`}>
                                    {msg.loading ? (
                                        <span className="flex items-center gap-1.5 text-gray-400">
                                            <FaSpinner className="animate-spin" size={12} /> Thinking...
                                        </span>
                                    ) : msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendAiMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 flex-shrink-0">
                        <input
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            className="flex-1 border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 text-sm"
                            placeholder="Share how you're feeling..."
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                            disabled={!aiInput.trim() || isSending}
                        >
                            {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'COUNSELOR' && (
                <div className="flex h-full bg-white m-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Available Counselors</h3>
                        
                        {/* DEBUG: If empty, say so */}
                        {counselors.length === 0 && <p className="text-gray-400 text-sm">No counselors found for this institute.</p>}

                        {counselors.map(c => (
                            <button 
                                key={c._id || c.id || Math.random()} 
                                onClick={() => handleStartChat(c)}
                                className={`w-full text-left p-3 rounded-xl mb-2 text-sm transition-all border ${activeSession?.counselorId === (c._id || c.id) ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-50 font-bold text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaUserMd /></div>
                                    <div><div className="font-bold">{c.name || "Unknown Doctor"}</div><div className="text-[10px] text-green-500 flex items-center gap-1"><FaCircle size={6}/> Online</div></div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col bg-white">
                        {activeSession ? (
                            <>
                                <header className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><FaUserMd className="text-blue-500"/> Professional Session</h3>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Live</span>
                                </header>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                    {messages.map(m => (
                                        <div key={m._id} className={`flex ${m.senderId === (user._id || user.usn) ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm ${m.senderId === (user._id || user.usn) ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'}`}>{m.content}</div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
                                    <input value={messageInput} onChange={e => setMessageInput(e.target.value)} className="flex-1 border p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="Type message..." disabled={isSending}/>
                                    <button className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50" disabled={!messageInput.trim() || isSending}><FaPaperPlane/></button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                <FaUserMd size={48} className="mb-4 opacity-20"/>
                                <p>Select a counselor to start.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PROFILE' && (
                <StudentProfileTab user={user} riskProfile={riskProfile} onRetakeQuiz={() => setShowQuiz(true)} />
            )}
        </ChatLayout>
        </>
    );
}