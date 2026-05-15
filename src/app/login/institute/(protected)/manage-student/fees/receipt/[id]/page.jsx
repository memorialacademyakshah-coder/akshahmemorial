"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import * as htmlToImage from "html-to-image";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const PAYMENT_COLLECTION = "student_payments";
const ADMISSION_COLLECTION = "student_admissions";

export default function ReceiptPage() {

    const { id } = useParams();

    const [payment, setPayment] = useState(null);
    const [admission, setAdmission] = useState(null);
    const [receiptNumber, setReceiptNumber] = useState("");
    const [franchise, setFranchise] = useState(null);

    const printRef = useRef();

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const generateReceiptNumber = () => {

        const date = new Date();

        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();

        const random = Math.floor(100000 + Math.random() * 900000);

        return `${d}-${m}-${y}/COA${random}`;

    };

    const fetchData = async () => {

        const pay = await databases.getDocument(
            DATABASE_ID,
            PAYMENT_COLLECTION,
            id
        );

        setPayment(pay);

        const adm = await databases.getDocument(
            DATABASE_ID,
            ADMISSION_COLLECTION,
            pay.admissionId
        );

        setAdmission(adm);

        // 🔥 FETCH FRANCHISE
        const franchiseRes = await databases.listDocuments(
            DATABASE_ID,
            "franchise_approved",
            [Query.equal("email", adm.franchiseEmail)]
        );

        if (franchiseRes.documents.length > 0) {
            setFranchise(franchiseRes.documents[0]);
        }

        setReceiptNumber(generateReceiptNumber());

    };

    // ✅ CONVERT IMAGE
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

            link.download = `${payment.studentName}_receipt.png`;

            link.href = dataUrl;

            link.click();

        } catch (err) {

            console.log("DOWNLOAD ERROR:", err);

        }

    };

    if (!payment || !admission) {
        return <div className="p-10">Loading...</div>
    }

    const totalFees = Number(admission.totalFees || 0);
    const paid = Number(payment.paymentAmount || 0);
    const due = totalFees - paid;

    return (

        <div className="flex justify-center p-10 bg-gray-100">

            <div className="relative w-[900px]" ref={printRef}>

                {/* RECEIPT TEMPLATE BACKGROUND */}

                <img
                    src="/FEES.png"
                    className="w-full"
                />


{/* FRANCHISE LOGO */}
{franchise?.logo && (
                  <div className="absolute top-[10px] left-[410px] w-[135px] h-[135px] overflow-hidden bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md">
    <img
        src={franchise.logo}
      className="w-full h-full object-cover rounded-full"
    />
  </div>
                )}

{/* INSTITUTE NAME */}
<div className="absolute top-[160px] left-0 w-full text-center text-3xl font-bold text-red-700">
  {franchise?.instituteName || ""}
</div>


                {/* RECEIPT NUMBER */}

                <div className="absolute top-[260px] left-[140px] flex items-center gap-2">

                    <span className="font-semibold">Receipt Number :</span>

                    <div className="border px-3 py-1 w-[220px] text-center">
                        {receiptNumber}
                    </div>

                </div>

                {/* RECEIPT DATE */}

                <div className="absolute top-[260px] right-[130px] flex items-center gap-2">

                    <span className="font-semibold">Receipt Date :</span>

                    <div className="border px-3 py-1 w-[140px] text-center">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>

                </div>

                {/* STUDENT NAME */}

                <div className="absolute top-[320px] left-[140px] flex items-center gap-2">

                    <span className="font-semibold">Student Name :</span>

                    <div className="border px-3 py-1 w-[270px]">
                        {payment.studentName}
                    </div>

                </div>

                {/* BATCH */}

                <div className="absolute top-[320px] right-[100px] flex items-center gap-2">

                    <span className="font-semibold">Batch Name :</span>

                    <div className="border px-3 py-1 w-[140px] text-center">
                        {admission.batch}
                    </div>

                </div>

                {/* COURSE */}

                <div className="absolute top-[390px] left-[140px] flex items-center gap-2">

                    <span className="font-semibold">Course Name :</span>

                    <div className="border px-3 py-1 w-[550px]">
                        {admission.courseName || payment.course || ""}
                    </div>

                </div>

                {/* FEES SECTION */}

                <div className="absolute top-[450px] left-[140px] flex gap-6">

                    <div className="flex items-center gap-2">

                        <span className="font-semibold">Course Fees :</span>

                        <div className="border px-3 py-1 w-[110px] text-center">
                            {totalFees}
                        </div>

                    </div>

                    <div className="flex items-center gap-2">

                        <span className="font-semibold">Fees Received :</span>

                        <div className="border px-3 py-1 w-[110px] text-center">
                            {paid}
                        </div>

                    </div>

                    <div className="flex items-center gap-2">

                        <span className="font-semibold">Due Amount :</span>

                        <div className="border px-3 py-1 w-[110px] text-center">
                            {due}
                        </div>

                    </div>


                    {/* OWNER NAME */}
<div className="absolute bottom-[-90px] right-[30px] text-center">

  <div className="font-semibold text-lg">
    {franchise?.name || ""}
  </div>

</div>


                    {/* FRANCHISE SIGNATURE */}
{franchise?.signature && (
    <div className="absolute bottom-[-60px] right-[10px] w-[130px] h-[50px]  overflow-hidden bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md">
  <img
    src={franchise.signature}
   className="w-full h-full object-cover "
  />
</div>
)}


                    {/* FRANCHISE EMAIL */}
<div className="absolute top-[90px] left-0 w-full text-center text-sm">
  {franchise?.email || ""}
</div>


{/* FRANCHISE ADDRESS */}
<div className="absolute top-[117px] left-0 w-full text-center text-sm">
  {franchise?.address || ""}, {franchise?.city || ""}, {franchise?.state || ""}
</div>


                </div>

                   <div className="fixed top-20 right-20 flex gap-4">

                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg"
                >
                    Print Admission Form
                </button>

                <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-2 rounded shadow-lg"
                >
                    Download Admission Form
                </button>

            </div>

            </div>

        </div>

    );

}