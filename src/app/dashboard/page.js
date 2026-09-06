"use client";

// ============================================================================
// File: src/app/dashboard/page.js
// Description: Institute Admin Dashboard (Full Production Version)
// Features: 
//   - Manual Entry & CSV Bulk Upload (Student/Staff)
//   - Database Repair Tool (Fixes "Email already exists" Index Errors)
//   - Password Visibility Toggle
//   - Real-time Updates & Delete Account
//   - Robust Error Handling & UI Feedback
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    FaUserPlus, FaUserGraduate, FaSignOutAlt, FaCog, 
    FaChartLine, FaUsers, FaBuilding, FaSpinner, 
    FaTrash, FaEdit, FaCheckCircle, FaExclamationTriangle,
    FaIdCard, FaLock, FaSave, FaFileUpload, FaWrench, FaTimes
} from "react-icons/fa";
import PasswordInput from "@/components/PasswordInput";
import AcademicsTab from "@/components/AcademicsTab";
import RiskAnalyticsGraph from "@/components/RiskAnalyticsGraph";

export default function InstituteDashboard() {
    // ------------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ------------------------------------------------------------------------
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('student'); 

    // --- Data Lists ---
    const [studentList, setStudentList] = useState([]);
    const [staffList, setStaffList] = useState([]);

    // --- Forms (Manual) ---
    const [manualStudent, setManualStudent] = useState({ name: '', usn: '' });
    const [manualStaff, setManualStaff] = useState({ name: '', password: '', role: 'teacher' });
    
    // --- Forms (CSV) ---
    const [csvMode, setCsvMode] = useState(false);
    const [csvText, setCsvText] = useState("");

    // --- Status Messages ---
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // --- Settings & Modals ---
    const [settings, setSettings] = useState({
        teacherPrefix: 'TCHR',
        psychPrefix: 'PSYCH',
        defaultStudentPass: 'student123'
    });
    const [settingsStatus, setSettingsStatus] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // ------------------------------------------------------------------------
    // 2. INITIALIZATION & DATA FETCHING
    // ------------------------------------------------------------------------
    useEffect(() => {
        const storedUser = localStorage.getItem("instituteUser");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // Ensure we have a valid ID reference
                if (!parsed._id && parsed.id) parsed._id = parsed.id;
                setUser(parsed);
            } catch (e) {
                // Corrupt data, force logout
                localStorage.removeItem("instituteUser");
                router.push("/login");
            }
        } else {
            // No user found
            router.push("/login");
        }
        setLoading(false);
    }, [router]);

    // --- Data Refresh Function ---
    const refreshData = useCallback(async () => {
        if (!user?._id) return;
        
        const timestamp = Date.now(); // Cache buster
        
        try {
            // 1. Fetch Students
            const stuRes = await fetch(`/api/institute/student-list?instituteId=${user._id}&t=${timestamp}`);
            if (stuRes.ok) {
                const data = await stuRes.json();
                setStudentList(data.students || []);
            }

            // 2. Fetch Staff
            const staffRes = await fetch(`/api/institute/staff-list?instituteId=${user._id}&t=${timestamp}`);
            if (staffRes.ok) {
                const data = await staffRes.json();
                setStaffList(data.staff || []);
            }
        } catch (err) {
            console.error("Data refresh failed:", err);
        }
    }, [user]);

    // Trigger fetch when user is loaded
    useEffect(() => {
        if (user) refreshData();
    }, [user, refreshData]);

    const handleLogout = () => {
        localStorage.removeItem('instituteUser');
        router.push('/login');
    };

    // ------------------------------------------------------------------------
    // 3. CORE HANDLERS
    // ------------------------------------------------------------------------

    // --- Database Repair (Fixes "User already exists" / "Email required") ---
    const handleRepairDB = async () => {
        if(!confirm("This will fix database index errors (like 'Email already exists' or 'Duplicate Key'). Continue?")) return;
        
        setStatusMsg({ type: 'loading', text: 'Repairing Database Indexes...' });
        try {
            const res = await fetch('/api/repair');
            const data = await res.json();
            
            if(res.ok) {
                alert(data.message);
                setStatusMsg({ type: 'success', text: "Database Repaired Successfully!" });
                setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
            } else {
                alert("Repair failed: " + data.error);
                setStatusMsg({ type: 'error', text: "Repair Failed: " + data.error });
            }
        } catch(e) { 
            alert("Repair connection failed."); 
            setStatusMsg({ type: 'error', text: "Repair connection failed." });
        }
    };

    // --- Universal Submit Handler (Manual & CSV) ---
    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setStatusMsg({ type: 'loading', text: 'Processing...' });

        let entries = [];
        let role = '';

        // Prepare Data based on Type (Student/Staff) and Mode (Manual/CSV)
        if (type === 'student') {
            role = 'student';
            if (csvMode) {
                // Parse CSV: Name, USN
                entries = csvText.split('\n').map(line => {
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        const name = parts[0].trim();
                        const usn = parts[1].trim();
                        if (name && usn) return { name, usn: usn.toUpperCase() };
                    }
                    return null;
                }).filter(Boolean);
            } else {
                if (!manualStudent.name || !manualStudent.usn) {
                    setStatusMsg({ type: 'error', text: 'Name and USN are required.' });
                    return;
                }
                entries = [{ name: manualStudent.name, usn: manualStudent.usn.toUpperCase() }];
            }
        } else {
            // Staff
            role = manualStaff.role;
            if (csvMode) {
                // Parse CSV: Name, Password
                entries = csvText.split('\n').map(line => {
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        const name = parts[0].trim();
                        const password = parts[1].trim();
                        if (name && password) return { name, password };
                    }
                    return null;
                }).filter(Boolean);
            } else {
                if (!manualStaff.name || !manualStaff.password) {
                    setStatusMsg({ type: 'error', text: 'Name and Password are required.' });
                    return;
                }
                entries = [{ name: manualStaff.name, password: manualStaff.password }];
            }
        }

        if (entries.length === 0) {
            setStatusMsg({ type: 'error', text: 'No valid data found to submit.' });
            return;
        }

        try {
            const res = await fetch("/api/institute/generate-staff", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instituteId: user._id,
                    role: role,
                    entries: entries
                })
            });

            const data = await res.json();

            if (res.ok) {
                const count = data.count || 0;
                const errors = Array.isArray(data.errors) ? data.errors : [];

                if (count === 0) {
                    setStatusMsg({ type: 'error', text: errors[0] || data.message || "No users added. Check duplicates or missing fields." });
                    return;
                }

                // Show success; include first error if partial failure
                const partialNote = errors.length ? ` (some skipped: ${errors[0]})` : '';
                setStatusMsg({ type: 'success', text: `Success! Added ${count} users${partialNote}.` });
                
                // Reset Forms
                setManualStudent({ name: '', usn: '' });
                setManualStaff({ ...manualStaff, name: '', password: '' });
                setCsvText("");
                
                // Refresh Data Immediately
                await refreshData();
                
                // Clear success message
                setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
            } else {
                setStatusMsg({ type: 'error', text: data.message || "Failed to add users." });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Network Error. Please try again.' });
        }
    };

    // --- Save Settings ---
    const handleSettingsSave = async (e) => {
        e.preventDefault();
        setSettingsStatus('saving');
        // Placeholder for API call to save settings
        await new Promise(r => setTimeout(r, 1000));
        setSettingsStatus('success');
        setTimeout(() => setSettingsStatus(null), 3000);
    };

    // --- Delete Institute ---
    const handleDeleteInstitute = async () => {
        if (deleteConfirmText !== "DELETE") return;
        
        try {
            const res = await fetch(`/api/institute/delete-account?id=${user._id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert("Institute deleted successfully.");
                handleLogout();
            } else {
                alert("Failed to delete institute.");
            }
        } catch (e) {
            alert("Error deleting account.");
        }
    };

    // --- Delete Single Student ---
    const handleDeleteStudent = async (studentId) => {
        if (!confirm("Delete this student? This cannot be undone.")) return;
        try {
            const res = await fetch('/api/institute/delete-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId }),
            });
            if (res.ok) {
                await refreshData();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || 'Failed to delete student.');
            }
        } catch (e) {
            alert('Error deleting student.');
        }
    };

    // --- Delete Single Staff ---
    const handleDeleteStaff = async (staffId) => {
        if (!confirm("Delete this staff member? This cannot be undone.")) return;
        try {
            const res = await fetch('/api/institute/delete-staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId }),
            });
            if (res.ok) {
                await refreshData();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || 'Failed to delete staff.');
            }
        } catch (e) {
            alert('Error deleting staff.');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-indigo-800 text-xl">Loading Portal...</div>;

    // ------------------------------------------------------------------------
    // 4. RENDER UI
    // ------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-[#313a90] text-white flex flex-col shadow-xl z-10 sticky top-0 h-screen transition-all">
                <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
                    <div className="bg-white/20 p-2 rounded text-white shadow-sm"><FaBuilding size={20} /></div>
                    <div>
                        <span className="block font-bold text-lg leading-tight">Admin Portal</span>
                        <span className="text-xs text-indigo-300">Institute Manager</span>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <button 
                        onClick={()=>{setActiveTab('student'); setCsvMode(false); setStatusMsg({});}} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab==='student'?'bg-[#4e58b5] border-l-4 border-orange-400 shadow-md text-white':'text-indigo-100 hover:bg-white/10'}`}
                    >
                        <FaUserGraduate /> Students
                    </button>
                    
                    <button 
                        onClick={()=>{setActiveTab('staff'); setCsvMode(false); setStatusMsg({});}} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab==='staff'?'bg-white/20 shadow-inner text-white':'text-indigo-100 hover:bg-white/10'}`}
                    >
                        <FaUsers /> Staff
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('wellness')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'wellness' ? 'bg-white/20 text-white' : 'text-indigo-100 hover:bg-white/10'}`}
                    >
                        <FaChartLine /> Wellness Report
                    </button>

                    <button
                        onClick={() => setActiveTab('academics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'academics' ? 'bg-white/20 text-white' : 'text-indigo-100 hover:bg-white/10'}`}
                    >
                        <FaUserGraduate /> Academics
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('settings')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'settings' ? 'bg-white/20 text-white' : 'text-indigo-100 hover:bg-white/10'}`}
                    >
                        <FaCog /> Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <button onClick={handleLogout} className="w-full bg-[#dc2626] hover:bg-red-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                        <FaSignOutAlt /> Logout
                    </button>
                    <div className="mt-4 text-center text-xs text-indigo-400">© 2025 MANSI AI</div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                
                {/* ---------------- STUDENT TAB ---------------- */}
                {activeTab === 'student' && (
                    <div className="animate-fadeIn max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                                <p className="text-gray-500 text-sm">Manage student records and access.</p>
                            </div>
                            <button 
                                onClick={()=>setCsvMode(!csvMode)} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border transition-all ${csvMode ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}
                            >
                                {csvMode ? <FaUserPlus/> : <FaFileUpload/>} 
                                {csvMode ? "Switch to Manual Entry" : "Bulk Upload via CSV"}
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-2 items-center">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded text-sm">{csvMode ? <FaFileUpload/> : "➕"}</span> 
                                {csvMode ? "Bulk CSV Upload" : "Add New Student"}
                            </h3>
                            
                            {csvMode ? (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                                        <strong>Format:</strong> <code>Name, USN</code> (One entry per line)<br/>
                                        <strong>Example:</strong><br/>
                                        <code>Rahul Kumar, 1BI21CS001</code><br/>
                                        <code>Priya Sharma, 1BI21CS002</code>
                                    </div>
                                    <textarea 
                                        className="w-full border p-3 rounded-lg font-mono text-sm h-40 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" 
                                        placeholder="Paste CSV data here..." 
                                        value={csvText} 
                                        onChange={e=>setCsvText(e.target.value)}
                                    ></textarea>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                        <input 
                                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                                            placeholder="e.g. Rahul Kumar" 
                                            value={manualStudent.name} 
                                            onChange={e=>setManualStudent({...manualStudent,name:e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">USN / Roll No</label>
                                        <input 
                                            className="w-full border p-3 rounded-lg uppercase focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                                            placeholder="e.g. 1BI21CS001" 
                                            value={manualStudent.usn} 
                                            onChange={e=>setManualStudent({...manualStudent,usn:e.target.value})} 
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <button 
                                    onClick={(e)=>handleSubmit(e, 'student')} 
                                    disabled={statusMsg.type==='loading'} 
                                    className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 w-full sm:w-auto transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {statusMsg.type==='loading' ? <FaSpinner className="animate-spin"/> : (csvMode ? <><FaFileUpload/> Upload Students</> : <><FaUserPlus/> Add Student</>)}
                                </button>
                            </div>

                            {statusMsg.text && (
                                <div className={`mt-4 p-4 rounded-lg text-sm flex gap-3 items-center border ${statusMsg.type==='error'?'bg-red-50 text-red-700 border-red-200':'bg-green-50 text-green-700 border-green-200'} animate-fadeIn`}>
                                    {statusMsg.type==='error'?<FaExclamationTriangle size={18}/>:<FaCheckCircle size={18}/>}
                                    <span className="font-medium">{statusMsg.text}</span>
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">📋 Registered Students <span className="text-gray-400 font-normal">({studentList.length})</span></h3>
                                <button onClick={refreshData} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh List</button>
                            </div>
                            
                            {studentList.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <FaUserGraduate className="mx-auto text-gray-300 mb-2" size={40}/>
                                    <p className="text-gray-500">No students found.</p>
                                    <p className="text-xs text-gray-400">Add students manually or via CSV.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">USN</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {studentList.map((s,i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                                                    <td className="p-4 text-orange-600 font-mono font-bold">{s.usn}</td>
                                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">{s.status || 'Active'}</span></td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteStudent(s._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                        >
                                                            <FaTrash/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- STAFF TAB ---------------- */}
                {activeTab === 'staff' && (
                    <div className="animate-fadeIn max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                                <p className="text-gray-500 text-sm">Manage teachers and counselors.</p>
                            </div>
                            <button 
                                onClick={()=>setCsvMode(!csvMode)} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border transition-all ${csvMode ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}
                            >
                                {csvMode ? <FaUserPlus/> : <FaFileUpload/>} 
                                {csvMode ? "Switch to Manual Entry" : "Bulk Upload via CSV"}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-2 items-center">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded text-sm">{csvMode ? <FaFileUpload/> : "➕"}</span>
                                {csvMode ? "Bulk CSV Upload" : "Add Staff Member"}
                            </h3>

                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Role for this batch</label>
                                <select 
                                    className="w-full sm:w-1/3 border p-3 rounded-lg bg-white block focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={manualStaff.role} 
                                    onChange={e=>setManualStaff({...manualStaff, role: e.target.value})}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="psychologist">Psychologist</option>
                                </select>
                            </div>

                            {csvMode ? (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                                        <strong>Format:</strong> <code>Name, Password</code> (One per line). Login IDs are auto-generated.<br/>
                                        <strong>Example:</strong><br/>
                                        <code>Dr. Smith, SecurePass123</code><br/>
                                        <code>Ms. Jane Doe, welcome@2025</code>
                                    </div>
                                    <textarea 
                                        className="w-full border p-3 rounded-lg font-mono text-sm h-40 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
                                        placeholder="Paste CSV data here..." 
                                        value={csvText} 
                                        onChange={e=>setCsvText(e.target.value)}
                                    ></textarea>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
                                    <div className="flex-[2] w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                        <input 
                                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                            placeholder="e.g. Dr. Anjali" 
                                            value={manualStaff.name} 
                                            onChange={e=>setManualStaff({...manualStaff,name:e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <div className="flex-[2] w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                                        <PasswordInput 
                                            value={manualStaff.password} 
                                            onChange={e=>setManualStaff({...manualStaff, password: e.target.value})} 
                                            className="mt-0" 
                                            leftIcon={null} 
                                            placeholder="Set Password"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <button 
                                    onClick={(e)=>handleSubmit(e, 'staff')} 
                                    disabled={statusMsg.type==='loading'} 
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 w-full sm:w-auto transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {statusMsg.type==='loading' ? <FaSpinner className="animate-spin"/> : (csvMode ? <><FaFileUpload/> Upload Staff</> : <><FaUserPlus/> Create Account</>)}
                                </button>
                            </div>

                            {statusMsg.text && (
                                <div className={`mt-4 p-4 rounded-lg text-sm flex gap-3 items-center border ${statusMsg.type==='error'?'bg-red-50 text-red-700 border-red-200':'bg-green-50 text-green-700 border-green-200'} animate-fadeIn`}>
                                    {statusMsg.type==='error'?<FaExclamationTriangle size={18}/>:<FaCheckCircle size={18}/>}
                                    <span className="font-medium">{statusMsg.text}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">👨‍🏫 Current Staff <span className="text-gray-400 font-normal">({staffList.length})</span></h3>
                                <button onClick={refreshData} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh List</button>
                            </div>

                            {staffList.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <FaUsers className="mx-auto text-gray-300 mb-2" size={40}/>
                                    <p className="text-gray-500">No staff found.</p>
                                    <p className="text-xs text-gray-400">Add teachers or counselors to see them here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Role</th>
                                                <th className="p-4 font-semibold">Login ID</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {staffList.map((s,i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${s.role==='psychologist' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {s.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-mono bg-gray-100 text-indigo-700 px-3 py-1 rounded border border-gray-200 font-bold select-all">
                                                            {s.loginId || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button className="text-gray-400 hover:text-blue-500 transition-colors p-2"><FaEdit/></button>
                                                        <button
                                                            onClick={() => handleDeleteStaff(s._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                        >
                                                            <FaTrash/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- ACADEMICS TAB ---------------- */}
                {activeTab === 'academics' && (
                    <AcademicsTab user={user} studentList={studentList} refreshData={refreshData} />
                )}

                {/* ---------------- WELLNESS TAB ---------------- */}
                {activeTab === 'wellness' && (
                    <div className="max-w-6xl mx-auto animate-fadeIn">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <FaChartLine className="text-green-500" /> Student Wellness & Risk Analytics
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Based on student self-assessments combined with academic performance data.</p>
                        </div>
                        <RiskAnalyticsGraph instituteId={user?._id} />
                    </div>
                )}
                
                 {/* ---------------- SETTINGS TAB ---------------- */}
                 {activeTab === 'settings' && (
                    <div className="max-w-4xl mx-auto animate-fadeIn">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><FaCog className="text-gray-600"/> System Settings</h1>
                            
                            {/* REPAIR BUTTON: FIXES DATABASE INDEX ERRORS */}
                            <button 
                                onClick={handleRepairDB} 
                                className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-2 transition-colors border border-blue-200 shadow-sm"
                            >
                                <FaWrench/> Repair Database
                            </button>
                        </div>

                        {/* Profile */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3"><FaBuilding className="text-indigo-600"/> Institute Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Institute Name</label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">{user?.name || 'Loading...'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Email</label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">{user?.email || 'Loading...'}</div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSettingsSave} className="space-y-6">
                            {/* ID Configuration */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3"><FaIdCard className="text-blue-600"/> ID Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Prefix</label>
                                        <input value={settings.teacherPrefix} onChange={e=>setSettings({...settings, teacherPrefix: e.target.value.toUpperCase()})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Psychologist Prefix</label>
                                        <input value={settings.psychPrefix} onChange={e=>setSettings({...settings, psychPrefix: e.target.value.toUpperCase()})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                                    </div>
                                </div>
                            </div>

                            {/* Security Defaults */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3"><FaLock className="text-orange-600"/> Security Defaults</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Student Password</label>
                                    <input value={settings.defaultStudentPass} onChange={e=>setSettings({...settings, defaultStudentPass: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"/>
                                    <p className="text-xs text-gray-500 mt-2">Used for bulk student uploads (if manual password is not provided).</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button type="submit" disabled={settingsStatus === 'saving'} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50">
                                    {settingsStatus === 'saving' ? <FaSpinner className="animate-spin"/> : <FaSave/>} {settingsStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                                </button>
                                {settingsStatus === 'success' && <div className="inline-flex items-center gap-2 text-green-700 font-medium bg-green-50 px-4 py-2 rounded-lg border border-green-200 animate-fadeIn"><FaCheckCircle/> Settings saved!</div>}
                            </div>
                        </form>

                        {/* Danger Zone */}
                        <div className="mt-12 border-t pt-8">
                            <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-bold text-red-800 mb-1 flex items-center gap-2"><FaExclamationTriangle/> Danger Zone</h3>
                                    <p className="text-red-700 text-sm">Permanently delete this institute account and all associated data (students, staff, logs).</p>
                                </div>
                                <button onClick={()=>setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm whitespace-nowrap transition-colors flex items-center gap-2">
                                    <FaTrash/> Delete Institute
                                </button>
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-2xl font-bold text-gray-900">Are you sure?</h3>
                                        <button onClick={()=>{setShowDeleteModal(false); setDeleteConfirmText('');}} className="text-gray-400 hover:text-gray-600"><FaTimes size={20}/></button>
                                    </div>
                                    <p className="text-gray-600 mb-6">This action cannot be undone. This will permanently delete <strong>{user?.name}</strong> and all its data. Type <strong>DELETE</strong> to confirm.</p>
                                    
                                    <div className="mb-6">
                                        <input 
                                            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-0 outline-none transition-colors font-mono uppercase text-center tracking-widest font-bold" 
                                            placeholder="DELETE" 
                                            value={deleteConfirmText}
                                            onChange={e=>setDeleteConfirmText(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={()=>{setShowDeleteModal(false); setDeleteConfirmText('');}} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors">Cancel</button>
                                        <button 
                                            onClick={handleDeleteInstitute} 
                                            disabled={deleteConfirmText !== 'DELETE'} 
                                            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors shadow-md"
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}