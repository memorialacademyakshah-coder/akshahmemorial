'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const COLLECTION_ID = 'services'

export default function ServicesSection() {
  const [services, setServices] = useState([])
const [isPaused, setIsPaused] = useState(false)
  /* ---------------- FETCH SERVICES ---------------- */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!databases || !DATABASE_ID) return

        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.orderAsc('order'),
            Query.limit(100)
          ]
        )

        setServices(res.documents)
      } catch (error) {
        console.error('Services load failed:', error)
      }
    }

    fetchServices()
  }, [])

  /* ---------------- EMPTY ---------------- */
  if (services.length === 0) {
    return (
      <section className="w-full bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-28 overflow-hidden">
        <div className="text-center text-gray-400">
          Loading services...
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center text-white">

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Professional &{' '}
          <span className="text-[#19b9f1]">
            Trust-Focused
          </span>
        </h2>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
          OUR <span className="text-[#19b9f1]">TOP INSTITUTE</span>
        </h2>

        {/* SLIDER */}
        <div className="relative mt-20 overflow-hidden">

          {/* LEFT FADE */}
          <div className="absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-[#0f0f0f] to-transparent" />

          {/* RIGHT FADE */}
          <div className="absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-[#0f0f0f] to-transparent" />

       <div className="group overflow-hidden">
  <motion.div
  initial={{ x: 0 }}
  animate={{
    x: isPaused ? 0 : '-50%',
  }}
  transition={{
    repeat: Infinity,
    duration: 60,
    ease: 'linear',
  }}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  className="flex min-w-max gap-8"
>
            {[...services, ...services].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="
                  min-w-[300px]
                  sm:min-w-[340px]
                  lg:min-w-[360px]
                "
              >
                <ServiceCard
                  title={item.title}
                  imageUrl={item.imageUrl}
                  text={item.description}
                  state={item.state}
                />
              </motion.div>
            ))}
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================= SERVICE CARD ================= */

function ServiceCard({
  title,
  text,
  imageUrl,
  state,
}) {
  return (
    <div
      className="
      group
      relative
      rounded-3xl
      overflow-hidden
      bg-white/5
      backdrop-blur-xl
      p-8
      text-center
      border
      border-white/10
      transition-all
      duration-500
      hover:-translate-y-3
      hover:shadow-[0_10px_40px_rgba(25,185,241,0.25)]
      min-h-[380px]
    "
    >
      {/* Glow */}
      <div
        className="
        absolute
        inset-0
        opacity-0
        group-hover:opacity-100
        transition
        duration-500
        bg-gradient-to-br
        from-[#19b9f1]/20
        to-transparent
        blur-xl
      "
      />

      <div className="relative z-10 flex flex-col items-center">

        {/* IMAGE */}
        <div className="mb-6">
          <div
            className="
            w-44
            h-44
            rounded-full
            overflow-hidden
            border
            border-white/20
            shadow-lg
          "
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-110
                "
              />
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="font-bold text-2xl tracking-wide">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p
          className="
          mt-4
          text-gray-400
          text-sm
          leading-relaxed
          group-hover:text-gray-300
          transition
        "
        >
          {text}
        </p>

        {/* STATE */}
        {state && (
          <span
            className="
            mt-5
            px-4
            py-1
            text-xs
            rounded-full
            bg-[#19b9f1]/20
            text-[#19b9f1]
            border
            border-[#19b9f1]/30
          "
          >
            📍 {state}
          </span>
        )}
      </div>
    </div>
  )
}