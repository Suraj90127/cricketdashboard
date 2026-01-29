import { useEffect, useState, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getPendingBetAmo, fetchCricketBatingData, getBetPerents, masterBookReducer, masterBookReducerDownline } from "../redux/reducer/marketAnalyzeReducer";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { BiInfoCircle } from "react-icons/bi";
import Spinner2 from "../components/Spinner2";
import MatchOdd from "./CircketComponent/MatchOdd";
import TiedMatch from "./CircketComponent/TiedMatch";
import BookMaker from "./CircketComponent/BookMaker";
import { host } from "../redux/api";
import Navbar from "../components/Navbar";
import axios from "axios";
import LiveVideo from "./LiveVideo";
import LiveScoreSocket from "./LiveScoreSocket";
import { getAdmin } from "../redux/reducer/authReducer";





// import { getPendingBetAmo } from "../redux/reducer/betReducer";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000"); // Replace with your backend URL

const oddsDataraw = [
  {
    title: "KKR 14 Over Total Runs (Odds / Evens)",
    options: [
      { label: "ODD", value: "1.95", stake: "1M" },
      { label: "EVEN", value: "1.95", stake: "1M" },
    ],
  },
  {
    title: "KKR 15 Over Total Runs (Odds / Evens)",
    options: [
      { label: "ODD", value: "1.95", stake: "1M" },
      { label: "EVEN", value: "1.95", stake: "1M" },
    ],
  },
];

const dismissalData = [
  { method: "Caught", odds: "1.3" },
  { method: "Bowled", odds: "4" },
  { method: "LBW", odds: "5" },
  { method: "Run Out", odds: "15" },
  { method: "Stumped", odds: "20" },
  { method: "Others", odds: "100" },
];

