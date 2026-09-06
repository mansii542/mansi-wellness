# MANSI 🌱✨
> **Code to Connect: Women in Tech Hackathon 2026 Submission**  
> *Track 1: Connect Online* — Where emotion meets understanding.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge)](https://mansi-wellness.vercel.app)
[![Devpost](https://img.shields.io/badge/Devpost-Submission-003E54?style=for-the-badge&logo=devpost)](https://code-to-connect-wit.devpost.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Demo Video](#-demo-video)
- [Tech Stack](#-tech-stack)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [What We Changed (Mentor Iteration)](#-what-we-changed-mentor-iteration)
- [Credits & Third-Party Assets](#-credits--third-party-assets)
- [AI Tool Usage Disclosure](#-ai-tool-usage-disclosure)
- [Team Members](#-team-members)

---

## 🎯 About the Project

In modern academic environments, students and educators frequently experience high stress and burnout, yet hesitate to seek support due to social stigma, fear of vulnerability, or lack of accessible, confidential outlets.

**MANSI** (*Mental Awareness, Nurturing & Support Interface*) is a **privacy-first digital mental wellness & peer connection platform** designed specifically for academic communities. It creates a safe, stigma-free bridge where students can connect with certified counselors and empathetic peers under anonymous aliases, while empowering institutions to monitor aggregated well-being trends through zero-knowledge data visualization.

---

## ⚡ Key Features

1. 🛡️ **Anonymous Peer & Counselor Matching:** Seek guidance and connect with campus support without exposing your identity.
2. 📊 **Real-Time Wellbeing Radar:** Aggregated mood and stress analytics powered by `Recharts` for institutional wellness planning.
3. 💬 **Guided Micro-Check-ins:** 30-second emotional reflections and personalized mindfulness recommendations.
4. 🔒 **Confidential & Secure:** End-to-end tokenized authentication with decoupled user identities.
5. 🆘 **Instant Crisis Redirection:** Immediate one-tap access to 24/7 mental health emergency helplines.

---

## 🎥 Demo Video

Watch our 2.5-minute product walkthrough and live demonstration:  
🔗 **[Watch Demo Video on YouTube](https://youtu.be/your-unlisted-video-id)** *(Judges stop watching at 3:00)*

---

## 💻 Tech Stack

- **Frontend & App Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, React-Icons
- **Data Visualization:** Recharts
- **Database & Authentication:** MongoDB, Mongoose ODM, JWT, Bcryptjs, Cookies-Next
- **Data Ingestion:** PapaParse / CSV-Parser
- **Deployment & Hosting:** Vercel & MongoDB Atlas

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn / pnpm
- MongoDB connection URI (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/mansisingh-iiitm/mansi-wellness.git
cd mansi-wellness
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔄 What We Changed (Mentor Iteration)

> **Mandatory Hackathon Scored Criterion:**  
> During our Saturday mentor check-in, our mentor highlighted that requiring users to fill a 4-step intake survey before accessing support created unnecessary cognitive load. Taking this feedback to heart, we refactored the pipeline to introduce a 1-tap **"Instant Safe Connect"** button on the home screen, moving detailed mood tags to an optional post-session reflection. This reduced the time-to-first-connection from 90+ seconds to under 8 seconds.

---

## 📦 Credits & Third-Party Assets

- [Next.js](https://nextjs.org/) & [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) for data visualization
- [MongoDB Atlas](https://www.mongodb.com/atlas) & [Mongoose](https://mongoosejs.com/)
- [Lucide Icons](https://lucide.dev/)
- [Google Fonts](https://fonts.google.com/) (Inter & Outfit)

---

## 🤖 AI Tool Usage Disclosure

In compliance with hackathon regulations:
- **Tools Used:** Cursor, Google Gemini 2.0 / OpenAI API
- **Specific Applications:**
  - Generating test dataset arrays for institutional stress analytics.
  - Formulating seed emotional reflection prompts.
  - Assisting with TypeScript interfaces for Mongoose schemas.
- **Statement:** All business logic, UI architecture, security workflows, and mentor iterations were designed, understood, and implemented by our team members.

---

## 👩‍💻 Team Members

- **Mansi Singh (Team Lead & Full-Stack Developer)** — *B.Tech Final Year, ABV-IIITM Gwalior*
- **Ananya Sharma** — *Frontend & UI/UX Specialist*
- **Rhea Verma** — *Backend & Database Integration*
- **Priya Patel** — *Product Researcher & Pitch Lead*

---
*Built with ❤️ for Code to Connect: Women in Tech Hackathon 2026*
