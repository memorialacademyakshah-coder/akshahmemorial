"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function SemesterCourseList() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {

    const user = await account.get();

    const res = await databases.listDocuments(
      DATABASE_ID,
      "semester_courses",
      [
        Query.equal("createdById", user.$id),
        Query.orderDesc("$createdAt")
      ]
    );

    setCourses(res.documents);
  };

  return (

    <div className="min-h-screen bg-[#0b0b0f] text-white p-3 sm:p-5 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">

            Semester Courses

          </h1>

          <Link
            href="/login/institute/add-course/semester-course/add"
            className="btn-glow text-center w-full sm:w-auto"
          >
            + Add Course
          </Link>

        </div>

        {/* TABLE CARD */}
        <div className="cool-card overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-xs sm:text-sm">

              <thead className="text-gray-400 border-b border-gray-700">

                <tr>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    #
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Code
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Name
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Duration
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Sem
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Exam Fees
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Course Fees
                  </th>

                  <th className="p-3 sm:p-4 text-left whitespace-nowrap">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {courses.map((c, i) => (

                  <tr
                    key={c.$id}
                    className="row"
                  >

                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      {i + 1}
                    </td>

                    <td className="p-3 sm:p-4 text-orange-400 font-semibold whitespace-nowrap">
                      {c.courseCode}
                    </td>

                    <td className="p-3 sm:p-4 min-w-[220px] break-words">
                      {c.courseName}
                    </td>

                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      {c.duration}
                    </td>

                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      {c.totalSemesters}
                    </td>

                    <td className="p-3 sm:p-4 text-green-400 font-semibold whitespace-nowrap">
                      ₹{c.examFees}
                    </td>

                    <td className="p-3 sm:p-4 text-blue-400 font-semibold whitespace-nowrap">
                      ₹{c.courseFees || 0}
                    </td>

                    <td className="p-3 sm:p-4">

                      <Link
                        href={`/login/institute/add-course/semester-course/${c.courseCode}`}
                        className="bg-orange-500 hover:bg-orange-600 transition px-3 py-2 rounded-lg text-black text-xs sm:text-sm font-medium inline-block whitespace-nowrap"
                      >
                        Add Semester
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <style jsx>{`

        .cool-card {
          background: rgba(255,255,255,0.05);

          border: 1px solid rgba(255,255,255,0.1);

          border-radius: 16px;

          backdrop-filter: blur(10px);
        }

        .row {
          border-bottom: 1px solid rgba(255,255,255,0.06);

          transition: 0.25s;
        }

        .row:hover {
          background: rgba(255,255,255,0.05);
        }

        th,
        td {
          vertical-align: middle;
        }

        .btn-glow {
          background: linear-gradient(
            135deg,
            #f97316,
            #fb923c
          );

          padding: 12px 18px;

          border-radius: 10px;

          box-shadow: 0 0 15px rgba(249,115,22,0.6);

          font-weight: 600;

          transition: 0.3s;
        }

        .btn-glow:hover {
          box-shadow: 0 0 25px rgba(249,115,22,0.9);
        }

      `}</style>

    </div>
  );
}