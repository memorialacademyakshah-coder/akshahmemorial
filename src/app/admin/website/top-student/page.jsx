
"use client";

import { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import {
  Trophy,
  Users,
  Award,
  Pencil,
  Trash2,
  Upload,
  Save,
  X,
} from "lucide-react";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLLECTION_ID = "top_students";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function TopStudentsCMS() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] =
    useState(null);

  const [newStudent, setNewStudent] =
    useState({
      name: "",
      class: "",
      rank: "",
      percentage: "",
      achievement: "",
      imageUrl: "",
    });

  /* ================= FETCH ================= */

  const fetchStudents = async () => {
    try {
      const res =
        await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderAsc("order")]
        );

      setStudents(res.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= IMAGE ================= */

const uploadImage = async (
  file,
  isEdit = false
) => {
  if (!file) return;

  try {
    const uploaded = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    const fileId = uploaded.$id;

    console.log("Uploaded File ID:", fileId);

    if (isEdit) {
      setEditingStudent((prev) => ({
        ...prev,
        imageUrl: fileId,
      }));
    } else {
      setNewStudent((prev) => ({
        ...prev,
        imageUrl: fileId,
      }));
    }
  } catch (error) {
    console.error(error);
    alert("Image Upload Failed");
  }
};

const getImageUrl = (fileId) => {
  if (!fileId) return "/placeholder.png";

  return storage.getFileView(
    BUCKET_ID,
    fileId
  ).toString();
};
  /* ================= ADD ================= */

  const addStudent = async () => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          name: newStudent.name,
          class:
            newStudent.class,
          rank: newStudent.rank,
          percentage:
            newStudent.percentage,
          achievement:
            newStudent.achievement,
          imageUrl: newStudent.imageUrl,
          order: students.length + 1,
        }
      );

      setNewStudent({
        name: "",
        class: "",
        rank: "",
        percentage: "",
        achievement: "",
        imageUrl: "",
      });

      fetchStudents();

      alert("Student Added Successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add student");
    }
  };

  /* ================= DELETE ================= */

  const deleteStudent = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this student?"
      );

    if (!confirmDelete) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );

      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UPDATE ================= */

  const updateStudent = async () => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        editingStudent.$id,
        {
          name: editingStudent.name,
          class:
            editingStudent.class,
          rank: editingStudent.rank,
          percentage:
            editingStudent.percentage,
          achievement:
            editingStudent.achievement,
          imageUrl:
            editingStudent.imageUrl,
        }
      );

      setEditingStudent(null);
      fetchStudents();

      alert("Updated Successfully");
    } catch (err) {
      console.error(err);
      alert("Update Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Background */}

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.12),transparent_45%)]" />

      <div className="fixed top-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="fixed bottom-0 left-0 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-10">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-400">

            <Trophy size={16} />

            Academic Excellence CMS

          </div>

          <h1 className="mt-5 text-5xl font-bold">
            Top Students
            <span className="text-cyan-400">
              {" "}Dashboard
            </span>
          </h1>

          <p className="mt-4 text-gray-400">
            Manage toppers, achievements,
            rankings and student showcase.
          </p>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

            <Users className="text-cyan-400" />

            <p className="mt-3 text-gray-400">
              Total Students
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {students.length}
            </h2>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

            <Award className="text-yellow-400" />

            <p className="mt-3 text-gray-400">
              Achievers
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {students.length}
            </h2>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

            <Trophy className="text-green-400" />

            <p className="mt-3 text-gray-400">
              Excellence
            </p>

            <h2 className="text-4xl font-bold mt-2">
              🏆
            </h2>

          </div>

        </div>

        {/* ADD FORM */}

        <div className="mb-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Add New Student
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value,
                })
              }
            />

            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Class"
              value={newStudent.class}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  class:
                    e.target.value,
                })
              }
            />

            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Rank"
              value={newStudent.rank}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  rank: e.target.value,
                })
              }
            />

            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Percentage"
              value={newStudent.percentage}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  percentage:
                    e.target.value,
                })
              }
            />

          </div>

          <textarea
            rows={4}
            placeholder="Achievement"
            value={newStudent.achievement}
            onChange={(e) =>
              setNewStudent({
                ...newStudent,
                achievement:
                  e.target.value,
              })
            }
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />

          <div className="mt-5">

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 p-4">

              <Upload />

              Upload Student Photo

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

            {newStudent.imageUrl && (
              <img
                src={getImageUrl(
                  newStudent.imageUrl
                )}
                alt=""
                className="mt-5 h-36 w-36 rounded-3xl object-cover border border-cyan-500/20"
              />
            )}

          </div>

          <button
            onClick={addStudent}
            className="mt-6 rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-black hover:scale-105 transition"
          >
            Add Student
          </button>

        </div>

        {/* STUDENTS */}

        <div className="space-y-5">

          {students.map((student) => (

            <div
              key={student.$id}
              className="rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >

              {editingStudent?.$id ===
              student.$id ? (

                <div className="space-y-4">

                  <input
                    value={
                      editingStudent.name
                    }
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        name:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  />

                  <input
                    value={
                      editingStudent.class
                    }
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        class:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  />

                  <input
                    value={
                      editingStudent.rank
                    }
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        rank:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  />

                  <input
                    value={
                      editingStudent.percentage
                    }
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        percentage:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  />

                  <textarea
                    rows={4}
                    value={
                      editingStudent.achievement
                    }
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        achievement:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  />

                  <div className="flex gap-3">

                    <button
                      onClick={
                        updateStudent
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-500/20 px-5 py-2 text-green-400"
                    >
                      <Save size={16} />
                      Save
                    </button>

                    <button
                      onClick={() =>
                        setEditingStudent(
                          null
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-gray-500/20 px-5 py-2 text-gray-300"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                  </div>

                </div>

              ) : (

                <div className="flex flex-col md:flex-row items-center justify-between gap-5">

                  <div className="flex items-center gap-5">

                    {student.imageUrl && (
                      <img
                        src={getImageUrl(
                          student.imageUrl
                        )}
                        alt=""
                        className="h-24 w-24 rounded-3xl object-cover border border-cyan-500/20"
                      />
                    )}

                    <div>

                      <h3 className="text-2xl font-bold">
                        {student.name}
                      </h3>

                      <p className="text-cyan-400">
                        {
                          student.class
                        }
                      </p>

                      <div className="mt-2 flex gap-2 flex-wrap">

                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                          {
                            student.percentage
                          }
                        </span>

                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
                          {student.rank}
                        </span>

                      </div>

                      <p className="mt-3 text-gray-400">
                        {
                          student.achievement
                        }
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        setEditingStudent(
                          student
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-blue-500/20 px-5 py-2 text-blue-400"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteStudent(
                          student.$id
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-red-500/20 px-5 py-2 text-red-400"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

