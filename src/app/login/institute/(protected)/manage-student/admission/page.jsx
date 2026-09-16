"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "student_admissions";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const STUDENTS_PER_PAGE = 15;

export default function AdmissionList() {
  const [students, setStudents] = useState([]);
  const router = useRouter();
  const [courseMap, setCourseMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const user = await account.get();

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("createdById", user.$id),
        Query.orderAsc("createdAt"),
        Query.limit(500)
      ]
    );

    setStudents(res.documents);

    loadSemesterCourseNames(res.documents);
  };

  const loadSemesterCourseNames = async (students) => {
    const ids = [
      ...new Set(
        students
          .filter(
            (s) =>
              s.courseType === "semester" &&
              s.courseName?.length > 20
          )
          .map((s) => s.courseName)
      )
    ];

    const map = {};

    for (const id of ids) {
      try {
        const course = await databases.getDocument(
          DATABASE_ID,
          "semester_courses",
          id
        );

        map[id] = course.courseName;
      } catch {
        map[id] = "Unknown";
      }
    }

    setCourseMap(map);
  };

  // DELETE STUDENT
  const deleteStudent = async (studentId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        studentName || "this student"
      }?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        studentId
      );

      // Remove deleted student from the current list
      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => student.$id !== studentId
        )
      );

      alert("Student deleted successfully.");

    } catch (error) {
      console.error("Error deleting student:", error);

      alert(
        "Failed to delete student. Please try again."
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const courseName =
      student.courseType === "semester" &&
      student.courseName?.length > 20
        ? courseMap[student.courseName] || ""
        : student.courseName || "";

    return (
      student.studentName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      student.rollNumber
        ?.toString()
        .includes(searchTerm) ||

      student.mobile
        ?.toString()
        .includes(searchTerm) ||

      courseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      student.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredStudents.length / STUDENTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * STUDENTS_PER_PAGE;

  const endIndex =
    startIndex + STUDENTS_PER_PAGE;

  const currentStudents =
    filteredStudents.slice(startIndex, endIndex);

  // Go to previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Go to next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // If deleting the last student on a page,
  // automatically move to the previous page.
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="p-10">

      {/* ================= HEADER ================= */}

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          LIST STUDENT ADMISSION
        </h1>

        <div className="mb-6">

          <input
            type="text"
            placeholder="Search by Name, Roll No, Mobile or Course..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full md:w-96 bg-[#121212] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500"
          />

        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              router.push(
                "/login/institute/manage-student/admission/add"
              )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ADD NEW STUDENT
          </button>

          <button
            onClick={() =>
              router.push(
                "/login/institute/manage-student/admission/bulk"
              )
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            BULK ADMISSION
          </button>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <table className="w-full border">

        <thead className="bg-yellow-200">

          <tr>

            <th className="border p-2">S/N</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Photo</th>
            <th className="border p-2">Batch</th>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Mobile</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Password</th>
            <th className="border p-2">Action</th>

          </tr>

        </thead>

        <tbody>

          {currentStudents.length === 0 ? (

            <tr>

              <td
                colSpan="11"
                className="text-center p-4"
              >
                No Data Found
              </td>

            </tr>

          ) : (

            currentStudents.map((item, index) => (

              <tr key={item.$id}>

                {/* S/N */}

                <td className="border p-2">
                  {startIndex + index + 1}
                </td>

                {/* STATUS */}

                <td className="border p-2">
                  {item.status}
                </td>

                {/* PHOTO */}

                <td className="border p-2">

                  {item.photoId ? (

                    <img
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${item.photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                      width="40"
                      alt={item.studentName || "Student"}
                    />

                  ) : (
                    "No Photo"
                  )}

                </td>

                {/* BATCH */}

                <td className="border p-2">
                  {item.batch}
                </td>

                {/* STUDENT NAME */}

                <td className="border p-2">
                  {item.studentName}
                </td>

                {/* CLASS */}

                <td className="border p-2">
                  {item.className ||
                    item.courseName ||
                    "-"}
                </td>

                {/* MOBILE */}

                <td className="border p-2">
                  {item.mobile}
                </td>

                {/* COURSE */}

                <td className="border p-2">
                  {item.courseName || "-"}
                </td>

                {/* USERNAME */}

                <td className="border p-2">
                  {item.username || "-"}
                </td>

                {/* PASSWORD */}

                <td className="border p-2">
                  {item.password || "-"}
                </td>

                {/* ACTION */}

                <td className="border p-2 space-x-2">

                  {/* EDIT */}

                  <button
                    onClick={() =>
                      router.push(
                        `/login/institute/manage-student/admission/edit/${item.$id}`
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  {/* ADMISSION FORM */}

                  <button
                    onClick={() =>
                      router.push(
                        `/login/institute/manage-student/admission/form/${item.$id}`
                      )
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Admission Form
                  </button>

                  {/* ID CARD */}

                  <button
                    onClick={() =>
                      router.push(
                        `/login/institute/manage-student/admission/idcard/${item.$id}`
                      )
                    }
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    ID Card
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteStudent(
                        item.$id,
                        item.studentName
                      )
                    }
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {/* ================= PAGINATION ================= */}

      {filteredStudents.length > 0 && (

        <div className="flex items-center justify-between mt-6">

          {/* SHOWING INFORMATION */}

          <div className="text-gray-600">

            Showing{" "}
            <span className="font-semibold">
              {startIndex + 1}
            </span>
            {" - "}
            <span className="font-semibold">
              {Math.min(
                endIndex,
                filteredStudents.length
              )}
            </span>
            {" of "}
            <span className="font-semibold">
              {filteredStudents.length}
            </span>
            {" students"}

          </div>

          {/* PAGINATION BUTTONS */}

          <div className="flex items-center gap-2">

            {/* PREVIOUS */}

            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded border ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            {/* PAGE NUMBER */}

            <div className="px-4 py-2 bg-blue-600 text-white rounded">
              Page {currentPage} of {totalPages}
            </div>

            {/* NEXT */}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded border ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>

          </div>

        </div>

      )}

    </div>
  );
}