import Link from 'next/link';
import { FaUserGraduate, FaChalkboardTeacher, FaUserMd, FaBuilding } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">MANSI AI</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Seamless wellness and management portal for modern educational institutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        
        {/* Student Card */}
        <Link href="/student/login" className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-orange-200">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaUserGraduate size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student</h2>
          <p className="text-gray-500 text-sm">Access wellness resources and chat.</p>
        </Link>

        {/* Teacher Card */}
        <Link href="/teacher/login" className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-blue-200">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaChalkboardTeacher size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher</h2>
          <p className="text-gray-500 text-sm">Monitor student engagement.</p>
        </Link>

        {/* Psychologist Card */}
        <Link href="/psychologist/login" className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-purple-200">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaUserMd size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Counselor</h2>
          <p className="text-gray-500 text-sm">Manage cases and appointments.</p>
        </Link>

        {/* Institute Card */}
        <Link href="/login" className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-indigo-200">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaBuilding size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Institute</h2>
          <p className="text-gray-500 text-sm">Admin dashboard and settings.</p>
        </Link>

      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        © 2025 MANSI AI. Secure & Confidential.
      </footer>
    </div>
  );
}