"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBuilding, FaEnvelope, FaLock, FaSpinner, FaArrowLeft } from "react-icons/fa";
import PasswordInput from "@/components/PasswordInput"; // IMPORTED

export default function InstituteLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("instituteUser", JSON.stringify(data.user));
                router.push("/dashboard");
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
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4"><FaBuilding size={28}/></div>
                    <h2 className="text-2xl font-bold text-gray-800">Institute Admin</h2>
                </div>

                {status.error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm text-center border border-red-200">{status.error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                            <input type="email" className="w-full pl-10 pr-3 py-3 border rounded-lg" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required/>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <PasswordInput 
                            value={formData.password} 
                            onChange={e=>setFormData({...formData, password: e.target.value})} 
                            leftIcon={<FaLock />} 
                        />
                    </div>

                    <button disabled={status.loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg">{status.loading ? <FaSpinner className="animate-spin mx-auto"/> : "Login"}</button>
                </form>
                <div className="mt-6 text-center border-t pt-4">
                    <Link href="/register" className="text-sm text-indigo-600 hover:underline">Register New Institute</Link>
                </div>
            </div>
        </div>
    );
}