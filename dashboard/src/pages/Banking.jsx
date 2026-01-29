import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBan,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRegEdit,
  FaUnlock,
} from "react-icons/fa";
import {
  getAllOnlyUserAndDownline,
  setCurrentPage,
  updateCreditReference,
  withdrawalAndDeposite,
} from "../redux/reducer/authReducer";
import { toast } from "react-toastify";
const Banking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    userInfo,
    currentPage,
    totalPages,
    loading,
    onlyusers,
    crediteHistory,
  } = useSelector((state) => state.auth);

  // console.log("users", users);

  const [entries, setEntries] = useState(10);
  const [creditPopup, setCreditPopup] = useState(false);
  const [currentUser, setcurrentUser] = useState(null);
  const [type, setType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // console.log("currentUser", currentUser);

  const [formData, setFormData] = useState({
    creditReference: null,
    masterPassword: "",
    status: "active",
    userInputs: {}, // ⬅️ holds per-user input like balance & remark
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateCreditReference({ formData, userId: currentUser._id })).then(
      (res) => {
        if (res?.payload?.success) {
          toast.success(res.payload.message);
          setCreditPopup(false); // Optional: close the popup on success
          dispatch(
            getAllOnlyUserAndDownline({ page: currentPage, limit: entries, searchQuery })
          );
        } else {
          toast.error(res.payload.message);
        }
      }
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };



  const handleWithdwalDeposite = async (e) => {
    // e.preventDefault();
    if (!type) return toast.error("Selected Withdrawal or Deposite");
    console.log("type", type)
    if (!currentUser) return toast.error("No user selected");
    try {
      const userInput = formData.userInputs[currentUser._id] || {};

      const finalData = {
        ...formData,
        balance: userInput.balance || "",
        remark: userInput.remark || "",
      };
      const data = await dispatch(
        withdrawalAndDeposite({ formData: finalData, userId: currentUser._id, type })
      ).unwrap();
      toast.success(data.message);
      // dispatch(getAdmin());
      dispatch(
        getAllOnlyUserAndDownline({ page: currentPage, limit: entries, searchQuery })
      );
      // setBalancePopup(false); // Optional: close the popup on success
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    dispatch(
      getAllOnlyUserAndDownline({
        page: currentPage,
        limit: entries,
        searchQuery
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);
  return (
    <>
      <Navbar />
      <div className="p-2 md:p-6">
        {/* Statement Table */}
        <div className="border border-gray-300 bg-white  text-[13px]">
          <div className="bg-dark text-white py-1 px-3">
            <h2 className="font-bold">Account Statement</h2>
          </div>

          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="flex items-center mb-2 md:mb-0">
                <span className="mr-2">Show</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1"
                  value={entries}
                  onChange={(e) => setEntries(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                </select>
                <span className="ml-2">entries</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Search:</span>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">
                      <div className="flex items-center justify-between text-[13px]">
                        UID
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
                        Available D/W
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
                        Exposure
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
                        Credit Reference
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
                        Reference P/L
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
                        Deposit P/L
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
                  </tr>
                </thead>
                <tbody className="border">
                  {onlyusers.map((item, i) => (
                    <tr
                      key={i}
                      className="border border-gray-300 font-semibold"
                    >
                      <td className="p-2 border border-gray-300">
                        {item.userName}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {item.balance}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {item.avbalance}
                      </td>
                      <td className="p-2 border border-gray-300 text-red-500">
                        ({item.exposure})
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-x-2">
                          {item.creditReference}
                          <span
                            className="text-blue2"
                            onClick={() => {
                              setCreditPopup(true);
                              setcurrentUser(item);
                            }}
                          >
                            <FaRegEdit />
                          </span>
                        </div>
                      </td>
                      <td
                        className={`p-2 border border-gray-300 ${item.profitLoss <= 0
                          ? "text-red-500 "
                          : "text-green-500"
                          }`}
                      >
                        {item.profitLoss}
                      </td>
                      <td className="p-2 border border-gray-300">
                        <div className=" flex gap-1 items-center">
                          <button
                            onClick={() => {
                              setType("deposite");
                              setcurrentUser(item);
                            }}
                            className={`px-3 py-2 text-xs rounded border border-gray-900 ${type === "deposite" &&
                              currentUser?._id === item._id
                              ? "bg-green-500 text-white"
                              : "bg-gray-300"
                              }`}
                          >
                            D
                          </button>

                          <button
                            onClick={() => {
                              setType("withdrawal");
                              setcurrentUser(item);
                            }}
                            className={`px-3 py-2 text-xs rounded border border-gray-900 ${type === "withdrawal" &&
                              currentUser?._id === item._id
                              ? "bg-red-500 text-white"
                              : "bg-gray-300"
                              }`}
                          >
                            W
                          </button>

                          <input
                            type="number"
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                userInputs: {
                                  ...prev.userInputs,
                                  [item._id]: {
                                    ...prev.userInputs[item._id],
                                    balance: e.target.value,
                                  },
                                },
                              }))
                            }
                            value={formData.userInputs[item._id]?.balance || ""}
                            placeholder="Add here"
                            className="border border-gray-300 px-3 py-2 mx-1 text-xs"
                          />

                          <button className="bg-gray-500 text-white px-3 py-2 text-xs rounded">
                            Full
                          </button>
                        </div>
                      </td>
                      <td className="p-2 border border-gray-300">
                        <input
                          type="text"
                          placeholder="Remark"
                          className="border border-gray-300 px-3 py-2 text-xs w-full"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              userInputs: {
                                ...prev.userInputs,
                                [item._id]: {
                                  ...prev.userInputs[item._id],
                                  remark: e.target.value,
                                },
                              },
                            }))
                          }
                          value={formData.userInputs[item._id]?.remark || ""}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <div>
                Showing : {currentPage} to {totalPages} of {onlyusers?.length}{" "}
                entries
              </div>
              <div className="flex">
                <button
                  className={`px-3 py-1 border border-gray-300 rounded-l ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white"
                    }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  « Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 border-t border-b border-gray-300 ${currentPage === i + 1 ? "bg-gray-200" : "bg-white"
                      }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className={`px-3 py-1 border border-gray-300 rounded-r ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white"
                    }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next »
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-sm w-full md:w-1/5">
                Cancel
              </button>
              <input
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    masterPassword: e.target.value,
                  })
                }
                value={formData.masterPassword}
                placeholder="Enter your password..."
                className="border border-gray-400 rounded-sm py-1 px-2 w-full md:w-1/5"
              />
              <button
                onClick={handleWithdwalDeposite}
                className="px-4 py-2 bg-dark text-white rounded-sm w-full md:w-1/5"
              >
                Submit Payment
              </button>
              <div></div>
            </div>
          </div>
        </div>
        {creditPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <div className="bg-white w-70 md:w-100 rounded-lg shadow-lg">
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Edit Credit Refernce - {currentUser.name}</span>
                <button
                  onClick={() => setCreditPopup(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                <form onSubmit={handleUpdate} className="p-4 space-y-2">
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">Current</span>
                    <input
                      readOnly
                      type="text"
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                      value={currentUser.creditReference}
                      placeholder="Add here"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">New </span>
                    <input
                      type="text"
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditReference: e.target.value,
                        })
                      }
                      value={formData.creditReference}
                      placeholder="Add here"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">Password</span>
                    <input
                      type="password"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder="Enter your password..."
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      // onClick={() => handleUpdate(e)}
                      className="px-3 py-1 bg-blue rounded-md text-white"
                    >
                      Submit
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-300 rounded-md"
                      onClick={() => setCreditPopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Banking;
