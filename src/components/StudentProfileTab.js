"use client";
import { useState, useEffect } from "react";
import { FaUserGraduate, FaBook, FaClipboardList, FaCalendarAlt, FaSpinner, FaShieldAlt, FaRedo, FaExclamationTriangle } from "react-icons/fa";

const PASS_THRESHOLD = 40;
const ATTEND_WARN = 75;

// Thresholds must match submit-risk/route.js: ≤25 Low | ≤55 Moderate | ≤75 High | >75 Crisis
const RISK_META = (score, level) => {
    if (level === "Crisis" || score > 75) return { color: "text-red-600",    ring: "ring-red-400",    bg: "bg-red-50",    label: "Crisis" };
    if (level === "High"   || score > 55) return { color: "text-orange-600", ring: "ring-orange-400", bg: "bg-orange-50", label: "High Risk" };
    if (level === "Moderate"|| score > 25) return { color: "text-yellow-600", ring: "ring-yellow-400", bg: "bg-yellow-50", label: "Moderate Risk" };
    return { color: "text-green-600", ring: "ring-green-400", bg: "bg-green-50", label: "Low Risk" };
};

function pct(a, b) {
    if (a == null || !b) return null;
    return Math.round((a / b) * 100);
}

function Badge({ value, warn }) {
    if (value === null) return <span className="text-gray-300">—</span>;
    const color = value >= warn ? "bg-green-100 text-green-700" : value >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{value}%</span>;
}

