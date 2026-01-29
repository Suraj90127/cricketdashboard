import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getDownLinefilterData } from "../redux/reducer/downlineReducer";
// import Spinner2 from "../../../client/src/components/Spinner2";
import Spinner2 from "../components/Spinner2";
const UserProfitLossByEvent = () => {



    const { gameName } = useParams();
    const { id } = useParams();
    console.log("new id", id)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const { plfilter, loading } = useSelector((state) => state.downline);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [pastdate, setPastDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const formatDate = (date) => date.toISOString();
    const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
    const [endDate, setEndDate] = useState(formatDate(currentDate));
    const [activeTab, setActiveTab] = useState("PL");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState("LIVE DATA");

    const { dlfilter, loading, betHistory } = useSelector((state) => state.downline);

    // console.log("dlfilter2222", dlfilter)
    const PLdata = dlfilter?.reports;
    // console.log("PLdata", PLdata)

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

    // const PLdata = plfilter?.report;

    // console.log(plfilter, "plfilter");

    const handelnavigate = (item) => {


        navigate(`/online-user/${id}`, { state: { mystate: item } });

    }



    useEffect(() => {
        if(startDate && endDate && id)
        dispatch(getDownLinefilterData({
            page,
            limit,
            startDate,
            endDate,
            gameName,
            eventName: "",
            marketName: "",
            userName: id,
            targetUserId: id,
        }));
    }, [dispatch, page, limit, startDate, endDate,id]);
    



    return (
        <div>
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

                                onClick={() => handelnavigate("profile")}
                            >
                                My Profile
                            </button>
                            <button
                                className={`w-full text-left px-2 py-1 text-sm border-b border-gray-300 ${activeTab === "BH"
                                    ? "bg-blue-100"
                                    : "bg-white hover:bg-gray-100"
                                    }`}

                                onClick={() => handelnavigate("BH")}
                            >
                                Bet History
                            </button>
                            <button
                                className={`w-full text-left px-2 py-1 text-sm border-b border-gray-300 ${activeTab === "PL"
                                    ? "bg-blue-100"
                                    : "bg-white hover:bg-gray-100"
                                    }`}
                                onClick={() => handelnavigate("PL")}
                            >
                                Profit & Loss
                            </button>
                            <button
                                className={`w-full text-left px-2 py-1 text-sm border-b border-gray-300 ${activeTab === "statement"
                                    ? "bg-blue-100"
                                    : "bg-white hover:bg-gray-100"
                                    }`}
                                onClick={() => handelnavigate("statement")}
                            >
                                Account Statement
                            </button>
                            <button
                                className={`w-full text-left px-2 py-1 text-sm ${activeTab === "activity"
                                    ? "bg-blue-100"
                                    : "bg-white hover:bg-gray-100"
                                    }`}

                                onClick={() => handelnavigate("activity")}
                            >
                                Activity Log
                            </button>
                        </div>
                    </div>

                    {/* Statement Table */}
                    <div className="flex-1 bg-white p-4 rounded-lg">

                        <div className="border border-gray-300 bg-white  text-[15px]">
                            <div className="bg-dark text-white py-1 px-3">
                                <h2 className="font-bold text-base">Profit & Loss Events</h2>
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
                                                <th className="border border-gray-300 p-2 text-center">
                                                    <div className="flex items-center justify-center text-[13px]">
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
                                                <th className="border border-gray-300 p-2 text-center">
                                                    <div className="flex items-center justify-center text-[13px]">
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
                                                <th className="border border-gray-300 p-2 text-center">
                                                    <div className="flex items-center justify-center text-[13px]">
                                                        Profit & Loss
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

                                                <th className="border border-gray-300 p-2 text-center">
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
                                                <th className="border border-gray-300 p-2 text-center">
                                                    <div className="flex items-center justify-center text-[13px]">
                                                        Total P&L

                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading && (
                                                <tr>
                                                    <td colSpan={6} className="border border-gray-300 p-4 text-center">
                                                        <div className="text-center py-4 fixed top-52 left-[40%]">
                                                            <Spinner2 />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!loading && PLdata?.length > 0 ? (
                                                PLdata.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-100 text-center text-sm font-semibold">
                                                        <td className="border border-gray-300 p-2 font-[400]">
                                                            {item.gameName}
                                                        </td>
                                                        <td className="border border-gray-300 p-2 text-[#2789ce] cursor-pointer" onClick={() => navigate(`/userplbymarket/${item.name}/${id}`, { state: { gameName: item.gameName, eventName: item.eventName } })}>
                                                            {item.name}
                                                        </td>
                                                        <td className={`border border-gray-300 p-2 ${item.myProfit > 0 ? "text-green-500" : "text-red-500"}`}>
                                                            {Math.abs(item.myProfit)}
                                                        </td>

                                                        <td className="border border-gray-300 p-2">
                                                            0
                                                        </td>
                                                        <td className={`border border-gray-300 p-2 ${item.myProfit > 0 ? "text-green-500" : "text-red-500"}`}>
                                                            {Math.abs(item.myProfit)}
                                                        </td>
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
                </div>
            </div>
        </div>
    )
}

export default UserProfitLossByEvent
