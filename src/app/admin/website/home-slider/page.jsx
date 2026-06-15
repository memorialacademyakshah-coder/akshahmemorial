"use client";

import { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const COLLECTION_ID = "homepage_slider";

export default function HomeSliderCMS() {
  const [slides, setSlides] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderAsc("order")]
      );

      setSlides(response.documents);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        selectedFile
      );

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          imageId: uploadedFile.$id,
          order: Number(order) || 0,
          active: true,
        }
      );

      alert("Slider image uploaded successfully");

      setSelectedFile(null);
      setOrder("");

      document.getElementById("slider-image").value = "";

      fetchSlides();
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteSlide = async (slide) => {
    const confirmDelete = window.confirm(
      "Delete this slider image?"
    );

    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        slide.$id
      );

      await storage.deleteFile(
        BUCKET_ID,
        slide.imageId
      );

      fetchSlides();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Homepage Slider CMS
      </h1>

      {/* Upload Form */}

      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Upload New Slide
        </h2>

        <div className="space-y-4">
          <input
            id="slider-image"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setSelectedFile(e.target.files[0])
            }
            className="w-full border p-3 rounded"
          />

          <input
            type="number"
            placeholder="Display Order"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            {loading ? "Uploading..." : "Upload Slide"}
          </button>
        </div>
      </div>

      {/* Slides List */}

      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Current Slides
        </h2>

        {slides.length === 0 ? (
          <p>No slider images found.</p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {slides.map((slide) => (
              <div
                key={slide.$id}
                className="bg-white shadow rounded-xl overflow-hidden"
              >
                <img
                  src={storage.getFileView(
                    BUCKET_ID,
                    slide.imageId
                  )}
                  alt="Slider"
                  className="w-full h-52 object-cover"
                />

                <div className="p-4">
                  <p className="font-medium">
                    Order: {slide.order}
                  </p>

                  <button
                    onClick={() => deleteSlide(slide)}
                    className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}