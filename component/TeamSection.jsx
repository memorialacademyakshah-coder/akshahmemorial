"use client";

import { useEffect, useRef, useState } from "react";
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

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [itemsPerView, setItemsPerView] =
    useState(3);

  const startX = useRef(0);
  const isDragging = useRef(false);

  /* ================= RESPONSIVE ================= */

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateView();

    window.addEventListener(
      "resize",
      updateView
    );

    return () =>
      window.removeEventListener(
        "resize",
        updateView
      );
  }, []);

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

  /* ================= AUTO SLIDE ================= */

  useEffect(() => {
    if (isPaused || team.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === team.length - 1
          ? 0
          : prev + 1
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, team]);

  /* ================= IMAGE ================= */

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

  /* ================= WIDTH ================= */

  const slideWidth =
    itemsPerView === 1
      ? 100
      : itemsPerView === 2
      ? 50
      : 33.333;

  /* ================= UI ================= */

  if (!team.length) {
    return (
      <section className="py-16 text-center text-white bg-[#1e1e1e]">
        Loading team...
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#1e1e1e] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">

        <h2 className="text-3xl font-bold mb-10">
          Our{" "}
          <span className="text-cyan-400">
            Team
          </span>
        </h2>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() =>
            setIsPaused(true)
          }
          onMouseLeave={() =>
            setIsPaused(false)
          }
          onTouchStart={(e) => {
            startX.current =
              e.touches[0].clientX;
            isDragging.current = true;
          }}
          onTouchEnd={(e) => {
            if (!isDragging.current)
              return;

            const endX =
              e.changedTouches[0].clientX;

            const diff =
              startX.current - endX;

            if (diff > 50) {
              setCurrentIndex((prev) =>
                prev === team.length - 1
                  ? 0
                  : prev + 1
              );
            }

            if (diff < -50) {
              setCurrentIndex((prev) =>
                prev === 0
                  ? team.length - 1
                  : prev - 1
              );
            }

            isDragging.current = false;
          }}
        >

          {/* LEFT BUTTON */}

          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === 0
                  ? team.length - 1
                  : prev - 1
              )
            }
            className="
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              z-30
              w-10
              h-10
              md:w-12
              md:h-12
              rounded-full
              bg-black/60
              border
              border-white/20
              text-white
              text-xl
              hover:bg-cyan-500
              transition
            "
          >
            ←
          </button>

          {/* RIGHT BUTTON */}

          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === team.length - 1
                  ? 0
                  : prev + 1
              )
            }
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              z-30
              w-10
              h-10
              md:w-12
              md:h-12
              rounded-full
              bg-black/60
              border
              border-white/20
              text-white
              text-xl
              hover:bg-cyan-500
              transition
            "
          >
            →
          </button>

          {/* SLIDER */}

          <motion.div
            animate={{
              x: `-${currentIndex * slideWidth}%`,
            }}
            transition={{
              duration: 0.7,
              ease: "easeInOut",
            }}
            className="flex"
          >
            {team.map((member, index) => (
              <div
                key={index}
                style={{
                  minWidth: `${slideWidth}%`,
                }}
                className="p-3"
              >
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.03,
                  }}
                  className="
                    bg-black
                    rounded-2xl
                    overflow-hidden
                    border
                    border-white/10
                    shadow-lg
                  "
                >

                  <div className="relative overflow-hidden">

                    <img
                      src={getImageUrl(
                        member.imageUrl
                      )}
                      alt={member.name}
                      className="
                        w-full
                        h-[260px]
                        md:h-[320px]
                        object-contain
                        transition-transform
                        duration-500
                        hover:scale-105
                      "
                    />

                    <div className="absolute inset-0 bg-cyan-500/0 hover:bg-cyan-500/10 transition duration-500" />
                  </div>

                  <div className="p-5 text-center">

                    <h4 className="font-bold text-lg">
                      {member.name}
                    </h4>

                    <p className="text-cyan-400 text-sm mt-1">
                      {member.role}
                    </p>

                    <p className="text-gray-400 text-xs mt-2">
                      {member.experience}
                    </p>

                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}