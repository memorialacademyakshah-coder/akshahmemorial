"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

import { account } from "@/lib/appwrite";

const user = await account.get();

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const RESULT_COLLECTION = "exam_results";
const CERT_COLLECTION = "certificates";

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;


export default function CertificatePage() {

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  // LOAD RESULTS
  const loadResults = async () => {

    try {

      // RESULTS
      const res = await databases.listDocuments(
        DATABASE_ID,
        RESULT_COLLECTION
      );

      const passedStudents = res.documents.filter(
        (r) => r.grade !== "F"
      );

      // EXISTING CERTIFICATES
      const certRes = await databases.listDocuments(
        DATABASE_ID,
        CERT_COLLECTION
      );

      // APPLIED IDS
      const alreadyApplied = certRes.documents.map(
        (c) => `${c.studentId}-${c.semesterNumber}`
      );

      // FINAL DATA
      const finalResults = passedStudents.map((r) => ({
        ...r,
        alreadyApplied: alreadyApplied.includes(
          `${r.studentId}-${Number(r.semesterNumber)}`
        )
      }));

      setResults(finalResults);

    } catch (err) {

      console.log(err);

    }
  };

  // TOGGLE SELECT
  const toggleSelect = (id) => {

    if (selected.includes(id)) {

      setSelected(
        selected.filter((s) => s !== id)
      );

    } else {

      setSelected([...selected, id]);

    }
  };

  // APPLY CERTIFICATE
  const applyCertificate = async () => {

    try {

      const selectedResults = selected.map((id) =>
        results.find((r) => r.$id === id)
      );

      for (const item of selectedResults) {

        const fullResult = await databases.getDocument(
          DATABASE_ID,
          RESULT_COLLECTION,
          item.$id
        );

        const sem = Number(
          fullResult.semesterNumber
        );

        if (!sem) {

          alert("Semester missing in result");

          continue;
        }

        const existing =
          await databases.listDocuments(
            DATABASE_ID,
            CERT_COLLECTION,
            [
              Query.equal(
                "studentId",
                fullResult.studentId
              ),

              Query.equal(
                "semesterNumber",
                sem
              )
            ]
          );

        if (existing.documents.length > 0)
          continue;

        await databases.createDocument(
          DATABASE_ID,
          CERT_COLLECTION,
          ID.unique(),
          {
            studentId: fullResult.studentId,
            studentName: fullResult.studentName,
            course: fullResult.course,
            photoId: fullResult.photoId,
            marks: fullResult.totalMarks,
            grade: fullResult.grade,
            semesterNumber: sem,
            marksArray: fullResult.marksArray,
            courseType: fullResult.courseType,
            certificateNo:
              "AKSMA-" + Date.now(),
            status: "pending",
            createdAt:
              new Date().toISOString()
          }
        );
      }

      setAppliedIds((prev) => [
        ...prev,
        ...selected
      ]);

      alert("Certificate request sent to admin");

      setSelected([]);

    } catch (err) {

      console.log("Certificate Error:", err);

      alert(err.message);
    }
  };

  // PHOTO URL
  const getPhoto = (photoId) => {

    if (!photoId) return null;

    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  return (

    <div className="min-h-screen bg-gray-100 p-3 sm:p-5 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
          ALL EXAMS RESULTS
        </h1>

        <button
          onClick={applyCertificate}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg w-full sm:w-auto"
        >
          Apply For Certificate
        </button>

      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-5 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px] border-collapse text-xs sm:text-sm">

            <thead className="bg-yellow-200">

              <tr>

                <th className="border p-2 whitespace-nowrap"></th>

                <th className="border p-2 whitespace-nowrap">
                  #
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Photo
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Student
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Course
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Exam Mode
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Objective Marks
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Practical Marks
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Percentage
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Grade
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Result
                </th>

                <th className="border p-2 whitespace-nowrap">
                  Exam Date
                </th>

              </tr>

            </thead>

            <tbody>

              {results.map((r, index) => {

                const photoUrl = getPhoto(r.photoId);

                let objective = 0;
                let practical = 0;

                try {

                  const marks = JSON.parse(
                    r.marksArray || "[]"
                  );

                  marks.forEach((m) => {

                    objective += Number(
                      m.objective || 0
                    );

                    practical += Number(
                      m.practical || 0
                    );
                  });

                } catch {}

                return (

                  <tr
                    key={r.$id}
                    className="hover:bg-gray-50"
                  >

                    {/* CHECKBOX */}
                    <td className="border p-2 text-center">

                      {r.alreadyApplied ? (

                        <span className="text-red-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                          Applied
                        </span>

                      ) : (

                        <input
                          type="checkbox"
                          checked={selected.includes(r.$id)}
                          onChange={() =>
                            toggleSelect(r.$id)
                          }
                          className="w-4 h-4"
                        />

                      )}

                    </td>

                    {/* INDEX */}
                    <td className="border p-2 whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* PHOTO */}
                    <td className="border p-2">

                      {photoUrl && (

                        <img
                          src={photoUrl}
                          alt="student"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mx-auto"
                        />

                      )}

                    </td>

                    {/* STUDENT */}
                    <td className="border p-2 min-w-[180px] break-words">
                      {r.studentName}
                    </td>

                    {/* COURSE */}
                    <td className="border p-2 min-w-[200px] break-words">

                      {r.courseType === "semester" &&
                      r.course?.length > 20
                        ? "Semester Course"
                        : r.course}

                    </td>

                    {/* MODE */}
                    <td className="border p-2 whitespace-nowrap">
                      OFFLINE
                    </td>

                    {/* OBJECTIVE */}
                    <td className="border p-2 whitespace-nowrap">
                      {objective}
                    </td>

                    {/* PRACTICAL */}
                    <td className="border p-2 whitespace-nowrap">
                      {practical}
                    </td>

                    {/* PERCENTAGE */}
                    <td className="border p-2 whitespace-nowrap">
                      {r.percentage}
                    </td>

                    {/* GRADE */}
                    <td className="border p-2 whitespace-nowrap">
                      {r.grade}
                    </td>

                    {/* RESULT */}
                    <td className="border p-2 text-green-600 font-semibold whitespace-nowrap">
                      Passed
                    </td>

                    {/* DATE */}
                    <td className="border p-2 whitespace-nowrap">
                      {r.examDate || "-"}
                    </td>

                  </tr>

                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}