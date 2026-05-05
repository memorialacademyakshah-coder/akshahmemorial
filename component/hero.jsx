"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { databases } from "@/lib/appwrite";
import { Stars } from "@react-three/drei";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
  AnimatePresence,
} from "framer-motion";
  import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const TEXTS = [
"BHARAT NATIONAL MULTIMEDIA INSTITUTE",
"STUDENT'S PORTAL, FRANCHISE PORTAL, CERTIFICATE VERIFICATION PORTAL",
  "JOIN US AND SHAPE YOUR FUTURE",
];

export default function AuroraHero() {
  const color = useMotionValue(COLORS_TOP[0]);

  const [states, setStates] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeState = states[activeIndex];

  // typing
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);


function CameraParallax({ mouse }) {
  useFrame((state) => {
    const { camera } = state;

    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.05;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchStates = async () => {
      const res = await databases.listDocuments(DB, COLLECTION);
      const filtered = res.documents.filter((d) => d.type === "state");

      setStates(filtered);
    };

    fetchStates();
  }, []);

  /* ================= AUTO ROTATE ================= */
  useEffect(() => {
    if (!states.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % states.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [states]);

  /* ================= BG ================= */
  useEffect(() => {
    animate(color, COLORS_TOP, {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  /* ================= TYPING ================= */
  useEffect(() => {
    const current = TEXTS[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);

        if (charIndex === current.length) setIsDeleting(true);
      } else {
        setDisplayText(current.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % TEXTS.length);
        }
      }
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  const backgroundImage = useMotionTemplate`
    radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})
  `;

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    setMouse({ x, y });
  };

  window.addEventListener("mousemove", handleMouseMove);

  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);
  

  return (
    <motion.section
      style={{ backgroundImage }}
      className="relative min-h-screen flex items-center justify-center text-white px-6"
    >
      <div className="relative z-10 grid md:grid-cols-2 gap-16 max-w-7xl w-full items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            {displayText}
          </h1>

          <p className="mt-6 text-gray-300 max-w-md">
            Explore our comprehensive portals for students, franchises, and certificate verification. Join us to access resources, manage your franchise, and verify credentials with ease.
          </p>

          <button className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:scale-105 transition">
            Apply Now <FiArrowRight />
          </button>
        </div>

        {/* RIGHT */}
    <div className="flex justify-center md:justify-end">
  <div className="w-full max-w-md">

    {/* 🔥 GLASS CARD */}
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">

      {/* 🔹 TITLE (NOW CENTERED INSIDE BOX) */}
      <p className="text-gray-400 text-sm">
        Our Institute
      </p>

      <h2 className="text-4xl md:text-5xl font-bold mt-1 mb-6">
        {activeState?.name}
      </h2>

      {/* 🔹 INSTITUTES LIST */}
      <div className="space-y-2 text-sm text-left max-h-[300px] overflow-y-auto pr-2">
        {activeState?.institutes?.map((inst, i) => (
          <div
            key={i}
            className="hover:text-purple-300 transition"
          >
            • {inst}
          </div>
        ))}
      </div>

      {/* 🔹 DIVIDER */}
      <div className="my-5 border-t border-white/10" />

      {/* 🔹 STATE SELECTOR (GRID) */}
      {/* <div className="grid grid-cols-2 gap-2">
        {states.map((state, i) => (
          <button
            key={state.$id}
            onClick={() => setActiveIndex(i)}
            className={`px-3 py-2 rounded-lg text-xs transition ${
              activeIndex === i
                ? "bg-white text-black"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {state.name}
          </button>
        ))}
      </div> */}
    </div>
  </div>
</div>
      </div>

      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 1] }}>
  <CameraParallax mouse={mouse} />
  <Stars radius={50} count={2000} factor={4} fade speed={2} />
</Canvas>
      </div>
    </motion.section>
  );
}