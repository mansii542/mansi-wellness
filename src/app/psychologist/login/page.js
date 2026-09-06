"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserMd, FaIdCard, FaLock, FaSpinner, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import InstituteSearch from "@/components/InstituteSearch"; // Ensure you created this component

export default function PsychologistLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ instituteId: '', loginId: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.instituteId) {
            setStatus({ loading: false, error: "Please search and select your institute." });
            return;
        }

        setStatus({ loading: true, error: '' });

        try {
            const res = await fetch("/api/auth/staff-login", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // Security Check
                if (data.user.role !== 'psychologist') {
                    setStatus({ loading: false, error: "Access Denied. Not a Psychologist account." });
                    return;
                }

                // Save user data for Dashboard
                localStorage.setItem("staffUser", JSON.stringify(data.user));
                
                // Redirect
                router.push("/psychologist");
            } else {
                setStatus({ loading: false, error: data.message || "Login failed" });
            }
        } catch (err) { 
            setStatus({ loading: false, error: "Network error. Please check connection." }); 
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 p-8">
                
                <div className="mb-6">
                    <Link href="/" className="text-gray-400 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors">
                        <FaArrowLeft/> Back to Home
                    </Link>
                </div>
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 ring-4 ring-blue-50/50 shadow-sm">
                        <FaUserMd size={28}/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Counselor Portal</h2>
                    <p className="text-sm text-gray-500 mt-2">Secure access for clinical staff</p>
                </div>

                {status.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 flex items-center justify-center font-medium animate-pulse">
                        {status.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* NEW: Searchable Institute Dropdown */}
                    <InstituteSearch onSelect={(id) => setFormData({...formData, instituteId: id})} />

                    {/* Login ID Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Login ID</label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 text-gray-400">
                                <FaIdCard />
                            </div>
                            <input 
                                className="w-full pl-11 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold text-gray-700 placeholder-gray-300 transition-all" 
                                placeholder="e.g. PSYCH-1234" 
                                value={formData.loginId} 
                                onChange={e => setFormData({...formData, loginId: e.target.value})} 
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Password</label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 text-gray-400">
                                <FaLock />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-11 pr-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 placeholder-gray-300 transition-all" 
                                placeholder="••••••••"
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button 
                        disabled={status.loading} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
                    >
                        {status.loading ? <FaSpinner className="animate-spin text-xl"/> : "Access Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}