'use client'

import { useEffect, useState } from 'react'
import { databases, storage } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const COLLECTION_ID = 'website'
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID

export default function NavbarCMS() {
  const [docId, setDocId] = useState(null)

  const [form, setForm] = useState({
    topBarText: '',
    phone: '',
    logoUrl: '',
    navMenus: '',
    showFranchiseBtn: true,
    showAdminBtn: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.limit(1)]
      )

      if (res.documents.length) {
        const d = res.documents[0]

        setDocId(d.$id)

        setForm({
          topBarText: d.topBarText || '',
          phone: d.phone || '',
          logoUrl: d.logoUrl || '',
          navMenus: d.navMenus || '',
          showFranchiseBtn: d.showFranchiseBtn ?? true,
          showAdminBtn: d.showAdminBtn ?? true,
        })
      }
    }

    fetchData()
  }, [])

  const uploadLogo = async (file) => {
    if (!file) return

    const uploaded = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    )

    const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploaded.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    setForm((prev) => ({
      ...prev,
      logoUrl: url,
    }))
  }

  const saveNavbar = async () => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        docId,
        form
      )

      alert('Navbar Updated Successfully ✅')
    } catch (err) {
      console.error(err)
      alert('Failed to update navbar')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-[#0A1551] to-[#5865F2] rounded-3xl p-8 text-white shadow-xl mb-8">

          <h1 className="text-4xl font-bold">
            Navbar CMS
          </h1>

          <p className="mt-2 text-white/80">
            Manage institute name, logo and navbar settings
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="p-8 space-y-8">

            {/* INSTITUTE NAME */}

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-[#0A1551] mb-5">
                Institute Information
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Institute Name
                  </label>

                  <input
                    value={form.topBarText}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        topBarText: e.target.value,
                      })
                    }
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#5865F2]
                    "
                    placeholder="PERFECT COMPUTER INSTITUTE"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-xl
                      px-4
                      py-3
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#5865F2]
                    "
                    placeholder="Enter phone number"
                  />
                </div>

              </div>

            </div>

            {/* LOGO SETTINGS */}

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-[#0A1551] mb-5">
                Logo Settings
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">

                <div>

                  <label className="block mb-3 font-medium text-gray-700">
                    Upload Logo
                  </label>

                  <label
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      h-52
                      border-2
                      border-dashed
                      border-[#5865F2]
                      rounded-2xl
                      bg-white
                      cursor-pointer
                      hover:bg-blue-50
                      transition
                    "
                  >
                    <span className="text-[#5865F2] font-semibold">
                      Click To Upload Logo
                    </span>

                    <span className="text-sm text-gray-500 mt-2">
                      PNG, JPG, SVG
                    </span>

                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        uploadLogo(e.target.files[0])
                      }
                    />
                  </label>

                </div>

                {/* PREVIEW */}

                <div>

                  <label className="block mb-3 font-medium text-gray-700">
                    Navbar Preview
                  </label>

                  <div
                    className="
                      h-52
                      bg-white
                      rounded-2xl
                      border
                      flex
                      items-center
                      justify-center
                      px-4
                    "
                  >

                    <div className="flex items-center gap-6">

                      {form.logoUrl && (
                        <img
                          src={form.logoUrl}
                          alt="logo"
                          className="h-20 object-contain"
                        />
                      )}

                      <h2
                        className="
                          text-2xl
                          lg:text-3xl
                          font-bold
                          text-[#0A1551]
                          text-center
                        "
                      >
                        {form.topBarText || 'BNMI INDIA'}
                      </h2>

                      {form.logoUrl && (
                        <img
                          src={form.logoUrl}
                          alt="logo"
                          className="h-20 object-contain"
                        />
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* BUTTON SETTINGS */}

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-[#0A1551] mb-5">
                Button Visibility
              </h2>

              <div className="space-y-5">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold">
                      Franchise Login Button
                    </h3>

                    <p className="text-sm text-gray-500">
                      Show or hide franchise login
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.showFranchiseBtn}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        showFranchiseBtn: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#5865F2]"
                  />

                </div>

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold">
                      Admin Login Button
                    </h3>

                    <p className="text-sm text-gray-500">
                      Show or hide admin login
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.showAdminBtn}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        showAdminBtn: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#5865F2]"
                  />

                </div>

              </div>

            </div>

            {/* SAVE BUTTON */}

            <button
              onClick={saveNavbar}
              className="
                w-full
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-[#0A1551]
                to-[#5865F2]
                text-white
                text-lg
                font-semibold
                shadow-lg
                hover:scale-[1.01]
                transition
              "
            >
              Save Navbar Settings
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}