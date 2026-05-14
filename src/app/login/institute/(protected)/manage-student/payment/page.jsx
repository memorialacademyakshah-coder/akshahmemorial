"use client";

import Image from "next/image";
import { FaWhatsapp, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function PaymentPage() {

  const whatsappNumber = "918011211185"; // replace with your WhatsApp number
  const paymentAmount = "₹5,000";

  const message = encodeURIComponent(
    "Hello Sir, I have completed the payment. Please find my payment screenshot attached."
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111111] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
      >

        {/* Top Gradient */}
        <div className="bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500 p-6 text-center">

          <h1 className="text-3xl font-bold text-black">
            Complete Payment
          </h1>

          <p className="text-black mt-2 font-medium">
            Scan QR & Pay Securely
          </p>

        </div>

        {/* Content */}
        <div className="p-6">

          {/* Amount Box */}
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 text-center mb-6">

            <p className="text-gray-400 text-sm">
              Total Amount
            </p>

            <h2 className="text-4xl font-bold text-orange-400 mt-2">
             Pay The Amount To The Given QR Code
            </h2>

          </div>

          {/* QR Code */}
          <div className="bg-white rounded-3xl p-4 flex justify-center items-center mb-6">

            <Image
              src="/Qr.jpeg" // put your QR image in public folder
              alt="QR Code"
              width={260}
              height={260}
              className="rounded-xl"
            />

          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">

            <div className="flex items-center gap-3 text-gray-300">
              <FaCheckCircle className="text-green-400" />
              <p>Open any UPI app</p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <FaCheckCircle className="text-green-400" />
              <p>Scan the QR code & complete payment</p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <FaCheckCircle className="text-green-400" />
              <p>Send screenshot on WhatsApp</p>
            </div>

          </div>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >

            <button className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-green-500/20">

              <FaWhatsapp className="text-2xl" />

              Send Screenshot on WhatsApp

            </button>

          </a>

          {/* Bottom Note */}
          <p className="text-center text-gray-500 text-sm mt-5">
            Payment verification usually takes 5-10 minutes.
          </p>

        </div>

      </motion.div>

    </div>
  );
}