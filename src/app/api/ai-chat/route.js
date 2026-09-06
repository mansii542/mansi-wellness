import { NextResponse } from 'next/server';

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_MODEL = 'llama-3.3-70b-versatile';

// System prompts per role
const SYSTEM_PROMPTS = {
    student: `You are MANSI, a compassionate AI wellness companion designed for students. 
Your role is to:
- Provide empathetic emotional support and a safe space to talk
- Help students manage academic stress, anxiety, and personal challenges
- Offer evidence-based coping strategies (breathing exercises, CBT techniques, mindfulness)
- Recognize signs of crisis and gently encourage professional help when needed
- Keep responses warm, concise (2-4 sentences), and non-judgmental
- Never diagnose or prescribe; always suggest consulting a real counselor for serious concerns
You are not a replacement for professional mental health care.`,

    teacher: `You are MANSI, an AI wellness assistant for educational staff.
Your role is to:
- Support teachers dealing with burnout, stress, and professional challenges
- Provide practical wellness strategies for managing workload and emotional fatigue
- Offer guidance on maintaining work-life balance and healthy boundaries
- Keep responses professional, empathetic, and actionable (2-4 sentences)
- Suggest seeking HR or professional counseling for serious concerns`,

    psychologist: `You are MANSI Clinical AI, an assistant for licensed psychologists and counselors.
Your role is to:
- Help with case conceptualization, session notes, and clinical documentation
- Suggest evidence-based therapeutic techniques (CBT, DBT, ACT, MI) for specific presentations
- Assist with psychoeducation materials and treatment planning
- Provide research-backed information on mental health topics
- Summarize key clinical themes from session descriptions
- Keep responses concise, clinical, and professionally framed
You are a tool to support, not replace, clinical judgment.`
};

export async function POST(req) {
    try {
        const { messages, role } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const systemPrompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.student;

        const payload = {
            model: GROK_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 512,
        };

        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Grok API error:', errText);
            return NextResponse.json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

        return NextResponse.json({ message: aiMessage }, { status: 200 });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
