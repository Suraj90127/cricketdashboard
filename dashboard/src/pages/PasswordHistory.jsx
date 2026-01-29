import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPasswordHistory,
  setCurrentPage,
} from "../redux/reducer/authReducer";
import { FaRegEdit } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const users = [
  {
    _id: "1",
    userName: "john_doe",
    date: "2025-04-08 15:30",
    remark: "Login from new device",
  },
  {
    _id: "2",
    userName: "jane_smith",
    date: "2025-04-07 10:15",
    remark: "Password changed",
  },
];

const PasswordHistory = () => {
  const dispatch = useDispatch();
  const [entries, setEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    userInfo,
    successMessage,
    errorMessage,
    currentPage,
    passwordHistoryData,
    totalPages,
    loading,
  } = useSelector((state) => state.auth);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  useEffect(() => {
    dispatch(
      getPasswordHistory({
        page: currentPage,
        limit: entries,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);

  return (
    <>
      <Navbar />
      <div className=" mx-auto  overflow-hidden relative text-sm p-2 md:p-6">
        <div className="mt-4">
          <div className="bg-dark text-white px-4 py-2 font-semibold">
            Password change history
          </div>
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

          <table className="w-full border border-gray-100">
            <thead>
              <tr className="bg-[#e0e6e6]">
                <th className="border px-4 py-2 text-center">User Name</th>
                <th className="border px-4 py-2 text-center">Remark</th>
                <th className="border px-4 py-2 text-center">Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {passwordHistoryData.length > 0 ? (
                passwordHistoryData.map((user) => (
                  <tr key={user._id}>
                    <td className="border px-4 py-2 text-center">
                      {user.userName}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {user.remark}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {new Date(user.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="border px-4 py-2 text-center">
                    No data!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div>
              Showing : {currentPage} to {totalPages} of{" "}
              {passwordHistoryData?.length} entries
            </div>
            <div className="flex">
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 border border-gray-300 mx-1"
              >
                First
              </button>
              <button
                className={`px-3 py-1 border border-gray-300 rounded-l ${
                  currentPage === 1
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
                  className={`px-3 py-1 border-t border-b border-gray-300 ${
                    currentPage === i + 1 ? "bg-gray-200" : "bg-white"
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={`px-3 py-1 border border-gray-300 rounded-r ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white"
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next »
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 border border-gray-300 mx-1"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordHistory;
