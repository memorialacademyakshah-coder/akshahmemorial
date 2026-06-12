"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Storage, Client, ID, Query } from "appwrite";
import { useParams, useRouter } from "next/navigation";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "student_admissions";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const storage = new Storage(client);

export default function EditStudent() {

  const { id } = useParams();
  const router = useRouter();

  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);

  const [photoPreview, setPhotoPreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({

    studentName: "",
    surname: "",

    relationType: "S/O",

    fatherName: "",
    motherName: "",

    showFatherInCertificate: false,
    showMotherInCertificate: false,

    mobile: "",
    altMobile: "",
    email: "",
className: "",
    dob: "",
    gender: "",

    state: "",
    city: "",
    postcode: "",
    address: "",

    aadhar: "",
    qualification: "",
    occupation: "",

    courseName: "",
    subjects: "",

    courseFees: 0,
    discount: 0,
    totalFees: 0,
    feesReceived: 0,
    balance: 0,
    examFees: 0,

    batch: "",
    admissionDate: "",
    remark: ""

  });

  useEffect(() => {
    fetchStudent();
  }, []);

  useEffect(() => {
  fetchStudent();
  loadCourses();
}, []);

const loadCourses = async () => {
  try {

    const res = await databases.listDocuments(
      DATABASE_ID,
      "courses_single"
    );

    setCourses(res.documents);

  } catch (err) {
    console.log(err);
  }
};

  const fetchStudent = async () => {

    try {

      const res = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );

      setForm({
  ...res,
  className:
    res.className ||
    res.originalClass ||
    ""
});

      // PHOTO PREVIEW
      if (res.photoId) {
        setPhotoPreview(
          `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${res.photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        );
      }

      // SIGNATURE PREVIEW
      if (res.signatureId) {
        setSignaturePreview(
          `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${res.signatureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        );
      }

    } catch (err) {

      console.log(err);
      alert("Failed to load student");

    }
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const calculateFees = (courseFees, discount) => {

    const fees = Number(courseFees) || 0;
    const disc = Number(discount) || 0;

    const total = fees - disc;
    const balance = total - (Number(form.feesReceived) || 0);

    setForm(prev => ({
      ...prev,
      courseFees: fees,
      discount: disc,
      totalFees: total,
      balance
    }));

  };

  const handleFeesReceived = (value) => {

    const received = Number(value) || 0;

    const balance =
      (Number(form.totalFees) || 0) - received;

    setForm(prev => ({
      ...prev,
      feesReceived: received,
      balance
    }));

  };

 const loadExamFee = async () => {

  try {

    const franchiseRes =
      await databases.listDocuments(
        DATABASE_ID,
        "franchise_approved",
        [
          Query.equal(
            "email",
            form.franchiseEmail
          )
        ]
      );

    if (
      franchiseRes.documents.length === 0
    ) {
      return 0;
    }

    const plan =
      franchiseRes.documents[0].plan;

    const planRes =
      await databases.listDocuments(
        DATABASE_ID,
        "franchise_plans",
        [
          Query.equal("name", plan)
        ]
      );

    if (
      planRes.documents.length > 0
    ) {
      return Number(
        planRes.documents[0].amount || 0
      );
    }

    return 0;

  } catch (err) {

    console.log(err);

    return 0;

  }
};


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      let photoId = form.photoId;
      let signatureId = form.signatureId;

      // PHOTO UPDATE
      if (photo) {

        const uploadPhoto = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          photo
        );

        photoId = uploadPhoto.$id;
      }

      // SIGNATURE UPDATE
      if (signature) {

        const uploadSign = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          signature
        );

        signatureId = uploadSign.$id;
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        {

          ...form,

          photoId,
          signatureId,
          courseId: form.courseId,
courseName: form.courseName,
subjects: form.subjects,

          courseFees: Number(form.courseFees) || 0,
          discount: Number(form.discount) || 0,
          totalFees: Number(form.totalFees) || 0,
          feesReceived: Number(form.feesReceived) || 0,
          balance: Number(form.balance) || 0

        }
      );

      alert("Student Updated Successfully");

      router.push("/login/institute/manage-student/admission");

    } catch (err) {

      console.log(err);
      alert(err?.message || "Update failed");

    }

  };

  return (

 <form
  onSubmit={handleSubmit}
  className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-8"
>

   <div className="max-w-7xl mx-auto mb-8">

  <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">

      <h1 className="text-4xl font-bold text-white">
        Student Profile Management
      </h1>

      <p className="text-blue-100 mt-2">
        Update student details, course, fees and documents
      </p>

    </div>

  </div>

</div>

      {/* PHOTO + SIGNATURE */}
<div className="max-w-7xl mx-auto">

<div className="bg-white rounded-3xl shadow-xl p-8"></div>
      <div className="grid grid-cols-2 gap-6 mb-8">

        <div>

          <label className="block font-semibold mb-2">
            Student Photo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file = e.target.files[0];

              setPhoto(file);

              if (file) {
                setPhotoPreview(URL.createObjectURL(file));
              }

            }}
            className="
