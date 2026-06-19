"use client";

import { useEffect, useState } from "react";
import { databases, storage, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const JOBS_COLLECTION = "teacher_jobs";
const APPLICATIONS_COLLECTION = "teacher_applications";

export default function TeacherJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    qualification: "",
    experience: "",
    description: "",
    isActive: true,
    showPopup: true,
  });

  const fetchJobs = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION
      );

      setJobs(res.documents);

      const appMap = {};

      for (const job of res.documents) {
        const apps = await databases.listDocuments(
          DATABASE_ID,
          APPLICATIONS_COLLECTION,
          [Query.equal("jobId", job.$id)]
        );

        appMap[job.$id] = apps.documents;
      }

      setApplications(appMap);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async () => {
    try {
      if (!form.title.trim()) {
        alert("Title required");
        return;
      }

      await databases.createDocument(
        DATABASE_ID,
        JOBS_COLLECTION,
        ID.unique(),
        {
          title: form.title,
          qualification: form.qualification,
          experience: form.experience,
          description: form.description,
          isActive: form.isActive,
          showPopup: form.showPopup,
        }
      );

      setForm({
        title: "",
        qualification: "",
        experience: "",
        description: "",
        isActive: true,
        showPopup: true,
      });

      fetchJobs();
      alert("Job created");
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        JOBS_COLLECTION,
        id
      );

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (job) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        JOBS_COLLECTION,
        job.$id,
        {
          isActive: !job.isActive,
        }
      );

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePopup = async (job) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        JOBS_COLLECTION,
        job.$id,
        {
          showPopup: !job.showPopup,
        }
      );

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        APPLICATIONS_COLLECTION,
        appId,
        { status }
      );

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const viewResume = async (resumeFileId) => {
    try {
      const url = storage.getFileView(
        BUCKET_ID,
        resumeFileId
      );

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading...
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-slate-100 p-6">

    {/* HEADER */}

    <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white shadow-2xl">

      <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">
        Teacher Recruitment Management
      </div>

      <h1 className="mt-5 text-5xl font-bold">
        Teacher Recruitment CMS
      </h1>

      <p className="mt-3 text-blue-100 text-lg">
        Manage vacancies, applications and recruitment workflow
      </p>

    </div>

    {/* CREATE VACANCY */}

    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-10">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Create New Vacancy
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <input
          className="border border-slate-200 focus:border-blue-500 outline-none p-4 rounded-xl"
          placeholder="Teacher Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <input
          className="border border-slate-200 focus:border-blue-500 outline-none p-4 rounded-xl"
          placeholder="Qualification"
          value={form.qualification}
          onChange={(e) =>
            setForm({
              ...form,
              qualification: e.target.value,
            })
          }
        />

        <input
          className="border border-slate-200 focus:border-blue-500 outline-none p-4 rounded-xl"
          placeholder="Experience"
          value={form.experience}
          onChange={(e) =>
            setForm({
              ...form,
              experience: e.target.value,
            })
          }
        />

      </div>

      <textarea
        rows={5}
        className="w-full mt-5 border border-slate-200 focus:border-blue-500 outline-none p-4 rounded-xl"
        placeholder="Job Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
      />

      <div className="flex flex-wrap gap-8 mt-6">

        <label className="flex items-center gap-3 font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({
                ...form,
                isActive: e.target.checked,
              })
            }
          />
          Active Vacancy
        </label>

        <label className="flex items-center gap-3 font-medium">
          <input
            type="checkbox"
            checked={form.showPopup}
            onChange={(e) =>
              setForm({
                ...form,
                showPopup: e.target.checked,
              })
            }
          />
          Show Popup
        </label>

      </div>

      <button
        onClick={createJob}
        className="mt-6 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition"
      >
        Create Vacancy
      </button>

    </div>

    {/* JOBS */}

    <div className="space-y-8">

      {jobs.map((job) => (
        <div
          key={job.$id}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
        >

          {/* TOP */}

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-7">

            <div className="flex flex-wrap justify-between gap-5">

              <div>

                <h2 className="text-3xl font-bold">
                  {job.title}
                </h2>

                <div className="flex flex-wrap gap-4 mt-3">

                  <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                    Qualification: {job.qualification}
                  </span>

                  <span className="bg-white/10 px-4 py-2 rounded-full text-sm">
                    Experience: {job.experience}
                  </span>

                </div>

                <p className="mt-4 text-slate-300">
                  {job.description}
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() => toggleActive(job)}
                  className={`px-5 py-3 rounded-xl text-white font-semibold ${
                    job.isActive
                      ? "bg-red-500"
                      : "bg-green-600"
                  }`}
                >
                  {job.isActive
                    ? "Disable"
                    : "Enable"}
                </button>

                <button
                  onClick={() => togglePopup(job)}
                  className="px-5 py-3 rounded-xl bg-yellow-500 text-white font-semibold"
                >
                  Popup {job.showPopup ? "ON" : "OFF"}
                </button>

                <button
                  onClick={() =>
                    deleteJob(job.$id)
                  }
                  className="px-5 py-3 rounded-xl bg-slate-700 text-white font-semibold"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

          {/* APPLICATIONS */}

          <div className="p-7">

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-2xl font-bold text-slate-800">
                Applications
              </h3>

              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                {applications[job.$id]?.length || 0}
              </div>

            </div>

            <div className="space-y-5">

              {applications[job.$id]?.length === 0 && (
                <div className="text-center py-10 text-slate-500 border rounded-2xl">
                  No applications yet
                </div>
              )}

              {applications[job.$id]?.map((app) => (
                <div
                  key={app.$id}
                  className="border border-slate-200 rounded-2xl p-6 bg-slate-50"
                >

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                      <p className="text-slate-500 text-sm">
                        Name
                      </p>
                      <p className="font-semibold">
                        {app.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Father
                      </p>
                      <p className="font-semibold">
                        {app.fatherName}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Age
                      </p>
                      <p className="font-semibold">
                        {app.age}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        DOB
                      </p>
                      <p className="font-semibold">
                        {app.dob}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Qualification
                      </p>
                      <p className="font-semibold">
                        {app.qualification}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Phone
                      </p>
                      <p className="font-semibold">
                        {app.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Email
                      </p>
                      <p className="font-semibold break-all">
                        {app.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Status
                      </p>

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          app.status === "Selected"
                            ? "bg-green-100 text-green-700"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {app.status}
                      </span>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      onClick={() =>
                        viewResume(app.resumeFileId)
                      }
                      className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      View Resume
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          app.$id,
                          "Selected"
                        )
                      }
                      className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      Selected
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          app.$id,
                          "Rejected"
                        )
                      }
                      className="bg-red-600 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      Rejected
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          app.$id,
                          "Pending"
                        )
                      }
                      className="bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      Pending
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      ))}

    </div>

  </div>
);
}