'use client'

import { useEffect, useRef, useState } from 'react'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons'

import {
  GraduationCap,
  MapPinned,
  Phone,
  Mail,
} from 'lucide-react'

import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const COLLECTION_ID = 'website'

export default function Footer() {

  const footerRef = useRef(null)

  const [data, setData] = useState(null)

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchData = async () => {

      try {

        if (!databases || !DATABASE_ID)
          return

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.limit(1)]
          )

        if (res.documents.length) {

          setData(res.documents[0])

        }

      } catch (error) {

        console.error(
          'Footer fetch failed:',
          error
        )

      }
    }

    fetchData()

  }, [])

  /* ================= GSAP ================= */

  useEffect(() => {

    if (!footerRef.current) return

    gsap.fromTo(
      footerRef.current.querySelectorAll(
        '.footer-anim'
      ),
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
        },
      }
    )

  }, [data])

  if (!data) return null

  return (
    <footer
      ref={footerRef}
      className="
        relative
        overflow-hidden
        bg-[#f3f3fb]
        text-[#08104d]
      "
    >

      {/* BG GLOW */}

      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[700px]
          bg-[#fff0c7]
          opacity-30
          blur-[160px]
          rounded-full
        "
      />

      {/* ================= MAIN ================= */}

      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-6
          md:px-10
          py-24
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-5
          gap-14
        "
      >

        {/* ================= LOGO ================= */}

        <div className="footer-anim">

          {/* LOGO */}
          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-[#5865F2]
                flex
                items-center
                justify-center
              "
            >
              <GraduationCap
                className="text-white"
                size={28}
              />
            </div>

            <div>

              <h2
                className="
                  text-4xl
                  font-black
                  text-[#08104d]
                "
              >
                BNMI
              </h2>

              <p
                className="
                  text-[#5865F2]
                  font-semibold
                  text-sm
                "
              >
                Franchise Provider
              </p>

            </div>

          </div>

          {/* ABOUT */}
          <p
            className="
              mt-8
              text-[#5b5f97]
              leading-9
              text-[16px]
            "
          >
            {data.footerAboutText}
          </p>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-8">

            {[
              faFacebookF,
              faInstagram,
              faYoutube,
              faLinkedinIn,
            ].map((icon, i) => (

              <a
                key={i}
                href="#"
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-white
                  border
                  border-[#ececec]
                  flex
                  items-center
                  justify-center
                  text-[#08104d]
                  hover:bg-[#5865F2]
                  hover:text-white
                  transition-all
                  duration-300
                  shadow-sm
                "
              >

                <FontAwesomeIcon icon={icon} />

              </a>

            ))}

          </div>

        </div>

        {/* ================= ABOUT ================= */}

        <div className="footer-anim">

          <h3
            className="
              text-2xl
              font-black
              mb-8
            "
          >
            About BNMI
          </h3>

          <ul
            className="
              space-y-5
              text-[#5b5f97]
              font-medium
            "
          >

            <li className="hover:text-[#5865F2] transition cursor-pointer">
              About Us
            </li>

            <li className="hover:text-[#5865F2] transition cursor-pointer">
              Franchise Registration
            </li>

            <li className="hover:text-[#5865F2] transition cursor-pointer">
              Become A Teacher
            </li>

            <li className="hover:text-[#5865F2] transition cursor-pointer">
              All Institutes
            </li>

            <li className="hover:text-[#5865F2] transition cursor-pointer">
              Contact Us
            </li>

          </ul>

        </div>

        {/* ================= COURSES ================= */}

        <div className="footer-anim">

          <h3
            className="
              text-2xl
              font-black
              mb-8
            "
          >
            Popular Courses
          </h3>

          <ul
            className="
              space-y-5
              text-[#5b5f97]
              font-medium
            "
          >

            <li>Development</li>
            <li>Arts & Design</li>
            <li>Visual Design</li>
            <li>Graphic Design</li>
            <li>Digital Marketing</li>

          </ul>

        </div>

        {/* ================= CONTACT ================= */}

        <div className="footer-anim">

          <h3
            className="
              text-2xl
              font-black
              mb-8
            "
          >
            Contact Info
          </h3>

          <div className="space-y-8">

            {/* ADDRESS */}
            <div className="flex gap-4">

              <MapPinned
                className="
                  text-[#5865F2]
                  shrink-0
                  mt-1
                "
              />

              <p
                className="
                  text-[#5b5f97]
                  leading-8
                "
              >
                {data.footerAddress}
              </p>

            </div>

            {/* PHONE */}
            <div className="flex gap-4">

              <Phone
                className="
                  text-[#5865F2]
                  shrink-0
                  mt-1
                "
              />

              <p
                className="
                  text-[#5b5f97]
                "
              >
                {data.footerPhone}
              </p>

            </div>

            {/* EMAIL */}
            <div className="flex gap-4">

              <Mail
                className="
                  text-[#5865F2]
                  shrink-0
                  mt-1
                "
              />

              <p
                className="
                  text-[#5b5f97]
                "
              >
                {data.footerEmail}
              </p>

            </div>

          </div>

        </div>

        {/* ================= APP / BUTTON ================= */}

        <div className="footer-anim">

          <h3
            className="
              text-2xl
              font-black
              mb-8
            "
          >
            Verification
          </h3>

          <p
            className="
              text-[#5b5f97]
              leading-9
            "
          >
            Verify student certificates and
            institute records directly from
            our portal.
          </p>

          {/* BUTTON */}
          <Link href="/verify/verification">

            <button
              className="
                mt-8
                w-full
                bg-[#5865F2]
                hover:bg-[#4452eb]
                text-white
                py-5
                rounded-2xl
                font-bold
                transition-all
                duration-300
                shadow-[0_10px_30px_rgba(88,101,242,0.25)]
              "
            >
              STUDENT VERIFICATION
            </button>

          </Link>

        </div>

      </div>

      {/* ================= COPYRIGHT ================= */}

      <div
        className="
          relative
          z-10
          border-t
          border-[#e5e7eb]
          py-7
          text-center
          text-[#5b5f97]
          text-sm
        "
      >
        © Copyright 2026 BNMI. All Rights Reserved.
      </div>

    </footer>
  )
}