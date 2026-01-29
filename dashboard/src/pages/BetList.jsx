import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { geAllBetHistory, getBetPerents } from "../redux/reducer/authReducer";
import { motion, AnimatePresence } from "framer-motion";

const BetList = () => {
  const { bethistoryData, betPerantsData, loading } = useSelector(
    (state) => state.auth
  );
  console.log("bethistoryData", bethistoryData);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pastdate, setPastDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedVoid, setSelectedVoid] = useState("");
  const [popup, setPopup] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(
      geAllBetHistory({
        page: page,
        limit: limit,
        startDate: pastdate,
        endDate: date,
        selectedGame,
        selectedVoid,
      })
    );
  };
  useEffect(() => {
    fetchData();
  }, [date, pastdate, selectedGame, selectedVoid, page, limit, selectedVoid]);

  // console.log(bethistoryData, "bet history data");

  const handelpopup = async (id) => {
    setPopup(true);
    await dispatch(getBetPerents(id));
    console.log("idddd", id);
  };
  return (
    <div>
      <Navbar />
      <div className="p-2">
        {/* Filter Section */}
        <div className="border border-gray-900 rounded-lg text-[13px] bg-[#e0e6e6] p-4 mb-4">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-1/6">
              <label className="block mb-1">Choose Type</label>
              <select
                value={selectedVoid}
                onChange={(e) => setSelectedVoid(e.target.value)}
                className="border  p-2 bg-white col-span-1 w-full text-sm"
              >
                <option value="">Choose Type</option>
                <option value="settel">Settel</option>
                <option value="void">Void</option>
                <option value="unsettel">Unsettel</option>
              </select>
            </div>
            <div className="w-full md:w-1/6">
              <label className="block mb-1">Choose Sports</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="border border-gray-300 p-2 bg-[#e0e6e6] col-span-1 w-full text-sm"
              >
                <option value="">All</option>
                <option value="Cricket Game">Cricket</option>
                <option value="Tennis Game">Tennis</option>
                <option value="Soccer Game">Soccer</option>
                <option value="Casino Game">Casino</option>
                <option value="Horse Racing Game">Horse Racing</option>
                <option value="Greyhound Racing Game">Greyhound Racing</option>
                <option value="Basket Ball Game">Basket Ball</option>
                <option value="Lottery Game">Lottery</option>
              </select>
            </div>
            <div className="w-full md:w-1/6">
              <label className="block mb-1">From</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={pastdate}
                  onChange={(e) => setPastDate(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/6">
              <label className="block mb-1">To</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button className="bg-dark font-bold text-white px-4 py-2 rounded text-base">
                Get History
              </button>
            </div>
          </div>
        </div>

        {/* Statement Table */}
        <div className="border border-gray-300 bg-white  text-[13px]">
          <div className="bg-dark text-white py-1 px-3">
            <h2 className="font-bold">Bet History</h2>
          </div>

          <div className="p-4">
            <div className="flex items-center mb-4">
              <span className="mr-2">Show</span>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="ml-2">entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">
                      <div className="flex items-center justify-between text-[13px]">
                        User Name
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
                        Sports Name
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
                        Event Name
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
                        Market Name
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
                        Selection
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
                        Type
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
                        Odd Req
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
                        Stake
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
                        P | L
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
                        Result
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
                        Place Time
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
                  {loading ? (
                    <tr>Loading</tr>
                  ) : bethistoryData.length > 0 ? (
                    bethistoryData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td
                          className="border border-gray-300 p-2 text-blue-800 font-semibold"
                          // onMouseEnter={() => handelpopup(item.userId)}
                        >
                          {item?.userName}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.gameName}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.eventName}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.marketName}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.teamName}
                        </td>
                        <td className={`border font-bold ${item?.otype === "back" ? "text-green-500" : "text-red-500"} border-gray-300 p-2`}>
                          {item?.otype}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.xValue}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.price}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <span className="text-green-500">{item?.resultAmount}.00</span> /
                          <span className="text-red-500">-{item?.price}</span>
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.status === 0
                            ? <span className="text-red-500">Pending</span>
                            : item?.status === 1 ? <span className="text-green-500">Win</span> : <span className="text-red-500">Lose</span>}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item?.createdAt}
                        </td>
                        {/* <td className="border border-gray-300 p-2">
                          {item?.updatedAt}
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center p-4">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <div className="mb-2 md:mb-0">
                Showing {limit} entries of {page} page
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border border-gray-300 mx-1"
                >
                  Previous
                </button>
                <p>{page}</p>
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border border-gray-300 mx-1"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {popup && (
          <div className="fixed inset-0 flex items-start justify-center bg-[#0000005d] bg-opacity-50 z-[100]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white  mt-1 w-64 md:w-100 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="bg-blue text-white font-bold px-4 py-1.5 flex justify-between">
                <span>Parent List</span>
                <button
                  onClick={() => setPopup(false)}
                  className="text-white text-xl"
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className="p-4 space-y-2">
                {[...betPerantsData].reverse().map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-center items-center border border-gray-300 px-4 py-2 text-center font-semibold"
                  >
                    <span>{item.userName}</span>
                    <span>
                      <span>({item.role.toUpperCase()})</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetList;