export default function StudentProfileTab({ user, riskProfile, onRetakeQuiz }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSem, setActiveSem] = useState(null);

    useEffect(() => {
        if (!user?._id) return;
        fetch(`/api/student/academic?studentId=${user._id}`)
            .then(r => r.json())
            .then(d => {
                const recs = d.records || [];
                setRecords(recs);
                if (recs.length) setActiveSem(recs[recs.length - 1].semester);
            })
            .finally(() => setLoading(false));
    }, [user?._id]);

    const currentRecord = records.find(r => r.semester === activeSem);

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
            {/* Header card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold">{user?.name}</h2>
                        <p className="text-sm opacity-80 font-mono mt-0.5">{user?.usn}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Student</span>
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {user?.instituteName || "Campus"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Wellness Assessment Card (No score shown to student) ─── */}
            {riskProfile ? (
                <div className="mx-6 mt-5 mb-1 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <FaShieldAlt className="text-indigo-500 text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-indigo-800 text-sm">Wellness Assessment Completed ✓</p>
                            <p className="text-xs text-indigo-500 mt-0.5">
                                Last updated: {new Date(riskProfile.lastRecalculated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Your counselor can view your wellness summary to support you better.</p>
                        </div>
                    </div>
                    <button onClick={onRetakeQuiz}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-white px-3 py-2 rounded-xl transition hover:border-indigo-400">
                        <FaRedo size={11}/> Retake
                    </button>
                </div>
            ) : (
                <div className="mx-6 mt-5 mb-1 bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-gray-400">
                        <FaShieldAlt size={22} className="opacity-40 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-600 text-sm">Wellness Assessment Pending</p>
                            <p className="text-xs text-gray-400 mt-0.5">Complete the quick check-in to help your counselor support you better.</p>
                        </div>
                    </div>
                    <button onClick={onRetakeQuiz}
                        className="flex-shrink-0 text-xs font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition">
                        Start Check-In
                    </button>
                </div>
            )}

            <div className="flex-1 p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">
                        <FaSpinner className="animate-spin mr-2" /> Loading your records…
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <FaBook size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-gray-500">No academic records yet</h3>
                        <p className="text-sm mt-1">Your institute hasn't uploaded your marks or attendance yet.</p>
                    </div>
                ) : (
                    <div>
                        {/* Semester tabs */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {records.map(r => (
                                <button key={r.semester}
                                    onClick={() => setActiveSem(r.semester)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition ${activeSem === r.semester ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                                    Sem {r.semester}
                                    <span className="ml-1 text-xs opacity-70">({r.academicYear})</span>
                                </button>
                            ))}
                        </div>

                        {currentRecord && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Marks card */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-5 py-4 border-b bg-blue-50">
                                        <FaBook className="text-blue-500" />
                                        <h3 className="font-bold text-gray-800">Marks — Semester {currentRecord.semester}</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-xs text-gray-500 uppercase bg-gray-50">
                                                <th className="p-3 text-left">Subject</th>
                                                <th className="p-3 text-center">Score</th>
                                                <th className="p-3 text-center">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentRecord.subjects
                                                .filter(s => s.marksObtained != null)
                                                .map((sub, i) => {
                                                    const p = pct(sub.marksObtained, sub.maxMarks);
                                                    return (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium text-gray-800">{sub.name}</td>
                                                            <td className="p-3 text-center text-gray-600">
                                                                {sub.marksObtained}<span className="text-gray-400">/{sub.maxMarks}</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Badge value={p} warn={PASS_THRESHOLD} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            {currentRecord.subjects.filter(s => s.marksObtained != null).length === 0 && (
                                                <tr><td colSpan={3} className="p-6 text-center text-gray-400 text-sm">Marks not uploaded yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance card */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-5 py-4 border-b bg-purple-50">
                                        <FaClipboardList className="text-purple-500" />
                                        <h3 className="font-bold text-gray-800">Attendance — Semester {currentRecord.semester}</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-xs text-gray-500 uppercase bg-gray-50">
                                                <th className="p-3 text-left">Subject</th>
                                                <th className="p-3 text-center">Classes</th>
                                                <th className="p-3 text-center">Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentRecord.subjects
                                                .filter(s => s.attendanceTotal != null)
                                                .map((sub, i) => {
                                                    const p = pct(sub.attendancePresent, sub.attendanceTotal);
                                                    return (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium text-gray-800">{sub.name}</td>
                                                            <td className="p-3 text-center text-gray-600">
                                                                {sub.attendancePresent}<span className="text-gray-400">/{sub.attendanceTotal}</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Badge value={p} warn={ATTEND_WARN} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            {currentRecord.subjects.filter(s => s.attendanceTotal != null).length === 0 && (
                                                <tr><td colSpan={3} className="p-6 text-center text-gray-400 text-sm">Attendance not uploaded yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary stats */}
                                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {(() => {
                                        const withMarks = currentRecord.subjects.filter(s => s.marksObtained != null);
                                        const withAtt = currentRecord.subjects.filter(s => s.attendanceTotal != null);
                                        const avgMark = withMarks.length
                                            ? Math.round(withMarks.reduce((a, s) => a + pct(s.marksObtained, s.maxMarks), 0) / withMarks.length)
                                            : null;
                                        const avgAtt = withAtt.length
                                            ? Math.round(withAtt.reduce((a, s) => a + pct(s.attendancePresent, s.attendanceTotal), 0) / withAtt.length)
                                            : null;
                                        const passed = withMarks.filter(s => pct(s.marksObtained, s.maxMarks) >= PASS_THRESHOLD).length;
                                        const attDanger = withAtt.filter(s => pct(s.attendancePresent, s.attendanceTotal) < ATTEND_WARN).length;

                                        return [
                                            { label: "Avg Marks", value: avgMark != null ? `${avgMark}%` : "—", color: "blue" },
                                            { label: "Subjects Passed", value: `${passed}/${withMarks.length}`, color: "green" },
                                            { label: "Avg Attendance", value: avgAtt != null ? `${avgAtt}%` : "—", color: "purple" },
                                            { label: "Low Attendance", value: attDanger > 0 ? `${attDanger} subject${attDanger > 1 ? "s" : ""}` : "None", color: attDanger > 0 ? "red" : "green" },
                                        ].map(stat => (
                                            <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4 text-center`}>
                                                <div className={`text-2xl font-extrabold text-${stat.color}-600`}>{stat.value}</div>
                                                <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
