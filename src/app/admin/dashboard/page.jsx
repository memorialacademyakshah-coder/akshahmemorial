"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  FileText
} from "lucide-react";

import { databases } from "@/lib/appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLORS = ["#22c55e", "#f97316"];

export default function Dashboard() {

  // =========================
  // STATES
  // =========================

  const [admissionCount, setAdmissionCount] = useState(0);

  const [certificateCount, setCertificateCount] = useState(0);

  const [franchiseCount, setFranchiseCount] = useState(0);

  const [enquiryCount, setEnquiryCount] = useState(0);

  const [courseCount, setCourseCount] = useState(0);

  const [barData, setBarData] = useState([]);

  const [pieData, setPieData] = useState([
    { name: "Admissions", value: 0 },
    { name: "Certificates", value: 0 }
  ]);

  // =========================
  // LOAD
  // =========================

  useEffect(() => {

    loadDashboard();

  }, []);

  // =========================
  // LOAD DASHBOARD
  // =========================

const loadDashboard = async () => {

  try {

    // =========================
    // LOAD ALL TOGETHER (FAST)
    // =========================

    const [
      admissionRes,
      certificateRes,
      franchiseRes,
      enquiryRes,
      singleCourses,
      beautyCourses,
      multipleCourses
    ] = await Promise.all([

      databases.listDocuments(
        DATABASE_ID,
        "student_admissions",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "certificates",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "franchise_approved",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "student_enquiries",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "courses_master",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "beauty_courses_master",
        []
      ),

      databases.listDocuments(
        DATABASE_ID,
        "courses_master_multiple",
        []
      )

    ]);

    // =========================
    // COUNTS
    // =========================

    setAdmissionCount(admissionRes.total);

    setCertificateCount(certificateRes.total);

    setFranchiseCount(franchiseRes.total);

    setEnquiryCount(enquiryRes.total);

    const totalCourses =
      singleCourses.total +
      beautyCourses.total +
      multipleCourses.total;

    setCourseCount(totalCourses);

    // =========================
    // PIE
    // =========================

    setPieData([
      {
        name: "Admissions",
        value: admissionRes.total
      },
      {
        name: "Certificates",
        value: certificateRes.total
      }
    ]);

    // =========================
    // BAR
    // =========================

    setBarData([
      {
        name: "Enquiries",
        total: enquiryRes.total
      },
      {
        name: "Admissions",
        total: admissionRes.total
      },
      {
        name: "Certificates",
        total: certificateRes.total
      },
      {
        name: "Courses",
        total: totalCourses
      },
      {
        name: "Franchises",
        total: franchiseRes.total
      }
    ]);

  } catch (err) {

    console.log(
      "DASHBOARD ERROR:",
      err
    );

  }

};

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 p-4 md:p-8">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Welcome to ASMA Dashboard
        </p>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">

        <StatCard
          title="Enquiries"
          amount={enquiryCount}
          icon={<DollarSign />}
          color="from-orange-400 to-orange-600"
        />

        <StatCard
          title="Admissions"
          amount={admissionCount}
          icon={<ShoppingCart />}
          color="from-green-400 to-green-600"
        />

        <StatCard
          title="Certificates"
          amount={certificateCount}
          icon={<CreditCard />}
          color="from-blue-400 to-blue-600"
        />

        <StatCard
          title="Courses"
          amount={courseCount}
          icon={<FileText />}
          color="from-purple-400 to-purple-600"
        />

        <StatCard
          title="Franchises"
          amount={franchiseCount}
          icon={<FileText />}
          color="from-pink-400 to-pink-600"
        />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BAR CHART */}

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">

          <h2 className="font-semibold mb-4">
            Overall Statistics
          </h2>

          <div className="w-full h-[300px]">

            <ResponsiveContainer>

              <BarChart data={barData}>

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* PIE CHART */}

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex flex-col items-center">

          <h2 className="font-semibold mb-4">
            Admissions vs Certificates
          </h2>

          <div className="w-full h-[300px]">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >

                  {pieData.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="flex justify-around w-full mt-4">

            <div className="text-center">

              <p className="text-xl font-bold">
                {admissionCount}
              </p>

              <p className="text-green-500 text-sm">
                Admissions
              </p>

            </div>

            <div className="text-center">

              <p className="text-xl font-bold">
                {certificateCount}
              </p>

              <p className="text-orange-500 text-sm">
                Certificates
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  amount,
  icon,
  color
}) {

  return (

    <div
      className={`bg-gradient-to-r ${color} text-white p-5 rounded-2xl shadow-lg hover:scale-105 transition`}
    >

      <div className="flex justify-between items-center mb-2">

        <p>{title}</p>

        <div className="bg-white/20 p-2 rounded-lg">

          {icon}

        </div>

      </div>

      <h2 className="text-2xl font-bold">

        {amount}

      </h2>

    </div>

  );

}