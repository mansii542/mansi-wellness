"use client";
import { useState } from "react";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaArrowLeft, FaSpinner, FaHeart } from "react-icons/fa";

// ── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
    { id: 1,  text: "How often have you felt sad or hopeless in the past 2 weeks?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] },
    { id: 2,  text: "How well are you sleeping on most nights?",
      options: ["Very well", "Fairly well", "Somewhat poorly", "Poorly", "Very poorly"] },
    { id: 3,  text: "How overwhelmed do you feel by your academic workload?",
      options: ["Not at all", "Slightly", "Moderately", "Very much", "Extremely"] },
    { id: 4,  text: "How often do you feel anxious or nervous about things?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] },
    { id: 5,  text: "Do you have someone you trust to talk to when you're struggling?",
      options: ["Always", "Usually", "Sometimes", "Rarely", "Never"] },
    { id: 6,  text: "How is your appetite — are you eating regularly?",
      options: ["Eating well", "Mostly fine", "Sometimes skip meals", "Often skip meals", "Rarely eating properly"] },
    { id: 7,  text: "How often do you find it hard to concentrate on studies?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] },
    { id: 8,  text: "Do you feel disconnected from friends or family lately?",
      options: ["Not at all", "Occasionally", "Sometimes", "Often", "Almost always"] },
    { id: 9,  text: "How confident do you feel about your academic future?",
      options: ["Very confident", "Fairly confident", "Unsure", "Not very confident", "Not confident at all"] },
    { id: 10, text: "Have you had any thoughts of harming yourself recently?",
      crisis: true,
      options: ["Never", "A fleeting thought once", "Occasional thoughts", "Frequent thoughts", "Very frequent thoughts"] },
];

// ── Motivational quotes per band — score is NEVER shown to student ─────────
const QUOTES = {
    Low: [
        { quote: "You're doing better than you think. Keep going — every small step counts.", emoji: "🌟", tip: "Keep up your routines — sleep, movement, and connection go a long way." },
        { quote: "Your resilience is your superpower. The fact that you showed up today is already enough.", emoji: "💪", tip: "Celebrate the small wins. You're building something meaningful." },
        { quote: "Good things are on their way. Stay curious, stay kind to yourself.", emoji: "🌱", tip: "Try sharing something you're grateful for with someone you trust today." },
    ],
    Moderate: [
        { quote: "It's okay to not be okay. Reaching out is a sign of strength, not weakness.", emoji: "🤝", tip: "Consider talking to a friend, family member, or campus counselor soon." },
        { quote: "You are not alone in what you feel. Brighter days are always ahead — one step at a time.", emoji: "🌤️", tip: "A 10-minute walk or deep breathing can make a real difference today." },
        { quote: "Every storm runs out of rain. Give yourself the same compassion you'd give a dear friend.", emoji: "🌈", tip: "Be gentle with yourself. You're carrying more than you realise." },
    ],
    High: [
        { quote: "Your feelings are completely valid. A counselor is here to walk this path with you.", emoji: "💙", tip: "Please reach out to your campus counselor — they're there for exactly this." },
        { quote: "Hard times are part of the story, not the whole story. Talk to someone you trust today.", emoji: "🫂", tip: "You don't have to figure everything out alone. One conversation can change things." },
        { quote: "You matter more than you know. Asking for help is the bravest thing you can do.", emoji: "❤️", tip: "Connect with a counselor this week — you deserve that support." },
    ],
    Crisis: [
        { quote: "Your life has immense value. Please speak to your campus counselor or a trusted adult today.", emoji: "❤️", tip: "iCall Helpline (free & confidential): 9152987821" },
        { quote: "You are loved and never alone. Support is available right now — please reach out.", emoji: "🫂", tip: "iCall Helpline (free & confidential): 9152987821" },
    ],
};

function getQuote(level) {
    const pool = QUOTES[level] || QUOTES.Moderate;
    return pool[Math.floor(Math.random() * pool.length)];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RiskQuestionnaire({ user, onComplete }) {
    const [step, setStep]       = useState(0); // 0=intro, 1-10=questions, done=result
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [quote, setQuote]     = useState(null);
    const [error, setError]     = useState("");

    const currentQ = QUESTIONS[step - 1];
    const progress = step === 0 ? 0 : Math.round((step / QUESTIONS.length) * 100);
    const answered = answers[step - 1] !== undefined;

    const handleAnswer = (idx) => {
        setAnswers(prev => ({ ...prev, [step - 1]: idx }));
    };

    const handleNext = () => {
        if (step < QUESTIONS.length) { setStep(s => s + 1); return; }
        handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true); setError("");
        const payload = QUESTIONS.map((q, i) => ({
            questionId: q.id,
            score: answers[i] ?? 0,
        }));
        try {
            const res = await fetch("/api/student/submit-risk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: user._id, answers: payload }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data.profile);
                setQuote(getQuote(data.profile.riskLevel)); // pick quote by server's band
            } else {
                setError(data.message || "Submission failed.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Result screen — motivational quote. Score NEVER shown. ───────────────
    if (result && quote) {
        const isCrisis = result.crisisFlag || result.riskLevel === "Crisis";
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                    {/* Top gradient strip */}
                    <div className={`${isCrisis ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-indigo-500 to-purple-600"} p-6 text-center`}>
                        <div className="text-5xl mb-3">{quote.emoji}</div>
                        <h2 className="text-xl font-extrabold text-white">Thank you for sharing</h2>
                        <p className="text-white/80 text-sm mt-1">Your responses are completely confidential.</p>
                    </div>

                    <div className="p-6">
                        {/* Quote */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-4 text-center">
                            <p className="text-gray-700 font-medium text-base leading-relaxed italic">
                                "{quote.quote}"
                            </p>
                        </div>

                        {/* Tip */}
                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 mb-5">
                            <FaHeart className="text-pink-400 mt-0.5 flex-shrink-0" />
                            <p className={`text-sm font-medium ${isCrisis ? "text-red-700" : "text-gray-600"}`}>
                                {quote.tip}
                            </p>
                        </div>

                        {/* Crisis helpline banner */}
                        {isCrisis && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-700 font-bold text-sm">You are not alone</p>
                                    <p className="text-red-600 text-xs mt-0.5">
                                        Please speak to your campus counselor right away, or call iCall (free & confidential): <strong>9152987821</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => onComplete(result)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                            <FaCheckCircle /> Go to My Portal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Intro screen ──────────────────────────────────────────────────────────
    if (step === 0) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-5">
                        <FaShieldAlt className="text-indigo-600 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-2">Wellness Check-In</h2>
                    <p className="text-center text-gray-500 text-sm mb-6">
                        Welcome, <strong className="text-gray-700">{user?.name}</strong>! Before you begin, we'd like to understand how you're doing so we can support you better.
                    </p>
                    <ul className="space-y-2 mb-7 text-sm text-gray-600">
                        {[
                            "10 quick questions — takes about 2 minutes",
                            "Your answers are completely confidential",
                            "Helps counselors understand who needs support",
                            "You can retake this anytime from My Profile",
                        ].map(t => (
                            <li key={t} className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-400 flex-shrink-0" /> {t}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setStep(1)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                        Begin Assessment <FaArrowRight />
                    </button>
                </div>
            </div>
        );
    }

    // ── Question screen ───────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-t-3xl">
                    <div className="h-1.5 bg-indigo-500 rounded-tl-3xl transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6 text-xs text-gray-400 font-bold">
                        <span>Question {step} of {QUESTIONS.length}</span>
                        <span>{progress}% complete</span>
                    </div>

                    {currentQ?.crisis && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg mb-4">
                            <FaExclamationTriangle /> This question is sensitive — all answers are completely confidential.
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-800 mb-6 leading-snug">{currentQ?.text}</h3>

                    <div className="space-y-2.5 mb-8">
                        {currentQ?.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                    answers[step - 1] === idx
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                                }`}>
                                <span className="mr-2 font-bold text-xs opacity-60">{String.fromCharCode(65 + idx)}.</span> {opt}
                            </button>
                        ))}
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <FaArrowLeft size={12} /> Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!answered || loading}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2">
                            {loading ? <FaSpinner className="animate-spin" /> : step === QUESTIONS.length ? "Submit" : <>Next <FaArrowRight size={12} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
