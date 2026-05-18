"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const BUCKET_ID = "6986e8a4001925504f6b";

export default function PrintCertificate() {

  const [student, setStudent] = useState(null);
  const [certificateNo, setCertificateNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {

    const data = localStorage.getItem("certificateStudent");
    if (!data) return;

    const parsed = JSON.parse(data);

    console.log("STUDENT DATA:", parsed);
    console.log("DURATION VALUE:", parsed.duration); // 🔥 DEBUG

    setStudent(parsed);

    // ✅ CERTIFICATE NUMBER
    let certNo = localStorage.getItem("certificateNo");

    if (!certNo) {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const numbers = Math.floor(10000 + Math.random() * 90000);
      certNo = `${random}${numbers}`;
      localStorage.setItem("certificateNo", certNo);
    }

    setCertificateNo(certNo);

    // ✅ DATE OF ISSUE
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    setIssueDate(today);

  }, []);

 useEffect(() => {
  const generateQR = async () => {
    if (!student?.studentId) return;

    const verifyUrl = `https://www.bnmiindia.org/beauty-verification/${student.studentId} ?sem=${student.semesterNumber || 0}`;

    const qr = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 1
    });

    setQrCode(qr);
  };

  if (student) generateQR();
}, [student]);

  if (!student) return <p className="p-10">Loading certificate...</p>;
    const handleChange = (field, value) => {
  setStudent((prev) => ({
    ...prev,
    [field]: value,
  }));
};

  // ✅ PHOTO
  const photoUrl = student.photoId
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${student.photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : null;

  // ✅ SIGNATURE
  const signatureUrl = student.signatureId
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${student.signatureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : null;

  const franchiseSign = student.franchiseSignature || null;

  // ✅ COURSE DURATION FUNCTION (FIXED)
 const getCourseDuration = (durationText) => {

  if (!durationText) return "N/A";

  const today = new Date();

  // ✅ END DATE = TODAY
  const end = new Date(today);

  // ✅ START DATE = TODAY
  const start = new Date(today);

  const text = durationText.toLowerCase();

  // ✅ YEAR
  if (text.includes("year")) {
    const years = parseInt(text) || 1;
    start.setFullYear(start.getFullYear() - years);
  }

  // ✅ MONTH
  if (text.includes("month")) {
    const months = parseInt(text) || 1;
    start.setMonth(start.getMonth() - months);
  }

  // ✅ ONE DAY FOR PERFECT RANGE
  start.setDate(start.getDate() + 1);

  const format = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return `${format(start)} To ${format(end)}`;
};
  const printPage = () => window.print();

  return (

    <div className="p-10">

      <button
        onClick={printPage}
        className="bg-blue-600 text-white px-6 py-2 mb-6"
      >
        Print Certificate
      </button>


      {/* EDIT BUTTON */}
<div className="mb-6 flex gap-4">

  <button
    onClick={() => setEditMode(!editMode)}
    className="bg-blue-600 text-white px-5 py-2 rounded"
  >
    {editMode ? "Close Edit" : "Edit Certificate"}
  </button>

</div>

{/* EDIT PANEL */}
{editMode && (

  <div className="bg-white shadow-lg rounded-xl p-6 mb-8 grid grid-cols-2 gap-4">

    <input
      type="text"
      value={student.studentName || ""}
      onChange={(e) =>
        handleChange("studentName", e.target.value)
      }
      placeholder="Student Name"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.fatherName || ""}
      onChange={(e) =>
        handleChange("fatherName", e.target.value)
      }
      placeholder="Father Name"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.motherName || ""}
      onChange={(e) =>
        handleChange("motherName", e.target.value)
      }
      placeholder="Mother Name"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.course || ""}
      onChange={(e) =>
        handleChange("course", e.target.value)
      }
      placeholder="Course Name"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.duration || ""}
      onChange={(e) =>
        handleChange("duration", e.target.value)
      }
      placeholder="Course Duration"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.grade || ""}
      onChange={(e) =>
        handleChange("grade", e.target.value)
      }
      placeholder="Grade"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.marks || ""}
      onChange={(e) =>
        handleChange("marks", e.target.value)
      }
      placeholder="Marks"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.instituteName || ""}
      onChange={(e) =>
        handleChange("instituteName", e.target.value)
      }
      placeholder="Institute Name"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={student.city || ""}
      onChange={(e) =>
        handleChange("city", e.target.value)
      }
      placeholder="City"
      className="border p-3 rounded"
    />

    <input
      type="text"
      value={issueDate}
      onChange={(e) => setIssueDate(e.target.value)}
      placeholder="Issue Date"
      className="border p-3 rounded"
    />

  </div>

)}

      <div className="relative w-[900px] h-[1200px] mx-auto">

        {/* TEMPLATE */}
        <img src="/beautycerti.png" className="absolute w-full h-full" />

        {/* LOGO */}
            {student?.logo && (
  <img
    src={student.logo}
    className="absolute top-[20px] left-[380px] w-[120px]"
  />
)}


        {/* PHOTO */}
        <div className="absolute top-[360px] left-[380px] w-[160px] h-[160px] overflow-hidden bg-white">
          {photoUrl && (
            <img src={photoUrl} className="w-full h-full object-cover" />
          )}
        </div>

 {qrCode && (
  <img
    src={qrCode}
    className="absolute top-[320px] right-[90px] w-[120px]"
  />
)}

   
{/* NAME */}
<div className="absolute top-[660px] left-[10px] w-full text-center">

  <div className="text-3xl font-bold flex items-center justify-center gap-3 flex-wrap">

    {/* STUDENT NAME */}
    <span>
      {student.studentName || student.name || ""}
    </span>

    {/* FATHER NAME */}
    {String(student.showFatherInCertificate).toLowerCase() === "true" && (
      <span className="text-3xl font-semibold">
        {student.relationType || "S/O"} {student.fatherName || ""}
      </span>
    )}

    {/* MOTHER NAME */}
    {String(student.showMotherInCertificate).toLowerCase() === "true" && (
      <span className="text-3xl font-semibold">
        M/O {student.motherName || ""}
      </span>
    )}

  </div>

