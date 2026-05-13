'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import TestimonialCard from '../component/TestimonialCard'

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const COLLECTION_ID = 'testimonials'

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [currentX, setCurrentX] = useState(0)

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        if (!databases || !DATABASE_ID) return

        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc('order')]
        )

        setTestimonials(res?.documents || [])
      } catch (err) {
        console.error(
          'Testimonials load failed:',
          err
        )

        setTestimonials([])
      }
    }

    fetchTestimonials()
  }, [])

  /* ================= AUTO MOVE ================= */
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentX((prev) => prev - 3)
    }, 10)

    return () => clearInterval(interval)
  }, [isPaused])

  /* ================= EMPTY ================= */
  if (
    !Array.isArray(testimonials) ||
    testimonials.length === 0
  ) {
    return null
  }

  return (
    <section
      className="
        py-24
        bg-gradient-to-b
        from-white
        to-gray-50
        relative
        overflow-hidden
      "
    >

      {/* HEADING */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold">
          What Says Our <br />

          <span className="text-[#19b9f1]">
            Student
          </span>{' '}
          Response
        </h2>
      </div>

      {/* LEFT BUTTON */}
      <button
        onClick={() =>
          setCurrentX((prev) => prev + 350)
        }
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          z-30
          w-12
          h-12
          rounded-full
          bg-white
          shadow-xl
          text-2xl
          hover:bg-[#19b9f1]
          hover:text-white
          transition-all
          duration-300
        "
      >
        ‹
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={() =>
          setCurrentX((prev) => prev - 350)
        }
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          z-30
          w-12
          h-12
          rounded-full
          bg-white
          shadow-xl
          text-2xl
          hover:bg-[#19b9f1]
          hover:text-white
          transition-all
          duration-300
        "
      >
        ›
      </button>

      {/* SLIDER */}
      <div className="relative overflow-hidden px-10">

        {/* LEFT FADE */}
        <div className="absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-white to-transparent" />

        {/* RIGHT FADE */}
        <div className="absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-white to-transparent" />

        <motion.div
          animate={{ x: currentX }}
          transition={{
            ease: 'linear',
            duration: 0,
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-6 min-w-max"
        >
          {[...testimonials, ...testimonials].map(
            (t, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <TestimonialCard
                  name={t.name}
                  role={t.role}
                  image={t.imageUrl}
                  text={t.text}
                />
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}