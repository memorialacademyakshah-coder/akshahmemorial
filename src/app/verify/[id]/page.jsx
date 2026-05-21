'use client'

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useSearchParams } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function VerifyPage() {

  const searchParams = useSearchParams();

  const code = searchParams.get("code");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        if (!code) {
          setLoading(false);
          return;
        }

        const res = await databases.listDocuments(
          DATABASE_ID,
          "franchise_approved",
          [
            Query.equal("atcCode", code)
          ]
        );

        if (res.documents.length > 0) {
          setData(res.documents[0]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [code]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-xl">
        Invalid or Not Found ❌
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white shadow-xl rounded-xl w-[500px] p-8 text-center">

        <h1 className="text-2xl font-bold text-black mb-2">
          Franchise Verification Certificate
        </h1>

        <p className="text-green-600 font-semibold mb-4">
          ✔ Verified Franchise
        </p>

        {data.logo && (
          <img
            src={data.logo}
            className="h-20 mx-auto mb-4 object-contain"
          />
        )}

        {data.ownerPhoto && (
          <img
            src={data.ownerPhoto}
            className="h-24 w-24 rounded-full mx-auto border mb-4"
          />
        )}

        <div className="text-left space-y-2 mt-4">

          <p><strong>Institute:</strong> {data.instituteName}</p>

          <p><strong>Owner Name:</strong> {data.name}</p>

          <p><strong>ATC Code:</strong> {data.atcCode}</p>

          <p><strong>Email:</strong> {data.email}</p>

          <p><strong>Mobile:</strong> {data.mobile}</p>

          <p>
            <strong>Address:</strong><br />
            {data.address}, {data.city}, {data.state} - {data.pincode}
          </p>

        </div>

        <div className="mt-6 text-sm text-gray-500 border-t pt-4">
          This franchise is verified by BNMI
        </div>

      </div>

    </div>
  );
}