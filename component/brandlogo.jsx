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

const DATABASE_ID = "6a182b3d00083605cba6";
const COLLECTION_ID = "brand_logos";
const BUCKET_ID = "6a1d6a3f00191ec61913";

export default function PremiumBrandSlider() {

  const [brands, setBrands] = useState([]);

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchBrands = async () => {

      try {

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID
          );

        const filtered =
          res.documents.map((doc) => ({

            id: doc.$id,

            title:
              doc.title || "Brand",

            image:
              doc.image?.includes("http")
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
    <section
      className="
        relative
        overflow-hidden
        py-28
        bg-gradient-to-r
        from-[#fff4e9]
        via-[#f9f7ec]
        to-[#eef0ff]
      "
    >

      {/* SOFT BG GLOW */}

      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[700px]
          bg-[#fff0c7]
          opacity-40
          blur-[160px]
          rounded-full
        "
      />

      {/* ================= TOP MARQUEE ================= */}

      <div
        className="
          relative
          mb-16
          overflow-hidden
          border-y
          border-[#dfe3ff]
          bg-white/40
          py-5
          backdrop-blur-xl
        "
      >

        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
          className="
            flex
            min-w-max
            items-center
            gap-16
          "
        >

          {[...Array(10)].map((_, i) => (

            <div
              key={i}
              className="
                flex
                items-center
                gap-6
              "
            >

              <span
                className="
                  text-2xl
                  text-[#5865F2]
                "
              >
                ✦
              </span>

              <h2
                className="
                  whitespace-nowrap
                  text-2xl
                  font-semibold
                  tracking-wide
                  text-[#08104d]
                "
              >
                BNMIINDIA.COM{" "}

                <span
                  className="
                    text-[#5865F2]
                  "
                >
                  BNMIINDIA.ORG
                </span>{" "}

                ADVANCEINDIAIT.IN
              </h2>

            </div>

          ))}

        </motion.div>

      </div>

      {/* ================= MAIN CONTAINER ================= */}

      <div
        className="
          relative
          mx-auto
          w-[96%]
          overflow-hidden
          rounded-[48px]
          border
          border-[#ececec]
          bg-white/50
          backdrop-blur-2xl
          py-24
          shadow-[0_20px_80px_rgba(0,0,0,0.05)]
        "
      >

        {/* LEFT FADE */}

        <div
          className="
            absolute
            left-0
            top-0
            z-20
            h-full
            w-52
            bg-gradient-to-r
            from-[#fff4e9]
            via-[#fff4e9]/90
            to-transparent
          "
        />

        {/* RIGHT FADE */}

        <div
          className="
            absolute
            right-0
            top-0
            z-20
            h-full
            w-52
            bg-gradient-to-l
            from-[#eef0ff]
            via-[#eef0ff]/90
            to-transparent
          "
        />

        {/* ================= HEADING ================= */}

        <div
          className="
            absolute
            left-1/2
            top-8
            z-30
            -translate-x-1/2
          "
        >

          <div
            className="
              flex
              items-center
              gap-6
            "
          >

            <div
              className="
                h-[2px]
                w-20
                bg-gradient-to-r
                from-transparent
                to-[#5865F2]
              "
            />

            <h2
              className="
                whitespace-nowrap
                text-sm
                font-bold
                tracking-[0.5em]
                text-[#08104d]
              "
            >
              BRANDS WE WORK WITH
            </h2>

            <div
              className="
                h-[2px]
                w-20
                bg-gradient-to-l
                from-transparent
                to-[#5865F2]
              "
            />

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
                    border-[#ececec]
                    bg-white/80
                    backdrop-blur-2xl
                    overflow-hidden
                    shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                  "
                >

                  {/* SOFT GLOW */}

                  <div
                    className="
                      absolute
                      inset-0
                      opacity-0
                      transition
                      duration-700
                      group-hover/card:opacity-100
                    "
                  >
                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#5865F2]/10
                        via-[#8b5cf6]/5
                        to-[#5865F2]/10
                        blur-3xl
                      "
                    />
                  </div>

                  {/* INNER */}

                  <div
                    className="
                      absolute
                      inset-[1px]
                      rounded-[32px]
                      bg-white/90
                    "
                  />

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