"use client"

import { useEffect, useState } from "react"
import { databases, storage } from "@/lib/appwrite"
import { ID, Query } from "appwrite"

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const CATEGORY_COLLECTION = "course_categories"
const COURSE_COLLECTION = "website_courses"

const BUCKET_ID = "6986e8a4001925504f6b"

export default function CourseCMS() {

  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])

  const [catImage, setCatImage] = useState(null)
  const [courseImage, setCourseImage] = useState(null)

  const [editingCourseId, setEditingCourseId] = useState(null)
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    subtitle: ""
  })

  const [courseForm, setCourseForm] = useState({
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

  /* =========================
      LOAD CATEGORIES
  ========================= */

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

  /* =========================
      LOAD COURSES
  ========================= */

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

  /* =========================
      CATEGORY CHANGE
  ========================= */

  const handleCategoryChange = (e) => {

    const { name, value } = e.target

    if (name === "name") {

      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")

      setCategoryForm({
        ...categoryForm,
        name: value,
        slug
      })

    } else {

      setCategoryForm({
        ...categoryForm,
        [name]: value
      })

    }

  }

  /* =========================
      COURSE CHANGE
  ========================= */

  const handleCourseChange = (e) => {

    setCourseForm({
      ...courseForm,
      [e.target.name]: e.target.value
    })

  }

  /* =========================
      ADD CATEGORY
  ========================= */

  const addCategory = async () => {

  try {

    let payload = {
      name: categoryForm.name,
      slug: categoryForm.slug,
      subtitle: categoryForm.subtitle
    }

    /* =========================
        IMAGE UPDATE
    ========================= */

    if (catImage) {

      const upload = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        catImage
      )

      payload.imageId = upload.$id

    }

    /* =========================
        UPDATE CATEGORY
    ========================= */

    if (editingCategoryId) {

      await databases.updateDocument(
        DATABASE_ID,
        CATEGORY_COLLECTION,
        editingCategoryId,
        payload
      )

      alert("Category Updated")

    }

    /* =========================
        ADD CATEGORY
    ========================= */

    else {

      payload.createdAt = new Date().toISOString()

      await databases.createDocument(
        DATABASE_ID,
        CATEGORY_COLLECTION,
        ID.unique(),
        payload
      )

      alert("Category Added")

    }

    /* =========================
        RESET
    ========================= */

    setCategoryForm({
      name: "",
      slug: "",
      subtitle: ""
    })

    setCatImage(null)
    setEditingCategoryId(null)

    loadCategories()

  } catch (err) {

    console.log(err)
    alert("Error adding category")

  }

}

  /* =========================
      SAVE COURSE
  ========================= */

  const saveCourse = async () => {

    if (!courseForm.category) {
      alert("Please select a category")
      return
    }

    try {

      let imageId = ""

      if (courseImage) {

        const upload = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          courseImage
        )

        imageId = upload.$id

      }

      const slug = courseForm.title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")

      const payload = {
        title: courseForm.title,
        slug,
        description: courseForm.description,
        category: courseForm.category.trim(),
        duration: courseForm.duration,
        fees: Number(courseForm.fees),
        createdAt: new Date().toISOString()
      }

      if (imageId) {
        payload.imageId = imageId
      }

      if (editingCourseId) {

        await databases.updateDocument(
          DATABASE_ID,
          COURSE_COLLECTION,
          editingCourseId,
          payload
        )

        alert("Course Updated")

      } else {

        await databases.createDocument(
          DATABASE_ID,
          COURSE_COLLECTION,
          ID.unique(),
          payload
        )

        alert("Course Added")

      }

      setCourseForm({
        title: "",
        description: "",
        category: "",
        duration: "",
        fees: ""
      })

      setCourseImage(null)
      setEditingCourseId(null)

      loadCourses()

    } catch (err) {

      console.error(err)
      alert(err.message)

    }

  }

  /* =========================
      EDIT COURSE
  ========================= */

  const editCourse = (course) => {

    setEditingCourseId(course.$id)

    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      duration: course.duration || "",
      fees: course.fees?.toString() || ""
    })

    window.scrollTo({
      top: 600,
      behavior: "smooth"
    })

  }

  /* =========================
      DELETE COURSE
  ========================= */

  const deleteCourse = async (id) => {

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

  const editCategory = (cat) => {

  setEditingCategoryId(cat.$id)

  setCategoryForm({
    name: cat.name || "",
    slug: cat.slug || "",
    subtitle: cat.subtitle || ""
  })

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })

}

  /* =========================
      DELETE CATEGORY
  ========================= */

  const deleteCategory = async (id) => {

    try {

      await databases.deleteDocument(
        DATABASE_ID,
        CATEGORY_COLLECTION,
        id
      )

      alert("Category Deleted")

      loadCategories()

    } catch (err) {

      console.log(err)
      alert("Delete failed")

    }

  }

  /* =========================
      CANCEL EDIT
  ========================= */

  const cancelEdit = () => {

    setEditingCourseId(null)

    setCourseForm({
      title: "",
      description: "",
      category: "",
      duration: "",
      fees: ""
    })

    setCourseImage(null)

  }

  /* =========================
      GET IMAGE
  ========================= */

  const getImage = (imageId) => {

    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

  }

  return (

    <div className="min-h-screen bg-gray-100 p-4 md:p-6 space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Course CMS Panel
        </h1>

        <p className="text-gray-500 text-sm">
          Manage categories and courses easily
        </p>

      </div>

      {/* =========================
          ADD CATEGORY
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Add Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="name"
            value={categoryForm.name || ""}
            onChange={handleCategoryChange}
            placeholder="Category Name"
            className="input-clean"
          />

          <input
            name="slug"
            value={categoryForm.slug || ""}
            disabled
            placeholder="Slug auto-generated"
            className="input-clean bg-gray-100"
          />

          <input
            name="subtitle"
            value={categoryForm.subtitle || ""}
            onChange={handleCategoryChange}
            placeholder="Subtitle"
            className="input-clean"
          />

          <input
            type="file"
            onChange={(e) => setCatImage(e.target.files[0])}
            className="input-clean"
          />

          <button
            onClick={addCategory}
            className="btn-primary col-span-full"
          >
            Add Category
          </button>

        </div>

      </div>
      
      {/* =========================
          MANAGE CATEGORIES
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Manage Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {categories.map(cat => (

            <div
              key={cat.$id}
              className="border rounded-xl p-4 hover:shadow-md transition"
            >

              {cat.imageId && (

                <img
                  src={getImage(cat.imageId)}
                  className="h-36 w-full object-cover rounded-lg mb-3"
                />

              )}

              <h3 className="font-semibold text-gray-800 text-lg">
                {cat.name}
              </h3>

              <p className="text-sm text-blue-600 mt-1">
                Slug: {cat.slug}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {cat.subtitle}
              </p>

             <div className="flex gap-2 mt-4">

  <button
    onClick={() => editCategory(cat)}
    className="btn-primary flex-1"
  >
    Edit
  </button>

  <button
    onClick={() => deleteCategory(cat.$id)}
    className="btn-danger flex-1"
  >
    Delete
  </button>

</div>

            </div>

          ))}

        </div>

      </div>

      {/* =========================
          ADD COURSE
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">

        <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-white/6 ">
          {editingCourseId ? "Edit Course" : "Add Course"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="title"
            value={courseForm.title || ""}
            onChange={handleCourseChange}
            placeholder="Course Title"
            className="input-clean"
          />

          <input
            value={
              (courseForm.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-")
            }
            disabled
            placeholder="Course Slug"
            className="input-clean bg-gray-100"
          />

          <select
            name="category"
            value={courseForm.category || ""}
            onChange={handleCourseChange}
            className="input-clean"
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

          <input
            name="duration"
            value={courseForm.duration || ""}
            onChange={handleCourseChange}
            placeholder="Course Duration"
            className="input-clean"
          />

          <input
            name="fees"
            value={courseForm.fees || ""}
            onChange={handleCourseChange}
            placeholder="Course Rating (out of 5)"
            className="input-clean"
          />

          <input
            type="file"
            onChange={(e) => setCourseImage(e.target.files[0])}
            className="input-clean"
          />

          <textarea
            name="description"
            value={courseForm.description || ""}
            onChange={handleCourseChange}
            placeholder="Course Description"
            className="input-clean col-span-full h-28"
          />

          <button
            onClick={saveCourse}
            className="btn-success col-span-full"
          >
            {editingCourseId ? "Update Course" : "Add Course"}
          </button>

          {editingCourseId && (

            <button
              onClick={cancelEdit}
              className="btn-secondary col-span-full"
            >
              Cancel Edit
            </button>

          )}

        </div>

      </div>


      {/* =========================
          ALL COURSES
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          All Courses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {courses.map(course => (

            <div
              key={course.$id}
              className="border rounded-xl p-4 hover:shadow-md transition"
            >

              {course.imageId && (

                <img
                  src={getImage(course.imageId)}
                  className="h-36 w-full object-cover rounded-lg mb-3"
                />

              )}

              <h3 className="font-semibold text-gray-800">
                {course.title}
              </h3>

              <p className="text-sm text-green-600 mt-1">
                Slug: {course.slug}
              </p>

              <p className="text-sm text-gray-500">
                Category: {course.category}
              </p>

              <p className="text-sm mt-2 line-clamp-2">
                {course.description}
              </p>

              <div className="flex justify-between mt-3 text-sm">

                <span>
                  ⏱ {course.duration}
                </span>

                <span className="text-yellow-500 font-semibold">
                  ⭐ {course.fees}
                </span>

              </div>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => editCourse(course)}
                  className="btn-primary flex-1"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCourse(course.$id)}
                  className="btn-danger flex-1"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}