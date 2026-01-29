"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdmin } from "../redux/reducer/authReducer";
import { FaRegEdit } from "react-icons/fa";
import Navbar from "../components/Navbar";
import {
  changePasswordBySelf,
  getLoginHistory,
  getTranstionHistory,
} from "../redux/reducer/authReducer";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAccount() {
  const {
    userInfo,
    successMessage,
    errorMessage,
    currentPage,
    totalPages,
    loading,
    LoginData,
    transtionHistoryData,
  } = useSelector((state) => state.auth);
  // console.log(userInfo, " userInfo");
  console.log("transtionHistoryData", transtionHistoryData);

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  const [activeTab, setActiveTab] = useState("profile");
  const [isOpen, setIsOpen] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [selectedOption, setSelectedOption] = useState("ALL");
  const dispatch = useDispatch();

  useEffect(() => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    if (selectedOption === "LIVE DATA") {
      setStartDate(formatDate(currentDate));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === "BACKUP DATA") {
      setStartDate(formatDate(oneMonthAgo));
      setEndDate(formatDate(twoDaysAgo));
    } else if (selectedOption === "OLD DATA") {
      setStartDate(formatDate(fiveMonthAgo));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === "ALL") {
      setStartDate(formatDate(fiveMonthAgo));
      setEndDate(formatDate(currentDate));
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Password not match.");
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("Old password and new password can't be the same.");
      return;
    }
    // console.log("oldPassword", oldPassword);
    // console.log("newPassword", newPassword);
    dispatch(changePasswordBySelf({ oldPassword, newPassword }));
    if (successMessage) {
      toast.success(successMessage);
      setShowPopup(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(errorMessage);
    }
  };

  const commissions = [
    { name: "Fancy", value: 0 },
    { name: "Matka", value: 0 },
    { name: "Casino", value: 0 },
    { name: "Binary", value: 0 },
    { name: "Sportbook", value: 0 },
    { name: "Bookmaker", value: 0 },
  ];

  useEffect(() => {
    dispatch(getLoginHistory(userInfo?._id));
  }, [dispatch, userInfo?._id]);

  const fetchHistory = () => {
    dispatch(getTranstionHistory({ page, limit, startDate, endDate }));
  };

  useEffect(() => {
    fetchHistory();
  }, [page, limit, startDate, endDate]);

  const updateDate = (isoDateString) => {
    const date = new Date(isoDateString);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${day}/${month}/${year} ${hours}:${paddedMinutes} ${ampm}`;
  };


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-1 md:p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar */}
          <div className="w-full md:w-80  text-[15px]">
            <div className="bg-dark text-white px-2 py-1">
              <h2 className="font-bold">My Account</h2>
            </div>
            <div className="border border-gray-300">
              <button
                className={`w-full text-left px-2 py-1 text-sm border-b border-gray-300 ${activeTab === "profile"
                  ? "bg-blue-100"
                  : "bg-white hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("profile")}
              >
                My Profile
              </button>
              <button
                className={`w-full text-left px-2 py-1 text-sm border-b border-gray-300 ${activeTab === "statement"
                  ? "bg-blue-100"
                  : "bg-white hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("statement")}
              >
                Account Statement
              </button>
              <button
                className={`w-full text-left px-2 py-1 text-sm ${activeTab === "activity"
                  ? "bg-blue-100"
                  : "bg-white hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="border border-gray-300 bg-white">
                <div className="bg-dark text-white px-2 py-1">
                  <h2 className="font-bold">Account Details</h2>
                </div>
                <div className="divide-y text-sm">
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">Name</div>
                    <div className="w-full md:w-2/3 p-4">
                      {userInfo?.name || "Nan"}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Commission
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      {userInfo?.commition || "Nan"}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Rolling Commission
                    </div>
                    <div className="w-full md:w-2/3 p-4 flex items-center gap-1">
                      <span>{userInfo?.rollingCommission || "Nan"}</span>
                      <button
                        className="text-blue mr-2 text-lg"
                        onClick={() => setIsEdit(true)}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className="text-blue"
                        onClick={() => setIsOpen(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Agent Rolling Commission
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      <button
                        className="text-blue"
                        onClick={() => setIsAgent(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Currency
                    </div>
                    <div className="w-full md:w-2/3 p-4">IRP</div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Partnership
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      {userInfo?.partnership || "Nan"}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Mobile Number
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      {userInfo?.phone || "Nan"}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row border-b border-gray-300">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Password
                    </div>
                    <div className="w-full md:w-2/3 p-4 flex items-center">
                      ********
                      <button
                        className="text-blue ml-2"
                        onClick={() => setShowPopup(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 p-4 font-medium">
                      Secure Auth Verification
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      <button className="text-blue flex items-center">
                        Click Here
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Statement Tab */}
            {activeTab === "statement" && (
              <div>
                {/* Filter Section */}
                <div className="border border-gray-900 rounded-lg text-[13px] bg-[#e0e6e6] p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 items-end gap-2">
                    <div className="w-full col-span-1">
                      <label className="block mb-1">Data Source</label>
                      <select
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className="border p-2 bg-white w-full"
                      >
                        <option>ALL</option>
                        <option>LIVE DATA</option>
                        <option>BACKUP DATA</option>
                        <option>OLD DATA</option>
                      </select>
                    </div>
                    <div className="w-full col-span-1">
                      <label className="block mb-1">From</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="border p-2 bg-white w-full"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}


                        />
                      </div>
                    </div>
                    <div className="w-full col-span-1">
                      <label className="block mb-1">To</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="border p-2 bg-white w-full"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button className="bg-dark font-bold text-white px-4 py-2 rounded w-full">
                        Get Statement
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statement Table */}
                <div className="border border-gray-300 bg-white  text-[13px]">
                  <div className="bg-dark text-white py-1 px-3">
                    <h2 className="font-bold">Account Statement</h2>
                  </div>
                  {loading && (
                    <div className="mt-4 p-4 text-center">
                      <p>Loading data...</p>
                      {/* You can add a spinner here if you want */}
                    </div>
                  )}
                  {!loading && (
                    <div className="p-4">
                      <div className="flex items-center gap-1 my-2 font-[500]">
                        <span className="">Show</span>
                        <select
                          className="border border-gray-300 px-2 py-1"
                          value={limit}
                          onChange={(e) => setLimit(e.target.value)}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="">entries</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  Date & Time
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  Deposit
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  Withdraw
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  Balance
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  Remark
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className="border border-gray-300 p-2 text-left">
                                <div className="flex items-center justify-between text-[13px]">
                                  From / To
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                  </svg>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transtionHistoryData?.length > 0 ? (
                              transtionHistoryData?.map((item, i) => (
                                <tr key={i} className="cursor-pointer">
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {updateDate(item.date)}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {item?.deposite || "-"}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {item?.withdrawl || "-"}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {item?.amount}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {item?.remark}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {item?.from} - {item?.to}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="border border-gray-300 px-4 py-2 text-center"
                                >
                                  No data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                        <div className="mb-2 md:mb-0">
                          Showing {transtionHistoryData.length} entries on page{" "}
                          {page}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                          <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="bg-gray-200 px-3 py-1 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-1">Page {page}</span>
                          <button
                            onClick={() => setPage((p) => p + 1)}
                            className="bg-gray-200 px-3 py-1"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === "activity" && (
              <div className="border border-gray-300 bg-white text-[13px]">
                <div className="bg-dark text-white px-4 py-1 font-semibold">
                  Password change history
                </div>
                <div className=" overflow-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-[#e0e6e6]">
                        <th className="border px-4 py-2 text-center">
                          Date / Time
                        </th>
                        <th className="border px-4 py-2 text-center">
                          Login Staus
                        </th>
                        <th className="border px-4 py-2 text-center">
                          IP Address
                        </th>
                        <th className="border px-4 py-2 text-center">ISP</th>
                        <th className="border px-4 py-2 text-center">
                          City/State/Country
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {LoginData.map((item, i) => (
                        <tr key={i}>
                          <td
                            colSpan=""
                            className="border px-4 py-2 text-center"
                          >
                            {item.dateTime}
                          </td>
                          <td
                            colSpan=""
                            className="border px-4 py-2 text-center"
                          >
                            {item.status}
                          </td>
                          <td
                            colSpan=""
                            className="border px-4 py-2 text-center"
                          >
                            {item.ip}
                          </td>
                          <td
                            colSpan=""
                            className="border px-4 py-2 text-center"
                          >
                            {item.isp}
                          </td>
                          <td
                            colSpan=""
                            className="border px-4 py-2 text-center"
                          >
                            {item.city}/{item.region}/{item.country}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg">
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Rooling Commission</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border px-4 py-2"
                  >
                    <span>{item.name}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {isAgent && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg">
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Agent Rooling Commission</span>
                <button
                  onClick={() => setIsAgent(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border px-4 py-2"
                  >
                    <span>{item.name}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {isEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg">
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Edit Commission</span>
                <button
                  onClick={() => setIsEdit(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 items-center px-4 py-1"
                  >
                    <span className="col-span-1 text-sm">{item.name}</span>
                    <input
                      type="text"
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                      value="0"
                      placeholder="Add here"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-3 items-center px-4 py-1">
                  <span className="col-span-1 text-sm">Virtual Sports</span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    value="0"
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 items-center px-4 py-1">
                  <span className="col-span-1 text-sm">Password</span>
                  <input
                    type="password"
                    className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    placeholder="Add here"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1 bg-blue rounded-md text-white">
                    Submit
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-300 rounded-md"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPopup && (
          <div className="absolute inset-0 flex justify-center items-center text-[13px] bg-[#0000007e]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-lg shadow-lg max-w-lg">
              <h2 className="font-semibold mb-4 bg-blue-one px-2 py-1 text-white">
                Change Password
              </h2>
              <div className="p-2">
                <input
                  type="password"
                  placeholder="Old Password"
                  className="w-full p-2 border rounded mb-2"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-2 border rounded mb-2"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-2 border rounded mb-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    className="bg-blue text-white px-4 py-2 rounded"
                    onClick={handleChangePassword}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
