"use client";

import { useState, useEffect } from "react";
import {
  Client,
  Databases,
  Storage,
  ID,
} from "appwrite";

/* ================= APPWRITE ================= */
const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = "6986e1c00001cabf9b03";
const COLLECTION_ID = "website";
const BUCKET_ID = "6986e8a4001925504f6b";

export default function CMSPage() {
  const [images, setImages] = useState([]);

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  /* ================= FETCH ================= */
  const fetchImages = async () => {
    try {
      const res =
        await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID
        );

      setImages(
        res.documents.filter(
          (d) => d.type === "image"
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPLOAD ================= */
  const uploadImage = async () => {
    const uploaded =
      await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        imageFile
      );

    return uploaded.$id;
  };

  /* ================= ADD ================= */
  const addImage = async () => {
    if (!imageFile) return;

    try {
      const fileId = await uploadImage();

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          type: "image",
          title,
          image: fileId,
        }
      );

      reset();
      fetchImages();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteImage = async (id) => {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );

    fetchImages();
  };

  /* ================= EDIT ================= */
  const startEdit = (img) => {
    setEditingId(img.$id);
    setTitle(img.title);
    setPreview(
      `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${img.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    );
  };

  /* ================= UPDATE ================= */
  const updateImage = async () => {
    try {
      let fileId = imageFile
        ? await uploadImage()
        : images.find(
            (i) => i.$id === editingId
          )?.image;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        editingId,
        {
          title,
          image: fileId,
        }
      );

      reset();
      fetchImages();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= RESET ================= */
  const reset = () => {
    setTitle("");
    setImageFile(null);
    setPreview(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-black p-10 text-white">

      {/* HEADER */}
      <h1 className="mb-10 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-5xl font-bold text-transparent">
        Brand CMS
      </h1>

      {/* FORM */}
      <div className="rounded-[35px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">

        {/* IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />

        {/* TITLE */}
        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Brand title..."
          className="
            mb-4
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/40
            p-4
            outline-none
          "
        />

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            className="
              mb-5
              h-36
              w-36
              rounded-2xl
              object-cover
              border
              border-white/10
            "
          />
        )}

        {/* BUTTON */}
        <button
          onClick={
            editingId
              ? updateImage
              : addImage
          }
          className="
            rounded-xl
            bg-gradient-to-r
            from-purple-500
            to-pink-500
            px-8
            py-4
            font-semibold
            transition
            hover:scale-105
          "
        >
          {editingId
            ? "Update Brand"
            : "Upload Brand"}
        </button>
      </div>

      {/* GRID */}
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">

        {images.map((img) => (
          <div
            key={img.$id}
            className="
              group
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.04]
              p-6
            "
          >

            <img
              src={`https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${img.image}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
              className="
                h-24
                w-full
                object-contain
                transition
                duration-500
                group-hover:scale-110
              "
            />

            <p className="mt-4 text-center text-sm">
              {img.title}
            </p>

            {/* ACTIONS */}
            <div className="mt-4 flex justify-center gap-3">

              <button
                onClick={() =>
                  startEdit(img)
                }
                className="
                  rounded-lg
                  bg-blue-500
                  px-4
                  py-2
                  text-xs
                "
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteImage(img.$id)
                }
                className="
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2
                  text-xs
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}