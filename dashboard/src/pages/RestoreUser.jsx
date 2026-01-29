import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  getAlldeleteUser,
  setCurrentPage,
  restoreUser,
} from "../redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../components/Spinner";

const RestoreUser = () => {
  const MySwal = withReactContent(Swal);
  const [entries, setEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  console.log("currentUser", currentUser);
  // const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, currentPage, totalPages, loading, deleteUsers } =
    useSelector((state) => state.auth);

  const handleDelete = (id) => {
    MySwal.fire({
      title: "Enter Master Password",
      input: "password",
      inputPlaceholder: "Master Password",
      showCancelButton: true,
      confirmButtonText: "Restore User",
      preConfirm: (masterPassword) => {
        if (!masterPassword) {
          Swal.showValidationMessage("Please enter master password");
        }
        return masterPassword;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        dispatch(
          restoreUser({ userId: id, masterPassword: result.value })
        ).then((res) => {
          if (res?.payload?.success) {
            toast.success(res.payload.message);
            deleteUsers: res.payload.data;
            setCurrentUser(null);
            dispatch(
              getAlldeleteUser({
                page: currentPage,
                limit: entries,
                searchQuery: searchQuery,
              })
            );
          } else {
            toast.error(res.payload.message);
          }
        });
      }
    });
  };

  // console.log("delete user", users);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  useEffect(() => {
    dispatch(
      getAlldeleteUser({
        page: currentPage,
        limit: entries,
        searchQuery: searchQuery,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);
  return (
    <>
      <Navbar />
      <div className=" mx-auto  overflow-hidden relative text-sm p-2 md:p-6">
        <div className="mt-4">
          <div className="bg-dark text-white px-4 py-2 font-semibold">
            Restore User
          </div>
          {loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between my-2">
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
          )}

          <div className="overflow-auto">

            <table className="w-full border border-gray-100 text-xs md:text-sm">
              <thead>
                <tr className="bg-[#e0e6e6]">
                  <th className="border px-4 py-2 text-center">User Name</th>
                  <th className="border px-4 py-2 text-center">Name</th>
                  <th className="border px-4 py-2 text-center">Date / Time</th>
                  <th className="border px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {deleteUsers.length > 0 ? (
                  deleteUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="border px-4 py-2 text-center">
                        {user.userName}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {user.name}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {new Date(user.updatedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </td>

                      <td className="border px-4 py-2 text-center">
                        <button
                          className="bg-blue text-white px-3 py-1 rounded"
                          onClick={() => handleDelete(user._id)}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border px-4 py-2 text-center">
                      No data!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div>
              Showing : {currentPage} to {totalPages} of {deleteUsers?.length}{" "}
              entries
            </div>
            <div className="flex">
              <button className="px-3 py-1 border border-gray-300 mx-1">
                First
              </button>
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
              <button className="px-3 py-1 border border-gray-300 mx-1">
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestoreUser;
