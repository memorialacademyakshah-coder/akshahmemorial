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
} from "framer-motion";
import { useFrame } from "@react-three/fiber";

/* ================= CANVAS ================= */
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

/* ================= GRID ================= */
const ShuffleGrid = ({ images }) => {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    if (!images.length) return;

    setGrid(images);

    const interval = setInterval(() => {
      setGrid((prev) => {
        const newArr = [...prev];

        const count = Math.min(6, newArr.length);

        const indexes = [];
        while (indexes.length < count) {
          const rand = Math.floor(Math.random() * newArr.length);
          if (!indexes.includes(rand)) indexes.push(rand);
        }

        const temp = newArr[indexes[0]];
        for (let i = 0; i < indexes.length - 1; i++) {
          newArr[indexes[i]] = newArr[indexes[i + 1]];
        }
        newArr[indexes[indexes.length - 1]] = temp;

        return newArr;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {grid.map((item) => (
        <motion.div
          key={item.id}
          layout
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 20,
          }}
          className="relative w-full h-24 md:h-28 rounded-xl overflow-hidden group cursor-pointer"
        >
          {/* IMAGE */}
          <div
            className="w-full h-full bg-cover bg-center transition duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${item.src})` }}
          />

          {/* 🔥 NEW HOVER (LEFT + RIGHT COURSES) */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-between px-4">

            {/* LEFT SIDE */}
            <div className="flex flex-col gap-2 text-xs text-white">
              {item.courses
                .slice(0, Math.ceil(item.courses.length / 2))
                .map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded"
                  >
                    {c}
                  </motion.div>
                ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-2 text-xs text-white">
              {item.courses
                .slice(Math.ceil(item.courses.length / 2))
                .map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded"
                  >
                    {c}
                  </motion.div>
                ))}
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ================= CAMERA ================= */
function CameraParallax({ mouse }) {
  useFrame((state) => {
    const { camera } = state;
    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ================= MAIN ================= */
export default function AuroraHero() {
  const color = useMotionValue(COLORS_TOP[0]);

  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCMS = async () => {
      const res = await databases.listDocuments(DB, COLLECTION);

      const textData = res.documents
        .filter((d) => d.type === "text")
        .map((d) => d.text);

      const imageData = res.documents
        .filter((d) => d.type === "image")
        .map((d) => ({
          id: d.$id,
          src: d.image,
          courses: d.courses || [],
        }));

      setTexts(textData);
      setImages(imageData);
    };

    fetchCMS();
  }, []);

  /* ================= BG ================= */
  useEffect(() => {
    animate(color, COLORS_TOP, {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  /* ================= TYPING ================= */
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!texts.length) return;

    const current = texts[textIndex];

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
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  /* ================= MOUSE ================= */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const backgroundImage = useMotionTemplate`
    radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})
  `;

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
            Explore our platform with dynamic visuals and modern UI.
          </p>

          <button className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-2 hover:scale-105 transition">
            Apply Now <FiArrowRight />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
            <ShuffleGrid images={images} />
          </div>
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <CameraParallax mouse={mouse} />
          <Stars radius={50} count={2000} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
}