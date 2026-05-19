"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import QRCode from "qrcode";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const CERT_COLLECTION = "certificates";
const BUCKET_ID = "6986e8a4001925504f6b";

export default function FranchiseCertificateView() {

  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  // ===============================
  // ✅ GET USER
  // ===============================
  const getUser = async () => {

    try {

      const u = await account.get();

      setUser(u);

      loadCertificates(u.$id);

    } catch (err) {

      console.log(err);

    }
  };

  // ===============================
  // ✅ LOAD CERTIFICATES
  // ===============================
  const loadCertificates = async (userId) => {

    try {

      const res = await databases.listDocuments(
        DATABASE_ID,
        CERT_COLLECTION,
        [
          Query.equal("status", "approved"),
          Query.equal("createdById", userId)
        ]
      );

      setCertificates(res.documents);

    } catch (err) {

      console.log(err);

    }
  };

  // ===============================
  // ✅ PRINT CERTIFICATE
  // ===============================
  const printCertificate = async (cert) => {

    try {

      const studentData = await databases.getDocument(
        DATABASE_ID,
        "student_admissions",
        cert.studentId
      );

      // ✅ FRANCHISE
      const franchiseRes = await databases.listDocuments(
        DATABASE_ID,
        "franchise_approved",
        [Query.equal("email", studentData.franchiseEmail)]
      );

      const franchiseData = franchiseRes.documents[0];

      // ✅ QR
      const verifyUrl =
        `https://www.bnmiindia.org/beauty-verification/${cert.studentId}`;

      const qrCode = await QRCode.toDataURL(verifyUrl);

      // ✅ FINAL DATA
      const data = {

        // 🔥 IMPORTANT
        readOnly: true,

        studentId: cert.studentId,

       studentName:
  cert.studentName ||
  studentData.studentName ||
  "",

        fatherName:
  cert.fatherName ||
  studentData.fatherName ||
  "",

        motherName:
  cert.motherName ||
  studentData.motherName ||
  "",

        relationType:
          studentData.relationType || "S/O",

        showFatherInCertificate:
          String(studentData.showFatherInCertificate)
            .toLowerCase() === "true",

        showMotherInCertificate:
          String(studentData.showMotherInCertificate)
            .toLowerCase() === "true",

       course:
  cert.course ||
  studentData.courseName ||
  "",

   duration:
  cert.duration || "N/A",

        grade:
  cert.grade || "",

     marks:
  cert.marks || "",

    instituteName:
  cert.instituteName ||
  studentData.instituteName ||
  "",

        photoId:
          studentData.photoId || "",

        signatureId:
          studentData.signatureId || "",

       franchiseSignature:
  cert.franchiseSignature ||
  franchiseData?.signature ||
  "",

        logo:
          franchiseData?.logo || "",

        ownerName:
          franchiseData?.ownerName ||
          franchiseData?.owner ||
          franchiseData?.name ||
          "",
city:
  cert.city ||
  franchiseData?.city ||
  franchiseData?.address ||
  "",

        address:
          franchiseData?.address || "",

        qrCode,
        verifyUrl,

        certificateNo:
          cert.certificateNo ||
          `CERT-${Date.now()}`,
issueDate:
  cert.issueDate || "",

        semesterNumber:
          studentData.courseType === "semester"
            ? cert.semesterNumber
            : null
      };

   

    if (studentData.courseType === "beauty") {

  window.open(
    `/login/institute/certificate/beauty-certificate/${cert.$id}`,
    "_blank"
  );

} else if (studentData.courseType === "semester") {

  window.open(
    `/login/institute/certificate/semester-certificate/${cert.$id}`,
    "_blank"
  );

} else if (studentData.courseType === "multiple") {

  window.open(
    `/login/institute/certificate/multiple-certificate/${cert.$id}`,
    "_blank"
  );

} else {

  window.open(
    `/login/institute/certificate/print/${cert.$id}`,
    "_blank"
  );
}

    } catch (err) {

      console.log(err);

      alert("Certificate error");

    }
  };

  // ===============================
  // ✅ PRINT MARKSHEET
  // ===============================
  const printMarksheet = async (cert) => {

    try {

      const studentData = await databases.getDocument(
        DATABASE_ID,
        "student_admissions",
        cert.studentId
      );

      // ✅ FRANCHISE
      const franchiseRes = await databases.listDocuments(
        DATABASE_ID,
        "franchise_approved",
        [Query.equal("email", studentData.franchiseEmail)]
      );

      const franchiseData = franchiseRes.documents[0];

      // ===============================
      // ✅ SUBJECT MARKS
      // ===============================
      let marksArray = [];

      try {

        const res = await databases.listDocuments(
          DATABASE_ID,
          "student_subject_results",
          [Query.equal("studentId", cert.studentId)]
        );

        marksArray = res.documents.map((m) => ({
          subject: m.subject,
          objective: Number(m.objective || 0),
          practical: Number(m.practical || 0),
          total: Number(m.total || 0),
        }));

      } catch (err) {

        console.log("MARK FETCH ERROR:", err);

      }

      // ✅ FINAL DATA
     

      // ✅ OPEN PAGE
      if (studentData.courseType === "beauty") {

        window.open(
          "/login/institute/certificate/beauty-marksheet",
          "_blank"
        );

      } else if (studentData.courseType === "semester") {

        window.open(
          "/login/institute/certificate/semester-marksheet",
          "_blank"
        );

      } else if (studentData.courseType === "multiple") {

        window.open(
          "/login/institute/certificate/multiple-marksheet",
          "_blank"
        );

      } else {

        window.open(
          "/login/institute/certificate/marksheet",
          "_blank"
        );
      }

    } catch (err) {

      console.log(err);

      alert("Marksheet error");

    }
  };

  // ===============================
  // ✅ PHOTO
  // ===============================
  const getPhoto = (photoId) => {

    if (!photoId) return null;

    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  return (

    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Approved Certificates
      </h1>

      <table className="w-full border">

        <thead>

          <tr>

            <th className="border p-2">#</th>

            <th className="border p-2">
              Photo
            </th>

            <th className="border p-2">
              Student
            </th>

            <th className="border p-2">
              Course
            </th>

            <th className="border p-2">
              Marks
            </th>

            <th className="border p-2">
              Grade
            </th>

            <th className="border p-2">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {certificates.map((c, i) => (

            <tr key={c.$id}>

              <td className="border p-2">
                {i + 1}
              </td>

              <td className="border p-2">

                {getPhoto(c.photoId) ? (

                  <img
                    src={getPhoto(c.photoId)}
                    className="w-12 h-12 rounded-full object-cover mx-auto border"
                  />

                ) : (
                  "N/A"
                )}

              </td>

              <td className="border p-2">
                {c.studentName}
              </td>

              <td className="border p-2">
                {c.course}
              </td>

              <td className="border p-2">
                {c.marks}
              </td>

              <td className="border p-2">
                {c.grade}
              </td>

              <td className="border p-2 flex gap-2">

                <button
                  onClick={() => printCertificate(c)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Certificate
                </button>

                <button
                  onClick={() => printMarksheet(c)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                >
                  Marksheet
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}