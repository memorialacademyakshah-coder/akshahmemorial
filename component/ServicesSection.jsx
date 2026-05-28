'use client'

import { useEffect, useState } from 'react'
import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { motion } from 'framer-motion'

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const COLLECTION_ID = 'services'

export default function ServicesSection() {

  const [services, setServices] = useState([])

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchServices = async () => {

      try {

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

        console.error(error)

      }
    }

    fetchServices()

  }, [])

  return (
    <section
      className="
        relative
        overflow-hidden
        py-28
        px-6
        bg-gradient-to-r
        from-[#fff4e9]
        via-[#f9f7ec]
        to-[#eef0ff]
      "
    >

      {/* BG GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[600px]
          h-[600px]
          bg-[#fff1c7]
          opacity-40
          blur-[140px]
          rounded-full
        "
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADING */}
        <div className="text-center">

          <h2
            className="
              text-4xl
              md:text-6xl
              font-black
              text-[#08104d]
              leading-tight
            "
          >
            Find out by popular Categories
          </h2>

          <p
            className="
              mt-6
              text-[#4b5563]
              max-w-4xl
              mx-auto
              text-lg
              leading-9
            "
          >
            We offer a brand new approach to the most
            basic learning paradigms. Choose from a
            wide range of learning options and gain
            new skills.
          </p>

        </div>

        {/* CATEGORY PILLS */}
        <div
          className="
            mt-20
            flex
            flex-wrap
            justify-center
            gap-6
          "
        >

          {services.map((item, index) => (

            <motion.div
              key={item.$id}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              className="
                bg-white
                border
                border-[#e9e9e9]
                rounded-full
                px-6
                py-4
                flex
                items-center
                gap-4
                shadow-[0_8px_30px_rgba(0,0,0,0.05)]
                hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]
                transition-all
                duration-300
                cursor-pointer
              "
            >

              {/* ICON */}
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  overflow-hidden
                  bg-[#f5f5ff]
                  border
                  border-[#ececff]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                {item.imageUrl && (

                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="
                      w-10
                      h-10
                      object-cover
                      rounded-full
                    "
                  />

                )}

              </div>

              {/* TITLE */}
              <div>

                <h3
                  className="
                    text-[#5b5f97]
                    font-semibold
                    text-lg
                    whitespace-nowrap
                  "
                >
                  {item.title}
                </h3>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  )
}