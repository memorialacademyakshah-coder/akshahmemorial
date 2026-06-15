"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";


const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION = "student_admissions";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function HallTicketPage() {

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);

  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reportingTime, setReportingTime] = useState("");
  const [duration, setDuration] = useState("");
  const [searchTerm, setSearchTerm] = useState("");   
  const [appliedStudents, setAppliedStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  // ✅ LOAD STUDENTS
  const loadStudents = async () => {

    try {

      const user = await account.get();

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION,
        [
          Query.equal("createdById", user.$id),
          Query.orderAsc("$createdAt"),
           Query.limit(300)
        ]
      );

      setStudents(res.documents);

    } catch (error) {
      console.log("Error loading students:", error);
    }

  };

  // ✅ SELECT STUDENT
  const toggleStudent = (id) => {

    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }

  };

  // ✅ GENERATE HALL TICKET
  const generateHallTicket = async () => {

    try {

      // 🔐 CHECK USER
      let user;
      try {
        user = await account.get();
      } catch {
        alert("Session expired. Please login again");
        return;
      }

      // ✅ FETCH FRANCHISE (FIXED)
      let franchise;

      try {

        const res = await databases.listDocuments(
          DATABASE_ID,
          "franchise_approved",
          [Query.equal("email", user.email)] // ✅ FIXED
        );

        if (!res.documents.length) {
          alert("Franchise not found");
          return;
        }

        franchise = res.documents[0];

      } catch (err) {
        console.log("FRANCHISE ERROR:", err);
        alert("Error fetching franchise");
        return;
      }

      // ✅ FILTER STUDENTS
      const selectedStudents = students
        .filter(s => selected.includes(s.$id))
      .map(s => ({
  ...s,
  username: s.rollNumber || s.studentName,
  password: s.aadhar?.slice(-4) || "1234567890",

  signatureId: s.signatureId, // ✅ MUST BE HERE
  duration: s.duration
}))

      if (selectedStudents.length === 0) {
        alert("Select at least one student");
        return;
      }

      // Mark selected students as applied
setAppliedStudents(prev => [...new Set([...prev, ...selected])]);
setSelected([]);

      // ✅ SAVE TO LOCAL STORAGE
      localStorage.setItem(
        "hallticketStudents",
        JSON.stringify(selectedStudents)
      );

      localStorage.setItem(
        "hallticketExam",
        JSON.stringify({
          examDate,
          startTime,
          endTime,
          reportingTime,
          duration
        })
      );

      localStorage.setItem(
        "hallticketFranchise",
        JSON.stringify(franchise)
      );


      // ✅ OPEN PRINT PAGE
      window.open(
        "/login/institute/student-exam/hall-ticket/print",
        "_blank"
      );

    } catch (error) {

      console.error("HALL TICKET ERROR:", error);
      alert("Failed to generate hall ticket");

    }

  };


const filteredStudents = students.filter((student) =>
  student.studentName
    ?.toLowerCase()
    .includes(searchTerm.toLowerCase()) ||
  student.mobile
    ?.toString()
    .includes(searchTerm) ||
  student.rollNumber
    ?.toString()
    .includes(searchTerm)
);
  return (

    <div className="p-10 bg-black min-h-screen text-white">

      <h1 className="text-2xl font-bold mb-6">
        Hall Ticket Generator
      </h1>

      {/* EXAM DETAILS */}
      <div className="bg-[#121212] border border-gray-800 p-6 rounded mb-6">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

  {/* EXAM DATE */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-orange-400">
      Exam Date
    </label>

    <input
      type="date"
      value={examDate}
      onChange={(e) => setExamDate(e.target.value)}
      className="border p-2 bg-black text-white w-full"
    />
  </div>

  {/* START TIME */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-orange-400">
      Start Time
    </label>

    <input
      type="time"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      className="border p-2 bg-black text-white w-full"
    />
  </div>

  {/* END TIME */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-orange-400">
      End Time
    </label>

    <input
      type="time"
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      className="border p-2 bg-black text-white w-full"
    />
  </div>

  {/* REPORTING TIME */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-orange-400">
      Reporting Time
    </label>

    <input
      type="time"
      value={reportingTime}
      onChange={(e) => setReportingTime(e.target.value)}
      className="border p-2 bg-black text-white w-full"
    />
  </div>

  {/* DURATION */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-orange-400">
      Exam Duration
    </label>

    <input
      placeholder="e.g. 2 Hours"
      value={duration}
      onChange={(e) => setDuration(e.target.value)}
      className="border p-2 bg-black text-white w-full"
    />
  </div>

</div>

        <button
          onClick={generateHallTicket}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded font-semibold"
        >
          Generate Hall Ticket
        </button>

      </div>

      <div className="mb-4">
  <input
    type="text"
    placeholder="Search student by name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full md:w-96 border border-gray-700 bg-black text-white p-3 rounded"
  />
</div>

      {/* STUDENT TABLE */}
      <table className="w-full border border-gray-800">

        <thead>
          <tr className="bg-orange-500 text-black">
            <th className="p-2">Select</th>
            <th className="p-2">Photo</th>
            <th className="p-2">Name</th>
            <th className="p-2">Course</th>
            <th className="p-2">Fees</th>
            <th className="p-2">Exam Mode</th>
            <th className="p-2">Balance</th>
          </tr>
        </thead>

        <tbody>

         {filteredStudents.map(s => {

            const photo = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${s.photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

            return (

              <tr key={s.$id} className="border-t hover:bg-[#1a1a1a]">

<td className="p-2 text-center">
  {appliedStudents.includes(s.$id) ? (
    <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
      Applied
    </span>
  ) : (
    <input
      type="checkbox"
      checked={selected.includes(s.$id)}
      onChange={() => toggleStudent(s.$id)}
      className="accent-orange-500 w-5 h-5"
    />
  )}
</td>

                <td className="p-2">
                  <img src={photo} className="w-12 h-12 rounded-full" />
                </td>

                <td className="p-2">{s.studentName}</td>
                <td className="p-2">{s.courseName}</td>
                <td className="p-2">{s.courseFees}</td>
                <td className="p-2">{s.examMode}</td>
                <td className="p-2 text-red-400">{s.balance}</td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

}