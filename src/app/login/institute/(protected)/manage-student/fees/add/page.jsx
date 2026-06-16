"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import { useRouter } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const ADMISSION_COLLECTION = "student_admissions";
const PAYMENT_COLLECTION = "student_payments";

export default function AddPayment() {

  const router = useRouter();

  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    paymentAmount: "",
    paymentMode: "",
    notes: ""
  });

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {

    const user = await account.get();

  const response = await databases.listDocuments(
  DATABASE_ID,
  ADMISSION_COLLECTION,
  [
    Query.equal("createdById", user.$id),
    Query.limit(500)
  ]
);
    setAdmissions(response.documents);

  };

  const handleAdmissionSelect = async (admissionId) => {

    const admission = await databases.getDocument(
      DATABASE_ID,
      ADMISSION_COLLECTION,
      admissionId
    );

    setSelectedAdmission(admission);

    const payments = await databases.listDocuments(
      DATABASE_ID,
      PAYMENT_COLLECTION,
      [Query.equal("admissionId", admissionId)]
    );

    const paid = payments.documents.reduce(
      (sum, item) => sum + Number(item.paymentAmount),
      0
    );

    setTotalPaid(paid);

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    const user = await account.get();

    await databases.createDocument(
      DATABASE_ID,
      PAYMENT_COLLECTION,
      ID.unique(),
      {
        createdById: user.$id,

        studentId: selectedAdmission.$id,
        admissionId: selectedAdmission.$id,
        studentName: selectedAdmission.studentName,
        course: selectedAdmission.courseName,

        paymentAmount: Number(form.paymentAmount),
        paymentMode: form.paymentMode,
        notes: form.notes,

        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    );

    alert("Payment Added Successfully");

    router.push("/login/institute/manage-student/fees");

  };

  const balance = selectedAdmission
    ? Number(selectedAdmission.totalFees) -
    totalPaid -
    Number(form.paymentAmount || 0)
    : 0;

    const filteredAdmissions = admissions.filter((student) =>
  student.studentName?.toLowerCase().includes(search.toLowerCase()) ||
  student.rollNumber?.toString().includes(search) ||
  student.className?.toLowerCase().includes(search.toLowerCase())
);

  return (

    <div className="p-10 bg-gray-100 min-h-screen">

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h2 className="text-2xl font-bold mb-8 border-b pb-4">
          Student Payment Details
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* Student */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Select Student & Course
            </label>

         <div className="col-span-2">

  <label className="font-semibold mb-2 block">
    Search Student
  </label>

  <input
    type="text"
    placeholder="Search by Name, Roll Number or Class..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      w-full
      rounded-xl
      border
      border-gray-300
      px-4
      py-3
      mb-3
      focus:ring-2
      focus:ring-blue-500
      outline-none
    "
  />

  <div className="
  max-h-80
  overflow-y-auto
  border
  rounded-xl
  shadow-inner
  bg-white
">

    {filteredAdmissions.map((student) => (

      <div
        key={student.$id}
        onClick={() => handleAdmissionSelect(student.$id)}
       className={`
  p-4
  border-b
  cursor-pointer
  transition
  ${
    selectedAdmission?.$id === student.$id
      ? "bg-blue-100 border-l-4 border-blue-600"
      : "hover:bg-blue-50"
  }
`}
      >
        <div className="font-semibold">
          {student.studentName}
        </div>

        <div className="text-sm text-gray-500">
          Roll: {student.rollNumber} |
          Class: {student.className}
        </div>

      </div>

    ))}

  </div>

</div>
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Payment Amount
            </label>

            <input
              type="number"
              onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
              className="border rounded-md p-2"
              required
            />
          </div>

          {/* Mode */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Payment Mode
            </label>

            <select
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              className="border rounded-md p-2"
              required
            >
              <option value="">Select Mode</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Notes
            </label>

            <input
              type="text"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border rounded-md p-2"
            />
          </div>

        </form>

        {/* Summary */}
  {selectedAdmission && (

  <div className="mt-6 space-y-4">

    <div className="
      rounded-2xl
      bg-gradient-to-r
      from-blue-600
      to-indigo-600
      text-white
      p-6
      shadow-xl
    ">

      <h3 className="text-2xl font-bold">
        {selectedAdmission.studentName}
      </h3>

      <div className="grid md:grid-cols-3 gap-4 mt-4">

        <div>
          <p className="text-blue-100 text-sm">
            Roll Number
          </p>
          <p className="font-semibold">
            {selectedAdmission.rollNumber}
          </p>
        </div>

        <div>
          <p className="text-blue-100 text-sm">
            Class
          </p>
          <p className="font-semibold">
            {selectedAdmission.className}
          </p>
        </div>

        <div>
          <p className="text-blue-100 text-sm">
            Course
          </p>
          <p className="font-semibold">
            {selectedAdmission.courseName}
          </p>
        </div>

      </div>

    </div>

    <div className="grid md:grid-cols-3 gap-4">

      <div className="bg-blue-50 p-5 rounded-2xl">
        <p className="text-sm text-gray-500">
          Total Fees
        </p>
        <h2 className="text-2xl font-bold text-blue-600">
          ₹ {selectedAdmission.totalFees}
        </h2>
      </div>

      <div className="bg-green-50 p-5 rounded-2xl">
        <p className="text-sm text-gray-500">
          Paid Fees
        </p>
        <h2 className="text-2xl font-bold text-green-600">
          ₹ {totalPaid}
        </h2>
      </div>

      <div className="bg-red-50 p-5 rounded-2xl">
        <p className="text-sm text-gray-500">
          Balance
        </p>
        <h2 className="text-2xl font-bold text-red-600">
          ₹ {balance}
        </h2>
      </div>

    </div>

  </div>

)}
        <div className="flex gap-4 mt-8">

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Add Payment
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="bg-red-500 text-white px-6 py-2 rounded-md"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  );

}