export default function Cricketbet() {
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const hasCheckedRef = useRef(false); // ✅ run only once
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const { userInfo } = useSelector((state) => state.auth);


  // ✅ WebSocket Setup (Real-time updates)
  const [bettingData, setBettingData] = useState(null);


  const [loader, setLoader] = useState(false);

  const { battingData } = useSelector((state) => state.market);

  const { loading, pendingBet, betsData, betPerantsData, masterData, masterDataDownline } = useSelector((state) => state.market);

  // console.log("/get/market-bet-perents", betPerantsData)

  // console.log("betsData", betsData)


  const [activeTab, setActiveTab] = useState("fancy");
  const [activeSubTab, setActiveSubTab] = useState("Normal");
  const [scoreUrl, setScoreUrl] = useState(false);
  const [url, setUrl] = useState("");
  // console.log("url", url)
  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);
  const [tossTeam1, setTossTeam1] = useState()
  const [tossTeam2, setTossTeam2] = useState()

  // console.log("mmmmmmmmmmmmmmmm", selectData)

  const subTabs = [
    { id: "Normal", name: "ALL" },
    { id: "Normal", name: "Fancy" },
    { id: "line", name: "Line Markets" },
    { id: "ball", name: "Ball by Ball" },
    { id: "meter", name: "Meter Markets" },
    { id: "khado", name: "Khado Markets" },
  ];


  // ✅ Fetch once before using socket (optional)
  useEffect(() => {
    if (gameid) {
      setLoader(true);
      dispatch(fetchCricketBatingData(gameid)).finally(() => {
        setLoader(false);
      });
    }
  }, [dispatch, gameid]);



  useEffect(() => {
    if (!gameid) return;

    const socket = new WebSocket(host);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "cricket" }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.gameid === gameid) {
          setBettingData(message.data);
        }
      } catch (err) {
        console.error("❌ Error parsing message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => socket.close();
  }, [gameid]);


  useEffect(() => {
    let intervalId;

    if (gameid) {
      // Set loader true before initial fetch
      setLoader(true);

      const fetchData = async () => {
        await dispatch(fetchCricketBatingData(gameid));
        setLoader(false);
      };

      fetchData();


    }


    return () => {
      clearInterval(intervalId);
    };
  }, [gameid]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);







  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
      (item) =>
        item?.mname === "MATCH_ODDS" || item?.mname === "TOURNAMENT_WINNER"
    )
    : [];

  // console.log("matchOddsList", matchOddsList)



  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "Match Odds" || item?.gameType === "Winner"
    )
    : [];




  const tiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter(
      (item) =>
        item?.mname === "Tied Match" || item?.mname === "Bookmaker IPL CUP"
    )
    : [];
  const tiedMatch = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "Bookmaker IPL CUP" || item?.gameType === "Tied Match"
    )
    : [];


  const BookmakerList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === "Bookmaker")
    : [];

  const Bookmaker = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === "Bookmaker")
    : [];


  const Toss = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === "Toss")
    : [];


  const first6over = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === "1st 6 over")
    : [];

  // console.log("Toss", Toss)

  const fancy1List = bettingData?.filter((item) => item.mname === "fancy1");

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
      ? fancy1List[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: fancy1List[0].mname, // ✅ Access from first item
        status: fancy1List[0].status, // ✅ Access from first item
      }))
      : [];

  const over6List = bettingData?.filter((item) => item.mname === "Normal");
  const over6Data =
    Array.isArray(over6List) && over6List.length > 0 && over6List[0].section
      ? over6List[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: over6List[0].mname, // ✅ Access from first item
        status: sec.gstatus, // ✅ Access from first item
      }))
      : [];

  const fancy2List = bettingData?.filter((item) => item.mname === activeSubTab);
  const fancy2Data =
    Array.isArray(fancy2List) && fancy2List.length > 0 && fancy2List[0].section
      ? fancy2List[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: fancy2List[0].mname, // ✅ Access from first item
        status: sec.gstatus, // ✅ Access from first item
      }))
      : [];




  // console.log("fancy2Data", fancy2Data);

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);





  // console.log("userBet", userBet)



  useEffect(() => {
    document.body.style.overflow = masterpopup ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [masterpopup]);



  const hendalUserBetsData = (gameType, code, matchOddsList) => {
    const userBet = Array.isArray(betsData)
      ? betsData.filter(
        (item) =>
          item?.gameType === gameType || item?.gameType === code
      )
      : [];

    // Extract teams from matchOddsList
    const teams = Array.isArray(matchOddsList[0]?.section)
      ? matchOddsList[0].section.map((sec) => sec.nat)
      : [];
    setTeamHeaders(teams); // Set teams to render in table header


    // console.log("userbetas", userBet)
    setUserBet(userBet)

  }


  const hemdelMasterBook = async (userId, gameType, matchOddsList) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);

      // Use stored values if not passed (for downline use)
      const finalGameType = gameType || storedGameType;
      const finalMatchOddsList = matchOddsList?.length ? matchOddsList : storedMatchOddsList;

      // Save for future
      if (gameType && matchOddsList) {
        setStoredGameType(gameType);
        setStoredMatchOddsList(matchOddsList);
      }

      // Dispatch reset action if needed
      dispatch({ type: "RESET_MASTER_BOOK" });

      // Fetch new data
      await dispatch(masterBookReducer({ userId, gameid, gameType: finalGameType }));

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };



  const hemdelMasterBookDownline = async (userId) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);

      const finalGameType = storedGameType;
      const finalMatchOddsList = storedMatchOddsList;

      // Dispatch new downline request
      await dispatch(masterBookReducerDownline({ userId, gameid, gameType: finalGameType }));

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  const tossTeamamo = (gameType, team1, team2) => {


    const team1Data = Array.isArray(betsData)
      ? betsData.filter(
        (item) =>
          item?.gameType === gameType || item?.teamName === team1
      )
      : [];

    console.log("team1Data", team1Data)
  }

  // tossTeamamo()




  useEffect(() => {
    if (masterData?.length > 0) {
      setMasterDownline(masterData); // ⬅️ For first-level data
    }
  }, [masterData]);

  useEffect(() => {
    if (masterDataDownline?.length > 0) {
      setMasterDownline(masterDataDownline); // ⬅️ For downline drill
    }
  }, [masterDataDownline]);

  const videoS = async () => {
    if (url) {
      setUrl("");
      return;
    }
    try {
      const response = await axios.get(
        `https://api.cricketid.xyz/tv_url?key=uniique5557878&gmid=${gameid}&sid=4`
      );
      const data = response?.data;
      // console.log("API response:", data);
      setUrl(data?.tv_url); // make sure the field is `tv_url`
    } catch (error) {
      console.error("Video API Error:", error?.response?.data || error.message);
    }
  };

  const [popup, setPopup] = useState(false);
  const handelpopup = async (id) => {
    setPopup(true);
    await dispatch(getBetPerents(id));
    // console.log("idddd", id);
  };


  // Inside your React functional component (e.g., in a file like MyComponent.jsx)


  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  const pratnerShip = (role, amount, part) => {
    if (role === "user") {
      return amount
    } else {
      return Math.floor(amount * ((100 - part) / 100))
    }
  }



  return (
    <div className="relative">
      <Navbar />
      <div className=" w-full">

        {loader ? (
          <div className="text-center py-4 fixed top-52 left-[40%]">
            <Spinner2 />
          </div>
        ) : (
          <div className="w-full flex flex-col md:flex-row md:p-5 p-1">

            <div className="md:w-[60%] sm:w-full">


              <div className="z-0">

                {/* odds match data */}

                <MatchOdd matchOddsList={matchOddsList} gameid={gameid} match={match} />
                {/* tied match data */}
                {/* tied match data */}
                <TiedMatch tiedMatchList={tiedMatchList} gameid={gameid} match={match} />
                {/* bookmaker match data */}
                <BookMaker BookmakerList={BookmakerList} gameid={gameid} match={match} />

                {/* toss winn loass */}
                <div className="mt-2">
                  {fancy1Data.length > 0 &&
                    fancy1Data[0]?.team?.split("(")[0]?.includes("Toss") && (
                      <div>
                        <div className="mx-auto text-[13px] bg-gray-200">
                          <div className="flex justify-between items-center rounded-t-md bg-white">
                            <div className="font-bold bg-blue p-2 px-4 rounded-tr-3xl text-white flex gap-3">
                              <span>Which Team Will Win The Toss </span>

                              <span className="mt-1 text-lg font-black">
                                <HiOutlineExclamationCircle />
                              </span>
                            </div>
                            <div className="font-bold">
                              {fancy1Data[0].min} - {formatToK(fancy1Data[0]?.max)}
                            </div>
                          </div>

                          {fancy1Data[0]?.status === "SUSPENDED" ? (
                            <div className="border-2 border-red-500 relative mx-auto">
                              <div className="absolute flex items-center justify-centerz-10 bg-[#e1e1e17e] h-full w-full">
                                <p className="text-red-700 absolute left-1/2 transform -translate-x-1/2  font-bold text-3xl ">
                                  SUSPENDED
                                </p>
                              </div>
                              <div className=" bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]">
                                <div className="flex justify-around p-3">
                                  <div className="text-center">
                                    <p className="font-semibold">
                                      {" "}
                                      {fancy1Data[0]?.team?.split("(")[0]}
                                    </p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        {fancy1Data[0]?.odds[0].odds}
                                      </span>
                                      <span className="text-[10px] ">
                                        {" "}
                                        {fancy1Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">
                                      {fancy1Data[1]?.team?.split("(")[0]}
                                    </p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        1.5
                                      </span>
                                      <span className="text-[10px] ">3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className=" bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]">
                              <div className="flex justify-around p-3">
                                <div


                                  className="text-center"
                                >
                                  <p className="font-semibold text-xs">
                                    {" "}
                                    {fancy1Data[0]?.team?.split("(")[0]}
                                  </p>
                                  <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                    <span className="text-[13px] font-semibold">
                                      {fancy1Data[0]?.odds[0].odds}
                                    </span>
                                    <span className="text-[10px] ">
                                      {" "}
                                      {fancy1Data[0]?.odds[0].size}
                                    </span>
                                  </span>
                                  <span>{tossTeamamo("Toss", fancy1Data[0]?.team?.split("(")[0])}</span>
                                </div>
                                <div

                                  className="text-center"
                                >
                                  <p className=" text-xs md:text-[11px] font-bold">
                                    {" "}
                                    {fancy1Data[1]?.team?.split("(")[0]}
                                  </p>
                                  <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                    <span className="text-[13px] font-semibold">
                                      {fancy1Data[1]?.odds[0].odds}
                                    </span>
                                    <span className="text-[10px] ">
                                      {" "}
                                      {fancy1Data[1]?.odds[0].size}
                                    </span>
                                  </span>
                                  <span>0.00</span>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                {/* 1st 6 over matches */}
                <div className="mt-2">
                  {over6Data.length > 0 &&
                    over6Data[0]?.team?.split("(")[0]?.includes("6 over") && (
                      <div>
                        <div className="mx-auto text-[13px] bg-gray-200">
                          <div className="flex justify-between items-center rounded-t-md bg-white">
                            <div className="font-bold bg-blue p-2 px-4 rounded-tr-3xl text-white flex gap-3">
                              <span>Highest Score In 1st 6 Over </span>

                              <span className="mt-1 text-lg font-black">
                                <HiOutlineExclamationCircle />
                              </span>
                            </div>
                            <div className="font-bold">
                              {over6Data[0].min} - {formatToK(over6Data[0]?.max)}
                            </div>
                          </div>

                          {over6Data[0]?.status === "SUSPENDED" ? (
                            <div className="border-2 border-red-500 relative mx-auto">
                              <div className="absolute flex items-center justify-centerz-10 bg-[#e1e1e17e] h-full w-full">
                                <p className="text-red-700 absolute left-1/2 transform -translate-x-1/2  font-bold text-3xl ">
                                  SUSPENDED
                                </p>
                              </div>
                              <div className=" bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]">
                                <div className="flex justify-around p-3">
                                  <div className="text-center">
                                    <p className="font-semibold">
                                      {" "}
                                      {over6Data[0]?.team?.split("(")[0]}
                                    </p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        {over6Data[0]?.odds[0].odds}
                                      </span>
                                      <span className="text-[10px] ">
                                        {" "}
                                        {over6Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">Kolkata</p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        1.5
                                      </span>
                                      <span className="text-[10px] ">3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className=" bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]">
                              <div className="flex justify-around p-3">
                                <div

                                  className="text-center"
                                >
                                  <p className="font-semibold">
                                    {" "}
                                    {over6Data[0]?.team?.split("(")[0]}

                                  </p>
                                  <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                    <span className="text-[13px] font-semibold">
                                      {over6Data[0]?.odds[0].odds}
                                    </span>
                                    <span className="text-[10px] ">
                                      {" "}
                                      {over6Data[0]?.odds[0].size}
                                    </span>
                                  </span>
                                </div>
                                <div

                                  className="text-center"
                                >
                                  <p className="font-semibold">
                                    {" "}
                                    {over6Data[1]?.team?.split("(")[0]}
                                  </p>
                                  <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                    <span className="text-[13px] font-semibold">
                                      {over6Data[1]?.odds[0].odds}
                                    </span>
                                    <span className="text-[10px] ">
                                      {" "}
                                      {over6Data[1]?.odds[0].size}
                                    </span>
                                  </span>
                                  {/* <span>0.00</span> */}
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                {/*fancy  */}

                <main className="h-full bg-gray-100 mt-2">
                  <div className="w-full mx-auto bg-white rounded-md overflow-hidden">
                    <div className="flex gap-1 text-xs md:text-sm">
                      <button
                        className={`flex items-center px-4 py-2 rounded-tl-2xl ${activeTab === "fancy"
                          ? "bg-color text-white"
                          : "bg-color text-white"
                          }`}
                        onClick={() => setActiveTab("fancy")}
                      >
                        <span className="font-bold">Fancy Bet</span>
                        <BiInfoCircle size={16} className="ml-2" />
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 rounded-tl-2xl ${activeTab === "sportsbook"
                          ? "bg-orange text-white"
                          : "bg-orange text-white"
                          }`}
                        onClick={() => setActiveTab("sportsbook")}
                      >
                        <span className="font-bold">Sportsbook</span>
                        <BiInfoCircle size={16} className="ml-2" />
                      </button>
                    </div>

                    {activeTab === "fancy" && (
                      <>
                        <div className="flex gap-1 overflow-x-auto whitespace-nowrap bg-color text-white justify-start py-1 px-2 scroll-smooth">
                          {subTabs.map((tab) => (
                            <button
                              key={tab.id}
                              className={`px-2 py-1 text-xs ${activeSubTab === tab.id
                                ? "bg-white text-black font-medium text-xs rounded-t-md"
                                : ""
                                }`}
                              onClick={() => setActiveSubTab(tab.id)}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>

                        <div className="overflow-x-auto">
                          <div className="w-full text-xs">
                            <div className="">
                              <div className="text-xs grid grid-cols-6 border-b border-gray-400">
                                <span className="text-left py-2 px-4 col-span-4 md:col-span-3"></span>
                                <span className="py-2 px-4 bg-[#72bbef]  text-center col-span-1">
                                  Yes
                                </span>
                                <span className="py-2 px-4 bg-[#faa9ba] text-center w-full col-span-1">
                                  No
                                </span>

                                <span className="py-2 px-4  text-center col-span-1 hidden md:block">
                                  Min/Max
                                </span>
                              </div>
                            </div>
                            <div>
                              {fancy2Data.length > 0 ? (
                                fancy2Data.map(
                                  ({ team, odds, sid, min, max, status }, index) => (
                                    <div key={index} className="w-full">
                                      <div className="grid grid-cols-6">
                                        <span className="py-1 px-2 border-b border-gray-400 col-span-4 md:col-span-2  text-sm md:text-[11px] font-bold">
                                          {team}
                                          <div className="flex items-center">

                                            <p className="text-green-500">
                                              {
                                                pendingBet
                                                  ?.filter(
                                                    (item) =>
                                                      item.gameType ===
                                                      activeSubTab &&
                                                      item.teamName?.toLowerCase() ===
                                                      team?.toLowerCase()
                                                  )
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum + (item.totalPrice || "0.00"),
                                                    ""
                                                  ) // Changed initial value to 0
                                              }
                                            </p>
                                          </div>
                                        </span>
                                        <span className="py-1 px-2 border-b border-gray-400 text-center hidden md:block">
                                          <button className="bg-gray-700 hover:bg-[#243a48] text-white px-4 py-1 rounded text-xs">
                                            Book
                                          </button>
                                        </span>
                                        {status === "SUSPENDED" ? (
                                          <div className="relative col-span-2 flex item-center">
                                            <div className="absolute flex items-center justify-centerz-10 bg-[#48484869] h-full w-full">
                                              <p className="text-white absolute left-1/2 transform -translate-x-1/2">
                                                SUSPENDED
                                              </p>
                                            </div>

                                            {odds.slice(0, 2).map((odd, i) => (
                                              <span

                                                key={i}
                                                className={`p-1 border-b text-center cursor-pointer  w-full ${i === 0
                                                  ? "bg-[#72bbef]"
                                                  : i === 1
                                                    ? "bg-[#faa9ba]"
                                                    : i === 2
                                                      ? "bg-[#72bbef]"
                                                      : i === 3
                                                        ? "bg-[#faa9ba]"
                                                        : i === 4
                                                          ? "bg-pink-200"
                                                          : "bg-pink-100"
                                                  }`}
                                              // onClick={() => {
                                              //   setSelectedRun(index);
                                              //   setCurrentOdd(odd);
                                              // }}
                                              >
                                                <div className="cursor-pointer">
                                                  <div className="font-bold">
                                                    {odd?.odds}
                                                  </div>
                                                  <div className="text-gray-800">
                                                    {odd?.size}
                                                  </div>
                                                </div>
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="col-span-2 flex item-center">
                                            {" "}
                                            {/* This was likely col-span-4 (2 back + 2 lay for the actual odds) */}
                                            {odds.map(
                                              (odd, i) =>
                                                // ONLY RENDER IF odd.tno IS 0
                                                odd?.tno === 0 && ( // <-- Added this conditional rendering
                                                  <span

                                                    key={i}
                                                    className={`p-1 border-b text-center cursor-pointer w-full ${odd?.otype === "back"
                                                      ? "bg-[#72bbef]"
                                                      : "bg-[#faa9ba]"
                                                      }`}
                                                  >
                                                    <div
                                                      className="cursor-pointer"

                                                    >
                                                      <div className="font-bold">
                                                        <span>{odd?.odds}</span>{" "}
                                                        {/* No need for tno === 0 check here, already filtered */}
                                                      </div>
                                                      <div className="text-gray-800">
                                                        {odd?.size}
                                                      </div>
                                                    </div>
                                                  </span>
                                                )
                                            )}
                                          </div>
                                        )}
                                        <span className="py-1 px-2 border-b border-gray-400 text-center font-semibold col-span-1 hidden md:block">
                                          {min} - {formatToK(max)}
                                        </span>
                                      </div>

                                    </div>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="py-4 text-center text-gray-500"
                                  >
                                    No betting options available for this category
                                  </td>
                                </tr>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "sportsbook" && (
                      <div className="mt-2 text-xs">
                        <div className=" space-y-3">
                          {/* Odds/Evens Sections */}
                          {oddsDataraw.map((item, idx) => (
                            <div key={idx} className="rounded overflow-hidden">
                              <div className="bg-orange text-white font-semibold px-4 py-2">
                                {item.title}
                              </div>
                              <div className=" bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]">
                                <div className="flex justify-around p-3">
                                  <div className="text-center">
                                    <p className="font-semibold">Kolkata</p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        1.5
                                      </span>
                                      <span className="text-[10px] ">3m</span>
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">Kolkata</p>
                                    <span className="flex flex-col justify-center items-center bg-[#72e3a0] border-[1px] border-white py-0.5 w-[100px]">
                                      <span className="text-[13px] font-semibold">
                                        1.5
                                      </span>
                                      <span className="text-[10px] ">3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 5th Wicket Dismissal Method */}
                          <div className="rounded overflow-hidden">
                            <div className="bg-orange text-white font-semibold px-4 py-2 text-xs">
                              KKR 5th Wicket Dismissal Method
                            </div>
                            <div className="divide-y divide-gray-200">
                              {dismissalData.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center px-4 py-1 transition border-b border-gray-500"
                                >
                                  <span className="font-medium">{item.method}</span>
                                  <span className="bg-green-300 p-1 font-semibold flex flex-col justify-center items-center w-[100px]">
                                    {item.odds}
                                    <span className="text-xs">100K</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </main>
              </div>

            </div>
            <div className="md:w-[40%] mt-5 md-mt-0 sm:w-full">
              <div>
                <div>
                  <div className="bg-dark text-white px-4 py-1 rounded-t-md font-semibold cursor-pointer" onClick={() => videoS()}>
                    Live Streaming
                  </div>
                  {url ? (
                    <LiveVideo url={url} />
                  ) : null}
                </div>
                <div className="mt-4">
                  <div className="bg-dark text-white px-4 py-1 rounded-t-md font-semibold cursor-pointer" onClick={() => setScoreUrl(!scoreUrl)}>
                    Score Card
                  </div>
                  {scoreUrl ? (
                    <LiveScoreSocket gameId={gameid} />
                    // <img className="h-[150px]" src={scorecardimg} alt="scorecardimg" />
                  ) : null}
                </div>
                <div className="mt-4 bg-white">
                  <div className="bg-dark text-white px-4 py-1 rounded-t-md font-semibold cursor-pointer">
                    Book
                  </div>
                  <div className='flex justify-between p-4 w-full'>
                    <button className='bg-dark text-white px-4 py-1 rounded-md font-semibold cursor-pointer w-[47%]' onClick={() => setMasterpopup(true)}>Master Book</button>
                    <button className='bg-dark text-white px-4 py-1 rounded-md font-semibold cursor-pointer w-[47%]' onClick={() => setUserMasterpopup(true)}>User Book</button>
                  </div>
                </div>
                <div className="mt-4 bg-white">
                  <div className="bg-dark text-white md:px-4 p-2 py-1 rounded-t-md  cursor-pointer w-full flex justify-between">

                    <div className='flex justify-between md:p-4 p-0 md:w-[60%] w-2/3'>
                      <div className="flex md:gap-5 gap-2">
                        <span className="mt-4 md:mt-1">Live Bet</span>
                        <div className="inline-flex items-center">
                          <label className="flex items-center cursor-pointer relative">
                            <input
                              type="checkbox"
                              className="peer bg-white h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                              id="uncheck"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setLiveBets(betsData); // ✅ If checked
                                } else {
                                  setLiveBets([]); // ❌ If unchecked
                                }
                              }}
                            />
                            <span className="absolute text-blue-500 bg-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth={1}>
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </label>
                        </div>


                      </div>
                      <div className='flex md:gap-5 gap-2'>

                        <span className="mt-4 md:mt-1">Partnership Book</span>
                        <div className="inline-flex items-center">
                          <label className="flex items-center cursor-pointer relative">
                            <input type="checkbox" className="peer bg-white h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" id="check" />
                            <span className="absolute text-blue-500 bg-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth={1}>
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </label>
                        </div>
                      </div>

                    </div>
                    <div className='p-4 md:w-[40%] w-1/3 text-end flex justify-end'>

                      View More

                    </div>
                  </div>

                  {liveBets.length > 0 ? (
                    <div className="w-full border-t border-gray-300 p-2">
                      <div className="grid grid-cols-10 text-[11px]  py-2 border-b border-gray-400 bg-white">
                        <div className="col-span-4">Market Name</div>
                        <div className="col-span-2">Odds</div>
                        <div className="col-span-2">Stake</div>
                        <div className="col-span-2">Username</div>
                      </div>

                      {liveBets.map((item, index) => (
                        <div key={index} className={`${item.otype === "back" ? "bg-[#b6defa] border-[#89c9f8]" : "bg-[#f8e8eb] border-[#f8e8eb]"} text-sm px-2 py-1 border  `}>
                          <div>

                            <p className="text-[10px] text-gray-600">
                              Time: {item.date}
                            </p>
                          </div>
                          <div className={`${item.otype === "back" ? " bg-[#beddf4]" : "bg-[#f8e8eb]"} text-sm grid grid-cols-10 gap-2 items-center`}>

                            <div className="col-span-4">

                              <div className="flex items-center gap-2">
                                <div className={`${item.otype === "back" ? "bg-[#79c0f4] " : "bg-[#faa9ba]"} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                                  {item.otype}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-gray-400">{item.teamName}</span>
                                  <span className="text-[11px] font-semibold">
                                    {item.gameType}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2  text-[11px]">

                              <div>{item.xValue}</div>

                            </div>
                            <div className="col-span-2  text-[11px]">

                              <div>{item.price}</div>
                            </div>
                            <div className="col-span-2  text-[11px]">

                              <div>
                                <div className="text-gray-700 cursor-pointer underline" onClick={() => handelpopup(item.userId)}>{item.userName}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center items-center py-8">
                      <h2>There are no any bet.</h2>
                    </div>
                  )}

                </div>

                {/* master list popup */}

                {masterpopup && (
                  <div className="modal-overlay fixed h-full top-10 left-[25%]">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="modal-content w-[95%] md:w-[50%] h-fit">

                      <div className="modal-header bg-color flex justify-between">
                        <span> Market List</span>
                        <span className='text-lg' onClick={() => setMasterpopup(false)}> X</span>
                      </div>
                      <div className="modal-body p-4">
                        <div className='border border-gray-300'>

                          {matchOdd?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", matchOdd[0]?.gameType, matchOddsList)}>

                              {matchOdd[0]?.gameType}
                            </h2>
                          )}
                          {tiedMatch?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", tiedMatch[0]?.gameType, tiedMatchList)}>

                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", Bookmaker[0]?.gameType, BookmakerList)}>
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", Toss[0]?.gameType, Toss)}>
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", first6over[0]?.gameType, first6over)}>
                              {/* {Toss[0]?.gameType} */}
                              Highest Score In 1st 6 Over

                            </h2>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* master Book popup */}
                {masterDownline?.length > 0 && (
                  <div className="modal-overlay1 fixed h-full top-10 left-[25%] z-[9999]">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="modal-content h-fit w-[95%] md:w-[30%] bg-white shadow-lg rounded-lg">
                      <div className="modal-header  bg-color flex justify-between p-3 border-b">
                        <span className="font-semibold">Master Book</span>
                        <span
                          className="text-2xl cursor-pointer"
                          onClick={() => setMasterDownline([])}
                        >
                          ×
                        </span>
                      </div>
                      <div className="modal-body p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200 text-center text-sm">
                                <th className="border p-2">Username</th>
                                <th className="border p-2">Role</th>
                                {teamHeaders.map((team, idx) => (
                                  <th key={idx} className="border p-2">{team}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {loading && (
                                <tr>
                                  <td colSpan={6} className="p-4 text-center">Loading...</td>
                                </tr>
                              )}

                              {!loading && masterDownline?.length > 0 ? (
                                masterDownline.map((item, index) => (
                                  <tr key={index} className="text-center text-sm hover:bg-gray-100">
                                    <td
                                      className="border p-2 text-blue-500 cursor-pointer"
                                      onClick={() => hemdelMasterBookDownline(item.id)}
                                    >
                                      {item.userName}
                                    </td>
                                    <td className="border p-2">{item.userRole}</td>
                                    {teamHeaders.map((team, i) => (
                                      <td key={i} className="border p-2">
                                        {item.otype === "back" ? (
                                          item.teamName === team ? (
                                            <span className="text-green-600">{pratnerShip(item.userRole, item.totalBetAmount, item.partnership)}</span>
                                          ) : (
                                            <span className="text-red-500">-{pratnerShip(item.userRole, item.totalPrice, item.partnership)}</span>
                                          )
                                        ) : (
                                          item.teamName === team ? (
                                            <span className="text-red-500">-{pratnerShip(item.userRole, item.totalPrice, item.partnership)}</span>
                                          ) : (
                                            <span className="text-green-600">{pratnerShip(item.userRole, item.totalBetAmount, item.partnership)}</span>
                                          )
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-4">No data available</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}


                {/* user master list popup */}

                {userMasterpopup && (
                  <div className="modal-overlay h-full fixed top-10 left-[25%]">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="modal-content h-fit w-[95%] md:w-[50%]">

                      <div className="modal-header  bg-color flex justify-between">
                        <span> Market List</span>
                        <span className='text-2xl' onClick={() => setUserMasterpopup(false)}> X</span>
                      </div>
                      <div className="modal-body p-4">
                        <div className='border border-gray-300'>

                          {matchOdd?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(matchOdd[0]?.gameType, userInfo.code, matchOddsList)}>

                              {matchOdd[0]?.gameType}
                            </h2>
                          )}
                          {tiedMatch?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(tiedMatch[0]?.gameType, userInfo.code, tiedMatchList)}>

                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(Bookmaker[0]?.gameType, userInfo.code, BookmakerList)}>
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(Toss[0]?.gameType, userInfo.code, Toss)}>
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(first6over[0]?.gameType, userInfo.code, first6over)}>
                              {/* {first6over[0]?.gameType} */}
                              Highest Score In 1st 6 Over

                            </h2>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* user Book popup */}
                {userBet?.length > 0 && (
                  <div className="modal-overlay1 h-full fixed top-10 left-[25%]">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="modal-content h-fit w-[95%] md:w-[30%]">
                      <div className="modal-header  bg-color flex justify-between">
                        <span> Master Book</span>
                        <span className='text-2xl' onClick={() => setUserBet(null)}> X</span>
                      </div>
                      <div className="modal-body p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200 text-center">
                                <th className="border border-gray-300 p-2 text-left">
                                  <div className="flex items-center justify-center text-[13px]">
                                    Username

                                  </div>
                                </th>
                                <th className="border border-gray-300 p-2 text-left">
                                  <div className="flex items-center justify-center text-[13px]">
                                    Role

                                  </div>
                                </th>
                                {teamHeaders.map((team, index) => (
                                  <th
                                    key={index}
                                    className="border border-gray-300 p-2 text-left"
                                  >
                                    <div className="flex items-center justify-center text-[13px]">
                                      {team}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {loading && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="border border-gray-300 p-4 text-center"
                                  >
                                    Loading...
                                  </td>
                                </tr>
                              )}
                              {!loading && userBet?.length > 0 ? (
                                userBet.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-100 text-center text-sm font-semibold">
                                    <td className="border border-gray-300 p-2 text-[#2789ce] cursor-pointer">
                                      {item.userName}
                                    </td>

                                    <td className="border border-gray-300 p-2">
                                      {item.userRole}
                                    </td>

                                    {/* Loop through team headers for dynamic columns */}
                                    {teamHeaders.map((team, i) => (
                                      <td key={i} className="border border-gray-300 p-2">
                                        {item.otype === "back" ? (
                                          <div>
                                            {item.teamName === team ? (
                                              <span className="text-green-500">{item.betAmount || 0}</span>
                                            ) : (
                                              <span className="text-red-500">-{item.price || 0}</span>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            {item.teamName === team ? (
                                              <span className="text-red-500">-{item.price || 0}</span>
                                            ) : (
                                              <span className="text-green-500">{item.betAmount || 0}</span>
                                            )}
                                          </div>
                                        )}

                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="border border-gray-300 p-4 text-center">
                                    No data available in table
                                  </td>
                                </tr>
                              )}


                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

              </div>


              {/* user bet presents popup */}

            </div>
            <div>
              {popup && (
                <div className="fixed inset-0 flex items-start justify-center bg-[#0000005d] bg-opacity-50 z-[100]">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white  mt-1 w-94 md:w-150 rounded-lg shadow-lg"
                  >
                    {/* Header */}
                    <div className="bg-color text-white font-bold px-4 py-1.5 flex justify-between">
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
        )}
      </div>

    </div >
  );
}
