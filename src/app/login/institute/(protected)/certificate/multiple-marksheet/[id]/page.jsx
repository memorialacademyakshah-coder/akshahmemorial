
"use client";

import { useEffect, useState, useRef } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import * as htmlToImage from "html-to-image";
import QRCode from "qrcode";
import { useParams } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

const CERTIFICATES = "certificates";
const ADMISSIONS = "student_admissions";
const SUBJECT_RESULTS = "student_subject_results";
const EXAM_RESULTS = "exam_results";

const clean = (value) => String(value ?? "").trim();

const getSubjectTotal = (mark) =>
  Number(mark?.objective || 0) + Number(mark?.practical || 0);

// AK Shah Memorial Academy grading scale
const gradeForPercent = (value) => {
  const percentage = Number(value) || 0;

  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";

  return "E";
};

const remarkForPercent = (value) => {
  const percentage = Number(value) || 0;

  if (percentage >= 90) return "Outstanding";
  if (percentage >= 80) return "Excellent";
  if (percentage >= 70) return "Very Good";
  if (percentage >= 60) return "Good";
  if (percentage >= 50) return "Satisfactory";

  return "Needs Improvement";
};

export default function PrintMarksheetMultiple() {
  const { id } = useParams();
  const printRef = useRef(null);

  const [student, setStudent] = useState(null);
  const [marksArray, setMarksArray] = useState([]);
  const [qrCode, setQrCode] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({});

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------
  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      try {
        const user = await account.get();

        if (active && user?.$id) {
          // This is a separate academy portal.
          // Appwrite document permissions must restrict writes.
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("AUTHENTICATION ERROR:", error);
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    checkUser();

    return () => {
      active = false;
    };
  }, []);

  // --------------------------------------------------
  // FETCH SUBJECT MARKS
  // --------------------------------------------------
  const fetchMarks = async (studentId) => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SUBJECT_RESULTS,
      [
        Query.equal("studentId", studentId),
        Query.limit(100),
      ]
    );

    const docs = [...response.documents].sort(
      (a, b) =>
        new Date(a.$createdAt) - new Date(b.$createdAt)
    );

    const mapped = docs.map((doc) => ({
      $id: doc.$id,
      subject: doc.subject || "",
      objective: Number(doc.objective || 0),
      practical: Number(doc.practical || 0),
      total: getSubjectTotal(doc),
    }));

    setMarksArray(mapped);
    return mapped;
  };

  // --------------------------------------------------
  // FETCH CERTIFICATE, ADMISSION AND EXAM RESULT
  // --------------------------------------------------
  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchStudent = async () => {
      setLoadingStudent(true);

      try {
        const certificate = await databases.getDocument(
          DATABASE_ID,
          CERTIFICATES,
          String(id)
        );

        if (!certificate.studentId) {
          throw new Error(
            "The certificate does not contain a studentId."
          );
        }

        const studentDoc = await databases.getDocument(
          DATABASE_ID,
          ADMISSIONS,
          certificate.studentId
        );

        const resultResponse = await databases.listDocuments(
          DATABASE_ID,
          EXAM_RESULTS,
          [
            Query.equal("studentId", certificate.studentId),
            Query.limit(100),
          ]
        );

        if (!resultResponse.documents.length) {
          throw new Error(
            "Exam result not found for this student."
          );
        }

        const result = resultResponse.documents[0];

        let franchise = null;

        const franchiseEmail =
          certificate.franchiseEmail ||
          studentDoc.franchiseEmail;

        if (franchiseEmail) {
          try {
            const franchiseResponse =
              await databases.listDocuments(
                DATABASE_ID,
                "franchise_approved",
                [
                  Query.equal("email", franchiseEmail),
                  Query.limit(1),
                ]
              );

            franchise = franchiseResponse.documents[0] || null;
          } catch (error) {
            console.error("FRANCHISE FETCH ERROR:", error);
          }
        }

        if (!active) return;

        const data = {
          ...studentDoc,
          ...certificate,

          studentId: certificate.studentId,
          admissionId: studentDoc.$id,
          examResultId: result.$id,

          studentName:
            certificate.studentName ||
            studentDoc.studentName ||
            "",

          fatherName:
            certificate.fatherName ||
            studentDoc.fatherName ||
            "",

          motherName:
            certificate.motherName ||
            studentDoc.motherName ||
            "",

          surname:
            certificate.surname ||
            studentDoc.surname ||
            "",

          photoId:
            certificate.photoId ||
            studentDoc.photoId ||
            "",

          dob:
            certificate.dob ||
            studentDoc.dob ||
            "",

          course:
            certificate.course ||
            studentDoc.courseName ||
            "",

          instituteName:
            certificate.instituteName ||
            studentDoc.instituteName ||
            "",

          certificateNo:
            certificate.certificateNo || "",

          logo:
            certificate.logo ||
            franchise?.logo ||
            "",

          franchiseSignature:
            certificate.franchiseSignature ||
            franchise?.signature ||
            "",

          ownerName:
            certificate.ownerName ||
            franchise?.ownerName ||
            franchise?.owner ||
            franchise?.name ||
            "",

          city:
            certificate.city ||
            franchise?.city ||
            "",

          examinationYear:
            certificate.examinationYear ||
            certificate.examYear ||
            "",

          result:
            certificate.result ||
            result.result ||
            result.resultStatus ||
            "",

          medium:
            certificate.medium ||
            studentDoc.medium ||
            "",

          academicSession:
            certificate.academicSession ||
            studentDoc.academicSession ||
            "",

          rollNumber:
            studentDoc.rollNumber ||
            studentDoc.rollNo ||
            certificate.rollNumber ||
            "",

          className:
            studentDoc.className ||
            studentDoc.originalClass ||
            certificate.className ||
            studentDoc.courseName ||
            certificate.course ||
            "",

          // In the admission form, batch is the section.
          section:
            studentDoc.batch ||
            studentDoc.section ||
            certificate.section ||
            "",

          batch:
            studentDoc.batch ||
            studentDoc.section ||
            certificate.batch ||
            "",
        };

        setStudent(data);
        setDetailsDraft(data);

        await fetchMarks(certificate.studentId);
      } catch (error) {
        console.error("MARKSHEET FETCH ERROR:", error);
        alert(error?.message || "Unable to load marksheet.");
      } finally {
        if (active) setLoadingStudent(false);
      }
    };

    fetchStudent();

    return () => {
      active = false;
    };
  }, [id]);

  // --------------------------------------------------
  // GENERATE QR
  // --------------------------------------------------
  useEffect(() => {
    let active = true;

    const generateQR = async () => {
      if (!student?.studentId) return;

      try {
        const url =
          `https://akshahmemorialacademy.in/beauty-verification/${student.studentId}`;

        const image = await QRCode.toDataURL(url, {
          width: 300,
          margin: 1,
        });

        if (active) setQrCode(image);
      } catch (error) {
        console.error("QR ERROR:", error);
      }
    };

    generateQR();

    return () => {
      active = false;
    };
  }, [student?.studentId]);

  // --------------------------------------------------
  // MARKSHEET CALCULATIONS
  // --------------------------------------------------
  const total = marksArray.reduce(
    (sum, mark) => sum + getSubjectTotal(mark),
    0
  );

  const objectiveTotal = marksArray.reduce(
    (sum, mark) => sum + Number(mark.objective || 0),
    0
  );

  const practicalTotal = marksArray.reduce(
    (sum, mark) => sum + Number(mark.practical || 0),
    0
  );

  const totalOutOf = marksArray.length * 100;
  const objectiveOutOf = marksArray.length * 50;
  const practicalOutOf = marksArray.length * 50;

  const percentage =
    totalOutOf > 0
      ? ((total / totalOutOf) * 100).toFixed(2)
      : "0.00";

  const overallGrade = gradeForPercent(Number(percentage));

 const photoId = String(
  student?.photoId ||
  student?.studentPhoto ||
  student?.photo ||
  ""
).trim();

