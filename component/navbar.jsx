'use client'

import { useEffect, useState } from 'react'
import { databases } from '@/lib/appwrite'
import Link from 'next/link'
import { Query } from 'appwrite'
import { Menu, X, ChevronDown, GraduationCap } from 'lucide-react'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const WEBSITE_COLLECTION = 'website'

export default function Navbar() {
  const [navbarData, setNavbarData] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  /* ---------------- FETCH CMS DATA ---------------- */
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        if (!databases) return

        const res = await databases.listDocuments(
          DATABASE_ID,
          WEBSITE_COLLECTION,
          [Query.limit(1)]
        )

        if (res.documents.length) {
          setNavbarData(res.documents[0])
        }
      } catch (error) {
        console.error('Navbar CMS load failed:', error)
      }
    }

    fetchNavbar()
  }, [])

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#f5f5f5] border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-16 py-5">

        <div className="flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link href="/" className="flex items-center gap-3">

            {navbarData?.logoUrl ? (
              <img
                src={navbarData.logoUrl}
                alt="logo"
                className="h-12 object-contain"
              />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center">
                  <GraduationCap className="text-white w-7 h-7" />
                </div>

                <h1 className="text-[34px] font-extrabold text-[#0A1551] tracking-tight">
                  {navbarData?.siteName || 'Edulab'}
                </h1>
              </>
            )}

          </Link>

          {/* ================= DESKTOP MENU ================= */}
          <nav className="hidden lg:flex items-center gap-10">

            <NavItem title="HOME" href="/" />
            <NavItem title="ABOUT" href="/aboutus" />

            <NavDropdown title="COURSE" href="/#courses" />

            <NavDropdown
              title="CERTIFICATION"
              href="/certificate-demo"
            />

            <NavDropdown
              title="VERIFICATION"
              href="/verify/verification"
            />

            <NavItem title="CONTACT" href="/contact" />

          </nav>

          {/* ================= RIGHT BUTTONS ================= */}
          <div className="hidden lg:flex items-center gap-8">

            <Link
              href="/login/institute"
              className="text-[#0A1551] font-semibold text-[18px] hover:text-[#5865F2] transition-all duration-300"
            >
              Login
            </Link>

            <Link href="/student/login">
              <button
                className="
                  bg-[#5865F2]
                  hover:bg-[#4654e8]
                  text-white
                  font-semibold
                  px-8
                  py-4
                  rounded-none
                  transition-all
                  duration-300
                  shadow-md
                "
              >
                Student Login
              </button>
            </Link>

          </div>

          {/* ================= MOBILE BUTTON ================= */}
          <button
            className="lg:hidden text-[#0A1551]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}
        {menuOpen && (
          <div className="lg:hidden mt-6 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

            <MobileNav href="/" title="HOME" />
            <MobileNav href="/aboutus" title="ABOUT" />
            <MobileNav href="/#courses" title="COURSE" />
            <MobileNav href="/certificate-demo" title="CERTIFICATION" />
            <MobileNav href="/verify/verification" title="VERIFICATION" />
            <MobileNav href="/contact" title="CONTACT" />

            <div className="border-t pt-5 flex flex-col gap-4">

              <Link
                href="/login/institute"
                className="
                  w-full
                  border
                  border-[#5865F2]
                  text-[#5865F2]
                  text-center
                  py-3
                  font-semibold
                "
              >
                Login
              </Link>

              <Link href="/student/login">
                <button
                  className="
                    w-full
                    bg-[#5865F2]
                    text-white
                    py-3
                    font-semibold
                  "
                >
                  Student Login
                </button>
              </Link>

            </div>

          </div>
        )}

      </div>
    </header>
  )
}

/* ================= NAV ITEM ================= */
function NavItem({ title, href }) {
  return (
    <Link
      href={href}
      className="
        text-[#0A1551]
        font-bold
        text-[15px]
        tracking-wide
        hover:text-[#5865F2]
        transition-all
        duration-300
      "
    >
      {title}
    </Link>
  )
}

/* ================= DROPDOWN STYLE ITEM ================= */
function NavDropdown({ title, href }) {
  return (
    <Link
      href={href}
      className="
        flex
        items-center
        gap-1
        text-[#0A1551]
        font-bold
        text-[15px]
        tracking-wide
        hover:text-[#5865F2]
        transition-all
        duration-300
      "
    >
      {title}
      <ChevronDown size={16} strokeWidth={2.5} />
    </Link>
  )
}

/* ================= MOBILE NAV ================= */
function MobileNav({ title, href }) {
  return (
    <Link
      href={href}
      className="
        text-[#0A1551]
        font-semibold
        text-[16px]
        border-b
        border-gray-100
        pb-3
      "
    >
      {title}
    </Link>
  )
}