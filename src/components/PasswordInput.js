"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({ 
    value, 
    onChange, 
    placeholder = "Password", 
    className = "", 
    required = true,
    leftIcon = null 
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative w-full">
            {/* Optional Left Icon (like the Lock in login pages) */}
            {leftIcon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {leftIcon}
                </div>
            )}

            <input
                type={show ? "text" : "password"}
                className={`w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${leftIcon ? 'pl-10' : 'pl-3'} pr-10 ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />

            {/* Right Eye Toggle Button */}
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                tabIndex="-1" // Prevents tabbing to the eye button, keeps flow smooth
            >
                {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
        </div>
    );
}