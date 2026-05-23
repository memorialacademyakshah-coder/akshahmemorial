"use client";

import { useEffect, useState } from "react";
import { databases, account, ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useParams } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function ManageSemesterCourse() {

  const params = useParams();
  const courseCode = params.courseCode;

  const [subjects, setSubjects] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [newSubjects, setNewSubjects] = useState({});
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchCourse();
  }, []);

  // FETCH COURSE
  const fetchCourse = async () => {

    const res = await databases.listDocuments(
      DATABASE_ID,
      "semester_courses",
      [Query.equal("courseCode", courseCode)]
    );

    setCourse(res.documents[0]);
  };

  // FETCH SUBJECTS
  const fetchSubjects = async () => {

    const res = await databases.listDocuments(
      DATABASE_ID,
      "semester_subjects",
      [Query.equal("courseCode", courseCode)]
    );

    setSubjects(res.documents);

    groupBySemester(res.documents);
  };

  // GROUP SUBJECTS
  const groupBySemester = (data) => {

    const groupedData = {};

    data.forEach((item) => {

      if (!groupedData[item.semesterNumber]) {
        groupedData[item.semesterNumber] = [];
      }

      groupedData[item.semesterNumber].push(item);
    });

    setGrouped(groupedData);
  };

  // ADD SEMESTER
  const addSemester = () => {

    const existing = Object.keys(grouped).map(Number);

    const next =
      existing.length > 0
        ? Math.max(...existing) + 1
        : 1;

    setGrouped({
      ...grouped,
      [next]: []
    });
  };

  // ADD SUBJECT INPUT
  const addSubjectInput = (sem) => {

    setNewSubjects((prev) => ({
      ...prev,
      [sem]: [
        ...(prev[sem] || []),
        {
          subjectName: "",
          objective: "",
          practical: ""
        }
      ]
    }));
  };

  // UPDATE INPUT
  const updateInput = (sem, index, field, value) => {

    const updated = [...(newSubjects[sem] || [])];

    updated[index][field] = value;

    setNewSubjects({
      ...newSubjects,
      [sem]: updated
    });
  };

  // SAVE SUBJECTS
  const saveSubjects = async (sem) => {

    const user = await account.get();

    const list = newSubjects[sem] || [];

    if (list.length === 0) {
      alert("Add at least one subject");
      return;
    }

    for (const sub of list) {

      // DUPLICATE CHECK
      const existing = await databases.listDocuments(
        DATABASE_ID,
        "semester_subjects",
        [
          Query.equal("courseCode", courseCode),
          Query.equal("semesterNumber", Number(sem)),
          Query.equal("subjectName", sub.subjectName)
        ]
      );

      if (existing.documents.length > 0) {

        alert(`Subject "${sub.subjectName}" already exists in Semester ${sem}`);

        continue;
      }

      // SAVE SUBJECT
      await databases.createDocument(
        DATABASE_ID,
        "semester_subjects",
        ID.unique(),
        {
          courseCode,
          semesterNumber: Number(sem),
          subjectName: sub.subjectName,
          objectiveMarks: Number(sub.objective),
          practicalMarks: Number(sub.practical),
          totalMarks:
            Number(sub.objective) + Number(sub.practical),
          createdById: user.$id
        }
      );
    }

    // UPDATE SEMESTERS
    const allSemesters = [
      ...Object.keys(grouped).map(Number),
      Number(sem)
    ];

    const maxSemester = Math.max(...allSemesters);

    const courseRes = await databases.listDocuments(
      DATABASE_ID,
      "semester_courses",
      [Query.equal("courseCode", courseCode)]
    );

    const courseDoc = courseRes.documents[0];

    if (courseDoc) {

      await databases.updateDocument(
        DATABASE_ID,
        "semester_courses",
        courseDoc.$id,
        {
          totalSemesters: maxSemester
        }
      );
    }

    alert(`Semester ${sem} saved`);

    setNewSubjects({});

    fetchSubjects();

    fetchCourse();
  };

  return (

    <div className="min-h-screen bg-[#0b0b0f] text-white p-3 sm:p-5 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">

            Manage Course:
            <span className="text-orange-400 ml-2">
              {courseCode}
            </span>

          </h1>

          {course && (

            <p className="text-gray-400 mt-2 text-sm sm:text-base break-words">
              {course.courseName}
            </p>

          )}

        </div>

        <button
          onClick={addSemester}
          className="bg-orange-500 hover:bg-orange-600 transition px-4 py-3 rounded-lg text-black font-semibold w-full sm:w-auto"
        >
          ➕ Add Semester
        </button>

      </div>

      {/* SEMESTERS */}
      <div className="space-y-6">

        {Object.keys(grouped)
          .sort((a, b) => a - b)
          .map((sem) => (

            <div
              key={sem}
              className="bg-[#121212] border border-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg"
            >

              {/* SEM HEADER */}
              <h2 className="text-xl sm:text-2xl text-orange-400 font-semibold mb-5">
                Semester {sem}
              </h2>

              {/* EXISTING SUBJECTS */}
              <div className="space-y-2 mb-5">

                {grouped[sem]?.map((sub, i) => (

                  <div
                    key={i}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm sm:text-base text-gray-300 break-words"
                  >

                    <div className="font-medium">
                      {sub.subjectName}
                    </div>

                    <div className="text-gray-400 mt-1 text-xs sm:text-sm">

                      Obj:
                      <span className="text-white ml-1 mr-3">
                        {sub.objectiveMarks}
                      </span>

                      Prac:
                      <span className="text-white ml-1">
                        {sub.practicalMarks}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

              {/* NEW SUBJECT INPUTS */}
              <div className="space-y-4">

                {(newSubjects[sem] || []).map((sub, i) => (

                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >

                    <input
                      placeholder="Subject Name"
                      className="input"
                      onChange={(e) =>
                        updateInput(
                          sem,
                          i,
                          "subjectName",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      placeholder="Objective"
                      className="input"
                      onChange={(e) =>
                        updateInput(
                          sem,
                          i,
                          "objective",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      placeholder="Practical"
                      className="input"
                      onChange={(e) =>
                        updateInput(
                          sem,
                          i,
                          "practical",
                          e.target.value
                        )
                      }
                    />

                  </div>

                ))}

              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  onClick={() => addSubjectInput(sem)}
                  className="bg-gray-700 hover:bg-gray-600 transition px-4 py-3 rounded-lg w-full sm:w-auto"
                >
                  + Add Subject
                </button>

                <button
                  onClick={() => saveSubjects(sem)}
                  className="bg-green-500 hover:bg-green-600 transition px-4 py-3 rounded-lg text-black font-semibold w-full sm:w-auto"
                >
                  Save Semester
                </button>

              </div>

            </div>

          ))}

      </div>

      <style jsx>{`
        .input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 10px;
          color: white;
          width: 100%;
          outline: none;
          transition: 0.3s;
        }

        .input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 1px #f97316;
        }
      `}</style>

    </div>
  );
}