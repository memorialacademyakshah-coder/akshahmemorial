"use client";

import { useState, useEffect } from "react";
import { databases, storage, ID } from "@/lib/appwrite";

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";
const BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function CMSPage() {
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);

  const [textInput, setTextInput] = useState("");
  const [titleInput, setTitleInput] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [editingTextId, setEditingTextId] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      const res = await databases.listDocuments(DB, COLLECTION);

      setTexts(res.documents.filter((d) => d.type === "text"));
      setImages(res.documents.filter((d) => d.type === "image"));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Max 3MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const file = await storage.createFile(
      BUCKET,
      ID.unique(),
      imageFile
    );

    return storage.getFileView(BUCKET, file.$id);
  };

  /* ================= TEXT ================= */
  const addText = async () => {
    if (!textInput) return;

    await databases.createDocument(DB, COLLECTION, ID.unique(), {
      type: "text",
      text: textInput,
    });

    reset();
    fetchData();
  };

  const deleteText = async (id) => {
    await databases.deleteDocument(DB, COLLECTION, id);
    fetchData();
  };

  const updateText = async () => {
    await databases.updateDocument(DB, COLLECTION, editingTextId, {
      text: textInput,
    });

    reset();
    fetchData();
  };

  const startEditText = (t) => {
    setEditingTextId(t.$id);
    setTextInput(t.text);
  };

  /* ================= IMAGE ================= */
  const addImage = async () => {
    if (!imageFile) return;

    const url = await uploadImage();

    await databases.createDocument(DB, COLLECTION, ID.unique(), {
      type: "image",
      image: url,
      title: titleInput,
    });

    reset();
    fetchData();
  };

  const deleteImage = async (id) => {
    await databases.deleteDocument(DB, COLLECTION, id);
    fetchData();
  };

  const updateImage = async () => {
    let url = preview;

    if (imageFile) {
      url = await uploadImage();
    }

    await databases.updateDocument(DB, COLLECTION, editingImageId, {
      image: url,
      title: titleInput,
    });

    reset();
    fetchData();
  };

  const startEditImage = (img) => {
    setEditingImageId(img.$id);
    setTitleInput(img.title || "");
    setPreview(img.image);
  };

  /* ================= RESET ================= */
  const reset = () => {
    setTextInput("");
    setTitleInput("");
    setImageFile(null);
    setPreview(null);

    setEditingTextId(null);
    setEditingImageId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-10">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Hero CMS Dashboard
      </h1>

      {/* ================= TEXT SECTION ================= */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 shadow-xl">

        <h2 className="text-xl mb-4 font-semibold text-purple-300">
          Typing Text
        </h2>

        <div className="flex gap-3 flex-wrap">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter hero text..."
            className="p-3 bg-black/40 border border-white/10 rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={editingTextId ? updateText : addText}
            className={`px-5 py-3 rounded-lg font-medium transition ${
              editingTextId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105"
            }`}
          >
            {editingTextId ? "Update" : "Add"}
          </button>
        </div>

        {/* TEXT LIST */}
        <div className="mt-6 space-y-3">
          {texts.map((t) => (
            <div
              key={t.$id}
              className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition"
            >
              <span>{t.text}</span>

              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => startEditText(t)}
                  className="text-blue-400 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteText(t.$id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= IMAGE SECTION ================= */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">

        <h2 className="text-xl mb-4 font-semibold text-pink-300">
          Image Upload
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-3"
        />

        {/* TITLE INPUT */}
        <input
          type="text"
          placeholder="Enter image title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="p-3 bg-black/40 border border-white/10 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {preview && (
          <img
            src={preview}
            className="w-32 h-32 rounded-xl object-cover mb-3 border border-white/20"
          />
        )}

        <button
          onClick={editingImageId ? updateImage : addImage}
          className={`px-5 py-3 rounded-lg font-medium transition ${
            editingImageId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105"
          }`}
        >
          {editingImageId ? "Update Image" : "Upload Image"}
        </button>

        {/* IMAGE GRID */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.$id}
              className="group relative rounded-xl overflow-hidden border border-white/10"
            >
              <img
                src={img.image}
                className="w-full h-32 object-cover group-hover:scale-110 transition duration-500"
              />

              {/* TITLE */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center text-sm">
                {img.title}
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                <button
                  onClick={() => startEditImage(img)}
                  className="bg-white text-black px-3 py-1 rounded text-xs"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteImage(img.$id)}
                  className="bg-red-500 px-3 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}