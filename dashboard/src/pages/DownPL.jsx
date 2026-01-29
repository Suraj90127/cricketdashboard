import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDownLinefilterData, } from "../redux/reducer/downlineReducer";
// import Spinner2 from "../../../client/src/components/Spinner2";
import Spinner2 from "../components/Spinner2";
// import getMyRepostsDataByEvents

const DownPL = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dlfilter, loading } = useSelector((state) => state.downline);
  // console.log("object", dlfilter, "downline");
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("BACKUP DATA");

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
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === "OLD DATA") {
      setStartDate(formatDate(fiveMonthAgo)); // Or set a very old date if needed
      setEndDate(formatDate(currentDate));
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    // setStartDate(event.target.value)
  };

  const PLdata = dlfilter?.downlineProfitReport;
  const Totaldata = dlfilter?.overallProfit;
  // console.log(dlfilter, "myReportseventData");

  useEffect(() => {
    dispatch(getDownLinefilterData({
      page,
      limit,
      startDate,
      endDate,
      gameName: "",
      eventName: "",
      marketName: "",
      userName: "",
      targetUserId: "",
    }));
  }, [dispatch, page, limit, startDate, endDate]);

  const handelnavigate = (item) => {
    console.log(item, 'item')
    if (item.role === "user") {
      navigate(`/online-user/${item.userId}`, { state: { mystate: "PL" } });
    } else {
      dispatch(getDownLinefilterData({
        page,
        limit,
        startDate,
        endDate,
        gameName: "",
        eventName: "",
        marketName: "",
        userName: "",
        targetUserId: item.userId,
      }));
    }
  }

  return (
    <>
      <Navbar />
      <div className="p-2">
        {/* Filter Section */}
        <div className="border border-gray-900 rounded-lg text-[15px] bg-[#e0e6e6] p-4 mb-4">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-1/4">
              <label className="block mb-1">Data Source</label>
              <select
                value={selectedOption}
                onChange={handleOptionChange}
                className="border border-gray-300 p-2 bg-[#e0e6e6] col-span-1 w-full text-sm"
              >
                <option>LIVE DATA</option>
                <option>BACKUP DATA</option>
                <option>OLD DATA</option>
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block mb-1">From</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}


                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block mb-1">To</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <button className="bg-dark font-bold text-white px-4 py-2 rounded">
                Get P&L
              </button>
            </div>
          </div>
        </div>

        {/* Statement Table */}
        <div className="border border-gray-300 bg-white  text-[15px]">
          <div className="bg-dark text-white py-1 px-3">
            <h2 className="font-bold text-base">Profit Loss</h2>
          </div>

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
                  <tr className="bg-gray-200 text-center">
                    <th className="border border-gray-300 p-2 text-left">
                      <div className="flex items-center justify-center text-[13px]">
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
                      <div className="flex items-center justify-center text-[13px]">
                        Upline Profit / Loss
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
                      <div className="flex items-center justify-center text-[13px]">
                        Downline Profit / Loss
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
                      <div className="flex items-center justify-center text-[13px]">
                        Commission
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
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-300 p-4 text-center"
                      >
                        <div className="text-center py-4 fixed top-52 left-[40%]">
                          <Spinner2 />
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && PLdata?.length > 0 ? (
                    PLdata.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 text-center text-sm font-semibold"
                      >
                        <td
                          className="border border-gray-300 p-2 text-[#2789ce] cursor-pointer"
                          onClick={() => handelnavigate(item)}
                        >
                          {item.userName}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${item.netProfit > 0
                            ? "text-green-500"
                            : "text-red-500"
                            }`}
                        >
                          {Math.abs(item?.netProfit)}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${item.netProfit > 0
                            ? "text-red-500"
                            : "text-green-500"
                            }`}
                        >
                          {Math.abs(item?.netProfit)}
                        </td>
                        <td className="border border-gray-300 p-2">0</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-300 p-4 text-center"
                      >
                        No data available in table
                      </td>
                    </tr>
                  )}
                  {!loading && PLdata?.length > 0 && (
                    <tr className="text-center font-semibold" >
                      <td className="border border-gray-300 p-2">Total</td>
                      <td className={`border border-gray-300 p-2`}>{Math.abs(Totaldata?.netProfit)}</td>
                      <td className={`border border-gray-300 p-2`}>  {Math.abs(Totaldata?.netProfit)}</td>
                      <td className="border border-gray-300 p-2">0</td>
                    </tr>
                  )
                  }
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 mt-4">
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
      </div>
    </>
  );
};

export default DownPL;
