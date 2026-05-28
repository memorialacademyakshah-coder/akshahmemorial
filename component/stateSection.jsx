'use client'

import CounterGSAP from '../component/CounterGSAP'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BookOpen,
  GraduationCap,
  Users,
  Star,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function StatsSection() {

  const sectionRef = useRef(null)

  useEffect(() => {

    gsap.fromTo(
      sectionRef.current.children,
      {
        opacity: 0,
        y: 80,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reset',
        },
      }
    )

  }, [])

  const stats = [
    {
      number: 7687,
      title: 'Total Institute',
      icon: <BookOpen size={28} />,
      bg: 'bg-[#fff1ee]',
      iconColor: 'text-[#ff6b57]',
    },
    {
      number: 1235,
      title: 'Total Course',
      icon: <GraduationCap size={28} />,
      bg: 'bg-[#f0efff]',
      iconColor: 'text-[#6c63ff]',
    },
    {
      number: 151053,
      title: 'Total Student',
      icon: <Users size={28} />,
      bg: 'bg-[#f8efff]',
      iconColor: 'text-[#b04dff]',
    },
    {
      number: 19728,
      title: 'Reviews',
      icon: <Star size={28} />,
      bg: 'bg-[#eefaff]',
      iconColor: 'text-[#39b5ff]',
    },
  ]

  return (
    <section
      className="
        relative
        z-20
        w-full
        -mt-20
        px-4
        md:px-10
      "
    >

      <div
        ref={sectionRef}
        className="
          max-w-7xl
          mx-auto
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-7
        "
      >

        {stats.map((item, index) => (

          <div
            key={index}
            className="
              bg-white/90
              backdrop-blur-xl
              border
              border-[#ececec]
              rounded-[30px]
              px-8
              py-8
              shadow-[0_10px_40px_rgba(0,0,0,0.05)]
              hover:-translate-y-2
              transition-all
              duration-500
              group
            "
          >

            <div className="flex items-start gap-5">

              {/* ICON */}
              <div
                className={`
                  w-16
                  h-16
                  rounded-full
                  flex
                  items-center
                  justify-center
                  ${item.bg}
                  ${item.iconColor}
                  group-hover:scale-110
                  transition-all
                  duration-300
                `}
              >
                {item.icon}
              </div>

              {/* CONTENT */}
              <div>

                <h2
                  className="
                    text-5xl
                    font-black
                    text-[#08104d]
                    leading-none
                  "
                >
                  <CounterGSAP end={item.number} />
                </h2>

                <p
                  className="
                    mt-3
                    text-[#374151]
                    text-lg
                    font-medium
                  "
                >
                  {item.title}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  )
}