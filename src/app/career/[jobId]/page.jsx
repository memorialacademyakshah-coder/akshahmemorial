"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { databases, storage, ID } from "@/lib/appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const APPLICATIONS_COLLECTION =
  "teacher_applications";

export default function TeacherApplyPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    age: "",
    dob: "",
    qualification: "",
    phone: "",
    email: "",
  });

  const [resume, setResume] = useState(null);

  const submitApplication = async (e) => {
    e.preventDefault();

    try {
      if (!resume) {
        alert("Please upload resume PDF");
        return;
      }

      if (resume.type !== "application/pdf") {
        alert("Only PDF files allowed");
        return;
      }

      if (resume.size > 2 * 1024 * 1024) {
        alert("PDF must be below 2MB");
        return;
      }

      setLoading(true);

      const uploadedFile =
        await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          resume
        );

      await databases.createDocument(
        DATABASE_ID,
        APPLICATIONS_COLLECTION,
        ID.unique(),
        {
          jobId,
          name: form.name,
          fatherName: form.fatherName,
          age: form.age,
          dob: form.dob,
          qualification: form.qualification,
          phone: form.phone,
          email: form.email,
          resumeFileId: uploadedFile.$id,
          status: "Pending",
          submittedAt:
            new Date().toISOString(),
        }
      );

      alert(
        "Application submitted successfully"
      );

      router.push("/");

    } catch (error) {
      console.error(error);
      alert("Failed to submit");
    }

    setLoading(false);
  };

  return (
  <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">

    {/* Glow Effects */}
    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[150px] rounded-full" />

    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[150px] rounded-full" />

    {/* Main Content */}
    <div className="relative z-10 px-4 py-12">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-blue-200 text-sm font-medium">
            🎓 Akshah Memorial Academy
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white">
            Teacher Recruitment
          </h1>

          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Join our academic family and inspire the next generation
            through quality education and innovation.
          </p>

        </div>

        {/* Form Card */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-6 md:p-10">

          <form
            onSubmit={submitApplication}
            className="space-y-6"
          >

            {/* Personal Info */}
            <div>

              <h2 className="text-xl font-semibold text-white mb-5">
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  required
                  placeholder="Father Name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fatherName: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  required
                  placeholder="Age"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                  value={form.age}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      age: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white outline-none focus:border-blue-400"
                  value={form.dob}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dob: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            {/* Academic Info */}
            <div>

              <h2 className="text-xl font-semibold text-white mb-5">
                Academic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <input
                  type="text"
                  required
                  placeholder="Qualification"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      qualification:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />

              </div>

              <input
                type="email"
                required
                placeholder="Email Address"
                className="mt-5 w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-300 outline-none focus:border-blue-400"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

            </div>

            {/* Resume Upload */}
            <div>

              <h2 className="text-xl font-semibold text-white mb-5">
                Resume Upload
              </h2>

              <label className="block border-2 border-dashed border-blue-400/40 rounded-2xl p-8 text-center bg-white/5 hover:bg-white/10 transition cursor-pointer">

                <div className="text-5xl mb-3">
                  📄
                </div>

                <div className="text-white font-medium">
                  Upload Resume PDF
                </div>

                <div className="text-gray-300 text-sm mt-2">
                  PDF only • Maximum 2MB
                </div>

                <input
                  type="file"
                  accept=".pdf"
                  required
                  className="hidden"
                  onChange={(e) =>
                    setResume(
                      e.target.files[0]
                    )
                  }
                />

              </label>

              {resume && (
                <div className="mt-3 text-green-400 text-sm">
                  ✓ {resume.name}
                </div>
              )}

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] transition-all duration-300 shadow-[0_10px_40px_rgba(59,130,246,0.4)]"
            >
              {loading
                ? "Submitting Application..."
                : "Submit Application"}
            </button>

          </form>

        </div>

      </div>

    </div>

  </div>
);
}