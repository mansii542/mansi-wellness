// src/components/ConfidentialChat.js - COMPLETE CODE (FINAL REAL-TIME CHAT & DYNAMIC COLOR)
"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPaperPlane, FaUserCircle, FaSpinner, FaRegClock, FaTimes, FaComment, FaTags, FaSave, FaCheck, FaUserFriends } from 'react-icons/fa';

const POLLING_INTERVAL = 3000;

// Hardcoded list of issue tags (must match ChatSession.js model)
const ISSUE_TAGS = [
    'Academic Stress', 'Exam Anxiety', 'Career Confusion', 
    'Family Conflict', 'Relationship Issues', 'Peer Pressure',
    'Low Self-Esteem', 'Sleep Problems', 'Grief/Loss',
    'Depression', 'Anxiety Disorder', 'Substance Abuse', 
    'Adjustment Issues', 'Financial Stress', 'Isolation/Loneliness',
    'Bullying/Harassment', 'Time Management', 'Other Mental Health',
    'Physical Health Concern', 'General Wellness Check'
];


export default function ConfidentialChat({ user, instituteId, isDoctor, activeView, currentMood, getPrimaryColorClass, onReportIdentity }) {
    
    // --- State Management ---
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChatSession, setActiveChatSession] = useState(null);
    const [isTaggingModalOpen, setIsTaggingModalOpen] = useState(false);
    const [sessionTags, setSessionTags] = useState([]); 
    const [selectedTags, setSelectedTags] = useState([]);
    const [taggingStatus, setTaggingStatus] = useState(false);
    
    // NEW STATE for Counselor List View
    const [counselorList, setCounselorList] = useState([]);
    const [selectedCounselor, setSelectedCounselor] = useState(null);

    const messagesEndRef = useRef(null);
    const myId = user?._id || user?.id || 'user_placeholder'; // Ensure reliable ID

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    const isCurrentUser = (senderId) => senderId === myId;
    
    // Get stable color classes (passed from ChatLayout)
    const primaryTextClass = getPrimaryColorClass('text');
    const primaryBgClass = getPrimaryColorClass('bg');
    const primaryRingClass = getPrimaryColorClass('ring');
    const primaryBubbleClass = getPrimaryColorClass('bubble');
    const lightBgClass = getPrimaryColorClass('lightBg'); 
    const chatHistoryBgClass = lightBgClass.replace('-50', '-100');


    // --- Utility Functions ---

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Emergency': return 'bg-red-600';
            case 'Critical': return 'bg-orange-500';
            case 'Normal': return 'bg-teal-500';
            default: return 'bg-gray-500';
        }
    };

    const fetchMessages = useCallback(async (currentSessionId) => {
        try {
            const res = await fetch(`/api/chat/messages?sessionId=${currentSessionId}`);
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages || []);
                if (isDoctor && activeChatSession) {
                    setSessionTags(activeChatSession.issueTags || []);
                }
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }, [isDoctor, activeChatSession]);
    
    const handleSelectChat = (session) => {
        setActiveChatSession(session);
        setSessionId(session._id);
        setSessionTags(session.issueTags || []);
        setSelectedTags(session.issueTags || []);
        setLoading(true);
        fetchMessages(session._id).then(() => setLoading(false));
    };

    const handleTagSelect = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // --- Identity and UI Logic ---

    // Chat Window Title (FINAL LOGIC)
    const chatWindowTitle = useMemo(() => {
        if (activeView === 'CounselorList' && selectedCounselor) {
            // Non-anonymous counselor name is visible to the initiator
            return `Chat with Dr. ${selectedCounselor.name}`;
        }
        if (activeView === 'Inbox' && isDoctor && activeChatSession) {
            // Anonymous initiator name is visible to the counselor
            return activeChatSession.name;
        }
        if (activeView === 'CounselorList' && !selectedCounselor) {
            return isDoctor ? 'Select Peer Counselor' : 'Select Counselor';
        }
        return 'Confidential Chat Session'; // Fallback
    }, [activeView, isDoctor, activeChatSession, selectedCounselor]);
    

    // --- Core API & Messaging Logic ---

    // 1. Fetch Counselors for List View
    const fetchCounselors = useCallback(async () => {
        if (!instituteId) return; // Wait until instituteId is available
        setLoading(true);
        try {
            const res = await fetch(`/api/institute/counselors?instituteId=${instituteId}`);
            const data = await res.json();
            if (res.ok && data.counselors) {
                setCounselorList(data.counselors);
            }
        } catch (err) {
            setError("Failed to fetch counselor list.");
        } finally {
            setLoading(false);
        }
    }, [instituteId]);


    // 2. Fetch Active Sessions (for Doctor's Inbox)
    const fetchActiveSessions = useCallback(async () => {
        if (isDoctor && activeView === 'Inbox' && instituteId) {
            setLoading(true);
            try {
                const res = await fetch(`/api/chat/inbox?instituteId=${instituteId}`);
                const data = await res.json();
                
                if (res.ok && data.sessions && data.sessions.length > 0) {
                    setActiveChatSession(data.sessions[0]);
                    setSessionId(data.sessions[0]._id);
                    fetchMessages(data.sessions[0]._id);
                } else {
                    setSessionId(null);
                }
            } catch (err) {
                setError("Failed to fetch inbox sessions.");
            } finally {
                setLoading(false);
            }
        }
    }, [isDoctor, activeView, instituteId, fetchMessages]);


    // 3. Initiate Chat with a Selected Counselor (Student/Teacher/Counselor Peer)
    const handleInitiateChat = useCallback(async (counselor) => {
        setSelectedCounselor(counselor);
        setLoading(true);
        setError(null);
        
        try {
            // Initiator is Anonymous unless they are the Doctor responding to an Inbox chat.
            const isInitiatorAnonymous = !isDoctor || user.role === 'psychologist'; 
            
            const res = await fetch("/api/chat/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    initiatorId: myId,
                    recipientId: counselor.id, // The Counselor's ID
                    instituteId: instituteId,
                    isAnonymous: isInitiatorAnonymous, 
                    
                }),
            });
            const data = await res.json();
            
            if (res.ok && data.session) {
                setSessionId(data.session._id);
                setActiveChatSession(data.session);
                fetchMessages(data.session._id);
            } else {
                setError(data.message || "Failed to create new chat session.");
            }
        } catch (err) {
            setError("Network error during chat initiation.");
        } finally {
            setLoading(false);
        }
    }, [myId, instituteId, isDoctor, user.role, fetchMessages]); 


    // 4. Handle Sending a Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !sessionId) return;
        
        const messagePayload = {
            sessionId: sessionId,
            senderId: myId,
            content: newMessage,
            // Check session status: If it was initiated anonymously, it stays anonymous.
            isAnonymous: activeChatSession?.isAnonymous || (!isDoctor && activeView === 'CounselorList'), 
            isDoctor: user.role === 'psychologist',
        };

        try {
            // **CHAT FUNCTIONALITY CHECK**
            await fetch("/api/chat/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messagePayload),
            });
            setNewMessage('');
            // Optimistic Update for Real-time feel
            setMessages(prev => [...prev, { ...messagePayload, timestamp: new Date().toISOString() }]);
            scrollToBottom();
        } catch (err) {
            setError("Failed to send message.");
        }
    };
    
    // 5. Handle Saving Tags (Counselor Feature)
    const handleSaveTags = async (e) => {
        e.preventDefault();
        if (!sessionId || selectedTags.length === 0) return;
        setTaggingStatus(true);

        const taggingPayload = {
            sessionId: sessionId,
            issueTags: selectedTags,
            counselorId: myId, 
            priority: currentMood.priority,
        };

        try {
            const res = await fetch("/api/institute/tag-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taggingPayload),
            });

            if (res.ok) {
                setSessionTags(selectedTags);
                setTaggingStatus(false);
                setIsTaggingModalOpen(false);
                alert("Session tags updated successfully! Wellness metrics will refresh shortly.");
            } else {
                setTaggingStatus(false);
                alert("Failed to save tags.");
            }
        } catch (err) {
            setTaggingStatus(false);
            alert("Network error during tagging.");
        }
    };

    // --- Component Lifecycle ---
    
    // Initial fetch hook
    useEffect(() => {
        if (activeView === 'CounselorList' && instituteId) { 
            fetchCounselors();
            setSessionId(null); 
            setSelectedCounselor(null);
        } else if (activeView === 'Inbox' && isDoctor && instituteId) { 
            fetchActiveSessions();
        } else if (!instituteId) {
            setLoading(true); 
        } else {
            setLoading(false);
        }
    }, [activeView, isDoctor, instituteId, fetchCounselors, fetchActiveSessions]);

    // Polling hook for real-time updates
    useEffect(() => {
        if (!sessionId) return;

        const interval = setInterval(() => {
            fetchMessages(sessionId);
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [sessionId, fetchMessages]);

    useEffect(() => { scrollToBottom(); }, [messages]);


    // --- Render Logic ---

    // Render Counselor List Selection View
    if (activeView === 'CounselorList' && !selectedCounselor) {
        if (loading) return <div className="flex justify-center items-center h-full text-gray-500"><FaSpinner className="animate-spin mr-2"/> Loading Counselors...</div>;
        if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;

        return (
            <div className="h-full bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaUserFriends className={primaryTextClass}/> {isDoctor ? 'Counselor Peer Support' : 'Available Counselors'}
                </h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {counselorList.map((counselor) => (
                        <div 
                            key={counselor.id}
                            onClick={() => handleInitiateChat(counselor)}
                            className={`p-4 rounded-lg flex justify-between items-center cursor-pointer transition ${lightBgClass.replace('-50', '-100')} hover:bg-white border border-transparent hover:border-${primaryTextClass.split('-')[1]}-300`}
                        >
                            <span className="font-medium text-lg text-gray-800">Dr. {counselor.name}</span>
                            <button className={`text-white px-3 py-1 rounded-full text-sm ${primaryBgClass}`}>
                                Start Anonymous Chat
                            </button>
                        </div>
                    ))}
                    {counselorList.length === 0 && <p className="text-gray-500">No counselors available at this time.</p>}
                </div>
            </div>
        );
    }
    
    // Render the Chat Window (Applies to Inbox and active CounselorList chat)
    const isChatActive = sessionId !== null;
    const isListActive = activeView === 'CounselorList';
    const listTitle = isListActive ? 'Counselors' : 'Inbox';


    return (
        <div className="h-full bg-white rounded-xl shadow-md flex border border-gray-200">
            
            {/* Left Panel: Contact List / Inbox */}
            <div className={`w-full md:w-1/3 border-r flex flex-col rounded-l-xl overflow-y-auto ${lightBgClass}`}>
                 <h4 className="text-lg font-bold p-4 border-b text-gray-700 bg-white sticky top-0">
                     {listTitle}
                 </h4>
                 
                 {/* List item for the active session */}
                 <div 
                    onClick={() => activeView === 'Inbox' ? handleSelectChat(activeChatSession) : null}
                    className={`flex items-center p-3 border-b cursor-pointer transition ${activeView === 'Inbox' ? 'hover:bg-white' : ''} ${isChatActive ? `bg-white border-l-4 ${primaryTextClass.replace('text', 'border')}` : lightBgClass}`}
                 >
                    <div className={`w-2 h-2 rounded-full mr-3 ${getPriorityBadge(activeChatSession?.counselorPriority || currentMood.priority)}`}></div>
                    <span className="font-medium text-sm">{chatWindowTitle}</span>
                 </div>

                 
                 {/* Back to List Button for Counselor Peer Support */}
                 {isListActive && selectedCounselor && (
                    <button 
                        onClick={() => { setSelectedCounselor(null); setSessionId(null); }}
                        className={`w-full text-sm font-medium p-3 mt-auto border-t hover:bg-gray-100 ${primaryTextClass}`}
                    >
                        <FaTimes className='inline mr-2'/> End Session / Back to List
                    </button>
                 )}

            </div>

            {/* Right Panel: Chat Window */}
            <div className="flex-grow flex flex-col">
                <div className={`p-3 border-b flex justify-between items-center ${lightBgClass}`}>
                    <span className='font-bold text-gray-800 flex items-center gap-2'>
                        <FaUserCircle className={primaryTextClass} /> {chatWindowTitle}
                    </span>
                    {/* Tagging button visible only if Doctor and session is active in Inbox */}
                    {isDoctor && isChatActive && activeView === 'Inbox' && (
                        <div className='flex space-space-2'>
                            <button className='text-gray-500 text-xs font-medium border border-gray-300 px-3 py-1 rounded hover:bg-gray-200' onClick={() => setIsTaggingModalOpen(true)}>
                                <FaTags className='inline mr-1' /> Tag Issue ({sessionTags.length})
                            </button>
                            <button className='text-red-500 text-xs font-medium border border-red-300 px-3 py-1 rounded hover:bg-red-50' onClick={onReportIdentity}>
                                Report Identity
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Message History */}
                <div className={`flex-grow overflow-y-auto space-y-4 p-4 ${chatHistoryBgClass}`}>
                    {sessionTags.length > 0 && (
                        <div className="text-center p-2 bg-yellow-100 rounded text-xs font-medium text-gray-700 border border-yellow-200">
                            Tags: {sessionTags.join(', ')}
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${isCurrentUser(msg.senderId) ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl max-w-xs text-sm ${isCurrentUser(msg.senderId) 
                                ? `text-white ${primaryBubbleClass}` 
                                : `bg-white text-gray-800 shadow-sm`}`}>
                                {msg.content}
                                <span className="block text-xs opacity-70 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                    <div className="text-center text-xs text-gray-400 pt-5">
                        Session ID: {sessionId || 'N/A'}. This chat will be automatically deleted in 7 days.
                    </div>
                </div>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t flex bg-white">
                    <input 
                        type="text" 
                        placeholder={isChatActive ? "Send a confidential message..." : "Select a counselor to begin..."} 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!isChatActive}
                        className={`flex-grow p-3 border rounded-l-lg focus:ring-2 ${primaryRingClass}`}
                    />
                    <button 
                        type="submit"
                        disabled={!isChatActive}
                        className={`p-3 rounded-r-lg text-white font-bold ${primaryBgClass}`} 
                        title="Send Message"
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>

            {/* --- Tagging Modal --- */}
            {isTaggingModalOpen && isDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSaveTags} className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800"><FaTags className={primaryTextClass}/> Tag Session Issues</h3>
                            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setIsTaggingModalOpen(false)}><FaTimes size={20}/></button>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Select all relevant tags:</p>
                            <div className="flex flex-wrap gap-2">
                                {ISSUE_TAGS.map(tag => (
                                    <button 
                                        key={tag} 
                                        type="button"
                                        onClick={() => handleTagSelect(tag)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition 
                                            ${selectedTags.includes(tag) 
                                                ? `${primaryBgClass.split(' ')[0]} text-white border-transparent` 
                                                : `bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200`
                                            }`
                                        }
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button 
                                type="submit" 
                                disabled={taggingStatus || selectedTags.length === 0}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-bold transition disabled:opacity-50 ${primaryBgClass}`}
                            >
                                {taggingStatus ? <FaSpinner className="animate-spin"/> : <FaSave/>} Save Tags
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}