'use client'

import { useEffect, useState } from 'react'
import { databases, ID, account } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { useRouter } from 'next/navigation'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const MASTER_COLLECTION = 'courses_master'
const SINGLE_COLLECTION = 'courses_single'

export default function AddCourseSingle() {
    const router = useRouter()
  const [examFee, setExamFee] = useState(0)
  const [courses, setCourses] = useState([])
  const [selectedCourses, setSelectedCourses] = useState({})
  const [search, setSearch] = useState('')

  const fetchCourses = async () => {

    try {
const res = await databases.listDocuments(
  DATABASE_ID,
  MASTER_COLLECTION,
  [
    Query.orderDesc('courseCode'),
    Query.limit(500) // 🔥 increase limit
  ]
)
      setCourses(res.documents)

    } catch (error) {
      console.log(error)
    }

  }
useEffect(() => {
  const fetchPlan = async () => {

    const user = await account.get()

    const res = await databases.listDocuments(
      DATABASE_ID,
      "franchise_approved",
      [Query.equal("email", user.email)]
    )

    const plan = res.documents[0]?.plan

    const planRes = await databases.listDocuments(
      DATABASE_ID,
      "franchise_plans",
      [Query.equal("name", plan)]
    );

    const fee = planRes.documents[0]?.amount || 0;

    setExamFee(fee);

    setExamFee(fee)
  }

  fetchPlan()
}, [])

  useEffect(() => {
    fetchCourses()
  }, [])


  const getExamFee = async (course) => {

  const duration = course.duration?.toLowerCase()

  // ✅ 1/2/3 MONTHS → use master course fees
  if (
    duration.includes("1 month") ||
    duration.includes("2 month") ||
    duration.includes("3 month")
  ) {
    return Number(course.courseFees || 0)
  }

  // ✅ 6 MONTH / 1 YEAR → use franchise plan
  const user = await account.get()

  const franchiseRes = await databases.listDocuments(
    DATABASE_ID,
    "franchise_approved",
    [Query.equal("email", user.email)]
  )

  const userPlan = franchiseRes.documents[0]?.plan

  const planRes = await databases.listDocuments(
    DATABASE_ID,
    "franchise_plans",
    [Query.equal("name", userPlan)]
  )

  return Number(planRes.documents[0]?.amount || 0)
}

  const handleCheck = (course) => {

    setSelectedCourses(prev => {

      if (prev[course.$id]) {
        const updated = { ...prev }
        delete updated[course.$id]
        return updated
      }

      return {
        ...prev,
        [course.$id]: {
          ...course,
          courseFees: '',
          minimumFees: ''
        }
      }

    })

  }

  const handleInput = (id, field, value) => {

    setSelectedCourses(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))

  }

  const addCourse = async () => {

    const selected = Object.values(selectedCourses)

    if (selected.length === 0) {
      alert("Please select a course")
      return
    }

    try {

    const user = await account.get()

const res = await databases.listDocuments(
  DATABASE_ID,
  "franchise_approved",
  [Query.equal("email", user.email)]
)

const franchise = res.documents[0]

const userPlan = franchise?.plan
const planRes = await databases.listDocuments(
  DATABASE_ID,
  "franchise_plans",
  [Query.equal("name", userPlan)]
);

const examFee = planRes.documents[0]?.amount || 0;

    for (const course of selected) {

  const dynamicExamFee = await getExamFee(course)

  if (!course.enteredCourseFees || !course.minimumFees) {
    alert("Please enter Course Fee and Minimum Fee")
    return
  }
        const existing = await databases.listDocuments(
                 DATABASE_ID,
                 SINGLE_COLLECTION,
                 [
                   Query.equal("courseId", course.$id),
                   Query.equal("franchiseEmail", user.email)
                 ]
               )
       
               if (existing.documents.length > 0) {
       
                 // 🔁 UPDATE (overwrite)
                 await databases.updateDocument(
                   DATABASE_ID,
                   SINGLE_COLLECTION,
                   existing.documents[0].$id,
                   {
                     courseFees: Number(course.courseFees),
                     minimumFees: Number(course.minimumFees),
                     examFees: dynamicExamFee,
                     status: "Active"
                   }
                 )
       
               } else {
       
                 // ➕ CREATE
                 await databases.createDocument(
                   DATABASE_ID,
                   SINGLE_COLLECTION,
                   ID.unique(),
                   {
                     courseId: course.$id,
                     courseCode: course.courseCode,
                     courseName: course.courseName,
                     duration: course.duration,
                   examFees: dynamicExamFee,
                     courseFees: Number(course.courseFees),
                     minimumFees: Number(course.minimumFees),
                     status: "Active",
                     franchiseEmail: user.email
                   }
                 )
       
               }
       
             }

      alert("Course Added Successfully")
      setSelectedCourses({})
router.push('/login/institute/add-course/single/list') // change if your route is different
    } catch (error) {

      console.log("Add Course Error:", error)
      alert(error.message)

    }

  }




  return (

    <div className="p-10 bg-black min-h-screen text-white">

      <div className="bg-[#121212] rounded-xl p-6 shadow-lg border border-gray-800">

        <div className="flex justify-between mb-6">

          <h2 className="text-xl font-bold">
            ADD COURSE WITH SINGLE SUBJECT
          </h2>

          <button
            onClick={addCourse}
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded"
          >
            Add Course
          </button>

        </div>

        <div className="mb-4">

  <input
    type="text"
    placeholder="Search Course Name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-black border border-gray-700 text-white p-3 rounded-lg outline-none focus:border-orange-500"
  />

</div>

        <div className="overflow-x-auto">

          <table className="w-full border border-gray-800 text-sm">

            <thead className="bg-orange-500 text-black">

              <tr>

                <th className="border border-gray-800 p-2"></th>
                <th className="border border-gray-800 p-2">Course Code</th>
                <th className="border border-gray-800 p-2">Course Name</th>
                <th className="border border-gray-800 p-2">Course Duration</th>
                <th className="border border-gray-800 p-2">Exam Fees</th>
                <th className="border border-gray-800 p-2">Course Fee</th>
                <th className="border border-gray-800 p-2">Minimum Fee</th>

              </tr>

            </thead>

            <tbody> 

              {courses
  .filter(course =>
    course.courseName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )
  .map(course => (

                <tr key={course.$id} className="border border-gray-800 hover:bg-[#1a1a1a]">

                  <td className="border border-gray-800 p-2 text-center">

                    <input
                      type="checkbox"
                      checked={!!selectedCourses[course.$id]}
                      onChange={() => handleCheck(course)}
                      className="accent-orange-500"
                    />

                  </td>

                  <td className="border border-gray-800 p-2">
                    {course.courseCode}
                  </td>

                  <td className="border border-gray-800 p-2">
                    {course.courseName}
                  </td>

                  <td className="border border-gray-800 p-2">
                    {course.duration}
                  </td>

        <td className="border border-gray-800 p-2">

  {(
    course.duration?.toLowerCase().includes("1 month") ||
    course.duration?.toLowerCase().includes("2 month") ||
    course.duration?.toLowerCase().includes("3 month")
  )
    ? `₹${course.courseFees || 0}`
    : `₹${examFee}`
  }

</td>
                  <td className="border border-gray-800 p-2">

                    <input
                      type="number"
                      placeholder="Course Fee"
                      className="border border-white bg-black text-white-400 p-1 w-28 rounded"
                      disabled={!selectedCourses[course.$id]}
                      onChange={(e) =>
                        handleInput(course.$id,'courseFees',e.target.value)
                      }
                    />

                  </td>

                  <td className="border border-gray-800 p-2">

                    <input
                      type="number"
                      placeholder="Minimum Fee"
                           className="border border-white bg-black text-white-400 p-1 w-28 rounded"
                      disabled={!selectedCourses[course.$id]}
                      onChange={(e) =>
                        handleInput(course.$id,'minimumFees',e.target.value)
                      }
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )
}