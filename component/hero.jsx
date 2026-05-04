"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { databases } from "@/lib/appwrite";

/* ================= CONFIG ================= */
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "website";

/* ================= TYPING ================= */
function TypingText() {
  const texts = [
    "BNMIIS Franchise Platform",
    "Smart Student & Certificate System",
    "Manage Institutes Seamlessly",
  ];

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const current = texts[index];
    let i = 0;

    const interval = setInterval(() => {
      setText(current.slice(0, i));
      i++;
      if (i > current.length) {
        clearInterval(interval);
        setTimeout(() => setIndex((p) => (p + 1) % texts.length), 1500);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <h1 className="text-4xl md:text-6xl font-semibold text-transparent bg-gradient-to-br from-white to-gray-400 bg-clip-text">
      {text}
      <span className="animate-pulse">|</span>
    </h1>
  );
}

/* ================= MAGNETIC BUTTON ================= */
function MagneticButton() {
  const ref = useRef();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-6 py-2 hover:bg-white/20 transition"
    >
      Get Started <FiArrowRight />
    </motion.button>
  );
}

/* ================= HERO ================= */
export default function PremiumHero() {
  const color = useMotionValue("#13FFAA");
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const [states, setStates] = useState([]);
  const [active, setActive] = useState(null);

  /* FETCH CMS */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        setStates(res.documents.filter((d) => d.type === "state"));
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  /* GRADIENT ANIMATION */
  useEffect(() => {
    animate(color, ["#13FFAA", "#1E67C6", "#9333EA"], {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const bg = useMotionTemplate`
    radial-gradient(120% 120% at ${mouseX}% ${mouseY}%, #020617 40%, ${color})
  `;

  return (
    <section
      onMouseMove={(e) => {
        mouseX.set((e.clientX / window.innerWidth) * 100);
        mouseY.set((e.clientY / window.innerHeight) * 100);
      }}
      className="relative min-h-screen overflow-hidden text-white px-6 py-24"
    >
      {/* 🌈 BACKGROUND */}
      <motion.div style={{ background: bg }} className="absolute inset-0" />

      {/* ⭐ LIGHTWEIGHT STARS */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white opacity-60 rounded-full"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 73) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT */}
        <div className="space-y-6 max-w-xl">
          <TypingText />

          <p className="text-gray-400">
            Manage your franchise ecosystem with real-time dashboards, automation, and smart certificate systems.
          </p>

          <MagneticButton />
        </div>

        {/* RIGHT (DASHBOARD STYLE STATES) */}
        <div className="relative w-full md:w-[45%]">

          <div className="grid grid-cols-3 gap-3">
            {states.map((state, i) => (
              <div
                key={i}
                onClick={() => setActive(state)}
                className={`cursor-pointer p-3 rounded-xl text-xs text-center transition
                ${
                  active?.name === state.name
                    ? "bg-cyan-500 text-black scale-110"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {state.name}
              </div>
            ))}
          </div>

          {/* PANEL */}
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white/10 backdrop-blur-xl p-4 rounded-xl"
            >
              <h3 className="text-cyan-400 mb-2">{active.name}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {active.institutes?.map((i, idx) => (
                  <div key={idx} className="bg-white/10 px-2 py-1 rounded">
                    {i}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}