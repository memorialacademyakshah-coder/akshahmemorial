"use client";

import { useEffect, useState } from "react";

import {
  databases,
  account,
  ID,
} from "@/lib/appwrite";

import { Query } from "appwrite";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function MultipleSubjectPage() {

  const params = useParams();

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const courseId =
    params.courseId;

  const courseName =
    searchParams.get("name") || "";

  const courseCode =
    searchParams.get("code") || "";

  const duration =
    searchParams.get("duration") || "";

  const [subjects,
    setSubjects] =
    useState([]);

  const [selectedSubjects,
    setSelectedSubjects] =
    useState([]);

  const [courseFees,
    setCourseFees] =
    useState("");

  const [minimumFees,
    setMinimumFees] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {

    fetchSubjects();

  }, []);

  // FETCH SUBJECTS
  const fetchSubjects =
    async () => {

      try {

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            "multiple_subjects_master",
            [
              Query.equal(
                "courseCode",
                courseCode
              ),

              Query.orderAsc(
                "$createdAt"
              ),
            ]
          );

        setSubjects(
          res.documents
        );

      } catch (error) {

        console.log(error);
      }
    };

  // TOGGLE SUBJECT
  const toggleSubject =
    (subjectName) => {

      setSelectedSubjects(
        (prev) => {

          if (
            prev.includes(
              subjectName
            )
          ) {

            return prev.filter(
              (sub) =>
                sub !==
                subjectName
            );
          }

          return [
            ...prev,
            subjectName,
          ];
        }
      );
    };

  // SAVE COURSE
  const saveCourse =
    async () => {

      try {

        setLoading(true);

        if (
          selectedSubjects.length === 0
        ) {
          alert(
            "Select at least one subject"
          );

          return;
        }

        if (
          !courseFees ||
          !minimumFees
        ) {
          alert(
            "Please enter fees"
          );

          return;
        }

        const user =
          await account.get();

        // CHECK DUPLICATE
        const existing =
          await databases.listDocuments(
            DATABASE_ID,
            "franchise_multiple_courses",
            [
              Query.equal(
                "courseId",
                courseId
              ),

              Query.equal(
                "franchiseEmail",
                user.email
              ),
            ]
          );

        if (
          existing.documents.length > 0
        ) {

          alert(
            "Course already added"
          );

          return;
        }

        // SAVE COURSE
        await databases.createDocument(
          DATABASE_ID,
          "franchise_multiple_courses",
          ID.unique(),
          {
            courseId,

            courseCode,

            courseName,

            duration,

            selectedSubjects:
              selectedSubjects.join(
                "||"
              ),

            courseFees:
              Number(
                courseFees
              ),

            minimumFees:
              Number(
                minimumFees
              ),

            franchiseEmail:
              user.email,

            createdById:
              user.$id,

            status: "Active",
          }
        );

        alert(
          "Course Added Successfully"
        );

        router.push(
          "/login/institute/add-course/multiple/list"
        );

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#07070a] text-white relative overflow-hidden p-3 sm:p-5 lg:p-10">

      {/* BG */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 blur-[140px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">

            {courseName}

          </h1>

          <p className="text-gray-400 mt-3">

            Select subjects for this course

          </p>

        </div>

        {/* COURSE INFO */}
        <div className="glass-card mb-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="info-box">

              <span className="label">
                Course Code
              </span>

              <span className="value orange">

                {courseCode}

              </span>

            </div>

            <div className="info-box">

              <span className="label">
                Duration
              </span>

              <span className="value">

                {duration}

              </span>

            </div>

            <div className="info-box">

              <span className="label">
                Total Subjects
              </span>

              <span className="value blue">

                {subjects.length}

              </span>

            </div>

          </div>

        </div>

        {/* SUBJECTS */}
        <div className="glass-card">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">

              Select Subjects

            </h2>

            <div className="selected-box">

              {
                selectedSubjects.length
              } Selected

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {subjects.map(
              (subject) => {

                const isSelected =
                  selectedSubjects.includes(
                    subject.subjectName
                  );

                return (

                  <div
                    key={subject.$id}
                    onClick={() =>
                      toggleSubject(
                        subject.subjectName
                      )
                    }
                    className={`subject-card ${
                      isSelected
                        ? "active-card"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between gap-4 mb-4">

                      <div className="font-semibold text-lg">

                        {
                          subject.subjectName
                        }

                      </div>

                      <div className={`checkbox ${
                        isSelected
                          ? "checkbox-active"
                          : ""
                      }`}>

                        {isSelected &&
                          "✓"}

                      </div>

                    </div>

                    <div className="flex justify-between text-sm text-gray-400">

                      <span>

                        Theory:
                        {" "}
                        {
                          subject.theoryMarks
                        }

                      </span>

                      <span>

                        Practical:
                        {" "}
                        {
                          subject.practicalMarks
                        }

                      </span>

                      <span className="text-orange-300 font-bold">

                        Total:
                        {" "}
                        {
                          subject.totalMarks
                        }

                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* FEES */}
        <div className="glass-card mt-8">

          <h2 className="text-2xl font-bold mb-6">

            Fees Configuration

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              type="number"
              placeholder="Course Fees"
              value={courseFees}
              onChange={(e) =>
                setCourseFees(
                  e.target.value
                )
              }
              className="input"
            />

            <input
              type="number"
              placeholder="Minimum Fees"
              value={minimumFees}
              onChange={(e) =>
                setMinimumFees(
                  e.target.value
                )
              }
              className="input"
            />

          </div>

        </div>

        {/* SAVE */}
        <button
          onClick={saveCourse}
          disabled={loading}
          className="save-btn mt-8"
        >

          {loading
            ? "Saving..."
            : "💾 Save Course"}

        </button>

      </div>

      <style jsx>{`

        .glass-card {
          background:
            rgba(255,255,255,0.06);

          backdrop-filter:
            blur(18px);

          border:
            1px solid rgba(255,255,255,0.08);

          border-radius: 24px;

          padding: 22px;

          box-shadow:
            0 8px 32px rgba(0,0,0,0.35);
        }

        .subject-card {
          background:
            rgba(255,255,255,0.04);

          border:
            1px solid rgba(255,255,255,0.06);

          padding: 20px;

          border-radius: 20px;

          cursor: pointer;

          transition: 0.3s;
        }

        .subject-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(249,115,22,0.2);
        }

        .active-card {
          border-color:
            rgba(249,115,22,0.4);

          box-shadow:
            0 0 35px rgba(249,115,22,0.15);
        }

        .checkbox {
          width: 30px;

          height: 30px;

          border-radius: 10px;

          border:
            1px solid rgba(255,255,255,0.1);

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: 700;
        }

        .checkbox-active {
          background:
            linear-gradient(
              135deg,
              #f97316,
              #ec4899
            );

          border: none;
        }

        .input {
          width: 100%;

          background:
            rgba(255,255,255,0.06);

          border:
            1px solid rgba(255,255,255,0.08);

          padding: 15px;

          border-radius: 16px;

          color: white;

          outline: none;
        }

        .input:focus {
          border-color:
            #f97316;

          box-shadow:
            0 0 20px rgba(249,115,22,0.25);
        }

        .info-box {
          background:
            rgba(255,255,255,0.04);

          border:
            1px solid rgba(255,255,255,0.06);

          border-radius: 18px;

          padding: 18px;

          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .label {
          color: #9ca3af;

          font-size: 13px;
        }

        .value {
          font-size: 20px;

          font-weight: 700;
        }

        .orange {
          color: #fb923c;
        }

        .blue {
          color: #93c5fd;
        }

        .selected-box {
          background:
            rgba(249,115,22,0.15);

          border:
            1px solid rgba(249,115,22,0.2);

          color: #fdba74;

          padding: 10px 14px;

          border-radius: 14px;

          font-weight: 700;
        }

        .save-btn {
          width: 100%;

          background:
            linear-gradient(
              135deg,
              #f97316,
              #ec4899
            );

          padding: 18px;

          border-radius: 18px;

          font-size: 18px;

          font-weight: 700;

          transition: 0.3s;

          box-shadow:
            0 0 35px rgba(249,115,22,0.35);
        }

        .save-btn:hover {
          transform:
            translateY(-3px);
        }

      `}</style>

    </div>
  );
}