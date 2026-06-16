"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const ADMISSION_COLLECTION = "student_admissions";
const PAYMENT_COLLECTION = "student_payments";

export default function PaymentList() {

  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalFees: 0,
    paidFees: 0,
    balanceFees: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      const user = await account.get();

    const admissions = await databases.listDocuments(
  DATABASE_ID,
  ADMISSION_COLLECTION,
  [
    Query.equal("createdById", user.$id),
    Query.limit(1000)
  ]
);

const payments = await databases.listDocuments(
  DATABASE_ID,
  PAYMENT_COLLECTION,
  [
    Query.equal("createdById", user.$id),
    Query.limit(1000)
  ]
);

      /* Create payment map */

      const paymentMap = {};

      payments.documents.forEach((p) => {

        if (!paymentMap[p.admissionId]) {
          paymentMap[p.admissionId] = [];
        }

        paymentMap[p.admissionId].push(p);

      });

      /* Format records */

      const formatted = admissions.documents.map((adm) => {

        const studentPayments = paymentMap[adm.$id] || [];

        const paid = studentPayments.reduce(
          (sum, p) => sum + Number(p.paymentAmount || 0),
          0
        );

        const lastPayment = studentPayments[studentPayments.length - 1];

        const total = Number(adm.totalFees || 0);
        const balance = total - paid;

        return {
          ...adm,
          total,
          paid,
          balance,
          paymentId: lastPayment ? lastPayment.$id : null
        };

      });

      /* Summary */

      const totalFees = formatted.reduce((s, r) => s + r.total, 0);
      const paidFees = formatted.reduce((s, r) => s + r.paid, 0);
      const balanceFees = formatted.reduce((s, r) => s + r.balance, 0);

      setRecords(formatted);

      setSummary({
        totalFees,
        paidFees,
        balanceFees
      });

    } catch (error) {

      console.error("Payment List Error:", error);

    }

  };

  const filteredRecords = records.filter((item) => {
  const search = searchTerm.toLowerCase();

  return (
    item.studentName?.toLowerCase().includes(search) ||
    item.rollNumber?.toString().includes(searchTerm) ||
    item.className?.toLowerCase().includes(search)
  );
});

  return (

    <div className="p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          List Students Payments
        </h2>

<input
  type="text"
  placeholder="Search by Name, Roll No or Class"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="border px-4 py-2 rounded-md w-80"
/>
        <div className="flex gap-4">

          <button
            onClick={() => router.push("/login/institute/manage-student/fees/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Payment
          </button>

          <button className="bg-red-500 text-white px-4 py-2 rounded-md">
            Export
          </button>

        </div>

      </div>

      {/* SUMMARY */}
{/* SUMMARY CARDS */}

<div className="grid md:grid-cols-3 gap-5 mb-8">

  <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg">
    <p className="text-sm opacity-90">Total Fees</p>
    <h2 className="text-3xl font-bold mt-2">
      ₹ {summary.totalFees}
    </h2>
  </div>

  <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-lg">
    <p className="text-sm opacity-90">Paid Fees</p>
    <h2 className="text-3xl font-bold mt-2">
      ₹ {summary.paidFees}
    </h2>
  </div>

  <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-2xl shadow-lg">
    <p className="text-sm opacity-90">Balance Fees</p>
    <h2 className="text-3xl font-bold mt-2">
      ₹ {summary.balanceFees}
    </h2>
  </div>

</div>

{/* TABLE */}

<div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="bg-gradient-to-r from-yellow-300 to-yellow-200 text-gray-800">

          <th className="p-4 border">#</th>
          <th className="p-4 border">Student Name</th>
          <th className="p-4 border">Roll No</th>
          <th className="p-4 border">Class</th>
          <th className="p-4 border">Course</th>
          <th className="p-4 border text-center">Total Fees</th>
          <th className="p-4 border text-center">Paid</th>
          <th className="p-4 border text-center">Balance</th>
          <th className="p-4 border text-center">Action</th>

        </tr>

      </thead>

      <tbody>

        {filteredRecords.length === 0 ? (

          <tr>

            <td
              colSpan="9"
              className="text-center p-10 text-gray-500"
            >
              No Data Available
            </td>

          </tr>

        ) : (

          filteredRecords.map((item, index) => (

            <tr
              key={item.$id}
              className="hover:bg-blue-50 transition-all duration-200"
            >

              <td className="p-4 border">
                {index + 1}
              </td>

              <td className="p-4 border font-semibold">
                {item.studentName}
              </td>

              <td className="p-4 border">
                {item.rollNumber || "-"}
              </td>

              <td className="p-4 border">
                {item.className || "-"}
              </td>

              <td className="p-4 border">
                {item.courseName || "-"}
              </td>

              <td className="p-4 border text-center font-semibold">
                ₹ {item.total}
              </td>

              <td className="p-4 border text-center font-semibold text-green-600">
                ₹ {item.paid}
              </td>

              <td className="p-4 border text-center font-semibold text-red-600">
                ₹ {item.balance}
              </td>

              <td className="p-4 border text-center">

                {item.paymentId ? (

                  <button
                    onClick={() =>
                      router.push(
                        `/login/institute/manage-student/fees/receipt/${item.paymentId}`
                      )
                    }
                    className="
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      hover:scale-105
                      transition-all
                      shadow-md
                    "
                  >
                    View Receipt
                  </button>

                ) : (

                  <span className="text-gray-400 text-sm">
                    No Receipt
                  </span>

                )}

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

</div>

  );

}