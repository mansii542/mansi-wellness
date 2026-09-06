"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserGraduate, FaIdCard, FaSpinner, FaArrowLeft, FaUser } from "react-icons/fa";
import InstituteSearch from "@/components/InstituteSearch"; 

export default function StudentLogin() {
    const router = useRouter();
    // Removed 'password' from state
    const [formData, setFormData] = useState({ instituteId: '', name: '', usn: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.instituteId) {
            setStatus({ loading: false, error: "Please select an institute." });
            return;
        }

        setStatus({ loading: true, error: '' });

        try {
            const res = await fetch("/api/auth/student-login", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem("studentUser", JSON.stringify(data.user));
                router.push("/student");
            } else {
                setStatus({ loading: false, error: data.message });
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
                        <FaUserGraduate size={28}/>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-800">Student Portal</h2>
                     <p className="text-sm text-gray-500 mt-2">Enter your details to access wellness resources</p>
                </div>

                {status.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium animate-pulse">
                        {status.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* 1. Institute Search */}
                    <InstituteSearch onSelect={(id) => setFormData({...formData, instituteId: id})} />

                    {/* 2. Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Student Name</label>
                        <div className="relative">
                            <FaUser className="absolute top-4 left-4 text-gray-400"/>
                            <input 
                                className="w-full pl-11 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 placeholder-gray-400 transition-all" 
                                placeholder="Enter your full name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    {/* 3. USN Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">USN / Roll Number</label>
                        <div className="relative">
                            <FaIdCard className="absolute top-4 left-4 text-gray-400"/>
                            <input 
                                className="w-full pl-11 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold text-gray-700 placeholder-gray-400 transition-all" 
                                placeholder="e.g. 1XY23CS001" 
                                value={formData.usn} 
                                onChange={e => setFormData({...formData, usn: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    <button 
                        disabled={status.loading} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 mt-4 flex justify-center items-center gap-2"
                    >
                        {status.loading ? <FaSpinner className="animate-spin text-xl"/> : "Access Portal"}
                    </button>
                </form>
            </div>
        </div>
    );
}