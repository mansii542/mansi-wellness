"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBuilding, FaEnvelope, FaLock, FaSpinner, FaArrowLeft } from "react-icons/fa";
import PasswordInput from "@/components/PasswordInput"; // IMPORTED

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });

        try {
            const res = await fetch("/api/auth/register-institute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/login");
            } else {
                setStatus({ loading: false, error: data.message });
            }
        } catch (err) {
            setStatus({ loading: false, error: "Network error." });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 p-8">
                <div className="mb-6"><Link href="/" className="text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm"><FaArrowLeft/> Back</Link></div>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Register Institute</h2>
                <p className="text-center text-gray-500 text-sm mb-6">Create an admin account for your campus.</p>

                {status.error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm text-center border border-red-200">{status.error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Institute Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaBuilding /></div>
                            <input type="text" className="w-full pl-10 pr-3 py-3 border rounded-lg" placeholder="e.g. BIT Bangalore" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                            <input type="email" className="w-full pl-10 pr-3 py-3 border rounded-lg" placeholder="admin@college.edu" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required/>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <PasswordInput 
                            value={formData.password} 
                            onChange={e=>setFormData({...formData, password: e.target.value})} 
                            leftIcon={<FaLock />} 
                            placeholder="Create password"
                        />
                    </div>

                    <button disabled={status.loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg">{status.loading ? <FaSpinner className="animate-spin mx-auto"/> : "Register"}</button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Login</Link></p>
            </div>
        </div>
    );
}