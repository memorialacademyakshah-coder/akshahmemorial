"use client";

import { useEffect, useState } from "react";
import { databases, storage, ID } from "@/lib/appwrite";
import { Trash2, Pencil, ImagePlus } from "lucide-react";

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "website";
const BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function HeroCMSPage() {

  /* ================= STATES ================= */

  const [heroType, setHeroType] = useState("banner");

  const [slides, setSlides] = useState([]);

  const [title, setTitle] = useState("");
  const [blueText, setBlueText] = useState("");
  const [description, setDescription] = useState("");

  const [bgFile, setBgFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);

  const [bgPreview, setBgPreview] = useState("");
  const [studentPreview, setStudentPreview] = useState("");

  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH ================= */

  const fetchData = async () => {

    try {

      const res = await databases.listDocuments(
        DB,
        COLLECTION
      );

      const heroSlides = res.documents.filter(
        (d) => d.type === "hero"
      );

      const settings = res.documents.find(
        (d) => d.type === "hero_settings"
      );

      setSlides(heroSlides);

      if (settings) {
        setHeroType(settings.heroType);
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILE UPLOAD ================= */

  const uploadFile = async (file) => {

    if (!file) return null;

    const uploaded = await storage.createFile(
      BUCKET,
      ID.unique(),
      file
    );

    return storage.getFileView(
      BUCKET,
      uploaded.$id
    );
  };

  /* ================= SAVE SETTINGS ================= */

  const saveHeroType = async () => {

    try {

      const res = await databases.listDocuments(
        DB,
        COLLECTION
      );

      const existing = res.documents.find(
        (d) => d.type === "hero_settings"
      );

      if (existing) {

        await databases.updateDocument(
          DB,
          COLLECTION,
          existing.$id,
          {
            heroType,
          }
        );

      } else {

        await databases.createDocument(
          DB,
          COLLECTION,
          ID.unique(),
          {
            type: "hero_settings",
            heroType,
          }
        );
      }

      alert("Hero type updated");

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= ADD HERO ================= */

  const addHero = async () => {

    try {

      const bgUrl = await uploadFile(bgFile);
      const studentUrl = await uploadFile(studentFile);

      await databases.createDocument(
        DB,
        COLLECTION,
        ID.unique(),
        {
          type: "hero",
          title,
          blueText,
          description,
          image: bgUrl,
          studentImage: studentUrl,
        }
      );

      reset();

      fetchData();

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= UPDATE HERO ================= */

  const updateHero = async () => {

    try {

      let bgUrl = bgPreview;
      let studentUrl = studentPreview;

      if (bgFile) {
        bgUrl = await uploadFile(bgFile);
      }

      if (studentFile) {
        studentUrl = await uploadFile(studentFile);
      }

      await databases.updateDocument(
        DB,
        COLLECTION,
        editingId,
        {
          title,
          blueText,
          description,
          image: bgUrl,
          studentImage: studentUrl,
        }
      );

      reset();

      fetchData();

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= DELETE ================= */

  const deleteHero = async (id) => {

    try {

      await databases.deleteDocument(
        DB,
        COLLECTION,
        id
      );

      fetchData();

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= EDIT ================= */

  const editHero = (item) => {

    setEditingId(item.$id);

    setTitle(item.title || "");
    setBlueText(item.blueText || "");
    setDescription(item.description || "");

    setBgPreview(item.image || "");
    setStudentPreview(item.studentImage || "");
  };

  /* ================= RESET ================= */

  const reset = () => {

    setEditingId(null);

    setTitle("");
    setBlueText("");
    setDescription("");

    setBgFile(null);
    setStudentFile(null);

    setBgPreview("");
    setStudentPreview("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7ff] p-6 md:p-10">

      {/* ================= HEADER ================= */}

      <div className="mb-10">

        <h1
          className="
            text-4xl
            font-black
            text-[#0b0b45]
          "
        >
          Hero Section CMS
        </h1>

        <p className="text-gray-500 mt-2">
          Manage Hero Banner & Slider
        </p>

      </div>

      {/* ================= SETTINGS ================= */}

      <div
        className="
          bg-white
          rounded-3xl
          p-8
          shadow-sm
          border
          border-gray-100
          mb-10
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-[#0b0b45]
            mb-6
          "
        >
          Hero Type
        </h2>

        <div className="flex flex-wrap gap-5">

          {/* BANNER */}
          <button
            onClick={() => setHeroType("banner")}
            className={`
              px-8
              py-4
              rounded-2xl
              font-semibold
              transition-all
              duration-300
              ${
                heroType === "banner"
                  ? "bg-[#5865F2] text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
          >
            Banner
          </button>

          {/* SLIDER */}
          <button
            onClick={() => setHeroType("slider")}
            className={`
              px-8
              py-4
              rounded-2xl
              font-semibold
              transition-all
              duration-300
              ${
                heroType === "slider"
                  ? "bg-[#5865F2] text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
          >
            Slider
          </button>

          {/* SAVE */}
          <button
            onClick={saveHeroType}
            className="
              px-8
              py-4
              rounded-2xl
              bg-[#0b0b45]
              text-white
              font-semibold
              hover:scale-105
              transition-all
            "
          >
            Save Settings
          </button>

        </div>

      </div>

      {/* ================= FORM ================= */}

      <div
        className="
          bg-white
          rounded-3xl
          p-8
          shadow-sm
          border
          border-gray-100
          mb-10
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-[#0b0b45]
            mb-8
          "
        >
          {editingId
            ? "Update Hero Slide"
            : "Add Hero Slide"}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          {/* BLUE TEXT */}
          <div>

            <label className="font-semibold text-[#0b0b45]">
              Blue Text
            </label>

            <input
              value={blueText}
              onChange={(e) =>
                setBlueText(e.target.value)
              }
              placeholder="Smart Study"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-xl
                p-4
                outline-none
              "
            />

          </div>

          {/* TITLE */}
          <div>

            <label className="font-semibold text-[#0b0b45]">
              Main Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Where Knowledge Meets the Web"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-xl
                p-4
                outline-none
              "
            />

          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="mt-6">

          <label className="font-semibold text-[#0b0b45]">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={5}
            placeholder="Hero description"
            className="
              mt-2
              w-full
              border
              border-gray-200
              rounded-xl
              p-4
              outline-none
            "
          />

        </div>

        {/* IMAGE UPLOADS */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">

          {/* BG IMAGE */}
          <div>

            <label className="font-semibold text-[#0b0b45]">
              Background Image
            </label>

            <label
              className="
                mt-3
                border-2
                border-dashed
                border-gray-300
                rounded-2xl
                h-[260px]
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                overflow-hidden
                bg-gray-50
              "
            >

              {bgPreview ? (

                <img
                  src={bgPreview}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <>
                  <ImagePlus
                    size={40}
                    className="text-gray-400"
                  />

                  <p className="mt-4 text-gray-500">
                    Upload Background
                  </p>
                </>

              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {

                  const file = e.target.files[0];

                  if (!file) return;

                  setBgFile(file);

                  setBgPreview(
                    URL.createObjectURL(file)
                  );
                }}
              />

            </label>

          </div>

          {/* STUDENT IMAGE */}
          <div>

            <label className="font-semibold text-[#0b0b45]">
              Student Image
            </label>

            <label
              className="
                mt-3
                border-2
                border-dashed
                border-gray-300
                rounded-2xl
                h-[260px]
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                overflow-hidden
                bg-gray-50
              "
            >

              {studentPreview ? (

                <img
                  src={studentPreview}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <>
                  <ImagePlus
                    size={40}
                    className="text-gray-400"
                  />

                  <p className="mt-4 text-gray-500">
                    Upload Student Image
                  </p>
                </>

              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {

                  const file = e.target.files[0];

                  if (!file) return;

                  setStudentFile(file);

                  setStudentPreview(
                    URL.createObjectURL(file)
                  );
                }}
              />

            </label>

          </div>

        </div>

        {/* BUTTON */}
        <div className="mt-10">

          <button
            onClick={
              editingId
                ? updateHero
                : addHero
            }
            className="
              bg-[#5865F2]
              hover:bg-[#4452eb]
              text-white
              px-10
              py-5
              rounded-2xl
              font-semibold
              transition-all
              duration-300
            "
          >
            {editingId
              ? "Update Hero"
              : "Add Hero"}
          </button>

        </div>

      </div>

      {/* ================= SLIDES ================= */}

      <div>

        <h2
          className="
            text-3xl
            font-black
            text-[#0b0b45]
            mb-8
          "
        >
          Hero Slides
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">

          {slides.map((item) => (

            <div
              key={item.$id}
              className="
                bg-white
                rounded-3xl
                overflow-hidden
                shadow-sm
                border
                border-gray-100
              "
            >

              {/* IMAGE */}
              <div className="relative h-[240px]">

                <img
                  src={item.image}
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                  "
                />

              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h3
                  className="
                    text-[#5865F2]
                    font-bold
                    text-xl
                  "
                >
                  {item.blueText}
                </h3>

                <h2
                  className="
                    text-2xl
                    font-black
                    text-[#0b0b45]
                    mt-2
                  "
                >
                  {item.title}
                </h2>

                <p className="text-gray-500 mt-4">
                  {item.description}
                </p>

                {/* BUTTONS */}
                <div className="flex gap-4 mt-6">

                  <button
                    onClick={() => editHero(item)}
                    className="
                      flex
                      items-center
                      gap-2
                      bg-blue-100
                      text-blue-600
                      px-5
                      py-3
                      rounded-xl
                      font-medium
                    "
                  >
                    <Pencil size={18} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteHero(item.$id)
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      bg-red-100
                      text-red-600
                      px-5
                      py-3
                      rounded-xl
                      font-medium
                    "
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}