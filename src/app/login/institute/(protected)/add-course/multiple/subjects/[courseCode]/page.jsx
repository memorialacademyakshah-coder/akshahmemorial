"use client";

import { useEffect, useState } from "react";
import { databases, account, ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function SubjectPage() {

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params.courseId;
  const courseName = searchParams.get("name");
  const courseCode = searchParams.get("code");
  const courseDuration = searchParams.get("duration");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [courseFees, setCourseFees] = useState("");
  const [minimumFees, setMinimumFees] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {

    const res = await databases.listDocuments(
      DATABASE_ID,
      "subjects_master",
      [Query.equal("courseCode", courseCode)]
    );

    setSubjects(res.documents);
  };

  const toggleSubject = (name) => {

    setSelectedSubjects((prev) => {

      // REMOVE
      if (prev.includes(name)) {
        return prev.filter((s) => s !== name);
      }

      // LIMIT
      if (prev.length >= 10) {
        alert("You can select maximum 10 subjects");
        return prev;
      }

      // ADD
      return [...prev, name];
    });
  };

  const saveCourse = async () => {

    if (selectedSubjects.length === 0) {
      alert("Select at least one subject");
      return;
    }

    const user = await account.get();

    await databases.createDocument(
      DATABASE_ID,
      "franchise_multiple_courses",
      ID.unique(),
      {
        courseId,
        courseName,
        courseCode,
        subjects: selectedSubjects.join("||"),
        duration: courseDuration || "",
        courseFees: Number(courseFees),
        minimumFees: Number(minimumFees),
        franchiseEmail: user.email,
        createdById: user.$id,
        status: "Active"
      }
    );

    alert("Course Saved");

    router.push("/login/institute/add-course/multiple/list");
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-3 sm:p-5 lg:p-10 flex items-center justify-center">

      <div className="w-full max-w-2xl bg-[#121212] border border-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <div className="mb-6">

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">
            {courseName}
          </h1>

          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Select subjects and configure fees
          </p>

        </div>

        {/* SUBJECT LIST */}
        <div className="max-h-[350px] overflow-y-auto mb-6 space-y-2 pr-1">

          {subjects.map((s) => (

            <label
              key={s.$id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer border border-transparent hover:border-gray-700 transition"
            >

              <input
                type="checkbox"
                checked={selectedSubjects.includes(s.subjectName)}
                onChange={() => toggleSubject(s.subjectName)}
                className="accent-orange-500 mt-1 w-4 h-4 shrink-0"
              />

              <div className="flex justify-between items-start w-full gap-3">

                <span className="break-words text-sm sm:text-base">
                  {s.subjectName}
                </span>

                {selectedSubjects.includes(s.subjectName) && (

                  <span className="bg-orange-500 text-black px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0">

                    {selectedSubjects.indexOf(s.subjectName) + 1}

                  </span>

                )}

              </div>

            </label>

          ))}

        </div>

        {/* INPUTS */}
        <div className="space-y-4">

          <input
            type="number"
            placeholder="Course Fees"
            value={courseFees}
            onChange={(e) => setCourseFees(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-gray-700 focus:border-orange-500 outline-none text-sm sm:text-base"
          />

          <input
            type="number"
            placeholder="Minimum Fees"
            value={minimumFees}
            onChange={(e) => setMinimumFees(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-gray-700 focus:border-orange-500 outline-none text-sm sm:text-base"
          />

        </div>

        {/* SELECTED COUNT */}
        <div className="mt-4 text-sm text-gray-400">

          Selected Subjects:
          <span className="text-orange-400 font-semibold ml-2">
            {selectedSubjects.length}/10
          </span>

        </div>

        {/* BUTTON */}
        <button
          onClick={saveCourse}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 transition py-3 rounded-lg font-semibold text-black shadow-lg text-sm sm:text-base"
        >
          Save Course
        </button>

      </div>

    </div>
  );
}