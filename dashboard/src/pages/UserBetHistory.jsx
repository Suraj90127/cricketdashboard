import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRepostsDataByEvents, getPLfilterData } from "../redux/reducer/downlineReducer";
import { useLocation } from "react-router-dom";

// import getMyRepostsDataByEvents

const UserBetHistory = () => {
  const { userName } = useParams();
  const location = useLocation();
  const { gameName } = location.state || {};
  const { eventName } = location.state || {};
  const { marketName } = location.state || {};
  const dispatch = useDispatch();
  const { plfilter, loading } = useSelector((state) => state.downline);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pastdate, setPastDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // console.log(eventName, "eventName");
  // console.log(gameName, "gameName");
  // console.log(marketName, "markketName");
  // console.log(userName, "markketName");

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString();
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("LIVE DATA");

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
  };

  const PLdata = plfilter?.report;

  console.log(plfilter, "plfilter");

  useEffect(() => {
    dispatch(getPLfilterData({
      page,
      limit,
      startDate,
      endDate,
      eventName: eventName,
      gameName: gameName,
      marketName: marketName,
      userName: userName,
    }));
  }, [dispatch, page, limit, startDate, endDate]);



  return (
    <>
      <Navbar />
      <div className="w-full overflow-x-hidden">
        <div className="mt-4 overflow-auto max-w-[90rem] mx-auto text-[13px]">

          <div className="flex justify-end items-center gap-0.5 text-sm mb-1">
            <div className="p-1 border bg-[#72bbef]">back</div>
            <div className="p-1 border bg-[#faa9ba]">lay</div>
            <div className="p-1 border bg-[#ffffff]">void</div>
          </div>
          <div className="bg-color text-white px-4 py-2 font-semibold w-full">Bet History</div>
          <div className="font-semibold overflow-auto">
            {/* <div className="bg-gray-200 text-black px-4 py-2 font-semibold w-full flex justify-between">
            <span>{selectedSport} - Events</span>
            <button
              onClick={() => setSelectedSport(null)}
              className="text-sm text-red-500 underline"
            >
              Back to Sports
            </button>
          </div> */}

            {loading && (
              <div className="mt-4 p-4 text-center">
                <p>Loading data...</p>
              </div>
            )}
            {!loading && (
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-[#e0e6e6]">
                    <th className="border border-gray-400 px-4 py-2 text-center">Sports Name</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Event Name</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Market Name</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Runner Name</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Bet Type</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">User price</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Amount</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Profit/Loss</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Place Date</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Match Date</th>
                  </tr>
                </thead>
                <tbody>
                  {PLdata?.map((event, i) => (
                    <tr key={i} className={`font-[400] text-[13px] ${event.otype === "back" ? "bg-[#72bbef]" : "bg-[#faa9ba]"}`}>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {event.gameName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2text-center">
                        <span >{event.eventName}</span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center "> <span> {event.marketName}</span></td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{event.teamName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">{event.otype}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">{event.xValue != null ? Number(event.xValue).toFixed(2) : "0.00"}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">{event.price}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">
                        <span>{event.price}</span>
                        <span className={`ml-2 ${event.status === 2 ? "text-red-500" : "text-green-800"}`}>

                          ({event.resultAmount})
                        </span>

                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">
                        {new Date(event.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center ">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default UserBetHistory;
