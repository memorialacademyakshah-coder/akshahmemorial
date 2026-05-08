"use client"

import { useEffect, useState } from "react"
import { databases, storage } from "@/lib/appwrite"
import { ID, Query } from "appwrite"

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const CATEGORY_COLLECTION = "course_categories"
const COURSE_COLLECTION = "website_courses"
const BUCKET_ID = "course_images"

export default function CourseCMS() {

  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])

  const [image, setImage] = useState(null)

  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    fees: ""
  })

  useEffect(() => {
    loadCategories()
    loadCourses()
  }, [])

  const loadCategories = async () => {

    try {

      const res = await databases.listDocuments(
        DATABASE_ID,
        CATEGORY_COLLECTION,
        [Query.orderAsc("$createdAt")]
      )

      setCategories(res.documents)

    } catch (err) {
      console.log(err)
    }

  }

  const loadCourses = async () => {

    try {

      const res = await databases.listDocuments(
        DATABASE_ID,
        COURSE_COLLECTION,
        [Query.orderAsc("$createdAt")]
      )

      setCourses(res.documents)

    } catch (err) {
      console.log(err)
    }

  }

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }

  const resetForm = () => {

    setForm({
      title: "",
      description: "",
      category: "",
      duration: "",
      fees: ""
    })

    setImage(null)
    setEditId(null)

  }

  const addCourse = async () => {

    try {

      let imageId = ""

      if (image) {

        const upload = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          image
        )

        imageId = upload.$id

      }

      const slug = form.title
        .toLowerCase()
        .replaceAll(" ", "-")

      await databases.createDocument(
        DATABASE_ID,
        COURSE_COLLECTION,
        ID.unique(),
        {
          title: form.title,
          slug,
          description: form.description,
          category: form.category,
          duration: form.duration,
          fees: Number(form.fees),
          imageId,
          createdAt: new Date().toISOString()
        }
      )

      alert("Course Added Successfully")

      resetForm()
      loadCourses()

    } catch (err) {

      console.log(err)
      alert("Error adding course")

    }

  }

  const updateCourse = async () => {

    try {

      const slug = form.title
        .toLowerCase()
        .replaceAll(" ", "-")

      let payload = {
        title: form.title,
        slug,
        description: form.description,
        category: form.category,
        duration: form.duration,
        fees: Number(form.fees)
      }

      if (image) {

        const upload = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          image
        )

        payload.imageId = upload.$id

      }

      await databases.updateDocument(
        DATABASE_ID,
        COURSE_COLLECTION,
        editId,
        payload
      )

      alert("Course Updated")

      resetForm()
      loadCourses()

    } catch (err) {

      console.log(err)
      alert("Update failed")

    }

  }

  const deleteCourse = async (id) => {

    const confirmDelete = confirm("Delete this course?")

    if (!confirmDelete) return

    try {

      await databases.deleteDocument(
        DATABASE_ID,
        COURSE_COLLECTION,
        id
      )

      alert("Course Deleted")

      loadCourses()

    } catch (err) {

      console.log(err)
      alert("Delete failed")

    }

  }

  const editCourse = (course) => {

    setEditId(course.$id)

    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      fees: course.fees
    })

  }

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-5xl font-extrabold text-gray-900">
          Course CMS Panel
        </h1>

        <p className="text-gray-500 mt-2">
          Manage categories and courses easily
        </p>

      </div>

      {/* ADD COURSE */}

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Course
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* COURSE TITLE */}

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Course Title"
            className="border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* SLUG */}

          <input
            value={
              form.title
                .toLowerCase()
                .replaceAll(" ", "-")
            }
            placeholder="Course Slug"
            readOnly
            className="border border-gray-300 rounded-xl px-4 py-4 bg-gray-100 text-gray-500"
          />

          {/* CATEGORY */}

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-green-500"
          >

            <option value="">
              Select Category
            </option>

            {categories.map(cat => (

              <option
                key={cat.$id}
                value={cat.slug}
              >
                {cat.name}
              </option>

            ))}

          </select>

          {/* DURATION */}

          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Course Duration"
            className="border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* FEES */}

          <input
            name="fees"
            value={form.fees}
            onChange={handleChange}
            placeholder="Course Fees"
            className="border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* IMAGE */}

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="border border-gray-300 rounded-xl px-4 py-4"
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Course Description"
            rows={6}
            className="border border-gray-300 rounded-xl px-4 py-4 md:col-span-2 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* BUTTON */}

          {
            editId ? (

              <button
                onClick={updateCourse}
                className="md:col-span-2 bg-orange-500 hover:bg-orange-600 transition text-white py-4 rounded-xl font-bold text-lg"
              >
                Update Course
              </button>

            ) : (

              <button
                onClick={addCourse}
                className="md:col-span-2 bg-green-600 hover:bg-green-700 transition text-white py-4 rounded-xl font-bold text-lg"
              >
                Add Course
              </button>

            )
          }

        </div>

      </div>

      {/* MANAGE COURSES */}

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-6">
          Manage Courses
        </h2>

        <div className="space-y-5">

          {courses.map(course => (

            <div
              key={course.$id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >

              <div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {course.title}
                </h3>

                <p className="text-gray-500 mt-2">
                  Slug:
                  <span className="ml-2 font-medium text-green-600">
                    {course.slug}
                  </span>
                </p>

                <p className="text-gray-500 mt-1">
                  Category:
                  <span className="ml-2 font-medium">
                    {course.category}
                  </span>
                </p>

                <p className="text-gray-500 mt-1">
                  Duration:
                  <span className="ml-2 font-medium">
                    {course.duration}
                  </span>
                </p>

                <p className="text-gray-500 mt-1">
                  Fees:
                  <span className="ml-2 font-medium">
                    ₹{course.fees}
                  </span>
                </p>

              </div>

              <div className="flex gap-4">

                <button
                  onClick={() => editCourse(course)}
                  className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCourse(course.$id)}
                  className="bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Deletegsdfgsd
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}