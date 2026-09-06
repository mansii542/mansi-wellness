"use client";
import { useState, useEffect } from "react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { FaShieldAlt, FaExclamationTriangle, FaSpinner, FaUserGraduate, FaSync } from "react-icons/fa";

const RISK_COLORS = {
    Low:      "#22c55e",   // green-500
    Moderate: "#eab308",   // yellow-500
    High:     "#f97316",   // orange-500
    Crisis:   "#ef4444",   // red-500
};

const DIST_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#f97316", "#ef4444"];

// Thresholds: ≤25 Low | ≤55 Moderate | ≤75 High | >75 Crisis
const LEVEL_META = (score) => {
    if (score > 75) return { level: "Crisis",   color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" };
    if (score > 55) return { level: "High",     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    if (score > 25) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return           { level: "Low",      color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" };
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
            <p className="font-bold text-gray-700">{payload[0].name || payload[0].dataKey}</p>
            <p className="text-indigo-600 font-bold">{payload[0].value} students</p>
        </div>
    );
};

export default function RiskAnalyticsGraph({ instituteId }) {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState("");

    const fetchData = async () => {
        setLoading(true); setError("");
        try {
            const res = await fetch(`/api/institute/risk-analytics?instituteId=${instituteId}`);
            const d   = await res.json();
            if (res.ok) setData(d);
            else setError(d.message || "Failed to load.");
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (instituteId) fetchData(); }, [instituteId]);

    if (loading) return (
        <div className="flex items-center justify-center h-60 text-gray-400">
            <FaSpinner className="animate-spin mr-2" /> Loading risk analytics…
        </div>
    );
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
    if (!data)  return null;

    // Prepare pie data
    const pieData = data.byLevel.map(d => ({
        name: d._id,
        value: d.count,
        avg: Math.round(d.avgScore),
    }));

    // Prepare distribution bar data
    const barData = [
        { range: "0–20",   count: 0 },
        { range: "21–40",  count: 0 },
        { range: "41–60",  count: 0 },
        { range: "61–80",  count: 0 },
        { range: "81–100", count: 0 },
    ];
    data.distribution.forEach(d => {
        const idx = ["0–20","21–40","41–60","61–80","81–100"].indexOf(d.range.replace("-","–"));
        if (idx > -1) barData[idx].count = d.count;
    });

    const coveragePct = data.totalStudents > 0
        ? Math.round((data.assessedCount / data.totalStudents) * 100)
        : 0;

    // Top risk table
    const topRisk = data.topRisk || [];

    return (
        <div className="space-y-6">
            {/* Summary stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: data.totalStudents, icon: <FaUserGraduate />, color: "indigo" },
                    { label: "Assessed", value: `${data.assessedCount} (${coveragePct}%)`, icon: <FaShieldAlt />, color: "blue" },
                    { label: "Crisis Flags", value: data.crisisCount, icon: <FaExclamationTriangle />, color: data.crisisCount > 0 ? "red" : "green" },
                    { label: "High Risk", value: data.byLevel.find(b => b._id === "High")?.count ?? 0, icon: <FaShieldAlt />, color: "orange" },
                ].map(stat => (
                    <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4`}>
                        <div className={`text-${stat.color}-500 mb-2 text-lg`}>{stat.icon}</div>
                        <div className={`text-2xl font-extrabold text-${stat.color}-700`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut — by risk level */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-indigo-500" /> Students by Risk Level
                    </h4>
                    {pieData.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 text-sm">No assessments yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}>
                                    {pieData.map((entry, idx) => (
                                        <Cell key={idx} fill={RISK_COLORS[entry.name] || "#94a3b8"} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar — score distribution */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">Score Distribution</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                                {barData.map((_, idx) => (
                                    <Cell key={idx} fill={DIST_COLORS[idx]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top risk student table */}
            {topRisk.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" /> Highest Risk Students
                        </h4>
                        <button onClick={fetchData} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            <FaSync size={12} /> Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                                    <th className="p-3 text-left">Student</th>
                                    <th className="p-3 text-left">USN</th>
                                    <th className="p-3 text-center">Risk Score</th>
                                    <th className="p-3 text-center">Level</th>
                                    <th className="p-3 text-center">Crisis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topRisk.map((r, i) => {
                                    const meta = LEVEL_META(r.totalRiskScore);
                                    return (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{r.studentId?.name || "—"}</td>
                                            <td className="p-3 font-mono text-xs text-orange-600 font-bold">{r.studentId?.usn || "—"}</td>
                                            <td className="p-3 text-center">
                                                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-sm ${meta.bg} ${meta.color}`}>
                                                    {r.totalRiskScore}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>{r.riskLevel}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {r.crisisFlag
                                                    ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">⚠ Yes</span>
                                                    : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