w-full
rounded-2xl
border-2
border-dashed
border-blue-300
p-4
bg-blue-50
hover:border-blue-500
transition
"
          />

          {photoPreview && (
            <img
              src={photoPreview}
              className="w-28 h-28 object-cover rounded mt-3 border"
            />
          )}

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Signature
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file = e.target.files[0];

              setSignature(file);

              if (file) {
                setSignaturePreview(URL.createObjectURL(file));
              }

            }}
            className="
w-full
rounded-2xl
border-2
border-dashed
border-blue-300
p-4
bg-blue-50
hover:border-blue-500
transition
"
          />

          {signaturePreview && (
            <img
              src={signaturePreview}
              className="w-28 h-20 object-contain rounded mt-3 border bg-white"
            />
          )}

        </div>

      </div>
      </div>
      

      {/* FORM */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

     <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Student Name
</label>

<input
  name="studentName"
  value={form.studentName || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>

      <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Surname
</label>

<input
  name="surname"
  value={form.surname || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>

      <div>

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Relation Type
        </label>

        <select
          name="relationType"
          value={form.relationType || "S/O"}
          onChange={handleChange}
          className="border p-3 bg-white"
        >
          <option>S/O</option>
          <option>D/O</option>
          <option>W/O</option>
        </select>

      </div>

        {/* FATHER */}

        <div>


       <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Father Name
</label>

<input
  name="fatherName"
  value={form.fatherName || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>
          <div className="flex items-center gap-2 mt-2">

            <input
              type="checkbox"
              checked={form.showFatherInCertificate || false}
              onChange={(e) =>
                setForm({
                  ...form,
                  showFatherInCertificate: e.target.checked
                })
              }
            />

            <label className="text-sm">
              Show in Certificate
            </label>

          </div>

        </div>

        {/* MOTHER */}

        <div>

         <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Mother Name
</label>

<input
  name="motherName"
  value={form.motherName || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>

          <div className="flex items-center gap-2 mt-2">

            <input
              type="checkbox"
              checked={form.showMotherInCertificate || false}
              onChange={(e) =>
                setForm({
                  ...form,
                  showMotherInCertificate: e.target.checked
                })
              }
            />

            <label className="text-sm">
              Show in Certificate
            </label>

          </div>

        </div>

<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Class Name
  </label>

  <input
    value={form.className || ""}
    readOnly
    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3"
  />
</div>
      <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Mobile
</label>

<input
  name="mobile"
  value={form.mobile || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>

      <div>

<label className="block text-sm font-semibold text-gray-700 mb-2">
  Alternate Mobile
</label>

<input
  name="altMobile"
  value={form.altMobile || ""}
  onChange={handleChange}
  className="
  w-full
  rounded-xl
  border
  border-gray-300
  px-4
  py-3
  bg-white
  focus:ring-2
  focus:ring-blue-500
  "
/>

</div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>

          <input
            name="email"
            value={form.email || ""}
            placeholder="Email"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <input
          type="date"
          name="dob"
          value={form.dob || ""}
          onChange={handleChange}
          className="border p-3 bg-white"
        />

        <select
          name="gender"
          value={form.gender || ""}
          onChange={handleChange}
          className="border p-3 bg-white"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          name="aadhar"
          value={form.aadhar || ""}
          placeholder="Aadhar"
          onChange={handleChange}
          className="border p-3 bg-white"
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Qualification
          </label>

          <input
            name="qualification"
            value={form.qualification || ""}
            placeholder="Qualification"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Occupation
          </label>

          <input
            name="occupation"
            value={form.occupation || ""}
            placeholder="Occupation"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State
          </label>

          <input
            name="state"
            value={form.state || ""}
            placeholder="State"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>

          <input
            name="city"
            value={form.city || ""}
            placeholder="City"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Postcode
          </label>

          <input
            name="postcode"
            value={form.postcode || ""}
            placeholder="Postcode"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Address
          </label>

          <textarea
            name="address"
            value={form.address || ""}
            placeholder="Address"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

      
<select
  value={form.courseId || ""}
  onChange={async (e) => {

    const courseId = e.target.value;

    const course = courses.find(
      c => c.$id === courseId
    );

    if (!course) return;

    const subjectRes =
      await databases.listDocuments(
        DATABASE_ID,
        "course_subjects",
        [
          Query.equal(
            "courseId",
            courseId
          )
        ]
      );

    const subjects =
      subjectRes.documents
        .map(s => s.subjectName)
        .join(", ");

    setForm(prev => ({
      ...prev,
      courseId: courseId,
      courseName: course.courseName,
      subjects: subjects,
      courseFees:
        Number(course.courseFees || 0)
    }));

  }}
  className="border p-3 bg-white"
>

  <option value="">
    Select Course
  </option>

  {courses.map(course => (
    <option
      key={course.$id}
      value={course.$id}
    >
      {course.courseName}
    </option>
  ))}

</select>
        <input
          name="subjects"
          value={form.subjects || ""}
          placeholder="Subjects"
          onChange={handleChange}
          className="border p-3 bg-white"
        />


        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Batch
          </label>

          <input
            name="batch"
            value={form.batch || ""}
            placeholder="Batch"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Course Fees
          </label>

          <input
            type="number"
            name="courseFees"
            value={form.courseFees || 0}
            placeholder="Course Fees"
            onChange={(e) =>
              calculateFees(e.target.value, form.discount)
            }
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Discount
          </label>

          <input
            type="number"
            name="discount"
            value={form.discount || 0}
            placeholder="Discount"
            onChange={(e) =>
              calculateFees(form.courseFees, e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              px-4
              py-3
              bg-white
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        <input
          value={form.totalFees || 0}
          readOnly
          className="border p-3 bg-gray-200"
        />

        <input
          type="number"
          value={form.feesReceived || 0}
          placeholder="Fees Received"
          onChange={(e) =>
            handleFeesReceived(e.target.value)
          }
          className="border p-3 bg-white"
        />

        <input
          value={form.balance || 0}
          readOnly
          className="border p-3 bg-gray-200"
        />

        <input
          type="date"
          name="admissionDate"
          value={form.admissionDate || ""}
          onChange={handleChange}
          className="border p-3 bg-white"
        />

        <textarea
          name="remark"
          value={form.remark || ""}
          placeholder="Remark"
          onChange={handleChange}
          className="border p-3 bg-white col-span-3"
        />

      </div>

      <div className="mt-8 flex justify-center">

        <button
          type="submit"
className="
px-10
py-4
rounded-2xl
text-white
font-bold
bg-gradient-to-r
from-blue-600
to-indigo-600
hover:scale-105
transition-all
shadow-lg
"
        >
          Update Student
        </button>

      </div>

    </form>

  );

}