</div>


        {/* COURSE */}
        <div className="absolute top-[837px] left-[300px] font-semibold">
          Course Name: {student.course}
        </div>

        {/* ✅ COURSE DURATION (FIXED) */}
        <div className="absolute top-[857px] left-[300px]  font-semibold">
          Course Duration: {getCourseDuration(
            student.duration || student.courseDuration || "1 year"
          )}
        </div>

        {/* GRADE */}
        <div className="absolute top-[770px] left-[550px] font-bold text-2xl">
          {student.grade}
        </div>

        {/* MARKS */}
        <div className="absolute top-[770px] left-[680px] font-bold text-2xl">
          {student.marks}
        </div>

        {/* QR */}
        {student.qrCode && (
          <img
            src={student.qrCode}
            className="absolute top-[320px] right-[90px] w-[120px]"
          />
        )}

        {/* CERT NO + DATE */}
        <div className="absolute bottom-[110px] left-[340px] font-semibold">

          <div>Certificate No : {certificateNo}</div>

          <div className="mt-1">
            Date Of Issue : {issueDate}
          </div>

        </div>

        {/* INSTITUTE + CITY */}
        <div className="absolute bottom-[440px] left-[150px] text-4xl font-bold text-red-700">

          ATC: {student.instituteName} | {[ student.city].filter(Boolean).join(", ")}
        </div>

        {/* SIGNATURE */}
        <div className="absolute top-[535px] left-[390px] w-[140px] h-[60px] bg-white flex items-center justify-center overflow-hidden">
          {signatureUrl && (
            <img
              src={signatureUrl}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* FRANCHISE SIGN */}
        {franchiseSign && (
          <img
            src={franchiseSign}
            className="absolute bottom-[100px] left-[100px] w-[100px]"
          />
        )}
        {/* ✅ OWNER NAME */}
{/* ✅ OWNER NAME */}
{student.ownerName && (
  <div className="absolute bottom-[60px] left-[100px] text-sm text-center">

    <div className="font-semibold">
      {student.ownerName}
    </div>

    <div className="text-xs text-gray-600">
    Controller Of Examination
    </div>

  </div>
)}

      </div>

    </div>
  );
}