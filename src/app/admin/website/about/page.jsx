"use client";

import { useEffect, useState } from "react";
import {
  Client,
  Databases,
  Storage,
  ID,
  Query,
} from "appwrite";

import {
  FiUpload,
  FiSave,
  FiImage,
} from "react-icons/fi";

/* ================= APPWRITE ================= */
const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  );

const databases = new Databases(client);
const storage = new Storage(client);

/* ================= IDS ================= */
const DATABASE_ID =
  "6a182b3d00083605cba6";

const COLLECTION_ID = "website";

const BUCKET_ID =
  "6a1d6a3f00191ec61913";

export default function AboutCMS() {
  const [docId, setDocId] =
    useState(null);

  const [form, setForm] = useState({
    aboutTitle: "",
    aboutDescription: "",
    missionTitle: "",
    missionContent: "",
    visionTitle: "",
    visionContent: "",
    aboutImageTop: "",
    aboutImageCenter: "",
    aboutImageBottom: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res =
          await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.limit(1)]
          );

        if (res.documents.length) {
          const doc = res.documents[0];

          setDocId(doc.$id);

          setForm({
            aboutTitle:
              doc.aboutTitle || "",
            aboutDescription:
              doc.aboutDescription || "",
            missionTitle:
              doc.missionTitle || "",
            missionContent:
              doc.missionContent || "",
            visionTitle:
              doc.visionTitle || "",
            visionContent:
              doc.visionContent || "",
            aboutImageTop:
              doc.aboutImageTop || "",
            aboutImageCenter:
              doc.aboutImageCenter || "",
            aboutImageBottom:
              doc.aboutImageBottom || "",
          });
        }
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (
    file,
    field
  ) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Max image size is 5MB");
      return;
    }

    setUploading(true);

    try {
      const uploaded =
        await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );

      const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploaded.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      setForm((prev) => ({
        ...prev,
        [field]: fileUrl,
      }));

      alert("Image Uploaded ✅");
    } catch (err) {
      console.log(err);
      alert(
        "Upload Failed. Check bucket permissions."
      );
    }

    setUploading(false);
  };

  /* ================= SAVE ================= */
  const saveAbout = async () => {
    try {
      setSaving(true);

      if (!docId) {
        const created =
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            form
          );

        setDocId(created.$id);
      } else {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          docId,
          form
        );
      }

      alert("Saved Successfully ✅");
    } catch (err) {
      console.log(err);
      alert(
        "Save Failed. Check collection attributes."
      );
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">

          <div>
            <h1 className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-5xl font-black text-transparent">
              About CMS
            </h1>

            <p className="mt-2 text-gray-400">
              Manage About Section
            </p>
          </div>

          <button
            onClick={saveAbout}
            disabled={saving}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 font-semibold transition hover:scale-105"
          >
            <FiSave />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* LEFT */}
          <div className="rounded-[35px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">

            <input
              value={form.aboutTitle}
              onChange={(e) =>
                setForm({
                  ...form,
                  aboutTitle:
                    e.target.value,
                })
              }
              placeholder="About Title"
              className="mb-5 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />

            <textarea
              rows={6}
              value={
                form.aboutDescription
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  aboutDescription:
                    e.target.value,
                })
              }
              placeholder="About Description"
              className="mb-5 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />

            <input
              value={form.missionTitle}
              onChange={(e) =>
                setForm({
                  ...form,
                  missionTitle:
                    e.target.value,
                })
              }
              placeholder="Mission Title"
              className="mb-4 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />

            <textarea
              rows={4}
              value={
                form.missionContent
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  missionContent:
                    e.target.value,
                })
              }
              placeholder="Mission Content"
              className="mb-5 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />

            <input
              value={form.visionTitle}
              onChange={(e) =>
                setForm({
                  ...form,
                  visionTitle:
                    e.target.value,
                })
              }
              placeholder="Vision Title"
              className="mb-4 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />

            <textarea
              rows={4}
              value={
                form.visionContent
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  visionContent:
                    e.target.value,
                })
              }
              placeholder="Vision Content"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4"
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <ImageCard
              title="Top Right Image"
              image={
                form.aboutImageTop
              }
              onUpload={(file) =>
                uploadImage(
                  file,
                  "aboutImageTop"
                )
              }
            />

            <ImageCard
              title="Center Image"
              image={
                form.aboutImageCenter
              }
              onUpload={(file) =>
                uploadImage(
                  file,
                  "aboutImageCenter"
                )
              }
            />

            <ImageCard
              title="Bottom Left Image"
              image={
                form.aboutImageBottom
              }
              onUpload={(file) =>
                uploadImage(
                  file,
                  "aboutImageBottom"
                )
              }
            />

            {uploading && (
              <p className="text-blue-300">
                Uploading...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CARD ================= */
function ImageCard({
  title,
  image,
  onUpload,
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">

      <div className="mb-4 flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <FiImage size={20} />
        </div>

        <h3 className="text-lg font-semibold">
          {title}
        </h3>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">

        {image ? (
          <img
            src={image}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-4 transition hover:bg-white/[0.06]">

        <FiUpload />

        Upload Image

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            onUpload(
              e.target.files[0]
            )
          }
        />
      </label>
    </div>
  );
}