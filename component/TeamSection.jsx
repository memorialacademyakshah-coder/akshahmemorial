"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLLECTION_ID = "team";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function TeamSlider() {

  const [team, setTeam] = useState([]);

  const [isPaused, setIsPaused] =
    useState(false);

  /* ================= FETCH TEAM ================= */

  useEffect(() => {

    const fetchTeam = async () => {

      try {

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.orderAsc("order")]
          );

        setTeam(res.documents || []);

      } catch (err) {

        console.error(err);

      }
    };

    fetchTeam();

  }, []);

  /* ================= IMAGE URL ================= */

  const getImageUrl = (image) => {

    if (!image) return "/placeholder.png";

    try {

      if (
        typeof image === "string" &&
        image.startsWith("http")
      ) {
        return image;
      }

      if (typeof image === "string") {

        return storage.getFileView(
          BUCKET_ID,
          image
        ).href;

      }

      if (typeof image === "object") {

        const id =
          image.$id ||
          image.fileId ||
          image.id;

        if (id) {

          return storage.getFileView(
            BUCKET_ID,
            id
          ).href;

        }
      }

      return "/placeholder.png";

    } catch {

      return "/placeholder.png";

    }
  };

  /* ================= LOADING ================= */

  if (!team.length) {

    return (
      <section className="py-16 text-center bg-[#f8f7ff] text-[#08104d]">
        Loading team...
      </section>
    );
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        py-24
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
          w-[700px]
          h-[700px]
          bg-[#fff0c7]
          opacity-40
          blur-[150px]
          rounded-full
        "
      />

      {/* CONTENT */}

      <div className="relative z-10 max-w-7xl mx-auto px-4">

        {/* HEADING */}

        <div className="text-center mb-16">

          <h2
            className="
              text-4xl
              md:text-6xl
              font-black
              text-[#08104d]
            "
          >
            Our{" "}
            <span className="text-[#5865F2]">
              Team
            </span>
          </h2>

          <p
            className="
              text-[#5b5f97]
              mt-5
              max-w-2xl
              mx-auto
              text-lg
              leading-8
            "
          >
            Meet the creative minds and skilled
            professionals powering our vision
            forward.
          </p>

        </div>

        {/* LEFT FADE */}

        <div
          className="
            absolute
            left-0
            top-0
            z-20
            h-full
            w-32
            bg-gradient-to-r
            from-[#fff4e9]
            to-transparent
            pointer-events-none
          "
        />

        {/* RIGHT FADE */}

        <div
          className="
            absolute
            right-0
            top-0
            z-20
            h-full
            w-32
            bg-gradient-to-l
            from-[#eef0ff]
            to-transparent
            pointer-events-none
          "
        />

        {/* ================= SLIDER ================= */}

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
                : ["0%", "-50%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 35,
              ease: "linear",
            }}
            className="
              flex
              min-w-max
              items-center
              gap-8
              pr-8
            "
          >

            {[...team, ...team].map(
              (member, index) => (

                <motion.div
                  key={index}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 16,
                  }}
                  className="
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-[#ececec]
                    bg-white/90
                    backdrop-blur-xl
                    shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                    w-[320px]
                    flex-shrink-0
                  "
                >

                  {/* SOFT GLOW */}

                  <div
                    className="
                      absolute
                      inset-0
                      opacity-0
                      hover:opacity-100
                      transition
                      duration-700
                    "
                  >
                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#5865F2]/10
                        via-[#8b5cf6]/5
                        to-[#5865F2]/10
                        blur-3xl
                      "
                    />
                  </div>

                  {/* IMAGE */}

                  <div className="relative overflow-hidden p-3">

                    <img
                      src={getImageUrl(
                        member.imageUrl
                      )}
                      alt={member.name}
                      draggable={false}
                      className="
                        w-full
                        h-[260px]
                        md:h-[320px]
                        object-cover
                        rounded-[26px]
                        transition-transform
                        duration-500
                        hover:scale-105
                      "
                    />

                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      p-6
                      text-center
                      relative
                      z-10
                    "
                  >

                    <h4
                      className="
                        font-black
                        text-2xl
                        text-[#08104d]
                      "
                    >
                      {member.name}
                    </h4>

                    <p
                      className="
                        text-[#5865F2]
                        text-sm
                        mt-2
                        font-semibold
                      "
                    >
                      {member.role}
                    </p>

                    <p
                      className="
                        text-[#6b7280]
                        text-sm
                        mt-4
                        leading-7
                      "
                    >
                      {member.experience}
                    </p>

                  </div>

                </motion.div>

              )
            )}

          </motion.div>

        </div>

      </div>

    </section>
  );
}