"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = "student_admissions";
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function IDCard() {

  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [franchise, setFranchise] = useState(null);

  const printRef = useRef();

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {

    try {

      const res = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );

      setStudent(res);

      // 🔥 FETCH FRANCHISE
      const franchiseRes = await databases.listDocuments(
        DATABASE_ID,
        "franchise_approved",
        [Query.equal("email", res.franchiseEmail)]
      );

      if (franchiseRes.documents.length > 0) {
        setFranchise(franchiseRes.documents[0]);
      }

    } catch (err) {
      console.log(err);
    }

  };

  // ✅ CONVERT IMAGE TO BASE64
  const toBase64 = async (url) => {

    const res = await fetch(url);

    const blob = await res.blob();

    return new Promise((resolve) => {

      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);

      reader.readAsDataURL(blob);

    });

  };

  // ✅ DOWNLOAD FUNCTION
  const handleDownload = async () => {

    try {

      const node = printRef.current;

      const images = node.querySelectorAll("img");

      for (let img of images) {

        const src = img.src;

        if (!src.startsWith("data:")) {

          try {

            const base64 = await toBase64(src);

            img.src = base64;

          } catch (err) {
            console.log(err);
          }

        }

      }

      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        width: node.scrollWidth,
        height: node.scrollHeight,
      });

      const link = document.createElement("a");

      link.download = `${student.studentName}_idcard.png`;

      link.href = dataUrl;

      link.click();

    } catch (err) {

      console.log("DOWNLOAD ERROR:", err);

    }

  };

  if (!student) return <div>Loading...</div>;

  return (

    <div className="flex flex-col items-center p-6 bg-black min-h-screen">

      {/* BUTTONS */}
      <div className="flex gap-4 mb-6">

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Print ID Card
        </button>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download ID Card
        </button>

      </div>

      {/* ID CARD */}
{/* ID CARD */}
<div
  ref={printRef}
  className="relative w-[1280px] bg-white"
>

  {/* TEMPLATE */}
  <img
    src="/ID.jpeg"
    className="w-full"
    alt="ID Card Template"
  />

  {/* STUDENT PHOTO */}
  {student.photoId && (
    <img
      src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${student.photoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
      className="absolute top-[210px] left-[60px] w-[300px] h-[420px] object-cover rounded-lg"
      alt="Student"
    />
  )}

  {/* STUDENT NAME */}
  <div className="absolute top-[310px] left-[710px] text-[22px] font-semibold text-black">
    {student.studentName || ""}
  </div>

  {/* FATHER NAME */}
  <div className="absolute top-[355px] left-[710px] text-[22px] text-black">
    {student.fatherName || ""}
  </div>

  {/* CLASS */}
  <div className="absolute top-[405px] left-[750px] text-[22px] text-black">
    {student.className || ""}
  </div>

  {/* SECTION */}
  <div className="absolute top-[545px] left-[710px] text-[22px] text-black">
    {student.section || ""}
  </div>

  {/* DATE OF BIRTH */}
  <div className="absolute top-[500px] left-[710px] text-[22px] text-black">
    {student.dob || ""}
  </div>

  {/* BLOOD GROUP */}
  <div className="absolute top-[698px] left-[710px] text-[22px] text-black">
    {student.bloodGroup || ""}
  </div>

  {/* CONTACT NUMBER */}
  <div className="absolute top-[595px] left-[710px] text-[22px] text-black">
    {student.mobile || ""}
  </div>

  {/* ADDRESS */}
  <div className="absolute top-[650px] left-[710px] w-[380px] text-[18px] leading-6 text-black">
    {student.address || ""}
  </div>

  {/* QR CODE */}
  {/* <div className="absolute bottom-[40px] right-[60px] bg-white p-2">
    <QRCode
      value={`${window.location.origin}/verify-student/${student.$id}`}
      size={120}
    />
  </div> */}

</div>
       



    </div>

  );

}