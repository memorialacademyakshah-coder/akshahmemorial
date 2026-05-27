'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const COLLECTION_ID = 'services'

export default function ServicesSection() {
  const [services, setServices] = useState([])
  const [isPaused, setIsPaused] =
    useState(false)

  /* ---------------- FETCH SERVICES ---------------- */

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!databases || !DATABASE_ID)
          return

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
              Query.orderAsc('order'),
              Query.limit(100),
            ]
          )

        setServices(res.documents)
      } catch (error) {
        console.error(
          'Services load failed:',
          error
        )
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
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-28">

      {/* BG GLOW */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,185,241,0.12),transparent_65%)]" />

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">

        {/* HEADING */}

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Professional &{' '}
          <span className="text-[#19b9f1]">
            Trust-Focused
          </span>
        </h2>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
          OUR{' '}
          <span className="text-[#19b9f1]">
            TOP INSTITUTE
          </span>
        </h2>

        {/* SLIDER */}

        <div className="relative mt-20 overflow-hidden">

          {/* LEFT FADE */}

          <div className="absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-[#0f0f0f] to-transparent pointer-events-none" />

          {/* RIGHT FADE */}

          <div className="absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-[#0f0f0f] to-transparent pointer-events-none" />

          {/* CONTINUOUS SLIDER */}

          <div
            className="overflow-hidden"
            onMouseEnter={() =>
              setIsPaused(true)
            }
            onMouseLeave={() =>
              setIsPaused(false)
            }
          >

            <motion.div
              animate={{
                x: isPaused
                  ? undefined
                  : ['0%', '-50%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 40,
                ease: 'linear',
              }}
              className="
                flex
                min-w-max
                items-center
                gap-8
                pr-8
              "
            >

              {[...services, ...services].map(
                (item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{
                      y: -10,
                      scale: 1.03,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 16,
                    }}
                    className="
                      min-w-[300px]
                      sm:min-w-[340px]
                      lg:min-w-[360px]
                      flex-shrink-0
                    "
                  >
                    <ServiceCard
                      title={item.title}
                      imageUrl={
                        item.imageUrl
                      }
                      text={
                        item.description
                      }
                      state={item.state}
                    />
                  </motion.div>
                )
              )}

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
      overflow-hidden
      rounded-[32px]
      border
      border-white/10
      bg-black/40
      backdrop-blur-2xl
      p-8
      text-center
      transition-all
      duration-500
      shadow-[0_10px_60px_rgba(0,0,0,0.45)]
      min-h-[420px]
    "
    >

      {/* GLOW */}

      <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">

        {/* IMAGE */}

        <div className="mb-6">

          <div
            className="
            w-44
            h-44
            rounded-[28px]
            overflow-hidden
            border
            border-white/10
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
                  rounded-[28px]
                  transition-transform
                  duration-500
                  group-hover:scale-105
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
          transition
          group-hover:text-gray-300
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