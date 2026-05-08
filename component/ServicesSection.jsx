'use client'

import { useEffect, useState, useRef } from 'react'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const COLLECTION_ID = 'services'

export default function ServicesSection() {
  const [services, setServices] = useState([])
  const [index, setIndex] = useState(0)
  const sliderRef = useRef(null)

  const itemsPerView = 4

  /* ---------------- FETCH SERVICES ---------------- */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!databases || !DATABASE_ID) return

        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc('order'),
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

  /* ---------------- DUPLICATE FOR INFINITE LOOP ---------------- */
  const extendedServices = [...services, ...services]

  /* ---------------- AUTO SLIDE ---------------- */
  useEffect(() => {
    if (services.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => prev + 1)
    }, 3000)

    return () => clearInterval(interval)
  }, [services])

  /* ---------------- RESET LOOP (SEAMLESS) ---------------- */
  useEffect(() => {
    if (index >= services.length) {
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'none'
        }
        setIndex(0)

        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition =
              'transform 0.5s ease-in-out'
          }
        }, 50)
      }, 500)
    }
  }, [index, services.length])

  return (
    <section className="w-full bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center text-white">

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Professional &{' '}
          <span className="text-[#19b9f1]">Trust-Focused</span>
        </h2>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          OUR <span className="text-[#19b9f1]">TOP INSTITUTE</span>
        </h2>

        {/* EMPTY STATE */}
        {services.length === 0 && (
          <p className="mt-10 text-gray-500">
            No services available
          </p>
        )}

        {/* SLIDER */}
        {services.length > 0 && (
          <div className="relative mt-20 overflow-hidden">

            <div
              ref={sliderRef}
              className="flex gap-8"
              style={{
                transform: `translateX(-${
                  index * (100 / itemsPerView)
                }%)`,
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              {extendedServices.map((item, i) => (
                <div
                  key={i}
                  className="min-w-[100%] sm:min-w-[50%] lg:min-w-[25%]"
                >
                  <ServiceCard
                    title={item.title}
                    imageUrl={item.imageUrl}
                    text={item.description}
                    state={item.state}
                  />
                </div>
              ))}
            </div>

            {/* ARROWS */}
            <button
              onClick={() => setIndex((prev) => prev - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 
              w-12 h-12 rounded-full bg-white/10 backdrop-blur-md 
              border border-white/20 hover:bg-[#19b9f1] transition"
            >
              ‹
            </button>

            <button
              onClick={() => setIndex((prev) => prev + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 
              w-12 h-12 rounded-full bg-white/10 backdrop-blur-md 
              border border-white/20 hover:bg-[#19b9f1] transition"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ================= SERVICE CARD ================= */

function ServiceCard({ title, text, imageUrl, state }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden
      bg-white/5 backdrop-blur-xl
      p-8 text-center border border-white/10
      transition-all duration-500
      hover:-translate-y-3 hover:shadow-[0_10px_40px_rgba(25,185,241,0.25)]
      min-h-[360px]"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 
        transition duration-500 bg-gradient-to-br from-[#19b9f1]/20 to-transparent blur-xl"
      />

      <div className="relative z-10 flex flex-col items-center">

        {/* PERFECT CIRCLE IMAGE */}
        <div className="mb-5">
          <div className="w-40 h-40 rounded-full overflow-hidden border border-white/20">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="font-semibold text-xl tracking-wide">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition">
          {text}
        </p>

        {/* STATE */}
        {state && (
          <span
            className="mt-3 px-3 py-1 text-xs rounded-full 
            bg-[#19b9f1]/20 text-[#19b9f1] border border-[#19b9f1]/30"
          >
            📍 {state}
          </span>
        )}
      </div>
    </div>
  )
}