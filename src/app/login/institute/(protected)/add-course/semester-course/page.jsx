"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function SemesterCourseSelectionPage() {

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] =
    useState([]);

  const [addedCourses, setAddedCourses] =
    useState([]);

  const [examFee, setExamFee] = useState(0);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const LIMIT = 20;

  useEffect(() => {

    fetchCourses();
    fetchAddedCourses();
    fetchPlan();

  }, []);

  // FETCH MASTER COURSES
  const fetchCourses = async (
    pageNumber = 0
  ) => {

    try {

      const res =
        await databases.listDocuments(
          DATABASE_ID,
          "semester_courses_master",
          [
            Query.limit(LIMIT),
            Query.offset(pageNumber * LIMIT),
            Query.orderDesc("$createdAt"),
          ]
        );

      const sorted =
        res.documents.sort((a, b) => {

          const numA =
            parseInt(
              a.courseCode.replace(/\D/g, "")
            ) || 0;

          const numB =
            parseInt(
              b.courseCode.replace(/\D/g, "")
            ) || 0;

          return numA - numB;
        });

      setCourses(sorted);

      setFilteredCourses(sorted);

    } catch (error) {

      console.log(error);
    }
  };

  // FETCH PLAN
  const fetchPlan = async () => {

    try {

      const user = await account.get();

      const res =
        await databases.listDocuments(
          DATABASE_ID,
          "franchise_approved",
          [
            Query.equal(
              "email",
              user.email
            ),
          ]
        );

      const plan =
        res.documents[0]?.plan;

      const planRes =
        await databases.listDocuments(
          DATABASE_ID,
          "franchise_plans",
          [
            Query.equal(
              "name",
              plan
            ),
          ]
        );

      const fee =
        planRes.documents[0]?.amount || 0;

      setExamFee(fee);

    } catch (error) {

      console.log(error);
    }
  };

  // FETCH ADDED COURSES
  const fetchAddedCourses = async () => {

    try {

      const user = await account.get();

      const res =
        await databases.listDocuments(
          DATABASE_ID,
          "franchise_semester_courses",
          [
            Query.equal(
              "franchiseEmail",
              user.email
            ),
          ]
        );

      const ids =
        res.documents.map(
          (c) => c.courseId
        );

      setAddedCourses(ids);

    } catch (error) {

      console.log(error);
    }
  };

  // SEARCH
  useEffect(() => {

    const filtered =
      courses.filter((course) =>

        course.courseName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        course.courseCode
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    setFilteredCourses(filtered);

  }, [search, courses]);

  // NEXT PAGE
  const nextPage = () => {

    const next = page + 1;

    setPage(next);

    fetchCourses(next);
  };

  // PREVIOUS PAGE
  const prevPage = () => {

    if (page === 0) return;

    const prev = page - 1;

    setPage(prev);

    fetchCourses(prev);
  };

  return (

    <div className="min-h-screen bg-[#07070a] text-white relative overflow-hidden p-3 sm:p-5 lg:p-10">

      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 blur-[140px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">

            Semester Course Selection

          </h1>

          <p className="text-gray-400 mt-3 text-sm sm:text-base">

            Select semester courses and configure fees

          </p>

        </div>

        {/* SEARCH */}
        <div className="glass-card mb-6">

          <input
            type="text"
            placeholder="Search by course name or code..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="input"
          />

        </div>

        {/* TABLE */}
        <div className="glass-card overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="table-head">

                  <th className="th">
                    Course Code
                  </th>

                  <th className="th">
                    Course Name
                  </th>

                  <th className="th">
                    Duration
                  </th>

                  <th className="th">
                    Semesters
                  </th>

                  <th className="th">
                    Exam Fee
                  </th>

                  <th className="th">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCourses.map(
                  (course) => {

                    const isAdded =
                      addedCourses.includes(
                        course.$id
                      );

                    return (

                      <tr
                        key={course.$id}
                        className="table-row"
                      >

                        <td className="td text-orange-400 font-bold">

                          {course.courseCode}

                        </td>

                        <td className="td min-w-[260px]">

                          {course.courseName}

                        </td>

                        <td className="td">

                          {course.duration}

                        </td>

                        <td className="td">

                          <span className="semester-badge">

                            {
                              course.totalSemesters
                            }{" "}
                            Semester

                          </span>

                        </td>

                        <td className="td text-green-400 font-bold">

                          ₹{examFee}

                        </td>

                        <td className="td">

                          {isAdded ? (

                            <span className="added-badge">

                              Already Added

                            </span>

                          ) : (

                            <Link
                            href={`/login/institute/add-course/semester-course/select/${course.$id}?name=${encodeURIComponent(course.courseName)}&code=${encodeURIComponent(course.courseCode)}&duration=${encodeURIComponent(course.duration)}&semester=${course.totalSemesters}`}
                              className="add-btn"
                            >

                              Add Course

                            </Link>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">

          <button
            onClick={prevPage}
            disabled={page === 0}
            className="pagination-btn disabled:opacity-40"
          >

            Previous

          </button>

          <div className="text-gray-400">

            Page {page + 1}

          </div>

          <button
            onClick={nextPage}
            className="pagination-btn"
          >

            Next

          </button>

        </div>

      </div>

      <style jsx>{`

        .glass-card {
          background: rgba(255,255,255,0.06);

          backdrop-filter: blur(18px);

          border: 1px solid rgba(255,255,255,0.08);

          border-radius: 24px;

          padding: 20px;

          box-shadow:
            0 8px 32px rgba(0,0,0,0.35);
        }

        .input {
          width: 100%;

          background: rgba(255,255,255,0.06);

          border: 1px solid rgba(255,255,255,0.08);

          padding: 15px;

          border-radius: 16px;

          color: white;

          outline: none;

          transition: 0.3s;
        }

        .input:focus {
          border-color: #f97316;

          box-shadow:
            0 0 20px rgba(249,115,22,0.25);
        }

        .table-head {
          background: rgba(249,115,22,0.12);

          border-bottom:
            1px solid rgba(255,255,255,0.08);
        }

        .th {
          padding: 18px;

          text-align: left;

          color: #fdba74;

          font-size: 14px;

          font-weight: 700;

          white-space: nowrap;
        }

        .td {
          padding: 18px;

          border-bottom:
            1px solid rgba(255,255,255,0.06);

          white-space: nowrap;
        }

        .table-row {
          transition: 0.3s;
        }

        .table-row:hover {
          background:
            rgba(255,255,255,0.04);
        }

        .semester-badge {
          background:
            rgba(59,130,246,0.15);

          color: #93c5fd;

          padding: 8px 12px;

          border-radius: 12px;

          font-size: 13px;

          font-weight: 700;

          border:
            1px solid rgba(59,130,246,0.2);
        }

        .added-badge {
          background:
            rgba(34,197,94,0.15);

          color: #86efac;

          padding: 10px 16px;

          border-radius: 14px;

          font-size: 14px;

          font-weight: 700;

          border:
            1px solid rgba(34,197,94,0.2);
        }

        .add-btn {
          background:
            linear-gradient(
              135deg,
              #f97316,
              #ec4899
            );

          padding: 12px 18px;

          border-radius: 14px;

          color: white;

          font-weight: 700;

          transition: 0.3s;

          display: inline-block;

          box-shadow:
            0 0 25px rgba(249,115,22,0.3);
        }

        .add-btn:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 0 35px rgba(249,115,22,0.45);
        }

        .pagination-btn {
          background:
            rgba(255,255,255,0.08);

          border:
            1px solid rgba(255,255,255,0.08);

          padding: 12px 22px;

          border-radius: 14px;

          transition: 0.3s;
        }

        .pagination-btn:hover {
          background:
            rgba(255,255,255,0.12);
        }

        @media (max-width: 640px) {

          .glass-card {
            padding: 15px;
          }

          .th,
          .td {
            padding: 14px;
          }
        }

      `}</style>

    </div>
  );
}