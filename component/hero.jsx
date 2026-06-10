"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Search, MoveRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";

export default function HeroSection() {

  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);

  const [current, setCurrent] = useState(0);

  /* ================= FETCH CMS ================= */

  useEffect(() => {

    const fetchData = async () => {
      try {

        const res = await databases.listDocuments(
          DB,
          COLLECTION,
          [Query.orderAsc("$createdAt")]
        );

        /* HERO IMAGES */
        const heroImages = res.documents.filter(
          (d) => d.type === "hero"
        );

        /* SETTINGS */
        const heroSettings = res.documents.find(
          (d) => d.type === "hero_settings"
        );

        setSlides(heroImages);
        setSettings(heroSettings);

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();

  }, []);

  /* ================= AUTO SLIDER ================= */

  useEffect(() => {

    if (
      settings?.heroType !== "slider" ||
      slides.length <= 1
    )
      return;

    const interval = setInterval(() => {

      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );

    }, 4000);

    return () => clearInterval(interval);

  }, [slides, settings]);

  const activeSlide = slides[current];

  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#f8f8ff]
        flex
        items-center
      "
    >

      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0 z-0">

        <AnimatePresence mode="wait">

          {activeSlide?.image && (

            <motion.img
              key={activeSlide.image}
              src={activeSlide.image}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />

          )}

        </AnimatePresence>

        {/* OVERLAY */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#fff5eb]/95
            via-[#f9f9f9]/90
            to-[#eef2ff]/85
          "
        />

      </div>

      {/* ================= CONTENT ================= */}

      <div
        className="
          relative
          z-10
          max-w-[1600px]
          mx-auto
          w-full
          grid
          lg:grid-cols-2
          gap-10
          items-center
          px-6
          md:px-16
          pt-32
        "
      >

        {/* ================= LEFT ================= */}

        <div>

          {/* SMALL DOT */}
          <div className="w-5 h-5 rounded-full bg-[#ff6b6b] mb-10" />

          {/* TITLE */}
          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              leading-[1.1]
              text-[#0b0b45]
              max-w-3xl
            "
          >

            <span className="text-[#5865F2]">
              {activeSlide?.blueText || "Smart Study"}
            </span>

            <br />

            {activeSlide?.title ||
              "Where Knowledge Meets the Web"}

          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-8
              text-[#4b5563]
              text-lg
              leading-9
              max-w-xl
            "
          >
            {activeSlide?.description ||
              "Lorem ipsum dolor sit amet consectetur adipisicing elit consectetur adipiscing elit tempor ut labore"}
          </p>

          {/* SEARCH BOX */}
          <div
            className="
              mt-10
              bg-white
              border
              border-gray-200
              flex
              items-center
              overflow-hidden
              max-w-[650px]
              shadow-sm
            "
          >

            <input
              type="text"
              placeholder="Search Your Course Here"
              className="
                flex-1
                px-7
                py-6
                outline-none
                text-[#0b0b45]
              "
            />

            <button
              className="
                bg-[#5865F2]
                hover:bg-[#4452eb]
                text-white
                px-10
                py-6
                font-semibold
                flex
                items-center
                gap-2
                transition-all
                duration-300
              "
            >
              Search
              <MoveRight size={20} />
            </button>

          </div>

        </div>

        {/* ================= RIGHT IMAGE ================= */}

        <div
          className="
            relative
            flex
            justify-center
            lg:justify-end
          "
        >

          {activeSlide?.studentImage && (

            <motion.img
              key={activeSlide.studentImage}
              src={activeSlide.studentImage}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="
                relative
                z-10
                w-full
                max-w-[500px]
                object-contain
              "
            />

          )}

          {/* ACTIVE STUDENTS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              absolute
              bottom-20
              right-0
              bg-white
              shadow-2xl
              rounded-xl
              px-8
              py-5
              flex
              items-center
              gap-5
              z-20
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#eef2ff]
                flex
                items-center
                justify-center
              "
            >
              <Search className="text-[#5865F2]" />
            </div>

            <div>
              <h3 className="text-4xl font-bold text-[#0b0b45]">
                4500+
              </h3>

              <p className="text-gray-500">
                Active student
              </p>
            </div>

          </motion.div>

        </div>

      </div>

      {/* ================= SLIDER DOTS ================= */}

      {settings?.heroType === "slider" &&
        slides.length > 1 && (

          <div
            className="
              absolute
              bottom-10
              left-1/2
              -translate-x-1/2
              flex
              gap-3
              z-20
            "
          >

            {slides.map((_, index) => (

              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`
                  w-4
                  h-4
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    current === index
                      ? "bg-[#5865F2] w-10"
                      : "bg-gray-300"
                  }
                `}
              />

            ))}

          </div>

        )}

    </section>
  );
}