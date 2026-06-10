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
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">

{/* TOP LOGO BAR */}
<div className="border-b border-gray-200 bg-[#f8f8f8]">

  <div className="max-w-[1800px] mx-auto px-6 py-4">

    <div className="flex items-center justify-center gap-8">

      {/* LEFT LOGO */}

      {navbarData?.logoUrl ? (
        <img
          src={navbarData.logoUrl}
          alt="logo"
          className="h-24 w-auto object-contain"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-[#5865F2] flex items-center justify-center">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
      )}

      {/* CENTER NAME */}

      <div className="text-center">

        <h1
          className="
            text-3xl
            md:text-4xl
            lg:text-5xl
            font-extrabold
            text-[#0A1551]
            uppercase
            tracking-wide
          "
        >
          {navbarData?.topBarText || 'BNMI INDIA'}
        </h1>

      </div>

      {/* RIGHT LOGO */}

      {navbarData?.logoUrl ? (
        <img
          src={navbarData.logoUrl}
          alt="logo"
          className="h-24 w-auto object-contain"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-[#5865F2] flex items-center justify-center">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
      )}

    </div>

  </div>

</div>

  {/* MENU BAR */}
  <div className="bg-white">
    <div className="max-w-[1800px] mx-auto px-8">

      <div className="flex items-center justify-between h-[72px]">

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-10">

          <NavItem title="HOME" href="/" />
          <NavItem title="ABOUT" href="/aboutus" />

          <NavItem title="COURSE" href="/#courses" />

          <NavItem
            title="CERTIFICATION"
            href="/certificate-demo"
          />

          <NavItem
            title="VERIFICATION"
            href="/verify/verification"
          />

          <NavItem title="CONTACT" href="/contact" />

        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-6">

          <Link
            href="/login/institute"
            className="
              flex
              items-center
              text-gray-700
              font-medium
              hover:text-[#5865F2]
            "
          >
            Login
          </Link>

          <Link href="/student/login">
            <button
              className="
                border-2
                border-[#5865F2]
                text-[#5865F2]
                px-7
                py-2.5
                rounded-full
                font-semibold
                hover:bg-[#5865F2]
                hover:text-white
                transition
              "
            >
              Student Login
            </button>
          </Link>

        </div>

        {/* MOBILE MENU */}
        <button
          className="lg:hidden text-[#0A1551]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

      </div>

    </div>
  </div>

  {/* MOBILE MENU */}
  {menuOpen && (
    <div className="lg:hidden bg-white border-t shadow-xl">
      <div className="p-6 flex flex-col gap-5">

        <MobileNav href="/" title="HOME" />
        <MobileNav href="/aboutus" title="ABOUT" />
        <MobileNav href="/#courses" title="COURSE" />
        <MobileNav href="/certificate-demo" title="CERTIFICATION" />
        <MobileNav href="/verify/verification" title="VERIFICATION" />
        <MobileNav href="/contact" title="CONTACT" />

        <div className="pt-4 border-t flex flex-col gap-3">

          <Link
            href="/login/institute"
            className="
              border
              border-gray-300
              text-center
              py-3
              rounded-lg
              font-medium
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
                rounded-lg
                font-semibold
              "
            >
              Student Login 
            </button>
          </Link>

        </div>

      </div>
    </div>
  )}

</header>
  )
}

/* ================= NAV ITEM ================= */
function NavItem({ title, href }) {
  return (
    <Link
      href={href}
      className="
        text-[15px]
        font-medium
        text-gray-700
        hover:text-[#5865F2]
        transition-all
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