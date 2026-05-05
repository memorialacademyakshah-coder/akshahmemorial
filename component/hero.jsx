"use client";

import React, { useEffect, useState, useRef } from "react";
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

/* ================= DYNAMIC CANVAS ================= */
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

/* ================= CONFIG ================= */
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";

/* ================= COLORS ================= */
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

/* ================= SHUFFLE ================= */
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

/* ================= PHOTO GRID ================= */
const ShuffleGrid = ({ images }) => {
  const [grid, setGrid] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!images.length) return;

    setGrid(shuffle(images));

    const loop = () => {
      setGrid(shuffle(images));
      timeoutRef.current = setTimeout(loop, 3500);
    };

    timeoutRef.current = setTimeout(loop, 3500);

    return () => clearTimeout(timeoutRef.current);
  }, [images]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {grid.map((img, i) => (
        <motion.div
          key={img + i}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
          }}
          className="w-full h-24 md:h-28 rounded-xl overflow-hidden"
        >
          <motion.div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
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

  /* ================= FETCH CMS ================= */
  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const res = await databases.listDocuments(DB, COLLECTION);

        const textData = res.documents
          .filter((d) => d.type === "text")
          .map((d) => d.text);

        const imageData = res.documents
          .filter((d) => d.type === "image")
          .map((d) => d.image);

        setTexts(textData);
        setImages(imageData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCMS();
  }, []);

  /* ================= BG ANIMATION ================= */
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
            {displayText || "Loading..."}
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