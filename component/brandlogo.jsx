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
const COLLECTION_ID = "brand_logos";
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

       const filtered = res.documents.map((doc) => ({
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
  <section className="relative overflow-hidden bg-black py-28">

    {/* BACKGROUND */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)]" />

    <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[180px]" />

    {/* ================= TOP MARQUEE ================= */}
    <div className="relative mb-16 overflow-hidden border-y border-purple-500/20 bg-black/40 py-5 backdrop-blur-xl">

      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="flex min-w-max items-center gap-16"
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6"
          >
            <span className="text-2xl text-purple-400">
              ✦
            </span>

            <h2 className="whitespace-nowrap text-2xl font-semibold tracking-wide text-white">
              BNMIINDIA.COM{" "}, 
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                BNMIINDIA.ORG, 
              </span>{" "}
              ADVANCEINDIAIT.IN
            </h2>
          </div>
        ))}
      </motion.div>
    </div>

    {/* ================= MAIN CONTAINER ================= */}
    <div className="relative mx-auto w-[96%] overflow-hidden rounded-[48px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl py-24">

      {/* LEFT FADE */}
      <div className="absolute left-0 top-0 z-20 h-full w-52 bg-gradient-to-r from-black via-black/90 to-transparent" />

      {/* RIGHT FADE */}
      <div className="absolute right-0 top-0 z-20 h-full w-52 bg-gradient-to-l from-black via-black/90 to-transparent" />

      {/* ================= HEADING ================= */}
      <div className="absolute left-1/2 top-8 z-30 -translate-x-1/2">

        <div className="flex items-center gap-6">

          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-purple-500" />

          <h2
            className="
              whitespace-nowrap
              text-sm
              font-semibold
              tracking-[0.5em]
              text-white
            "
          >
            BRANDS WE WORK WITH
          </h2>

          <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-purple-500" />
        </div>
      </div>

      {/* ================= SLIDER ================= */}
      <div className="group flex overflow-hidden">

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
          "
        >
          {[...brands, ...brands].map(
            (brand, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.08,
                  y: -8,
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
                  h-40
                  w-72
                  items-center
                  justify-center
                  rounded-[34px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  overflow-hidden
                  shadow-[0_10px_80px_rgba(168,85,247,0.08)]
                "
              >

                {/* GLOW */}
                <div className="absolute inset-0 opacity-0 transition duration-700 group-hover/card:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-cyan-500/20 blur-3xl" />
                </div>

                {/* INNER */}
                <div className="absolute inset-[1px] rounded-[32px] bg-black/60 backdrop-blur-xl" />

                {/* LOGO */}
                <motion.img
                  src={brand.image}
                  alt={brand.title}
                  draggable={false}
                  whileHover={{
                    scale: 1.12,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="
                    relative
                    z-10
                    max-h-[90px]
                    max-w-[180px]
                    object-contain
                    opacity-90
                  "
                />
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </div>
  </section>
);
}