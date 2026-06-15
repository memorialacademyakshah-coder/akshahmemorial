"use client";

import { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwrite";
import { Query } from "appwrite";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const COLLECTION_ID = "homepage_slider";

export default function HomeSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("active", true),
          Query.orderAsc("order"),
        ]
      );

      setSlides(res.documents);
    } catch (error) {
      console.error("Slider Error:", error);
    }
  };

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  if (!slides.length) {
    return (
      <div className="w-full h-[250px] md:h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No slider images found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">

      {/* Responsive Height */}
      <div className="h-[220px] sm:h-[300px] md:h-[450px] lg:h-[600px] xl:h-[700px]">

        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.$id}
              className="min-w-full h-full"
            >
              <img
                src={storage.getFileView(
                  BUCKET_ID,
                  slide.imageId
                )}
                alt="Slider"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        {slides.length > 1 && (
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 md:p-3 transition"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow */}
        {slides.length > 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 md:p-3 transition"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition ${
                  current === index
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}