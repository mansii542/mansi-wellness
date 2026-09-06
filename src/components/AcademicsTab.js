"use client";
import { useState, useCallback } from "react";
import {
    FaUserGraduate, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle,
    FaTimes, FaFileUpload, FaPlusCircle, FaTrash, FaBook, FaCalendarAlt,
    FaClipboardList, FaChartBar
} from "react-icons/fa";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const PASS_THRESHOLD = 40;   // % of maxMarks
const ATTEND_WARN = 75;       // %

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(a, b) {
    if (!b || b === 0) return null;
    return Math.round((a / b) * 100);
}

function MarksColor(obtained, max) {
    const p = pct(obtained, max);
    if (p === null) return "text-gray-400";
    if (p >= PASS_THRESHOLD) return "text-green-600 font-bold";
    return "text-red-600 font-bold";
}

function AttendColor(present, total) {
    const p = pct(present, total);
    if (p === null) return "text-gray-400";
    if (p >= ATTEND_WARN) return "text-green-600 font-bold";
    if (p >= 60) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
}

// ── Status message ─────────────────────────────────────────────────────────

function StatusBar({ msg }) {
    if (!msg?.text) return null;
    const isErr = msg.type === "error";
    return (
        <div className={`mt-4 p-3 rounded-lg text-sm flex gap-2 items-center border animate-pulse ${isErr ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
            {isErr ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{msg.text}</span>
        </div>
    );
}

// ── Student profile panel ──────────────────────────────────────────────────

function StudentProfilePanel({ student, onClose }) {
    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(true);

    useState(() => {
        fetch(`/api/institute/student-profile?studentId=${student._id}`)
            .then(r => r.json())
            .then(d => { setRecords(d.academicRecords || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [student._id]);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-start">
                    <div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-3">
                            {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold">{student.name}</h2>
                        <p className="text-sm opacity-80 mt-1 font-mono">{student.usn}</p>
                        <span className="mt-2 inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {student.status || "Active"}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400">
                            <FaSpinner className="animate-spin mr-2" /> Loading records…
                        </div>
                    ) : records?.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FaBook size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No academic records yet.</p>
                            <p className="text-sm mt-1">Upload marks or attendance from the Marks / Attendance tabs.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {records.map(rec => (
                                <div key={rec._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b">
                                        <FaCalendarAlt className="text-indigo-500" />
                                        <span className="font-bold text-gray-700">Semester {rec.semester}</span>
                                        <span className="text-xs text-gray-400 ml-1">({rec.academicYear})</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-white text-xs text-gray-500 uppercase">
                                                    <th className="p-3 text-left">Subject</th>
                                                    <th className="p-3 text-center">Marks</th>
                                                    <th className="p-3 text-center">%</th>
                                                    <th className="p-3 text-center">Attendance</th>
                                                    <th className="p-3 text-center">Att %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {rec.subjects.map((sub, i) => {
                                                    const markP = pct(sub.marksObtained, sub.maxMarks);
                                                    const attP = pct(sub.attendancePresent, sub.attendanceTotal);
                                                    return (
                                                        <tr key={i} className="hover:bg-gray-50 transition">
                                                            <td className="p-3 font-medium text-gray-800">{sub.name}</td>
                                                            <td className="p-3 text-center">
                                                                {sub.marksObtained != null
                                                                    ? `${sub.marksObtained}/${sub.maxMarks}`
                                                                    : <span className="text-gray-300">—</span>}
                                                            </td>
                                                            <td className={`p-3 text-center ${MarksColor(sub.marksObtained, sub.maxMarks)}`}>
                                                                {markP != null ? `${markP}%` : "—"}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                {sub.attendancePresent != null
                                                                    ? `${sub.attendancePresent}/${sub.attendanceTotal}`
                                                                    : <span className="text-gray-300">—</span>}
                                                            </td>
                                                            <td className={`p-3 text-center ${AttendColor(sub.attendancePresent, sub.attendanceTotal)}`}>
                                                                {attP != null ? `${attP}%` : "—"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Subject rows editor ────────────────────────────────────────────────────

function SubjectRows({ subjects, onChange, mode }) {
    const addRow = () => onChange([...subjects, { name: "", marksObtained: "", maxMarks: "100", attendancePresent: "", attendanceTotal: "" }]);
    const removeRow = (i) => onChange(subjects.filter((_, idx) => idx !== i));
    const set = (i, field, val) => {
        const next = [...subjects];
        next[i] = { ...next[i], [field]: val };
        onChange(next);
    };

    return (
        <div className="space-y-2">
            {subjects.map((sub, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <input
                        className="flex-[2] border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        placeholder="Subject name"
                        value={sub.name}
                        onChange={e => set(i, "name", e.target.value)}
                    />
                    {mode === "marks" ? (
                        <>
                            <input type="number" className="w-20 border p-2 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-400 outline-none"
                                placeholder="Marks" value={sub.marksObtained} onChange={e => set(i, "marksObtained", e.target.value)} />
                            <span className="text-gray-400 text-sm">/</span>
                            <input type="number" className="w-20 border p-2 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-400 outline-none"
                                placeholder="Max" value={sub.maxMarks} onChange={e => set(i, "maxMarks", e.target.value)} />
                        </>
                    ) : (
                        <>
                            <input type="number" className="w-20 border p-2 rounded-lg text-sm text-center focus:ring-2 focus:ring-purple-400 outline-none"
                                placeholder="Present" value={sub.attendancePresent} onChange={e => set(i, "attendancePresent", e.target.value)} />
                            <span className="text-gray-400 text-sm">/</span>
                            <input type="number" className="w-20 border p-2 rounded-lg text-sm text-center focus:ring-2 focus:ring-purple-400 outline-none"
                                placeholder="Total" value={sub.attendanceTotal} onChange={e => set(i, "attendanceTotal", e.target.value)} />
                        </>
                    )}
                    <button type="button" onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500 p-1 transition">
                        <FaTrash size={12} />
                    </button>
                </div>
            ))}
            <button type="button" onClick={addRow}
                className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                <FaPlusCircle size={14} /> Add subject
            </button>
        </div>
    );
}

// ── CSV parsers ────────────────────────────────────────────────────────────

function parseMarksCsv(text) {
    // Format: USN, SubjectName, MarksObtained, MaxMarks
    const map = {};
    text.split("\n").forEach(line => {
        const parts = line.split(",").map(s => s.trim());
        if (parts.length < 3) return;
        const [usn, name, marks, max] = parts;
        if (!usn || !name) return;
        if (!map[usn]) map[usn] = [];
        map[usn].push({ name, marksObtained: Number(marks), maxMarks: Number(max) || 100 });
    });
    return Object.entries(map).map(([usn, subjects]) => ({ usn, subjects }));
}

function parseAttCsv(text) {
    // Format: USN, SubjectName, Present, Total
    const map = {};
    text.split("\n").forEach(line => {
        const parts = line.split(",").map(s => s.trim());
        if (parts.length < 4) return;
        const [usn, name, present, total] = parts;
        if (!usn || !name) return;
        if (!map[usn]) map[usn] = [];
        map[usn].push({ name, attendancePresent: Number(present), attendanceTotal: Number(total) });
    });
    return Object.entries(map).map(([usn, subjects]) => ({ usn, subjects }));
}

// ── Upload panel ───────────────────────────────────────────────────────────

function UploadPanel({ mode, instituteId }) {
    const isMarks = mode === "marks";
    const accent = isMarks ? "indigo" : "purple";

    const [sem, setSem] = useState(1);
    const [year, setYear] = useState("2024-25");
    const [csvMode, setCsvMode] = useState(false);
    const [csvText, setCsvText] = useState("");
    const [usn, setUsn] = useState("");
    const [subjects, setSubjects] = useState([{ name: "", marksObtained: "", maxMarks: "100", attendancePresent: "", attendanceTotal: "" }]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const reset = () => {
        setUsn(""); setCsvText("");
        setSubjects([{ name: "", marksObtained: "", maxMarks: "100", attendancePresent: "", attendanceTotal: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setStatus(null);

        let entries;
        if (csvMode) {
            entries = isMarks ? parseMarksCsv(csvText) : parseAttCsv(csvText);
            if (!entries.length) {
                setStatus({ type: "error", text: "No valid rows found in CSV." });
                setLoading(false); return;
            }
        } else {
            const cleanSubs = subjects.filter(s => s.name.trim());
            if (!usn.trim() || !cleanSubs.length) {
                setStatus({ type: "error", text: "USN and at least one subject required." });
                setLoading(false); return;
            }
            entries = [{ usn: usn.toUpperCase().trim(), subjects: cleanSubs.map(s => ({
                name: s.name.trim(),
                ...(isMarks ? { marksObtained: Number(s.marksObtained), maxMarks: Number(s.maxMarks) || 100 }
                            : { attendancePresent: Number(s.attendancePresent), attendanceTotal: Number(s.attendanceTotal) })
            })) }];
        }

        const endpoint = isMarks ? "/api/institute/upload-marks" : "/api/institute/upload-attendance";
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instituteId, semester: sem, academicYear: year, entries })
            });
            const data = await res.json();
            setStatus({
                type: res.ok && data.count > 0 ? "success" : "error",
                text: data.message + (data.errors?.length ? ` (${data.errors[0]})` : "")
            });
            if (res.ok && data.count > 0) reset();
        } catch {
            setStatus({ type: "error", text: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className={`text-lg font-bold text-gray-800 mb-5 flex items-center gap-2`}>
                {isMarks ? <FaBook className="text-indigo-500" /> : <FaClipboardList className="text-purple-500" />}
                Upload {isMarks ? "Marks" : "Attendance"}
            </h3>

            {/* Semester & Year selectors */}
            <div className="flex gap-4 mb-5">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Semester</label>
                    <select value={sem} onChange={e => setSem(Number(e.target.value))}
                        className={`w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-${accent}-400 text-sm font-bold text-gray-700`}>
                        {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Academic Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)}
                        className={`w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-${accent}-400 text-sm`}
                        placeholder="e.g. 2024-25" />
                </div>

                {/* Toggle Manual/CSV */}
                <div className="flex items-end">
                    <button type="button"
                        onClick={() => { setCsvMode(!csvMode); reset(); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-sm transition ${csvMode ? "bg-gray-100 text-gray-600 border-gray-300" : `bg-${accent}-50 text-${accent}-600 border-${accent}-200`}`}>
                        {csvMode ? <FaPlusCircle /> : <FaFileUpload />}
                        {csvMode ? "Manual" : "CSV Upload"}
                    </button>
                </div>
            </div>

            {csvMode ? (
                <div className="space-y-3">
                    <div className={`bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800`}>
                        <strong>CSV Format:</strong>{" "}
                        {isMarks
                            ? <code>USN, SubjectName, MarksObtained, MaxMarks</code>
                            : <code>USN, SubjectName, Present, Total</code>}
                        <br />
                        <strong>Example:</strong>{" "}
                        {isMarks
                            ? <code>1XY23CS001, Mathematics, 85, 100</code>
                            : <code>1XY23CS001, Mathematics, 42, 50</code>}
                        <br />One row per subject per student.
                    </div>
                    <textarea
                        className="w-full border p-3 rounded-lg font-mono text-xs h-36 focus:ring-2 focus:ring-indigo-400 outline-none"
                        placeholder="Paste CSV data here…"
                        value={csvText} onChange={e => setCsvText(e.target.value)} />
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Student USN</label>
                        <input
                            className="w-full border p-3 rounded-lg uppercase font-bold focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                            placeholder="e.g. 1XY23CS001"
                            value={usn} onChange={e => setUsn(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                            {isMarks ? "Subject Marks" : "Attendance"}
                        </label>
                        <SubjectRows subjects={subjects} onChange={setSubjects} mode={mode} />
                    </div>
                </div>
            )}

            <div className="mt-5 flex items-center gap-4">
                <button
                    type="submit" disabled={loading}
                    className={`bg-${accent}-600 hover:bg-${accent}-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50`}>
                    {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    {loading ? "Uploading…" : `Upload ${isMarks ? "Marks" : "Attendance"}`}
                </button>
            </div>

            <StatusBar msg={status} />
        </form>
    );
}

// ── Main export ─────────────────────────────────────────────────────────────

export default function AcademicsTab({ user, studentList, refreshData }) {
    const [subTab, setSubTab] = useState("roster");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const tabs = [
        { id: "roster", label: "Student Roster", icon: <FaUserGraduate /> },
        { id: "marks", label: "Upload Marks", icon: <FaBook /> },
        { id: "attendance", label: "Upload Attendance", icon: <FaClipboardList /> },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Academic Records</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload marks, attendance and view student profiles.</p>
                </div>
            </div>

            {/* Sub-tab bar */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${subTab === t.id ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Roster */}
            {subTab === "roster" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <h3 className="text-lg font-bold text-gray-800">
                            All Students <span className="text-gray-400 font-normal">({studentList.length})</span>
                        </h3>
                        <button onClick={refreshData} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
                    </div>

                    {studentList.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FaUserGraduate size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No students found. Add students in the Students tab.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b">
                                        <th className="p-4 text-left">Name</th>
                                        <th className="p-4 text-left">USN</th>
                                        <th className="p-4 text-left">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {studentList.map(s => (
                                        <tr key={s._id} className="hover:bg-indigo-50/40 transition cursor-pointer group"
                                            onClick={() => setSelectedStudent(s)}>
                                            <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {s.name?.charAt(0).toUpperCase()}
                                                </div>
                                                {s.name}
                                            </td>
                                            <td className="p-4 font-mono text-orange-600 font-bold text-xs">{s.usn}</td>
                                            <td className="p-4">
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                                    {s.status || "Active"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelectedStudent(s); }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full font-bold hover:bg-indigo-50 transition">
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Marks */}
            {subTab === "marks" && (
                <UploadPanel mode="marks" instituteId={user?._id} />
            )}

            {/* Upload Attendance */}
            {subTab === "attendance" && (
                <UploadPanel mode="attendance" instituteId={user?._id} />
            )}

            {/* Student Profile Slide-over */}
            {selectedStudent && (
                <StudentProfilePanel student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
        </div>
    );
}
