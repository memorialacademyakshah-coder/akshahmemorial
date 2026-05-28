'use client'

import { useEffect, useState } from 'react'
import {
  databases,
  storage,
} from '@/lib/appwrite'

import { ID, Query } from 'appwrite'

import {
  Trash2,
  Pencil,
  ImagePlus,
} from 'lucide-react'

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const COLLECTION_ID = 'services'

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID

export default function ServicesCMS() {

  const [services, setServices] = useState([])

  const [editingId, setEditingId] =
    useState(null)

  const [uploading, setUploading] =
    useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    state: '',
  })

  /* ================= FETCH ================= */

  const fetchServices = async () => {

    try {

      const res =
        await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.orderAsc('order'),
          ]
        )

      setServices(res.documents)

    } catch (err) {

      console.log(err)

    }
  }

  useEffect(() => {

    fetchServices()

  }, [])

  /* ================= IMAGE ================= */

  const uploadImage = async (file) => {

    if (!file) return

    try {

      setUploading(true)

      const uploaded =
        await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        )

      const url =
        storage.getFileView(
          BUCKET_ID,
          uploaded.$id
        )

      setForm((prev) => ({
        ...prev,
        imageUrl: url,
      }))

    } catch (err) {

      console.log(err)

    }

    setUploading(false)
  }

  /* ================= SAVE ================= */

  const saveService = async () => {

    try {

      if (!form.title) {
        alert('Title required')
        return
      }

      if (editingId) {

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          editingId,
          form
        )

      } else {

        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            ...form,
            order: services.length + 1,
          }
        )

      }

      resetForm()

      fetchServices()

    } catch (err) {

      console.log(err)

    }
  }

  /* ================= DELETE ================= */

  const deleteService = async (id) => {

    try {

      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      )

      fetchServices()

    } catch (err) {

      console.log(err)

    }
  }

  /* ================= EDIT ================= */

  const editService = (item) => {

    setEditingId(item.$id)

    setForm({
      title: item.title || '',
      description:
        item.description || '',
      imageUrl: item.imageUrl || '',
      state: item.state || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  /* ================= RESET ================= */

  const resetForm = () => {

    setEditingId(null)

    setForm({
      title: '',
      description: '',
      imageUrl: '',
      state: '',
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f7ff] p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-10">

        <h1
          className="
            text-4xl
            font-black
            text-[#08104d]
          "
        >
          Course Categories CMS
        </h1>

        <p className="text-gray-500 mt-2">
          Manage categories & courses
        </p>

      </div>

      {/* FORM */}
      <div
        className="
          bg-white
          rounded-3xl
          p-8
          shadow-sm
          border
          border-gray-100
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-[#08104d]
            mb-8
          "
        >
          {editingId
            ? 'Update Category'
            : 'Add New Category'}
        </h2>

        {/* INPUTS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="font-semibold text-[#08104d]">
              Category Name
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Graphic Design"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-2xl
                p-4
                outline-none
              "
            />

          </div>

          <div>

            <label className="font-semibold text-[#08104d]">
              State
            </label>

            <input
              value={form.state}
              onChange={(e) =>
                setForm({
                  ...form,
                  state: e.target.value,
                })
              }
              placeholder="India"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-2xl
                p-4
                outline-none
              "
            />

          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="mt-6">

          <label className="font-semibold text-[#08104d]">
            Description
          </label>

          <textarea
            rows={5}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            placeholder="Category description"
            className="
              mt-2
              w-full
              border
              border-gray-200
              rounded-2xl
              p-4
              outline-none
            "
          />

        </div>

        {/* IMAGE */}
        <div className="mt-8">

          <label className="font-semibold text-[#08104d]">
            Category Icon
          </label>

          <label
            className="
              mt-3
              border-2
              border-dashed
              border-gray-300
              rounded-3xl
              h-[220px]
              flex
              items-center
              justify-center
              cursor-pointer
              overflow-hidden
              bg-[#fafafa]
            "
          >

            {form.imageUrl ? (

              <img
                src={form.imageUrl}
                className="
                  w-full
                  h-full
                  object-cover
                "
              />

            ) : (

              <div className="text-center">

                <ImagePlus
                  size={40}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-4 text-gray-500">
                  Upload category icon
                </p>

              </div>

            )}

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                uploadImage(
                  e.target.files[0]
                )
              }
            />

          </label>

          {uploading && (
            <p className="mt-3 text-gray-500">
              Uploading...
            </p>
          )}

        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-10">

          <button
            onClick={saveService}
            className="
              bg-[#5865F2]
              hover:bg-[#4452eb]
              text-white
              px-10
              py-5
              rounded-2xl
              font-semibold
              transition-all
            "
          >
            {editingId
              ? 'Update Category'
              : 'Add Category'}
          </button>

          {editingId && (

            <button
              onClick={resetForm}
              className="
                px-8
                py-5
                rounded-2xl
                bg-gray-100
                font-semibold
              "
            >
              Cancel
            </button>

          )}

        </div>

      </div>

      {/* CATEGORY LIST */}
      <div className="mt-14">

        <h2
          className="
            text-3xl
            font-black
            text-[#08104d]
            mb-8
          "
        >
          Existing Categories
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">

          {services.map((item) => (

            <div
              key={item.$id}
              className="
                bg-white
                rounded-3xl
                p-6
                border
                border-gray-100
                shadow-sm
              "
            >

              <div className="flex items-center gap-5">

                <div
                  className="
                    w-20
                    h-20
                    rounded-full
                    overflow-hidden
                    bg-[#f5f5ff]
                    shrink-0
                  "
                >

                  <img
                    src={item.imageUrl}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                </div>

                <div>

                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#08104d]
                    "
                  >
                    {item.title}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {item.state}
                  </p>

                </div>

              </div>

              <p className="mt-5 text-gray-500 leading-8">
                {item.description}
              </p>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    editService(item)
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    bg-blue-100
                    text-blue-600
                    px-5
                    py-3
                    rounded-xl
                    font-medium
                  "
                >
                  <Pencil size={18} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteService(item.$id)
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    bg-red-100
                    text-red-600
                    px-5
                    py-3
                    rounded-xl
                    font-medium
                  "
                >
                  <Trash2 size={18} />
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