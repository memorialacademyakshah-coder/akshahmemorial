"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { X, Briefcase, GraduationCap, Clock } from "lucide-react";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const JOBS_COLLECTION = "teacher_jobs";

export default function TeacherHiringPopup() {
  const [job, setJob] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    try {
      const popupClosed = sessionStorage.getItem(
        "teacherPopupClosed"
      );

      if (popupClosed === "true") {
        setLoading(false);
        return;
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION,
        [
          Query.equal("isActive", true),
          Query.equal("showPopup", true),
          Query.limit(1),
        ]
      );

      if (res.documents.length > 0) {
        setJob(res.documents[0]);
        setShow(true);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const closePopup = () => {
    sessionStorage.setItem(
      "teacherPopupClosed",
      "true"
    );

    setShow(false);
  };

  if (loading || !show || !job) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* Premium Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={closePopup}
      />

      {/* Floating Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full animate-pulse" />

      {/* Popup */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">

        {/* Top Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-600/20" />

        {/* Close */}
        <button
          onClick={closePopup}
          className="absolute right-5 top-5 z-20 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-red-500"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 p-8 md:p-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <Briefcase size={16} />
            We Are Hiring
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl md:text-5xl font-bold text-white leading-tight">
            {job.title}
          </h2>

          <p className="mt-3 text-blue-100 text-lg">
            Join Akshah Memorial Academy and help shape
            the future generation.
          </p>

          {/* Info Cards */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">

            {job.qualification && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-blue-200">
                  <GraduationCap size={18} />
                  Qualification
                </div>

                <p className="mt-2 text-white font-medium">
                  {job.qualification}
                </p>
              </div>
            )}

            {job.experience && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-blue-200">
                  <Clock size={18} />
                  Experience
                </div>

                <p className="mt-2 text-white font-medium">
                  {job.experience}
                </p>
              </div>
            )}

          </div>

          {/* Description */}
          {job.description && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">

              <h3 className="font-semibold text-white mb-2">
                Job Description
              </h3>

              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>

            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <Link
              href={`/career/${job.$id}`}
              className="group flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(59,130,246,0.5)]"
            >
              Apply Now →
            </Link>

            <button
              onClick={closePopup}
              className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              Maybe Later
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}