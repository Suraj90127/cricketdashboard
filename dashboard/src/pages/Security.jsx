import { useState } from "react";
import { FaEye } from "react-icons/fa";
import Navbar from "../components/Navbar";

const Security = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      
    <Navbar />
    <div className="flex justify-center items-center  bg-gray-100 p-2 text-[13px]">
      <div className="w-full bg-white border border-gray-300 max-w-7xl rounded-lg">
        {/* Header */}
        <div className="bg-[#243a48] text-white font-bold px-4 py-2 rounded-t-lg">
          Secure Auth Verification
        </div>

        {/* Content */}
        <div className="text-center p-4">
          <p className="font-semibold">
            Secure Auth Verification Status:{" "}
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              Disabled
            </span>
          </p>

          <p className="text-blue-600 font-semibold mt-2">
            নিরাপদ প্রমাণীকরণের স্থিতি: নিষ্ক্রিয়
          </p>

          <p className="text-gray-600 mt-2">
            Please select below option to enable secure auth verification
          </p>

          <p className="text-[#2789ce] cursor-pointer mt-1">
            নিরাপদ প্রমাণীকরণ যাচাই সক্ষম করতে দয়া করে নিচের বিকল্পটি নির্বাচন করুন।
          </p>

          <button className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow">
            Enable Using Telegram
          </button>

          {/* Password Input */}
          <div className="mt-6">
            <p className="font-semibold">Please enter your login password to continue</p>
            <div className="flex mt-2 md:w-[50%] mx-auto border border-gray-300 rounded-lg overflow-hidden">
              <input
                type={showPassword ? "text" : "password"}
                className="flex-1 px-4 py-2 outline-none"
                placeholder="Enter your login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="px-4 bg-gray-200"
                onClick={() => setShowPassword(!showPassword)}
              >
         <FaEye />
              </button>
            </div>

            <button className="mt-4 px-4 py-2 bg-[#243a48] text-white rounded-md shadow">
              Get Connection ID
            </button>
          </div>

          {/* Continue Button */}
          <div className="mt-6">
            <p className="text-gray-500">
              IF YOU HAVE ENABLED CONNECTION ID FROM TELEGRAM PLEASE CLICK HERE NOW
            </p>
            <button className="mt-2 px-6 py-2 bg-green-600 text-white rounded-md shadow">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Security;
