
"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useRouter, useSearchParams, useParams } from "next/navigation";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default function RechargePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id;
  const type = searchParams.get("type") || "add";

  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [rechargeBy, setRechargeBy] = useState("");
  const [leadBy, setLeadBy] = useState("");
  const [remarks, setRemarks] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [enable, setEnable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnable(masterPassword === "1010");
  }, [masterPassword]);

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      if (!id) return;

      try {
        const res = await databases.getDocument(
          DATABASE_ID,
          "franchise_approved",
          String(id)
        );

        if (active) setUser(res);
      } catch (err) {
        console.error("FETCH FRANCHISE ERROR:", err);
        if (active) {
          alert("Franchise not found.");
          router.push("/admin/dashboard/wallet");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, [id, router]);

  const handleRecharge = async () => {
    if (!user || saving) return;

    const enteredAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(enteredAmount) ||
      enteredAmount <= 0
    ) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }

    if (!rechargeBy.trim()) {
      alert("Please enter Recharge By.");
      return;
    }

    if (!paymentMode) {
      alert("Please select a payment mode.");
      return;
    }

    if (type !== "add" && type !== "deduct") {
      alert("Invalid wallet transaction type.");
      return;
    }

    const currentBalance = Number(user.wallet || 0);

    if (!Number.isFinite(currentBalance)) {
      alert("The current wallet balance is invalid.");
      return;
    }

    if (type === "deduct" && enteredAmount > currentBalance) {
      alert("Insufficient wallet balance.");
      return;
    }

    const newBalance =
      type === "deduct"
        ? currentBalance - enteredAmount
        : currentBalance + enteredAmount;

    setSaving(true);

    try {
      // IMPORTANT:
      // This page expects wallet_transactions.amount to be a String
      // in your existing Appwrite collection.
      const transactionAmount = enteredAmount.toFixed(2);
      const transactionDate = new Date().toISOString();

      // Create the transaction first so a transaction validation
      // failure does not happen after changing the wallet balance.
      const transaction = await databases.createDocument(
        DATABASE_ID,
        "wallet_transactions",
        ID.unique(),
        {
          franchiseId: String(id),
          amount: transactionAmount,
          type: String(type),
          paymentMode: String(paymentMode),
          rechargeBy: String(rechargeBy.trim()),
          leadBy: String(leadBy.trim()),
          remarks: String(remarks.trim()),
          date: transactionDate,
        }
      );

      try {
        await databases.updateDocument(
          DATABASE_ID,
          "franchise_approved",
          String(id),
          {
            wallet: newBalance.toFixed(2),
            lastRecharge: new Date().toLocaleString(),
          }
        );
      } catch (walletError) {
        // Remove the transaction if the balance update fails.
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            "wallet_transactions",
            transaction.$id
          );
        } catch (rollbackError) {
          console.error("TRANSACTION CLEANUP ERROR:", rollbackError);
        }

        throw walletError;
      }

      alert(
        type === "deduct"
          ? "Wallet deduction successful."
          : "Wallet recharge successful."
      );

      router.replace("/admin/dashboard/wallet");
      router.refresh();
    } catch (err) {
      console.error("WALLET TRANSACTION ERROR:", err);
      alert(err?.message || "Wallet transaction failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10">Loading franchise...</div>;
  }

  if (!user) {
    return <div className="p-10">Franchise not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-md md:p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          {type === "deduct" ? "Deduct Wallet Balance" : "Recharge Wallet"}
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          Manage the wallet for {user.instituteName || "this franchise"}.
        </p>

        <div className="mb-6 rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Current Wallet Balance</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{Number(user.wallet || 0).toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Amount *
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Account Type
            <input
              value="FRANCHISE"
              disabled
              className="mt-1 w-full rounded-lg border bg-gray-100 p-3"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Institute Name
            <input
              value={user.instituteName || ""}
              disabled
              className="mt-1 w-full rounded-lg border bg-gray-100 p-3"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Payment Mode *
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3"
            >
              <option value="">Select Payment Mode</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Recharge By *
            <input
              placeholder="Enter staff name"
              value={rechargeBy}
              onChange={(e) => setRechargeBy(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Lead By
            <input
              placeholder="Enter lead name"
              value={leadBy}
              onChange={(e) => setLeadBy(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>

          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Master Password *
            <input
              type="password"
              placeholder="Enter master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>

          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Remarks
            <textarea
              placeholder="Enter remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            disabled={saving}
            className="rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-gray-900 hover:bg-yellow-500 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleRecharge}
            disabled={!enable || saving}
            className={`rounded-lg px-5 py-3 font-semibold text-white ${
              enable && !saving
                ? type === "deduct"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {saving
              ? "Processing..."
              : type === "deduct"
                ? "Deduct Amount"
                : "Recharge Wallet"}
          </button>
        </div>

        {!enable && (
          <p className="mt-3 text-sm text-gray-500">
            Enter the master password to enable the transaction.
          </p>
        )}
      </div>
    </div>
  );
}