const photoUrl =
  photoId &&
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
  BUCKET_ID &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.replace(/\/+$/, "")}/storage/buckets/${BUCKET_ID}/files/${photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : null;

  // --------------------------------------------------
  // UPDATE EDIT FORM
  // --------------------------------------------------
  const updateDetail = (field, value) => {
    setDetailsDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateMark = (index, field, value) => {
    setMarksArray((previous) =>
      previous.map((mark, i) => {
        if (i !== index) return mark;

        const updated = {
          ...mark,
          [field]:
            field === "subject"
              ? value
              : Number(value || 0),
        };

        updated.total = getSubjectTotal(updated);
        return updated;
      })
    );
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------
  const cancelEditing = async () => {
    setDetailsDraft({ ...student });
    setEditingDetails(false);

    try {
      await fetchMarks(student.studentId);
    } catch (error) {
      console.error("RELOAD MARKS ERROR:", error);
    }
  };

  // --------------------------------------------------
  // SAVE ALL CHANGES
  // --------------------------------------------------
  const saveAllMarksheetDetails = async () => {
    if (!isAdmin) {
      alert("You are not authorized to edit this marksheet.");
      return;
    }

    if (savingDetails) return;

    if (!marksArray.length) {
      alert("No subject marks were found.");
      return;
    }

    const invalidMarks = marksArray.some(
      (mark) =>
        !clean(mark.subject) ||
        Number(mark.objective) < 0 ||
        Number(mark.objective) > 50 ||
        Number(mark.practical) < 0 ||
        Number(mark.practical) > 50
    );

    if (invalidMarks) {
      alert(
        "Enter a subject name and marks between 0 and 50 for both sections."
      );
      return;
    }

    setSavingDetails(true);

    try {
      const certificateUpdate = {
        studentName: clean(detailsDraft.studentName),
        fatherName: clean(detailsDraft.fatherName),
        motherName: clean(detailsDraft.motherName),
        
        
        
        examinationYear: clean(detailsDraft.examinationYear),
        result: clean(detailsDraft.result),
        medium: clean(detailsDraft.medium),
        academicSession: clean(detailsDraft.academicSession),
        rollNumber: clean(detailsDraft.rollNumber),
        className: clean(detailsDraft.className),
        section: clean(detailsDraft.section),

        // NEW FIELDS
  unitName1: clean(detailsDraft.unitName1),
  unitName2: clean(detailsDraft.unitName2),
        
      };

      // 1. Save certificate-linked marksheet details.
      await databases.updateDocument(
        DATABASE_ID,
        CERTIFICATES,
        String(id),
        certificateUpdate
      );

      // 2. Update admission details.
      // Only write admission fields already used by the admission form.
      if (student?.admissionId) {
        await databases.updateDocument(
          DATABASE_ID,
          ADMISSIONS,
          student.admissionId,
          {
            studentName: certificateUpdate.studentName,
            fatherName: certificateUpdate.fatherName,
            motherName: certificateUpdate.motherName,
            surname: certificateUpdate.surname,
            courseName: certificateUpdate.course,
            instituteName: certificateUpdate.instituteName,
            rollNumber: certificateUpdate.rollNumber,
            batch: certificateUpdate.section,
            dob: certificateUpdate.dob,
          }
        );
      }

      // 3. Save subject names and marks.
      await Promise.all(
        marksArray.map((mark) => {
          if (!mark.$id) {
            throw new Error(
              `Missing subject-result document ID for ${mark.subject}.`
            );
          }

          return databases.updateDocument(
            DATABASE_ID,
            SUBJECT_RESULTS,
            mark.$id,
            {
              subject: clean(mark.subject),
              objective: Number(mark.objective || 0),
              practical: Number(mark.practical || 0),
              total: getSubjectTotal(mark),
            }
          );
        })
      );

      // 4. Update the existing exam result document.
      if (student?.examResultId) {
        const savedMarks = marksArray.map((mark) => ({
          subject: clean(mark.subject),
          objective: Number(mark.objective || 0),
          practical: Number(mark.practical || 0),
          total: getSubjectTotal(mark),
        }));

        await databases.updateDocument(
          DATABASE_ID,
          EXAM_RESULTS,
          student.examResultId,
          {
            subjects: savedMarks
              .map((mark) => mark.subject)
              .join(", "),
            marksArray: JSON.stringify(savedMarks),
          }
        );
      }

      const updatedStudent = {
        ...student,
        ...certificateUpdate,
        batch: certificateUpdate.section,
        section: certificateUpdate.section,
      };

      setStudent(updatedStudent);
      setDetailsDraft(updatedStudent);
      setEditingDetails(false);

      alert("Marksheet changes saved successfully.");
    } catch (error) {
      console.error("SAVE MARKSHEET ERROR:", error);

      alert(
        error?.message ||
          "Could not save changes. Check the Appwrite collection attributes and permissions."
      );
    } finally {
      setSavingDetails(false);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD IMAGE
  // --------------------------------------------------
  const handleDownload = async () => {
    try {
      const node = printRef.current;

      if (!node) return;

      const rect = node.getBoundingClientRect();

      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        width: rect.width,
        height: rect.height,
        style: {
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          transform: "scale(1)",
          transformOrigin: "top left",
          overflow: "visible",
        },
      });

      const link = document.createElement("a");

      link.download =
        `${student?.studentName || "student"}_marksheet.png`;

      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);
      alert("Unable to download the marksheet image.");
    }
  };

  if (loadingStudent || !student) {
    return (
      <div className="p-10">
        {loadingStudent ? "Loading marksheet..." : "Marksheet not available."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 text-black sm:p-10">
      {/* ACTION BUTTONS */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
        >
          Download Image
        </button>

        {!loadingUser && isAdmin && !editingDetails && (
          <button
            onClick={() => {
              setDetailsDraft({ ...student });
              setEditingDetails(true);
            }}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Edit Marksheet
          </button>
        )}

        {editingDetails && (
          <>
            <button
              onClick={cancelEditing}
              disabled={savingDetails}
              className="rounded bg-gray-600 px-5 py-2 font-semibold text-white"
            >
              Cancel
            </button>

            <button
              onClick={saveAllMarksheetDetails}
              disabled={savingDetails}
              className="rounded bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
              {savingDetails ? "Saving..." : "Save All Changes"}
            </button>
          </>
        )}
      </div>

      {/* EDIT FORM */}
      {editingDetails && isAdmin && (
        <div className="mb-8 rounded-xl border border-gray-300 bg-slate-50 p-5">
          <h2 className="mb-5 text-xl font-bold">
            Edit Marksheet Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["studentName", "Student Name"],
              ["fatherName", "Father's Name"],
              ["motherName", "Mother's Name"],
              
              

              ["examinationYear", "Examination Year"],
              ["result", "Result"],
              ["medium", "Medium"],
              ["academicSession", "Academic Session"],
              ["rollNumber", "Roll Number"],
              ["className", "Class"],
              ["section", "Section / Batch"],
              ["unitName1", "Unit Name 1"],
["unitName2", "Unit Name 2"],
              

            ].map(([field, label]) => (
              <label
                key={field}
                className="text-sm font-medium"
              >
                {label}

                <input
                  type="text"
                  value={detailsDraft[field] ?? ""}
                  onChange={(event) =>
                    updateDetail(field, event.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2"
                />
              </label>
            ))}
          </div>

          <h3 className="mb-3 mt-7 text-lg font-bold">
            Edit Subjects and Marks
          </h3>

          <div className="space-y-3">
            {marksArray.map((mark, index) => (
              <div
                key={mark.$id || index}
                className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                <label className="text-sm">
                  Subject
                  <input
                    value={mark.subject}
                    onChange={(event) =>
                      updateMark(index, "subject", event.target.value)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>

                <label className="text-sm">
                  Objective / 50
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={mark.objective}
                    onChange={(event) =>
                      updateMark(index, "objective", event.target.value)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>

                <label className="text-sm">
                  Practical / 50
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={mark.practical}
                    onChange={(event) =>
                      updateMark(index, "practical", event.target.value)
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>

                <div className="self-center text-sm">
                  <p>
                    Total: <strong>{getSubjectTotal(mark)}/100</strong>
                  </p>
                  <p>
                    Grade:{" "}
                    <strong>
                      {gradeForPercent(getSubjectTotal(mark))}
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE MARKSHEET */}
      <div
        ref={printRef}
        style={{
          width: "900px",
          minHeight: "1200px",
          height: "1200px",
          position: "relative",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <img
          src="/marksheet1.png"
          alt="Marksheet template"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
          }}
        />

       {/* STUDENT PHOTO */}
<div
  className="absolute left-[740px] top-[345px] h-[120px] w-[110px] overflow-hidden bg-white"
  style={{ zIndex: 10 }}
>
  {photoUrl ? (
    <img
      src={photoUrl}
      alt="Student Photo"
      className="h-full w-full object-cover"
      onLoad={() => console.log("Student photo loaded")}
      onError={(e) => {
        console.error(
          "Student photo failed to load:",
          e.currentTarget.src,
          e.currentTarget.naturalWidth
        );
      }}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-center text-xs text-red-600">
      Photo ID missing
    </div>
  )}
</div>

        {/* STUDENT DETAILS */}
        <div className="absolute left-[200px] top-[340px] text-[16px] font-bold">
          {student.studentName}
        </div>

        <div className="absolute left-[200px] top-[370px] text-[16px] font-bold">
          {student.fatherName}
        </div>

        {/* <div className="absolute left-[330px] top-[352px] text-[16px]">
          {student.surname}
        </div> */}

        {/* <div className="absolute left-[330px] top-[374px] text-[16px]">
          {student.motherName}
        </div> */}

        <div className="absolute left-[380px] top-[295px] text-[16px] font-bold">
          {student.examinationYear}
        </div>

        <div className="absolute left-[200px] top-[400px] text-[16px] font-bold">
          {student.className || student.course}
        </div>

        <div className="absolute left-[570px] top-[370px] text-[16px] font-bold">
          {student.rollNumber}
        </div>

        <div className="absolute left-[570px] top-[400px] text-[16px] font-bold">
          {student.section || student.batch}
        </div>

        <div className="absolute left-[195px] top-[430px] text-[16px] font-bold">
          {student.medium}
        </div>

        <div className="absolute left-[600px] top-[430px] text-[16px] font-bold">
          {student.academicSession}
        </div>

        {/* QR CODE */}
        {qrCode && (
          <img
            src={qrCode}
            alt="Verification QR code"
            className="absolute right-[175px] top-[340px] w-[90px] p-1"
          />
        )}


        {/* UNIT NAMES ABOVE MARKS TABLE */}
<div
  style={{
    position: "absolute",
    top: 515,
    left: 310,
    width: 650,
    display: "flex",
    alignItems: "center",
    gap: 30,
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  }}
>
  <div>
    {student.unitName1 || ""}
  </div>

  <div>
    {student.unitName2 || ""}
  </div>
</div>

        {/* SUBJECT ROWS */}
        <div
          style={{
            position: "absolute",
            top: 550,
            left: 150,
            width: 650,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {Array.from({
            length: Math.max(8, marksArray.length),
          }).map((_, index) => {
            const mark = marksArray[index];

            return (
              <div
                key={mark?.$id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "150px 100px 100px 100px 100px 100px",
                  alignItems: "center",
                  minHeight: 26,
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    paddingRight: 10,
                    wordBreak: "break-word",
                  }}
                >
                  {mark ? `${index + 1}) ${mark.subject}` : ""}
                </div>

                <div style={{ textAlign: "center" }}>
                  {mark ? mark.objective : ""}
                </div>

                <div style={{ textAlign: "center" }}>
                  {mark ? mark.practical : ""}
                </div>

                <div style={{ textAlign: "center", fontWeight: "bold" }}>
                  {mark ? getSubjectTotal(mark) : ""}
                </div>

                <div style={{ textAlign: "center", fontWeight: "bold" }}>
                  {mark
                    ? gradeForPercent(getSubjectTotal(mark))
                    : ""}
                </div>

{/* REMARKS BASED ON SUBJECT MARKS */}
<div
  style={{
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    paddingLeft: 3,
    paddingRight: 3,
  }}
>
  {mark
    ? remarkForPercent(getSubjectTotal(mark))
    : ""}
</div>
                <div />
              </div>
            );
          })}
        </div>

        {/* TOTAL ROW */}
        <div
          style={{
            position: "absolute",
            top: 765,
            left: 270,
            width: 650,
            display: "grid",
            gridTemplateColumns:
              "150px 90px 90px 90px 100px 100px",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          
          <div style={{ textAlign: "center" }}>{objectiveTotal}</div>
          <div style={{ textAlign: "center" }}>{practicalTotal}</div>
          <div style={{ textAlign: "center" }}>{total}</div>
          <div />
          <div />
        </div>

        {/* OVERALL RESULT */}
        <div className="absolute bottom-[375px] right-[180px] font-bold">
          {percentage}
        </div>

        <div className="absolute bottom-[350px] left-[130px] font-bold">
          Grade: {overallGrade}
        </div>

        <div className="absolute bottom-[350px] right-[180px] font-bold">
           {student.result}
        </div>

        <div className="absolute bottom-[375px] left-[270px] font-bold">
          {total}
        </div>

        <div className="absolute bottom-[375px] left-[400px] font-bold">
          {totalOutOf}
        </div>

        {/* SIGNATURE */}
        {student.franchiseSignature && (
          <img
            src={student.franchiseSignature}
            alt="Institute signature"
            crossOrigin="anonymous"
            className="absolute bottom-[95px] left-[100px] w-[100px]"
          />
        )}
      </div>
    </div>
  );
}
