"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Client, Databases } from "appwrite";

/* ================= APPWRITE ================= */
const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = "6986e1c00001cabf9b03";
const COLLECTION_ID = "website";
const BUCKET_ID = "6986e8a4001925504f6b";

export default function PremiumBrandSlider() {
  const [brands, setBrands] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID
        );

        const filtered = res.documents
          .filter((doc) => doc.type === "image")
          .map((doc) => ({
            id: doc.$id,
            title: doc.title || "Brand",

            image: doc.image?.includes("http")
              ? doc.image
              : `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${doc.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
          }));

        setBrands(filtered);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="relative overflow-hidden bg-black py-24">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />

      {/* CONTAINER */}
      <div className="relative mx-auto w-[96%] overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl">

        {/* LEFT FADE */}
        <div className="absolute left-0 top-0 z-20 h-full w-52 bg-gradient-to-r from-black via-black/80 to-transparent" />

        {/* RIGHT FADE */}
        <div className="absolute right-0 top-0 z-20 h-full w-52 bg-gradient-to-l from-black via-black/80 to-transparent" />

        {/* SLIDER */}
        <div className="group flex overflow-hidden py-16">

          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear",
            }}
            className="
              flex
              min-w-max
              items-center
              gap-16
              pr-16
              group-hover:[animation-play-state:paused]
            "
          >
            {[...brands, ...brands].map((brand, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.12,
                  y: -10,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 16,
                }}
                className="
                  group/card
                  relative
                  flex
                  h-36
                  w-64
                  items-center
                  justify-center
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-xl
                  overflow-hidden
                  shadow-[0_10px_60px_rgba(255,255,255,0.06)]
                "
              >

                {/* GLOW */}
                <div className="absolute inset-0 opacity-0 transition duration-700 group-hover/card:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-cyan-500/20 blur-2xl" />
                </div>

                {/* INNER LIGHT */}
                <div className="absolute inset-[1px] rounded-[30px] bg-black/40 backdrop-blur-xl" />

                {/* LOGO */}
                <motion.img
                  src={brand.image}
                  alt={brand.title}
                  draggable={false}
                  whileHover={{
                    scale: 1.15,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="
                    relative
                    z-10
                    max-h-[70px]
                    max-w-[150px]
                    object-contain
                    opacity-80
                    transition-all
                    duration-500
                    group-hover/card:opacity-100
                  "
                />

                {/* TITLE */}
                <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs text-white opacity-0 backdrop-blur-xl transition duration-500 group-hover/card:opacity-100">
                  {brand.title}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}