"use client";
import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaSearch, FaUniversity, FaSpinner } from 'react-icons/fa';

export default function InstituteSearch({ onSelect }) {
    const [institutes, setInstitutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [loading, setLoading] = useState(true); // New Loading State
    const wrapperRef = useRef(null);

    // Fetch on mount
    useEffect(() => {
        setLoading(true);
        fetch('/api/public/institutes', { cache: 'no-store' }) // Client-side no-cache
            .then(res => res.json())
            .then(data => {
                setInstitutes(data.institutes || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load institutes", err);
                setLoading(false);
            });
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filtered = institutes.filter(inst => 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (inst) => {
        setSelectedName(inst.name);
        setSearchTerm('');
        setIsOpen(false);
        onSelect(inst._id);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
                Select Institute
            </label>
            
            <div 
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center cursor-pointer transition-all ${isOpen ? 'ring-2 ring-blue-500 bg-white' : 'hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <FaUniversity className="text-gray-400 flex-shrink-0" />
                    {loading ? (
                        <span className="text-gray-400 text-sm animate-pulse">Loading list...</span>
                    ) : (
                        <span className={`truncate ${selectedName ? "text-gray-800 font-bold" : "text-gray-400"}`}>
                            {selectedName || "Search Your Institute"}
                        </span>
                    )}
                </div>
                {loading ? <FaSpinner className="animate-spin text-gray-400 text-xs"/> : <FaChevronDown className="text-gray-400 text-xs"/>}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col animate-fadeIn">
                    
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-50 sticky top-0 bg-white">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <FaSearch className="text-gray-400 text-xs"/>
                            <input 
                                autoFocus
                                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                                placeholder="Type college name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="overflow-y-auto flex-1">
                        {filtered.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400 italic">
                                {searchTerm ? "No match found" : "No institutes registered yet"}
                            </div>
                        ) : (
                            filtered.map(inst => (
                                <div 
                                    key={inst._id}
                                    onClick={() => handleSelect(inst)}
                                    className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                >
                                    {inst.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}