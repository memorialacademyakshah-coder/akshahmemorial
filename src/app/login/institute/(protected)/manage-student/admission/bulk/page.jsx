"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { databases, account } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "student_admissions";

export default function BulkAdmission() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const jsonData =
      XLSX.utils.sheet_to_json(sheet);

    const formatted = jsonData.map((row) => ({
      studentName:
        row["Name of Student"] || "",

      fatherName:
        row["Father'S name "] || "",

      motherName:
        row["Mother's Name"] || "",

      aadhar:
        String(row["Student Addhaar No"] || ""),

      dob:
        row["DOB"] || "",

      rollNumber:
        String(row["Roll No"] || ""),

className:
  row["Class"] || "",

courseName: "",

      address:
        row["Full Address"] || "",

      mobile:
        String(row["Contact No"] || ""),

     fatherAadhar:
  String(row["Father's Adhaar No"] || ""),
    }));

    console.log("DOB VALUE:", row["DOB"]);
    setStudents(formatted);
  };

  const getFranchiseInfo = async () => {
    const user = await account.get();

    const res = await databases.listDocuments(
      DATABASE_ID,
      "franchise_approved",
      [Query.equal("email", user.email)]
    );

    if (res.documents.length === 0) {
      throw new Error("Franchise not found");
    }

    return {
      user,
      franchiseId: res.documents[0].$id,
      instituteName:
        res.documents[0].instituteName,
    };
  };

  const importStudents = async () => {
    try {
      setLoading(true);

      const franchise =
        await getFranchiseInfo();

      let imported = 0;
      let skipped = 0;

      for (const student of students) {
        try {
          const existing =
            await databases.listDocuments(
              DATABASE_ID,
              COLLECTION_ID,
              [
                Query.equal(
                  "aadhar",
                  student.aadhar
                ),
              ]
            );

          if (
            existing.documents.length > 0
          ) {
            skipped++;
            continue;
          }

          const username =
            student.rollNumber;

          const password =
            student.aadhar?.slice(-4) ||
            "1234";

          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
              studentName:
                student.studentName,

              fatherName:
                student.fatherName,

              motherName:
                student.motherName,

              aadhar:
                student.aadhar,

              dob: student.dob,

              rollNumber:
                student.rollNumber,

              courseName:
  student.courseName,

className:
  student.className,

              address:
                student.address,

              mobile:
                student.mobile,

              fatherAadhar:
                student.fatherAadhar,

              username,
              password,

              relationType: "S/O",

              status: "Active",

              bulkAdmission: true,

              photoId: "",
              signatureId: "",

              qualification: "",
              occupation: "",

              altMobile: "",
              email: "",

              gender: "",

              subjects: "",

              courseFees: 0,
              discount: 0,
              totalFees: 0,
              feesReceived: 0,
              balance: 0,

              batch: "",

              admissionDate:
                new Date()
                  .toISOString()
                  .split("T")[0],

              franchiseEmail:
                franchise.user.email,

              franchiseId:
                franchise.franchiseId,

              instituteName:
                franchise.instituteName,

              createdById:
                franchise.user.$id,

              createdByName:
                franchise.instituteName,

              createdAt:
                new Date().toISOString(),
            }
          );

          imported++;
        }catch (err) {
  console.error("IMPORT ERROR:", err);

  alert(
    `Error: ${err.message}\nCode: ${err.code}`
  );
}
      }

      alert(
        `Imported: ${imported}\nSkipped: ${skipped}`
      );

      setStudents([]);
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-8">

    {/* Header */}

    <div className="mb-8">

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

        <h1 className="text-4xl font-bold text-gray-800">
          Bulk Student Admission
        </h1>

        <p className="text-gray-500 mt-2">
          Upload Excel file and import hundreds of students instantly.
        </p>

      </div>

    </div>

    {/* Stats */}

    <div className="grid md:grid-cols-3 gap-6 mb-8">

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-gray-500 text-sm">
          Students Loaded
        </h3>

        <p className="text-4xl font-bold text-blue-600 mt-2">
          {students.length}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-gray-500 text-sm">
          Admission Type
        </h3>

        <p className="text-xl font-semibold text-green-600 mt-2">
          Bulk Import
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-gray-500 text-sm">
          Status
        </h3>

        <p className="text-xl font-semibold text-orange-500 mt-2">
          Ready
        </p>
      </div>

    </div>

    {/* Upload Section */}

    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-8">

      <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-500 transition">

        <div className="text-6xl mb-4">
          📊
        </div>

        <h2 className="text-2xl font-bold text-gray-700">
          Upload Excel File
        </h2>

        <p className="text-gray-500 mt-2">
          Supported formats: XLSX, XLS
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          className="mt-6 block mx-auto border p-3 rounded-xl bg-gray-50"
        />

      </div>

    </div>

    {/* Preview */}

    {students.length > 0 && (

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">

          <h2 className="text-white text-xl font-bold">
            Student Preview
          </h2>

          <p className="text-blue-100">
            Review data before importing
          </p>

        </div>

        <div className="overflow-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-100">

                <th className="p-4 text-left">
                  #
                </th>

                <th className="p-4 text-left">
                  Student Name
                </th>

                <th className="p-4 text-left">
                  Father Name
                </th>

                <th className="p-4 text-left">
                  Class
                </th>

                <th className="p-4 text-left">
                  Roll No
                </th>

                <th className="p-4 text-left">
                  Mobile
                </th>

              </tr>

            </thead>

            <tbody>

              {students.map((student, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-blue-50 transition"
                >

                  <td className="p-4">
                    {index + 1}
                  </td>

                  <td className="p-4 font-medium">
                    {student.studentName}
                  </td>

                  <td className="p-4">
                    {student.fatherName}
                  </td>

            <td className="p-4">
  {student.className}
</td>
                  <td className="p-4">
                    {student.rollNumber}
                  </td>

                  <td className="p-4">
                    {student.mobile}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Bottom Action */}

        <div className="flex justify-between items-center p-6 bg-gray-50">

          <div>

            <h3 className="font-semibold text-gray-700">
              Total Students
            </h3>

            <p className="text-2xl font-bold text-blue-600">
              {students.length}
            </p>

          </div>

          <button
            onClick={importStudents}
            disabled={loading}
            className="px-8 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all shadow-lg"
          >
            {loading
              ? "Importing Students..."
              : `Import ${students.length} Students`}
          </button>

        </div>

      </div>

    )}

  </div>
);
}