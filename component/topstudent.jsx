"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLLECTION_ID = "top_students";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function TopStudents() {
  const [students, setStudents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc("order")]
        );

        setStudents(res.documents || []);
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };

    fetchStudents();
  }, []);

const getImageUrl = (fileId) => {
  if (!fileId) return "/placeholder.png";

  return storage.getFileView(
    BUCKET_ID,
    fileId
  ).toString();
};

  if (!students.length) {
    return (
      <section className="bg-[#020617] py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold">
            Top Students
          </h2>

          <p className="mt-4 text-gray-400">
            Loading student achievements...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24 text-white">

      {/* Background Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)]" />

      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">

        {/* Heading */}

        <div className="text-center mb-16">

          <span className="uppercase tracking-[5px] text-cyan-400 text-sm font-medium">
            Student Achievers
          </span>

          <h2 className="mt-4 text-5xl md:text-6xl font-bold">
            Top{" "}
            <span className="text-cyan-400">
              Students
            </span>
          </h2>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            Celebrating academic excellence,
            dedication, and outstanding
            achievements of our brightest
            students.
          </p>

        </div>

        {/* Fade Left */}

        <div className="absolute left-0 top-0 z-20 h-full w-32 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />

        {/* Fade Right */}

        <div className="absolute right-0 top-0 z-20 h-full w-32 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />

        {/* Slider */}

        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
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
            className="flex min-w-max gap-8"
          >

            {[...students, ...students].map(
              (student, index) => (
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
                    rounded-[35px]
                    border
                    border-cyan-500/20
                    bg-gradient-to-b
                    from-[#0f172a]
                    to-[#020617]
                    shadow-[0_20px_80px_rgba(6,182,212,0.15)]
                    backdrop-blur-xl
                    w-[340px]
                    flex-shrink-0
                  "
                >

                  {/* Premium Glow */}

                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-yellow-500/10" />

                  {/* Top Badge */}

                  <div className="absolute top-4 right-4 z-20">

                    <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400 border border-yellow-500/30">
                      🏆 Achiever
                    </div>

                  </div>

                  {/* Image */}

                  <div className="relative p-4">

                    <img
  src={getImageUrl(student.imageUrl)}
  alt={student.name || "Student"}
  draggable={false}
  onError={(e) => {
    console.log(
      "Failed Image:",
      student.imageUrl
    );
    e.target.src = "/placeholder.png";
  }}
  className="
    h-[320px]
    w-full
    rounded-[28px]
    object-cover
    object-top
    transition-transform
    duration-500
    hover:scale-105
  "
/>

                  </div>

                  {/* Content */}

                  <div className="relative z-10 px-6 pb-8 text-center">

                    <h3 className="text-2xl font-bold">
                      {student.name}
                    </h3>

                    <p className="mt-2 text-cyan-400 font-medium">
                      {student.class}
                    </p>

                    {/* Stats */}

                    <div className="mt-5 flex justify-center gap-3">

                      <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">

                        <p className="text-xs text-gray-400">
                          Percentage
                        </p>

                        <p className="font-bold text-lg text-green-400">
                          {student.percentage}
                        </p>

                      </div>

                      <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">

                        <p className="text-xs text-gray-400">
                          Rank
                        </p>

                        <p className="font-bold text-lg text-yellow-400">
                          {student.rank}
                        </p>

                      </div>

                    </div>

                    {/* Achievement */}

                    <p className="mt-5 text-sm leading-relaxed text-gray-400">
                      {student.achievement}
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