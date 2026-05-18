"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { databases } from "@/lib/appwrite";
import {
  ID,
  Permission,
  Role,
  Query
} from "appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLLECTION_ID = "online_exam_questions";

export default function UploadOnlineExam() {

  const [file, setFile] = useState(null);

  const [courseType, setCourseType] =
    useState("single");

  const [courseName, setCourseName] =
    useState("");

  const [semester, setSemester] =
    useState(1);

  const [subjects, setSubjects] =
    useState([]);

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ✅ AUTO LOAD SUBJECTS
  useEffect(() => {

    if (!courseName) return;

    loadSubjects();

  }, [courseName, semester]);

  const loadSubjects = async () => {

    try {

      // =========================
      // SINGLE / BEAUTY
      // =========================
      if (
        courseType === "single" ||
        courseType === "beauty"
      ) {

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            "student_admissions",
            [
              Query.equal(
                "courseName",
                courseName
              )
            ]
          );

        if (
          res.documents.length > 0 &&
          res.documents[0].subjects
        ) {

          const sub =
            res.documents[0].subjects;

          setSubjects([sub]);
          setSelectedSubject(sub);

        }

        return;
      }

      // =========================
      // MULTIPLE COURSE
      // =========================
      if (courseType === "multiple") {

        const res =
          await databases.listDocuments(
            DATABASE_ID,
            "student_admissions",
            [
              Query.equal(
                "courseName",
                courseName
              )
            ]
          );

        if (
          res.documents.length > 0 &&
          res.documents[0].subjects
        ) {

          let subjectList = [];

          if (
            res.documents[0].subjects.includes(
              "||"
            )
          ) {

            subjectList =
              res.documents[0].subjects
                .split("||")
                .map((s) => s.trim());

          } else {

            subjectList = [
              res.documents[0].subjects
            ];

          }

          setSubjects(subjectList);

          if (subjectList.length > 0) {
            setSelectedSubject(
              subjectList[0]
            );
          }
        }

        return;
      }

      // =========================
      // SEMESTER
      // =========================
      if (courseType === "semester") {

        const courseRes =
          await databases.listDocuments(
            DATABASE_ID,
            "semester_courses",
            [
              Query.equal(
                "courseName",
                courseName
              )
            ]
          );

        if (
          courseRes.documents.length === 0
        ) {
          return;
        }

        const courseCode =
          courseRes.documents[0]
            .courseCode;

        const semRes =
          await databases.listDocuments(
            DATABASE_ID,
            "semester_subjects",
            [
              Query.equal(
                "courseCode",
                courseCode
              ),

              Query.equal(
                "semesterNumber",
                Number(semester)
              )
            ]
          );

        const uniqueSubjects = [
          ...new Set(
            semRes.documents.map(
              (s) => s.subjectName
            )
          )
        ];

        setSubjects(uniqueSubjects);

        if (uniqueSubjects.length > 0) {
          setSelectedSubject(
            uniqueSubjects[0]
          );
        }
      }

    } catch (err) {

      console.log(err);

    }
  };

  const handleUpload = async () => {

    if (!file) {
      alert("Please Select Excel File");
      return;
    }

    if (!courseName) {
      alert("Please Enter Course Name");
      return;
    }

    if (!selectedSubject) {
      alert("No Subject Found");
      return;
    }

    setLoading(true);

    try {

      const data =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(data);

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const jsonData =
        XLSX.utils.sheet_to_json(sheet);

      for (let item of jsonData) {

        if (!item.Question) continue;

        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            question:
              item.Question || "",

            option1:
              item.Option1 || "",

            option2:
              item.Option2 || "",

            option3:
              item.Option3 || "",

            option4:
              item.Option4 || "",

            correctAnswer:
              item.Correct || "",

            // ✅ COURSE DETAILS
            courseType,

            courseName:
              courseName
                .toLowerCase()
                .trim(),

            subject:
              selectedSubject
                .toLowerCase()
                .trim(),

            semester:
              courseType === "semester"
                ? Number(semester)
                : 0,

            createdAt:
              new Date().toISOString(),
          },
          [
            Permission.read(Role.any()),
            Permission.write(Role.any()),
          ]
        );
      }

      alert(
        "Questions Uploaded Successfully"
      );

      setFile(null);

    } catch (err) {

      console.log(err);
      alert("Upload Failed");

    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">

      <div className="w-full max-w-3xl bg-[#121212] border border-gray-800 rounded-3xl p-8 shadow-2xl">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            Upload Online Exam Questions
          </h1>

          <p className="text-gray-400">
            Upload MCQ Questions Using Excel File
          </p>

        </div>

        {/* COURSE TYPE */}
        <div className="mb-5">

          <label className="block mb-2 font-semibold">
            Course Type
          </label>

          <select
            value={courseType}
            onChange={(e) =>
              setCourseType(
                e.target.value
              )
            }
            className="w-full bg-black border border-gray-700 px-4 py-3 rounded-xl outline-none focus:border-orange-500"
          >

            <option value="single">
              Single Course
            </option>

            <option value="multiple">
              Multiple Course
            </option>

            <option value="beauty">
              Beauty Course
            </option>

            <option value="semester">
              Semester Course
            </option>

          </select>

        </div>

        {/* COURSE NAME */}
        <div className="mb-5">

          <label className="block mb-2 font-semibold">
            Course Name
          </label>

          <input
            type="text"
            value={courseName}
            onChange={(e) =>
              setCourseName(
                e.target.value
              )
            }
            placeholder="Enter Course Name"
            className="w-full bg-black border border-gray-700 px-4 py-3 rounded-xl outline-none focus:border-orange-500"
          />

        </div>

        {/* SEMESTER */}
        {courseType ===
          "semester" && (

          <div className="mb-5">

            <label className="block mb-2 font-semibold">
              Semester
            </label>

            <select
              value={semester}
              onChange={(e) =>
                setSemester(
                  e.target.value
                )
              }
              className="w-full bg-black border border-gray-700 px-4 py-3 rounded-xl outline-none focus:border-orange-500"
            >

              {[1,2,3,4,5,6,7,8].map(
                (sem) => (

                  <option
                    key={sem}
                    value={sem}
                  >
                    Semester {sem}
                  </option>

                )
              )}

            </select>

          </div>

        )}

        {/* SUBJECT AUTO LOAD */}
        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Subject
          </label>

          <select
            value={selectedSubject}
            onChange={(e) =>
              setSelectedSubject(
                e.target.value
              )
            }
            className="w-full bg-black border border-gray-700 px-4 py-3 rounded-xl outline-none focus:border-orange-500"
          >

            {subjects.length === 0 ? (

              <option>
                No Subject Found
              </option>

            ) : (

              subjects.map((sub, i) => (

                <option
                  key={i}
                  value={sub}
                >
                  {sub}
                </option>

              ))

            )}

          </select>

        </div>

        {/* FILE */}
        <div className="mb-8">

          <label className="block mb-2 font-semibold">
            Upload Excel File
          </label>

          <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 bg-black text-center">

            <p className="text-gray-400 mb-4">

              {file
                ? file.name
                : "Select Excel File (.xlsx)"}

            </p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                setFile(
                  e.target.files[0]
                )
              }
              className="text-sm"
            />

          </div>

        </div>

        {/* EXCEL FORMAT */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 mb-8">

          <h2 className="font-semibold text-orange-400 mb-3">
            Excel Format
          </h2>

          <div className="text-sm text-gray-300 space-y-2">

            <p>Question</p>
            <p>Option1</p>
            <p>Option2</p>
            <p>Option3</p>
            <p>Option4</p>
            <p>Correct</p>

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-black font-bold py-4 rounded-2xl shadow-lg"
        >

          {loading
            ? "Uploading Questions..."
            : "Upload Questions"}

        </button>

      </div>

    </div>
  );
}