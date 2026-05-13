"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "team";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function TeamSlider() {
  const [team, setTeam] = useState([]);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false)
const [position, setPosition] = useState(0)
const [currentX, setCurrentX] = useState(0)
  const startX = useRef(0);
  const isDragging = useRef(false);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  /* ================= FETCH CMS ================= */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc("order")]
        );

        setTeam(res.documents || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
  if (isPaused) return

  const interval = setInterval(() => {
    setCurrentX((prev) => prev - 1)
  }, 20)

  return () => clearInterval(interval)
}, [isPaused])
  /* ================= SAFE VALUES ================= */
  const safeTeam = Array.isArray(team) ? team : [];

  /* ================= IMAGE ================= */
  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";

    try {
      if (typeof image === "string" && image.startsWith("http")) {
        return image;
      }

      if (typeof image === "string") {
        return storage.getFileView(BUCKET_ID, image).href;
      }

      if (typeof image === "object") {
        const id = image.$id || image.fileId || image.id;

        if (id) {
          return storage.getFileView(BUCKET_ID, id).href;
        }
      }

      return "/placeholder.png";
    } catch {
      return "/placeholder.png";
    }
  };

  /* ================= UI ================= */
  if (!safeTeam.length) {
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
          Our <span className="text-cyan-400">Team</span>
        </h2>

        {/* SLIDER */}
        <div
          className="relative overflow-hidden"
          onMouseDown={(e) => {
            isDragging.current = true;
            startX.current = e.clientX;
          }}
          onMouseUp={(e) => {
            if (!isDragging.current) return;

            const diff = startX.current - e.clientX;

            if (diff > 50) {
              document
                .getElementById("team-slider")
                ?.scrollBy({ left: 300, behavior: "smooth" });
            }

            if (diff < -50) {
              document
                .getElementById("team-slider")
                ?.scrollBy({ left: -300, behavior: "smooth" });
            }

            isDragging.current = false;
          }}
        >
  {/* LEFT ARROW */}
<button
  onClick={() => setCurrentX((prev) => prev + 300)}
  className="
    absolute
    left-2
    top-1/2
    -translate-y-1/2
    z-30
    w-12
    h-12
    rounded-full
    bg-black/60
    border
    border-white/20
    text-white
    text-2xl
    hover:bg-cyan-500
    transition
  "
>
  ←
</button>

{/* RIGHT ARROW */}
<button
  onClick={() => setCurrentX((prev) => prev - 300)}
  className="
    absolute
    right-2
    top-1/2
    -translate-y-1/2
    z-30
    w-12
    h-12
    rounded-full
    bg-black/60
    border
    border-white/20
    text-white
    text-2xl
    hover:bg-cyan-500
    transition
  "
>
  →
</button>

<motion.div
  animate={{ x: currentX }}
  transition={{ ease: "linear", duration: 0 }}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  className="flex min-w-max gap-8"
>
            {[...safeTeam, ...safeTeam].map((member, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="
                  min-w-[280px]
                  md:min-w-[340px]
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
                    src={getImageUrl(member.imageUrl)}
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

                  {/* GLOW */}
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
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}