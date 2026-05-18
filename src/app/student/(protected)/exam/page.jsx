"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const ADMISSION_COLLECTION =
  "student_admissions";

export default function StudentExamDashboard() {

  const router = useRouter();

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadStudent();

  }, []);

  const loadStudent = async () => {

    try {

      const localStudent =
        JSON.parse(
          localStorage.getItem("student")
        );

      if (!localStudent) {

        router.push("/student/login");
        return;

      }

      const res =
        await databases.getDocument(
          DATABASE_ID,
          ADMISSION_COLLECTION,
          localStudent.$id
        );

      setStudent(res);

    } catch (err) {

      console.log(err);

    }

    setLoading(false);
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>

          <p className="text-lg">
            Loading Exam Dashboard...
          </p>

        </div>

      </div>

    );
  }

  // =========================
  // NO STUDENT
  // =========================
  if (!student) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Student Not Found

      </div>

    );
  }

  const isOnline =
    student.examMode === "online";

  const isOffline =
    student.examMode === "offline";

  const examStarted =
    student.onlineExamStarted === true;
    const examSubmitted =
  student.examSubmitted === true;

  return (

    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-8 rounded-3xl shadow-2xl mb-8">

        <h1 className="text-3xl font-bold mb-2">

          Welcome,
          {" "}
          {student.studentName}

        </h1>

        <p className="text-white/80">

          Online Examination Portal

        </p>

      </div>

      {/* STUDENT INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Course
          </p>

          <h2 className="text-xl font-semibold">

            {student.courseName}

          </h2>

        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Course Type
          </p>

          <h2 className="text-xl font-semibold capitalize">

            {student.courseType}

          </h2>

        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Exam Mode
          </p>

          <h2 className="text-xl font-semibold capitalize">

            {student.examMode || "Not Selected"}

          </h2>

        </div>

      </div>

      {/* EXAM STATUS CARD */}
      <div className="bg-[#121212] border border-gray-800 rounded-3xl p-8 shadow-xl">

        {/* OFFLINE */}
        {isOffline && (

          <div className="text-center">

            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">

              <span className="text-5xl">
                📝
              </span>

            </div>

            <h2 className="text-3xl font-bold mb-3 text-yellow-400">

              Offline Examination

            </h2>

            <p className="text-gray-400">

              Your examination will be conducted offline by your institute.

            </p>

          </div>

        )}

        {/* ONLINE BUT NOT STARTED */}
        {isOnline && !examStarted && (

          <div className="text-center">

            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">

              <span className="text-5xl">
                🔒
              </span>

            </div>

            <h2 className="text-3xl font-bold mb-3 text-red-400">

              Exam Not Started

            </h2>

            <p className="text-gray-400 mb-6">

              Please wait until the examiner starts your online examination.

            </p>

            <button
              disabled
              className="bg-gray-700 text-gray-400 px-8 py-3 rounded-2xl cursor-not-allowed"
            >

              Waiting For Examiner

            </button>

          </div>

        )}

        {/* ONLINE STARTED */}

{isOnline && examStarted && !examSubmitted && (

          <div className="text-center">

            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">

              <span className="text-5xl">
                🚀
              </span>

            </div>

            <h2 className="text-3xl font-bold mb-3 text-green-400">

              Online Exam Started

            </h2>

            <p className="text-gray-400 mb-8">

              Your examination is now active.
              Click below to begin your exam.

            </p>

            <button
              onClick={() =>
                router.push("/student/exam/start")
              }
              className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-black font-bold px-10 py-4 rounded-2xl shadow-2xl text-lg"
            >

              Start Exam

            </button>

          </div>

        )}


{/* EXAM SUBMITTED */}
{isOnline && examSubmitted && (

  <div className="text-center">

    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">

      <span className="text-5xl">
        ✅
      </span>

    </div>

    <h2 className="text-3xl font-bold mb-3 text-green-400">

      Exam Already Submitted

    </h2>

    <p className="text-gray-400 mb-6">

      Your online examination has already been submitted successfully.

    </p>

    <button
      disabled
      className="bg-gray-700 text-gray-400 px-8 py-3 rounded-2xl cursor-not-allowed"
    >

      Submission Completed

    </button>

  </div>

)}
        {/* NO MODE */}
        {!student.examMode && (

          <div className="text-center">

            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">

              <span className="text-5xl">
                ⏳
              </span>

            </div>

            <h2 className="text-3xl font-bold mb-3">

              Exam Pending

            </h2>

            <p className="text-gray-400">

              Your institute has not assigned an exam mode yet.

            </p>

          </div>

        )}

      </div>

    </div>

  );
}