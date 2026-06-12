'use client'

import { useState, useEffect } from 'react'
import { account, databases } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'
import { Query } from 'appwrite'
import { Eye, EyeOff } from 'lucide-react'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

export default function InstituteLogin() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ---------------- AUTO FILL FROM URL ---------------- */
  useEffect(() => {

    const params = new URLSearchParams(window.location.search)

    const urlEmail = params.get('email')
    const urlPassword = params.get('password')

    if (urlEmail) setEmail(urlEmail)
    if (urlPassword) setPassword(urlPassword)

  }, [])

  /* ---------------- LOGIN ---------------- */
  const login = async (e) => {

  e.preventDefault();

  if (loading) return;

  setLoading(true);

  try {

    // DELETE OLD SESSION FIRST
    try {
      await account.deleteSession("current");
    } catch (err) {
      // ignore if no session exists
    }

    // CREATE NEW SESSION
    await account.createEmailPasswordSession(email, password);

   
    /* ---------------- ADMIN LOGIN ---------------- */
if (email === "memorialacademyakshah@gmail.com") {

  localStorage.setItem("adminAuth", "true");

  setTimeout(() => {
    router.push("/admin");
  }, 500);

  return;
}

    /* ---------------- FRANCHISE CHECK ---------------- */
    const res = await databases.listDocuments(
      DATABASE_ID,
      "franchise_approved",
      [Query.equal("email", email)]
    );

    if (!res.documents.length) {

      alert("Your franchise is not approved yet");

      await account.deleteSession("current");

      setLoading(false);

      return;
    }

    /* ---------------- NORMAL USER LOGIN ---------------- */
    router.push("/login/institute/dashboard");

  } catch (error) {

    console.error(error);

    alert(error?.message || "Invalid credentials");

  } finally {

    setLoading(false);

  }

};

  return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

    <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">

      {/* LEFT PANEL */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 text-white">

        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 h-full flex flex-col justify-center p-10 lg:p-14">

          <img
            src="/campas.png"
            alt="Academy Logo"
            className="w-28 mb-8"
          />

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            AK Shah Memorial Academy Portal
          </h1>

          <p className="text-lg text-blue-100 mb-10">
            Access your institute dashboard, manage courses,
            monitor students and stay connected with your academy.
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <span>Institute Management Dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <span>Student & Franchise Records</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <span>Course & Certificate Access</span>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 sm:p-12">

        <div className="w-full max-w-md">

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-gray-800">
              Sign In
            </h2>

            <p className="text-gray-500 mt-2">
              Login to continue to your institute account
            </p>

          </div>

          <form onSubmit={login} className="space-y-5">

            {/* EMAIL */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          {/* PWA CARD */}
          {/* <div className="mt-8 p-5 bg-slate-50 border rounded-2xl">

            <h3 className="font-semibold text-gray-800 mb-2">
              📱 Student Mobile App
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Install the academy application and access courses
              anytime from your mobile device.
            </p>

            <button
              type="button"
              className="w-full border border-blue-600 text-blue-700 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Coming Soon
            </button>

          </div> */}

        </div>

      </div>

    </div>

  </div>
)
}