import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingBetAmo, fetchSoccerBatingData, fetchCricketBatingData, getBetPerents, masterBookReducer, masterBookReducerDownline } from "../redux/reducer/marketAnalyzeReducer";
import Spinner2 from "../components/Spinner2";
import SoccerOdds from "./SoccerComponents/SoccerOdds";
import SoccerOver15 from "./SoccerComponents/SoccerOver15";
import SoccerOver5 from "./SoccerComponents/SoccerOver_5";
import SoccerOver25 from "./SoccerComponents/SoccerOver25";
import { useNavigate, useParams } from "react-router-dom";
import { host } from "../redux/api";
import axios from "axios";
import Navbar from "../components/Navbar";
import LiveVideo from "./LiveVideo";
import MarketSidebar from "../components/MarketSidebar";
import { getAdmin } from "../redux/reducer/authReducer";
import scorecardimg from "../assets/scorecard-bg.png"
import { motion, AnimatePresence } from "framer-motion";
import LiveScoreSocket from "./LiveScoreSocket";

export default function Soccerbet() {
  const [bettingData, setBettingData] = useState(null);
  // const location = useLocation();
  const dispatch = useDispatch();
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const hasCheckedRef = useRef(false);
  const navigate = useNavigate()

  const [url, setUrl] = useState("");
  const [scoreUrl, setScoreUrl] = useState(false);
  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);


  const { userInfo } = useSelector((state) => state.auth);


  // ✅ WebSocket Setup (Real-time updates)




  const { loading, battingData, pendingBet, betsData, betPerantsData, masterData, masterDataDownline } = useSelector((state) => state.market);


  let sharedSocket;

  useEffect(() => {
    if (!gameid) return;

    if (!sharedSocket || sharedSocket.readyState !== 1) {
      sharedSocket = new WebSocket(host);

      sharedSocket.onopen = () => {
        console.log("✅ Socket connected");
        sharedSocket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "soccer" }));
      };

      sharedSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.gameid === gameid) {
            setBettingData(message.data);
          }
        } catch (e) {
          console.error("❌ Message error", e);
        }
      };

      sharedSocket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      sharedSocket.onclose = () => {
        console.log("Socket closed");
      };
    } else {
      // Already connected, just send subscription
      sharedSocket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "soccer" }));
    }

    return () => {
      // Optionally leave socket open for reuse
    };
  }, [gameid]);

  useEffect(() => {
    // let intervalId;

    if (gameid) {
      dispatch(fetchSoccerBatingData(gameid)); // initial
    }
  }, [dispatch, gameid]);




  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);



  const matchOddsList = bettingData?.filter(
    (item) => item.mname === "MATCH_ODDS"
  ) || [];

  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "Match Odds"
    )
    : [];


  const matcUnder5List = bettingData?.filter(
    (item) => item.mname === "OVER_UNDER_05"
  ) || [];


  const matcUnder5 = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "OVER_UNDER_05"
    )
    : [];

  const matcUnder15List = bettingData?.filter(
    (item) => item.mname === "OVER_UNDER_15"
  ) || [];

  const matcUnder15 = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "OVER_UNDER_15"
    )
    : [];


  const matcUnder25List = bettingData?.filter(
    (item) => item.mname === "OVER_UNDER_25"
  ) || [];

  const matcUnder25 = Array.isArray(betsData)
    ? betsData.filter(
      (item) =>
        item?.gameType === "OVER_UNDER_25"
    )
    : [];






  useEffect(() => {

    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);






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
        `https://api.cricketid.xyz/tv_url?key=uniique5557878&gmid=${gameid}&sid=1`
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



  // Inside your React functional component (e.g., in a file like MyComponent.jsx)

  return (
    <div className="relative">
      <Navbar />

      {loading ? (
        <div className="text-center py-4">
          <Spinner2 />
        </div>
      ) : (
          <div className="w-full flex flex-col md:flex-row md:p-5 p-1">
            <div className="md:w-[60%] sm:w-full">
            <div className="mx-auto text-[13px]">
              {/* odds match data */}
              <SoccerOdds
                matchOddsList={matchOddsList}
                gameid={gameid}
                match={match}
              />

              <SoccerOver5
                matcUnder5List={matcUnder5List}
                gameid={gameid}
                match={match}
              />
              {/* matcUnder15 match data */}
              <SoccerOver15
                matcUnder15List={matcUnder15List}
                gameid={gameid}
                match={match}
              />

              {/* matcUnder15 match data */}
              <SoccerOver25
                matcUnder25List={matcUnder25List}
                gameid={gameid}
                match={match}
              />
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
                          {matcUnder5?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", matcUnder5[0]?.gameType, matcUnder5List)}>

                              {matcUnder5[0]?.gameType}
                            </h2>
                          )}
                          {matcUnder15?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", matcUnder15[0]?.gameType, matcUnder15List)}>
                              {matcUnder15[0]?.gameType}
                            </h2>
                          )}
                          {matcUnder25?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hemdelMasterBook("", matcUnder25[0]?.gameType, matcUnder25List)}>
                              {matcUnder25[0]?.gameType}
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
                          {matcUnder5?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(matcUnder5[0]?.gameType, userInfo.code, matcUnder5List)}>

                              {matcUnder5[0]?.gameType}
                            </h2>
                          )}
                          {matcUnder15?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(matcUnder15[0]?.gameType, userInfo.code, matcUnder15List)}>
                              {matcUnder15[0]?.gameType}
                            </h2>
                          )}
                          {matcUnder25?.length > 0 && (
                            <h2 className='p-2 hover:bg-gray-200 text-sm cursor-pointer border-b border-gray-300' onClick={() => hendalUserBetsData(matcUnder25[0]?.gameType, userInfo.code, matcUnder25List)}>
                              {matcUnder25[0]?.gameType}
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
  );
}
