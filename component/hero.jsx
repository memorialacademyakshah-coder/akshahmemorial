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

          {/* HOVER CARD */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.9 }}
              whileHover={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-center shadow-lg"
            >
              <p className="text-white text-xs md:text-sm font-semibold">
                {item.title}
              </p>
            </motion.div>
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
      try {
        const res = await databases.listDocuments(DB, COLLECTION);

        /* TEXTS */
        const textData = res.documents
          .filter((d) => d.type === "text")
          .map((d) => d.text);

        /* IMAGES */
        const imageData = res.documents
          .filter((d) => d.type === "image")
          .map((d) => ({
            id: d.$id,
            src: d.image,
            title: d.title || "Course",
          }));

        setTexts(textData);
        setImages(imageData);
      } catch (error) {
        console.error("CMS Fetch Error:", error);
      }
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

        if (charIndex === current.length) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 1200);
        }
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
      className="relative min-h-screen flex items-center justify-center text-white px-6 overflow-hidden"
    >
      {/* CONTENT */}
      <div className="relative z-10 grid md:grid-cols-2 gap-16 max-w-7xl w-full items-center">
        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            {displayText}
          </h1>

          <p className="mt-6 text-gray-300 max-w-md">
            BNMI  is a leading educational institution dedicated to providing high-quality education and fostering a nurturing learning environment. With a commitment to academic excellence and holistic development, BNMI offers a wide range of programs and resources to empower students to achieve their full potential. Our experienced faculty, state-of-the-art facilities, and vibrant campus community create an ideal setting for students to thrive academically, socially, and personally. Join us at BNMI and embark on a transformative educational journey that prepares you for success in the ever-evolving global landscape.
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

      {/* BG CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <CameraParallax mouse={mouse} />

          <Stars
            radius={50}
            count={2000}
            factor={4}
            fade
            speed={2}
          />
        </Canvas>
      </div>
    </motion.section>
  );
}