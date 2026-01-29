"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBan,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRegEdit,
  FaUnlock,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  addAdmin,
  getAdmin,
  deleteSubAdmin,
  getAllUserAndDownline,
  setCurrentPage,
  fetchSubAdminByLevel,
  updateCreditReference,
  getCreditRefHistory,
  withdrawalAndDeposite,
  userSetting,
} from "../redux/reducer/authReducer";
import { toast } from "react-toastify";
import { IoMdSettings } from "react-icons/io";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import Loader from "../components/Loader";
import { updateGameLock } from "../redux/reducer/downlineReducer";

export default function AgentLIst() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, currentPage, totalPages, loading, users, crediteHistory } =
    useSelector((state) => state.auth);
  const { gamelock } = useSelector((state) => state.downline);

  // console.log("crediteHistory", crediteHistory);
  // console.log("totalCrediteData", totalCrediteData);
  // console.log("userInfo", userInfo);

  const [entries, setEntries] = useState(10);
  const [creditEntries, setCreditEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [creditPopup, setCreditPopup] = useState(false);
  const [patnerPopup, setPatnerPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [balancePopup, setBalancePopup] = useState(false);
  const [settingPopup, setSettingPopup] = useState(false);
  const [sportsPopup, setSportsPopup] = useState(false);
  const [currentUser, setcurrentUser] = useState(null);
  const [isFetchingAllUsers, setIsFetchingAllUsers] = useState(null);
  const [type, setType] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [gameLockData, setGameLockData] = useState([]);

  // console.log("currentUser", currentUser);
  const roleHierarchy = {
    supperadmin: ["admin", "white", "super", "master", "agent"],
    admin: ["white", "super", "master", "agent"],
    white: ["super", "master", "agent"],
    super: ["master", "agent"],
    master: ["agent"],
    agent: ["user"],
  };

  const allowedRoles = roleHierarchy[userInfo?.role] || [];

  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    accountType: "",
    commition: "",
    balance: null,
    exposureLimit: null,
    creditReference: null,
    rollingCommission: null,
    partnership: null,
    phone: null,
    password: "",
    confirmPassword: "",
    masterPassword: "",
    remark: "",
    status: "active",
  });

  // sport popup checkbox   
  const handleToggle = async (game, currentLock) => {
    try {
      dispatch(
        updateGameLock({ userId: currentUser?._id, game, lock: !currentLock })
      ).then((res) => {
        if (res.payload.success) {
          console.log("res.payload111", res.payload);
          setGameLockData(res.payload?.gamelock);
          dispatch(
            getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery })
          );
          toast.success(res.payload.message);
        } else {
          toast.error(res.payload.message);
        }
      });
    } catch (err) {
      console.error("Failed to update game lock:", err);
    }
  };

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }
    if (userInfo) {
      try {
        const result = await dispatch(addAdmin(formData)).unwrap();
        toast.success(result.message);
        dispatch(
          getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery })
        );
        dispatch(getAdmin());
        setIsEdit(false);
      } catch (error) {
        // console.log("root error", error);
        toast.error(error);
      }
    } else {
      navigate("/login");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleDelete = async (id) => {
    try {
      const deleteUser = await dispatch(deleteSubAdmin(id)).unwrap();

      toast.success(deleteUser.message);
      dispatch(
        getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery })
      );
    } catch (error) {
      toast.error(error);
    }

  };


  const handleLoadNextLevel = (user, code) => {
    if (user.role !== "user") {

      setIsFetchingAllUsers(false);
      dispatch(fetchSubAdminByLevel({ code: code }));
    }

  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        updateCreditReference({ formData, userId: currentUser._id })
      ).unwrap();
      toast.success(data.message);
      setCreditPopup(false);
      dispatch(
        getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery })
      );
    } catch (error) {
      toast.error(error);
    }
  };




  const handleWithdwalDeposite = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        withdrawalAndDeposite({ formData, userId: currentUser._id, type })
      ).unwrap();
      toast.success(data.message);
      dispatch(getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery }));
      dispatch(getAdmin());
      setBalancePopup(false); // Optional: close the popup on success
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSetting = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        userSetting({
          userId: currentUser._id,
          status: formData.status,
          masterPassword: formData.masterPassword,
        })
      ).unwrap();
      toast.success(result.message);
      setSettingPopup(false);
      dispatch(getAllUserAndDownline({ page: currentPage, limit: entries, searchQuery }));
    } catch (error) {
      toast.error(error);
    }
  };


  const handleCreditRefHistory = (userId) => {
    setSelectedUserId(userId);
    setIsOpen(true);
  };
  useEffect(() => {
    if (isOpen && selectedUserId) {
      dispatch(
        getCreditRefHistory({
          userId: selectedUserId,
          page: currentPage,
          limit: creditEntries,

        })
      );
    }
  }, [
    dispatch,
    currentPage,
    creditEntries,

    selectedUserId,
    isOpen,
  ]);

  useEffect(() => {
    setIsFetchingAllUsers(true);
    dispatch(
      getAllUserAndDownline({
        page: currentPage,
        limit: entries,
        searchQuery
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-1 md:p-4">
        <div className="flex justify-end mb-4 gap-2">
          <button
            className="bg-white border border-gray-300 rounded px-3 py-1 flex items-center gap-1"
            onClick={() => setIsEdit(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Add Master
          </button>
          <button className="bg-white border border-gray-300 rounded p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Financial metrics summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-0 mb-4 bg-white">
          <div className="border-b md:border-b-0 md:border-r border-gray-300 p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Total Balance
            </div>
            <div className="font-semibold">IRP {userInfo?.totalBalance}</div>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-300 p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Total Exposure
            </div>
            <div className="font-semibold ">
              IRP
              <span className="text-red-600">({userInfo?.exposure})</span>
            </div>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-300 p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Available Balance
            </div>
            <div className="font-semibold">IRP {userInfo?.agentAvbalance}</div>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-300 p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Balance
            </div>
            <div className="font-semibold">IRP {userInfo?.avbalance || 0}</div>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-300 p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Total Avail. bal.
            </div>
            <div className="font-semibold">IRP {userInfo?.totalAvbalance}</div>
          </div>
          <div className="p-2">
            <div className="text-gray-400 text-[12px] font-semibold">
              Upline P/L
            </div>
            <div className="font-semibold">
              IRP
              <span
                className={`${userInfo.profitLoss <= 0 ? "text-red-500" : "text-green-500"
                  }`}
              >
                ({userInfo?.profitLoss})
              </span>
            </div>
          </div>
        </div>

        {/* Main content area with table */}
        <div className="bg-white border border-gray-300 p-4 rounded">
          {/* Table controls */}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#e0e6e6]">
                  <th className="border border-gray-300 p-2 text-left">
                    Username
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Credit Ref.
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Balance
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Exposure
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Partnership
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Avail. Bal.
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Ref. P/L
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center border border-gray-300 p-2"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users?.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="text-sm font-semibold">
                      <td
                        onClick={() => handleLoadNextLevel(user, user.code)}
                        className={`border border-gray-300 p-2 ${user.role === "user" ? "text-[#0f1214]" : "text-[#2789ce] cursor-pointer"} `}
                      >
                        <div className="flex item-center gap-1">
                          {" "}
                          <span className="bg-green-400 border border-green-400 rounded-sm px-1 text-white">
                            {user.role}
                          </span>
                          {user.userName}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-x-2">
                          {user.creditReference}
                          <span
                            className="text-blue2"
                            onClick={() => {
                              setCreditPopup(true);
                              setcurrentUser(user);
                            }}
                          >
                            <FaRegEdit />
                          </span>
                          <span
                            className="text-blue2"
                            onClick={() => handleCreditRefHistory(user._id)}
                          >
                            <FaEye />
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-x-2">
                          <span>{user.balance || 0}</span>
                        </div>
                      </td>
                      <td className={`border border-gray-300 p-2 text-red-500`}>
                        ({user.exposure})
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-1">
                          {user.partnership || 0}
                          {isFetchingAllUsers == true ? (
                            <span
                              className="text-blue2"
                              onClick={() => setPatnerPopup(true)}
                            >
                              <FaRegEdit />
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        {user.avbalance || 0}
                      </td>
                      <td
                        className={`border border-gray-300 p-2 ${user.profitLoss < 0
                          ? "text-red-500"
                          : "text-green-500"
                          }`}
                      >
                        {Number(user.balance) - Number(user.creditReference)}
                      </td>
                      <td className="border border-gray-300 p-2 text-[12px]">
                        <span
                          className={`
                              px-1 rounded-sm border text-[11px]
                              ${user.status === "active"
                              ? "bg-green-100 border-green-200 text-green-700"
                              : ""
                            }
                              ${user.status === "suspend"
                              ? "bg-red-100 border-red-200 text-red-700"
                              : ""
                            }
                              ${user.status === "locked"
                              ? "bg-gray-200 border-gray-300 text-gray-800"
                              : ""
                            }
                            `}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-2">
                          {isFetchingAllUsers == true ? (
                            <>
                              <span
                                onClick={() => {
                                  setBalancePopup(true);
                                  setcurrentUser(user);
                                }}
                                className="text-lg bg-gray-200 border border-gray-500 rounded-sm p-0.5 text-gray-600 cursor-pointer"
                              >
                                <TbCoinRupeeFilled />
                              </span>
                              <span
                                onClick={() => {
                                  setSettingPopup(true);
                                  setcurrentUser(user);
                                }}
                                className="text-lg bg-gray-200 border border-gray-500 rounded-sm p-0.5 text-gray-600 cursor-pointer"
                              >
                                <IoMdSettings />
                              </span>
                            </>
                          ) : null}
                          <div className="text-lg bg-gray-200 border border-gray-500 rounded-sm p-0.5 text-gray-600 cursor-pointer">
                            <Link to={`/online-user/${user._id}`} className="">
                              <span>
                                <svg
                                  stroke="currentColor"
                                  fill="currentColor"
                                  stroke-width="0"
                                  viewBox="0 0 512 512"
                                  height="1em"
                                  width="1em"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M256 256c52.805 0 96-43.201 96-96s-43.195-96-96-96-96 43.201-96 96 43.195 96 96 96zm0 48c-63.598 0-192 32.402-192 96v48h384v-48c0-63.598-128.402-96-192-96z"></path>
                                </svg>
                              </span>
                            </Link>
                          </div>
                          <span
                            onClick={() => {
                              setSportsPopup(true);
                              setGameLockData(user?.gamelock);
                              setcurrentUser(user);
                            }}
                            className="text-lg bg-gray-200 border border-gray-500 rounded-sm p-0.5 text-gray-600 cursor-pointer"
                          >
                            <FaUnlock />
                          </span>
                          {isFetchingAllUsers == true ? (
                            <span
                              className="text-lg bg-gray-200 border border-gray-500 rounded-sm p-0.5 text-gray-600 cursor-pointer"
                              onClick={() => handleDelete(user._id)}
                            >
                              <MdDelete />
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center border border-gray-300 p-2"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div>
              Showing : {currentPage} to {totalPages} of {users?.length} entries
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
        </div>
        {isEdit && (
          <div className="fixed inset-0 flex items-center z-10 justify-center bg-[#00000074] p-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-full max-w-[500px] rounded-lg shadow-lg overflow-y-auto max-h-[90vh] mx-2"
            >
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between sticky top-0">
                <span> Add Master</span>
                <button
                  onClick={() => setIsEdit(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <form onSubmit={handleSubmit} className="md:p-4 space-y-2">
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    value={formData.name}
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    placeholder="Add here"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Username <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    value={formData.UserName}
                    placeholder="Add here"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Account Type <span className="text-red-500">*</span>
                  </span>
                  <select
                    name="account"
                    id="account"
                    className="col-span-2 w-full border border-gray-300 px-2 py-1 rounded-md"
                    onChange={(e) =>
                      setFormData({ ...formData, accountType: e.target.value })
                    }
                    value={formData.accountType}
                  >
                    <option value="">Select A/c Type</option>
                    {allowedRoles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption.charAt(0).toUpperCase() +
                          roleOption.slice(1)}{" "}
                        Level
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Commission <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({ ...formData, commition: e.target.value })
                    }
                    value={formData.commition}
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Opening Balance <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    value={formData.balance}
                    placeholder="Add here"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Credit Reference <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
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
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Rolling Commission <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rollingCommission: e.target.value,
                      })
                    }
                    value={formData.rollingCommission}
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Partnership <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        partnership: e.target.value,
                      })
                    }
                    value={formData.partnership}
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Mobile Number <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-md w-full"
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    value={formData.phone}
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Password<span className="text-red-500">*</span>
                  </span>
                  <span className="relative col-span-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password..."
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      value={formData.password}
                      className="w-full border border-gray-300 rounded text-xs md:text-sm px-2 py-0.5 md:py-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center px-4 py-1">
                  <span className="col-span-1 text-xs md:text-sm">
                    Confirm Password <span className="text-red-500">*</span>
                  </span>
                  <span className="relative col-span-2">
                    <input
                      type={showPassword2 ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Enter your password..."
                      className="w-full border border-gray-300 rounded text-xs md:text-sm px-2 py-0.5 md:py-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowPassword2(!showPassword2)}
                    >
                      {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </span>
                </div>
                <div className="flex justify-center items-center flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 items-center px-4 py-1 w-full">
                    <span className="col-span-1 text-xs md:text-sm">
                      Master Password <span className="text-red-500">*</span>
                    </span>
                    <span className="relative col-span-2">
                      <input
                        type={showPassword3 ? "text" : "password"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            masterPassword: e.target.value,
                          })
                        }
                        value={formData.masterPassword}
                        placeholder="Enter your password..."
                        className="w-full border border-gray-300 rounded text-xs md:text-sm px-2 py-0.5 md:py-1 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() => setShowPassword3(!showPassword3)}
                      >
                        {showPassword3 ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </span>
                  </div>

                  <button className="px-3 py-1 bg-blue rounded-md text-white">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {creditPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg"
            >
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
                      type={showPassword ? "text" : "password"}
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
            </motion.div>
          </div>
        )}
        {patnerPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Edit Patnership</span>
                <button
                  onClick={() => setPatnerPopup(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-3 items-center px-4 py-1">
                  <span className="col-span-1 text-sm">Current</span>
                  <input
                    // readOnly
                    type="text"
                    className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    value=""
                    placeholder="Add here"
                  />
                </div>
                <div className="grid grid-cols-3 items-center px-4 py-1">
                  <span className="col-span-1 text-sm">New </span>
                  <input
                    type="text"
                    className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    value=""
                    name="partnership"
                    placeholder="Add here.."
                  />
                </div>
                <div className="grid grid-cols-3 items-center px-4 py-1">
                  <span className="col-span-1 text-sm">Password</span>
                  <input
                    type="password"
                    className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                    placeholder="Password"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1 bg-blue rounded-md text-white">
                    Submit
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-300 rounded-md"
                    onClick={() => setPatnerPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {balancePopup && (
          <div className="fixed inset-0 flex items-center justify-center text-[13px] bg-[#00000074]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-70 md:w-100 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1 flex justify-between">
                <span>Banking - Master Balance : {userInfo.avbalance}</span>
                <button
                  onClick={() => setBalancePopup(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>
              <div className="flex justify-between px-4 py-2">
                <div>
                  <span>USER NAME</span>
                </div>
                <div>
                  Client Bal:{" "}
                  <span className="font-semibold">{currentUser.avbalance}</span>{" "}
                </div>
              </div>

              {/* Commission List */}
              <form onSubmit={handleWithdwalDeposite}>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">Balance</span>
                    <input
                      type="Number"
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                      onChange={(e) =>
                        setFormData({ ...formData, balance: e.target.value })
                      }
                      value={formData.balance}
                      placeholder="Add here"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">Remark</span>
                    <input
                      type="text"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remark: e.target.value,
                        })
                      }
                      value={formData.remark}
                      className="border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                      placeholder="Add here"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center px-4 py-1">
                    <span className="col-span-1 text-sm">Password</span>
                    <input
                      type={showPassword ? "text" : "password"}
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
                      onClick={() => setType("deposite")}
                      className="px-3 py-2 bg-green-300 rounded-md text-white"
                    >
                      Deposit
                    </button>
                    <button
                      className="px-3 py-2 bg-red-300 rounded-md text-white"
                      onClick={() => setType("withdrawal")}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {settingPopup && (
          <div className="fixed inset-0  bg-[#00000074] flex justify-center text-sm items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-full md:w-120 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white p-1 px-3 flex justify-between items-center">
                <h2 className="font-semibold">Change Status</h2>
                <button
                  className="text-white text-xl"
                  onClick={() => setSettingPopup(false)}
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* User Info */}
                <div className="flex justify-between items-center gap-2 mb-4 text-[13px]">
                  <div>
                    <span className="bg-green-500 text-white text-[11px] px-1 py-0.5 rounded text-xs">
                      {currentUser.role}
                    </span>
                    <span className="ml-2">{currentUser.name}</span>
                  </div>
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                    {currentUser.status}
                  </span>
                </div>

                {/* Status Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Active Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: "active" })
                    }
                    className={`border p-3 rounded flex flex-col items-center
      ${formData.status === "active"
                        ? "bg-green-500 text-white"
                        : "border-green-500 text-green-600"
                      }`}
                  >
                    <FaCheckCircle size={20} />
                    <span>Active</span>
                  </button>

                  {/* Suspend Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: "suspend" })
                    }
                    className={`border p-3 rounded flex flex-col items-center
      ${formData.status === "suspend"
                        ? "bg-red-500 text-white"
                        : "border-red-500 text-red-600"
                      }`}
                  >
                    <FaBan size={20} />
                    <span>Suspend</span>
                  </button>

                  {/* Locked Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: "locked" })
                    }
                    className={`border p-3 rounded flex flex-col items-center
      ${formData.status === "locked"
                        ? "bg-gray-700 text-white"
                        : "border-gray-400 text-gray-700"
                      }`}
                  >
                    <FaLock size={20} />
                    <span>Locked</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password.."
                      className="w-full border p-1 px-2 rounded"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      className="absolute right-3 top-2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Change Button */}
                  <button
                    onClick={handleSetting}
                    className="bg-blue text-white w-full px-2 rounded"
                  >
                    Change
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {sportsPopup && (
          <div className="fixed inset-0 text-sm bg-[#00000074] flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-96 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white p-3 py-1 flex justify-between items-center">
                <h2 className="font-semibold">Sports Settings</h2>
                <button
                  className="text-white text-xl"
                  onClick={() => setSportsPopup(false)}
                >
                  &times;
                </button>
              </div>

              {/* Table */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse border text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Sr.No.</th>
                      <th className="border p-2">Sport Name</th>
                      <th className="border p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLockData.map((item, index) => {
                      // Find matching parent (admin/userInfo) gamelock entry
                      const parentGameLock = userInfo?.gamelock?.find(
                        (g) => g.game === item.game
                      );

                      // Is the parent lock ON (true)? Only then allow change
                      const isParentLocked = parentGameLock?.lock === true;

                      return (
                        <tr className="border" key={item.game}>
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2">{item.game}</td>
                          <td className="border p-2 text-center">
                            <input
                              type="checkbox"
                              checked={item.lock}
                              disabled={!isParentLocked} // disable checkbox if admin lock is false
                              onChange={() =>
                                isParentLocked && handleToggle(item.game, item.lock)
                              }
                            />
                            {!isParentLocked && (
                              <div className="text-red-500 text-xs">Locked by Admin</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {isOpen && (
          <div className="fixed inset-0 bg-[#00000074] text-[12px] flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-3/4 max-w-2xl rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white p-1 px-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Credit Reference Log</h2>
                <button
                  className="text-white font-bold text-xl"
                  onClick={() => setIsOpen(false)}
                >
                  &times;
                </button>
              </div>

              {/* Body */}

              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="flex items-center mb-2 md:mb-0">
                        <span className="mr-2">Show</span>
                        <select
                          className="border border-gray-300 rounded px-2 py-1"
                          value={creditEntries}
                          onChange={(e) => {
                            setCreditEntries(Number(e.target.value));
                            setCurrentPage(1); // reset to first page on entries change
                          }}
                        >
                          <option value="2">2</option>
                          <option value="5">5</option>
                          <option value="10">10</option>
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

                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border border-gray-300 p-2">
                            From Name
                          </th>
                          <th className="border border-gray-300 p-2">
                            Username
                          </th>
                          <th className="border border-gray-300 p-2">
                            Old Credit Reference
                          </th>
                          <th className="border border-gray-300 p-2">
                            New Credit Reference
                          </th>
                          <th className="border border-gray-300 p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crediteHistory.length > 0 ? (
                          crediteHistory.map((item, index) => (
                            <tr key={index} className="text-center">
                              <td className="border border-gray-300 text-red-500 p-2">
                                ({item.formName})
                              </td>
                              <td className="border border-gray-300 p-2">
                                {item.userName}
                              </td>
                              <td className="border border-gray-300 text-red-500 p-2">
                                ({item.oldamount})
                              </td>
                              <td className="border border-gray-300 p-2">
                                {item.newamount}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {new Date(item.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="border border-gray-300 p-2 text-center"
                            >
                              No matching records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
