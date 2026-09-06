"use client";
import { useMemo } from 'react';

export default function WellnessGraph({ sessions }) {
    // 1. Process Data: Convert Sessions into Graph Points
    const dataPoints = useMemo(() => {
        if (!sessions || sessions.length === 0) return [];

        // Sort by date (oldest to newest)
        const sorted = [...sessions].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

        return sorted.map((session) => {
            // Convert Severity to Score
            let score = 50; // Default (Yellow/Pending)
            if (session.severity === 'Green') score = 90;
            if (session.severity === 'Yellow') score = 50;
            if (session.severity === 'Red') score = 20;

            return {
                id: session._id,
                date: new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                score: score,
                severity: session.severity || 'Yellow',
                problem: session.problemType || 'General'
            };
        });
    }, [sessions]);

    // 2. Graph Dimensions
    const width = 600;
    const height = 300;
    const padding = 40;

    // Helper: Map score (0-100) to Y pixel position
    const getY = (score) => height - padding - (score / 100) * (height - (padding * 2));
    // Helper: Map index to X pixel position
    const getX = (index) => padding + (index / (dataPoints.length - 1 || 1)) * (width - (padding * 2));

    if (dataPoints.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-gray-400">
                No wellness data recorded yet.
            </div>
        );
    }

    // 3. Build the SVG Path
    const pathData = dataPoints.length > 1 
        ? dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ')
        : `M ${padding} ${getY(dataPoints[0].score)} L ${width - padding} ${getY(dataPoints[0].score)}`; // Flat line if only 1 point

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                <span>Real-Time Wellness Trends</span>
                <span className="text-xs font-normal bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    Based on your Clinical Grading
                </span>
            </h3>
            
            <div className="relative w-full overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-lg">
                    {/* Grid Lines (Background) */}
                    <line x1={padding} y1={getY(20)} x2={width-padding} y2={getY(20)} stroke="#fee2e2" strokeWidth="1" strokeDasharray="5,5" />
                    <text x={padding-25} y={getY(20)+5} fontSize="10" fill="#ef4444">Critical</text>
                    
                    <line x1={padding} y1={getY(50)} x2={width-padding} y2={getY(50)} stroke="#fef08a" strokeWidth="1" strokeDasharray="5,5" />
                    <text x={padding-25} y={getY(50)+5} fontSize="10" fill="#eab308">Stable</text>
                    
                    <line x1={padding} y1={getY(90)} x2={width-padding} y2={getY(90)} stroke="#dcfce7" strokeWidth="1" strokeDasharray="5,5" />
                    <text x={padding-25} y={getY(90)+5} fontSize="10" fill="#22c55e">Good</text>

                    {/* The Trend Line */}
                    <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points (Dots) */}
                    {dataPoints.map((p, i) => (
                        <g key={p.id}>
                            <circle 
                                cx={getX(i)} 
                                cy={getY(p.score)} 
                                r="6" 
                                fill={p.severity === 'Red' ? '#ef4444' : p.severity === 'Green' ? '#22c55e' : '#eab308'} 
                                stroke="white" 
                                strokeWidth="2"
                            />
                            {/* Tooltip-like Label */}
                            <text x={getX(i)} y={getY(p.score) - 15} fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">
                                {p.problem}
                            </text>
                            <text x={getX(i)} y={height - 10} fontSize="10" textAnchor="middle" fill="#94a3b8">
                                {p.date}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}