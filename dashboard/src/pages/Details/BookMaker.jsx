import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBet, getPendingBetAmo, messageClear } from '../../redux/reducer/betReducer';
import { toast } from 'react-toastify';
import { getUser } from '../../redux/reducer/authReducer';

import { HiOutlineExclamationCircle } from 'react-icons/hi2';

const BookMaker = ({ gameid, match }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { battingData } = useSelector((state) => state.cricket);
  // console.log("battingData", battingData);

  const { userInfo } = useSelector((state) => state.auth);
  const { pendingBet } = useSelector((state) => state.bet);


  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);

  const [seletTeamName, setSeletTeamName] = useState("");

  const [formData, setFormData] = useState({
    gameId: gameid,
    sid: "",
    otype: "",
    price: null,
    xValue: "",
    gameType: "",
    gameName: "Cricket Game",
    teamName: "",
  });


  // useEffect(() => {
  //   let intervalId;

  //   if (gameid) {
  //     // Set loader true before initial fetch
  //     setLoader(true);

  //     const fetchData = async () => {
  //       await dispatch(fetchCricketBatingData(gameid));
  //       setLoader(false); // Stop loader after first successful fetch
  //     };

  //     fetchData();

  //     intervalId = setInterval(() => {
  //       dispatch(fetchCricketBatingData(gameid));
  //     }, 2000);
  //   }

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [gameid]);
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const setValue = (xValue, team, sid, otype, fancyScore) => {
    setBetOdds(xValue);
    // console.log("xValue,team,sid,otype", xValue, team, sid, otype);
    setSeletTeamName(team);

    setFormData((prev) => ({
      ...prev,
      xValue: xValue,
      teamName: team,
      sid: sid,
      otype: otype,
      fancyScore,
    }));
  };

  const placeBet = async (gameType, marketName, maxAmo) => {

    // console.log("maxAmo", maxAmo);

    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }
    const updatedFormData = {
      ...formData,
      price: betAmount,
      gameType,
      marketName,
      eventName: match,
    };
    setFormData(updatedFormData);

    await dispatch(createBet(updatedFormData)); // Wait for bet to process
    await dispatch(getUser()); // Then fetch updated user data
    dispatch(getPendingBetAmo(gameid));
    setSelectedRun({ type: null, index: null });
  };



  //   useEffect(() => {
  //     if (successMessage) {
  //       toast.success(successMessage);
  //       setSelectedRun(null);
  //       dispatch(messageClear());
  //     }

  //     if (errorMessage) {
  //       toast.error(errorMessage);
  //       dispatch(messageClear());
  //     }
  //   }, [successMessage, errorMessage, dispatch]);

  // console.log("matchOddsList", battingData);

  // 0 idex data/ Match odds data
  const BookmakerList = battingData.filter(
    (item) => item.mname === "Bookmaker"
  );
  // console.log("BookmakerList", BookmakerList);
  const bookmakerData =
    Array.isArray(BookmakerList) &&
      BookmakerList.length > 0 &&
      BookmakerList[0].section
      ? BookmakerList[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: "Bookmaker", // ✅ Access from first item
        status: sec.gstatus, // ✅ Access from first item
      }))
      : [];


  // console.log("fancy2Data", fancy2Data);

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);
  // const bets = eventName.filter((bet) => bet.eventName === event);
  // console.log( "events", eventName)



  // Helper function
  const getBetDetails = (pendingBet, matchData, team) => {
    // Always find the bet for the current match and current team
    const matchedTeamBet = pendingBet?.find(
      (item) =>
        item.gameType === matchData?.mname &&
        item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    // Also find *any* other bet on the same match (for fallback price)
    const otherTeamBet = pendingBet?.find(
      (item) => item.gameType === matchData?.mname
    );

    // console.log(matchedTeamBet, 'bet amount')
    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || "";
    const totalBetAmount = matchedTeamBet?.totalBetAmount || otherTeamBet?.totalBetAmount || "";
    const totalPrice = matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || "";
    const teamName = matchedTeamBet?.teamName || otherTeamBet?.teamName || "";


    return {
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  const [selectedRun, setSelectedRun] = useState({ type: null, index: null });

  const [betOddsValue, setBetOddsValue] = useState(0);
  const [betOddsType, setBetOddsType] = useState("");



  const handleSelect = (type, index, odds, back) => {
    setSelectedRun({ type, index });
    setBetAmount(0);
    setBetOddsValue(odds);
    setBetOddsType(back)
  };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  function MyComponent({ team, matchData, pendingBet, myAmount, index, selectedRun }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      matchData,
      team
    );

    console.log("seletTeamName", seletTeamName)
    console.log("teamName", teamName)

    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();

    // console.log("isMatchedTeam", isMatchedTeam)


    const existingBet = (otype && totalBetAmount || totalPrice && teamName && isMatchedTeam ? true : false);


    let betColor =
      otype === "lay" ? (isMatchedTeam ? "red" : "green") :
        otype === "back" ? (isMatchedTeam ? "green" : "red") :
          "green";

    // const valueColor =
    //   betOddsType === "lay"
    //     ? "green" : "red";

    // const elseColor = betOddsType !== "lay" ? "green" : "red";



    const displayValue = (() => {
      if (otype === "lay") {
        return isMatchedTeam ? totalPrice : totalBetAmount;
      } else if (otype === "back") {
        return isMatchedTeam ? totalBetAmount : totalPrice;
      } else {
        return isMatchedTeam ? totalPrice : totalBetAmount;
      }
    })();

    const isSelected =
      selectedRun?.type === "odd" &&
      selectedRun?.index === index;
    const isSelectedTeam =
      selectedRun?.type === "odd";

    let p = parseFloat(myAmount);
    let x = parseFloat(betOddsValue).toFixed(2);
    let b = 0;


    // let betColor;
    let elseColor;

    // let displayValue = 0;

    let calValue = 0;

    b = otype === "lay" ? p : p * (x / 100);
    p = otype === "lay" ? p * (x / 100) : p;


    if (isSelected && p !== 0) {
      calValue = betOddsType === "back" ? b : p || 0;
      elseColor = betOddsType === "back" && calValue >= 0 ? "green" : "red";
    } else if (isSelectedTeam && myAmount !== 0) {
      calValue = betOddsType === "back" ? p : b || 0;
      elseColor = betOddsType === "back" || calValue < 0 ? "red" : "green";
    }

    if (existingBet) {
      if (seletTeamName?.toLowerCase() === teamName?.toLowerCase()) {

        if (betOddsType === otype) {
          if (isSelected && p !== 0) {
            b = b + totalBetAmount
            p = p + totalPrice
            calValue = betOddsType === "back" ? b : p;
            elseColor = betOddsType === "back" && calValue >= 0 ? "green" : "red";
          } else if (isSelectedTeam && myAmount !== 0) {
            p = p + totalPrice;
            b = b + totalBetAmount;
            calValue = betOddsType === "back" ? p : b;
            elseColor = betOddsType === "back" || calValue < 0 ? "red" : "green";
          }


        }
        else {
          if (betOddsType === "back") {

            if (totalBetAmount > p) {

              if (isSelected && p !== 0) {

                p = totalPrice - b
                calValue = p || 0;
                elseColor = "red";
              } else if (isSelectedTeam && myAmount !== 0) {

                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";
              }

            } else {
              if (isSelected && p !== 0) {
                b = b - totalPrice;
                calValue = b || 0;

                elseColor = calValue < 0 ? "red" : "green";
              } else if (isSelectedTeam && myAmount !== 0) {

                p = p - totalBetAmount
                calValue = p || 0;
                elseColor = "red";
              }

            }
          } else if (betOddsType === "lay") {
            if (totalPrice >= b) {

              if (isSelected && p !== 0) {


                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";
              } else if (isSelectedTeam && myAmount !== 0) {


                p = totalPrice - b
                calValue = p || 0;
                elseColor = "red";
              }

            } else {
              if (isSelected && p !== 0) {

                p = p - totalBetAmount
                calValue = p || 0;
                elseColor = "red";
              } else if (isSelectedTeam && myAmount !== 0) {

                b = b - totalPrice;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";
              }

            }
          }

        }
      } else {
        if (betOddsType === otype) {
          if (betOddsType === "back") {

            if (totalPrice >= b) {

              if (isSelected && p !== 0) {

                p = totalPrice - b
                calValue = p || 0;
                elseColor = "red";
              } else if (isSelectedTeam && myAmount !== 0) {

                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";
              }

            } else {
              if (isSelected && p !== 0) {

                b = b - totalPrice;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";
              } else if (isSelectedTeam && myAmount !== 0) {
                p = p - totalBetAmount

                calValue = p || 0;
                elseColor = "red";
              }

            }
          } else if (betOddsType === "lay") {
            if (totalPrice >= b) {

              if (isSelected && p !== 0) {

                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";


              } else if (isSelectedTeam && myAmount !== 0) {

                p = totalPrice - b
                calValue = p || 0;
                elseColor = "red";
              }

            } else {
              if (isSelected && p !== 0) {
                p = p - totalBetAmount;
                calValue = p || 0;
                elseColor = "red";

              } else if (isSelectedTeam && myAmount !== 0) {
                b = b - totalPrice
                calValue = b || 0;
                elseColor = calValue < 0 ? "red" : "green";

              }

            }
          }
        }
        else {
          if (isSelected && p !== 0) {
            b = b + totalBetAmount
            p = p + totalPrice
            calValue = betOddsType === "back" ? b : p;
            elseColor = betOddsType === "back" && calValue >= 0 ? "green" : "red";
          } else if (isSelectedTeam && myAmount !== 0) {
            p = p + totalPrice;
            b = b + totalBetAmount;
            calValue = betOddsType === "back" ? p : b;
            elseColor = betOddsType === "back" || calValue < 0 ? "red" : "green";
          }

        }
      }
    }



    calValue = parseFloat(calValue).toFixed(2) || 0;


    // console.log("existingBet", existingBet)



    return (
      <div className="col-span-5 md:col-span-3 text-sm md:text-[11px] font-bold p-1 text-left pl-4">
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>
            {displayValue}
            {/* {isSelected && myAmount !== 0 ? ( */}
            {selectedRun?.type ? (
              <span style={{ color: elseColor }}>

                ({calValue})
              </span>
            ) : ""}

            {/* )} */}
          </p>
        </div>
      </div>
    );

  }


  // console.log("pendingBet1111", pendingBet);
  return (
    <div>
      <div className="mt-2">
        {bookmakerData.length > 0 && (
          <div>
            <div className="mx-auto text-[13px] bg-gray-200 ">
              <div className="flex justify-between items-center rounded-t-md bg-white">
                <div className="font-bold bg-blue p-2 px-4 rounded-tr-3xl text-white flex gap-3">
                  <span>{bookmakerData[0]?.mname}</span>

                  <span className="mt-1 text-lg font-black">
                    <HiOutlineExclamationCircle />
                  </span>
                </div>
                {/* <div className="font-bold">Matched € 204.7K</div> */}
              </div>

              {bookmakerData[0]?.status === "SUSPENDED" ? (
                <div className="border-2 border-red-500 relative mx-auto">
                  <div className="absolute flex items-center justify-centerz-10 bg-[#e1e1e17e] h-full w-full">
                    <p className="text-red-700 absolute left-1/2 transform -translate-x-1/2  font-bold text-3xl ">
                      SUSPENDED
                    </p>
                  </div>

                  <div className="grid grid-cols-9 text-center border-b border-gray-300 bg-[#faf8d8]">
                    <div className="col-span-5"></div>
                    <div className="bg-[#72bbef] text-slate-800 p-1 col-span-2 md:col-span-1 font-bold ">
                      Back
                    </div>
                    <div className="bg-[#faa9ba] text-slate-800 p-1 col-span-2  md:col-span-1 font-bold ">
                      Lay
                    </div>
                    <div className="bg-[#bed5d8] text-[#2789ce] p-1 text-[10px] rounded-lg col-span-2 hidden md:block">
                      Min/Max {BookmakerList[0]?.min}-{BookmakerList[0]?.max}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds, sid }, index) => (
                    <div key={index}>
                      <div
                        className="grid grid-cols-9 text-center text-[10px] opacity-30 font-semibold border-b bg-[#faf8d8] border-gray-300 cursor-block"
                      // onClick={() => setSelectedRun(index)}
                      >
                        <div className="col-span-5 md:col-span-3 text-sm md:text-[11px] font-bold  p-1  text-left pl-4">
                          {team}
                        </div>
                        {odds.map((odd, i) => (
                          <div
                            key={i}
                            className={`p-1 col-span-2 md:col-span-1 cursor-pointer ${i === 0
                              ? "bg-sky-100 hidden md:block"
                              : i === 1
                                ? "bg-sky-200 hidden md:block"
                                : i === 2
                                  ? "bg-[#72bbef] "
                                  : i === 3
                                    ? "bg-[#faa9ba]"
                                    : i === 4
                                      ? "bg-pink-200 hidden md:block"
                                      : "bg-pink-100 hidden md:block"
                              }`}
                          // onClick={() => {
                          //   setSelectedRun(index);
                          //   setCurrentOdd(odd);
                          // }}
                          >
                            <div
                              className="font-bold"
                              onClick={() => {
                                handleSelect("bookmark", index, odd?.odds, odd?.otype);
                                setValue(odd?.odds, team, sid, odd.otype);
                              }}
                            >
                              {odd?.odds}
                            </div>
                            <div className="text-gray-800">{odd?.size}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-9 text-center border-b border-gray-300 bg-[#faf8d8]">
                    <div className="col-span-5"></div>
                    <div className="bg-[#72bbef] text-slate-800 p-1 col-span-2 md:col-span-1 font-bold ">
                      Back
                    </div>
                    <div className="bg-[#faa9ba] text-slate-800 p-1 col-span-2 md:col-span-1 font-bold ">
                      Lay
                    </div>
                    <div className="bg-[#bed5d8] text-[#2789ce] p-1 text-[10px] rounded-lg col-span-2 hidden md:block">
                      Min/Max {BookmakerList[0]?.min}-{BookmakerList[0]?.max}
                    </div>
                  </div>
                  {bookmakerData.map(
                    ({ team, odds, sid, status }, index) => (
                      <div key={index}>
                        <div
                          className="grid grid-cols-9 text-center text-[10px] font-semibold border-b bg-[#faf8d8] border-gray-300 cursor-pointer hover:bg-gray-200"
                        // onClick={() => setSelectedRun(index)}
                        >
                          <MyComponent
                            key={team}
                            team={team}
                            matchData={bookmakerData[0]}
                            pendingBet={pendingBet}
                            myAmount={betAmount} // the live entered amount
                            index={index}
                            selectedRun={selectedRun} // should include { type, index, team }
                          // oddsValue={odd?.odds}
                          />

                          {odds.map((odd, i) => (
                            <div
                              key={i}
                              className={`p-1 col-span-2 md:col-span-1 ${i === 0
                                ? "bg-sky-100 hidden md:block"
                                : i === 1
                                  ? "bg-sky-200 hidden md:block"
                                  : i === 2
                                    ? "bg-[#72bbef] "
                                    : i === 3
                                      ? "bg-[#faa9ba]"
                                      : i === 4
                                        ? "bg-pink-200 hidden md:block"
                                        : "bg-pink-100 hidden md:block"
                                }`}
                            // onClick={() => {
                            //   setSelectedRun(index);
                            //   setCurrentOdd(odd);
                            // }}
                            >
                              <div
                                onClick={() => {
                                  if (odd?.odds !== 0) {
                                    handleSelect("bookmark", index, odd?.odds, odd?.otype);
                                    setValue(
                                      odd?.odds,
                                      team,
                                      sid,
                                      odd.otype
                                    );
                                  }
                                }}
                              >
                                <div className="font-bold">{odd?.odds}</div>
                                <div className="text-gray-800">
                                  {odd?.size}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedRun?.type === "bookmark" &&
                          selectedRun.index === index && (
                            <div className="bg-green-100 p-3 mt-2">
                              <div className="grid grid-cols-4 gap-2">
                                <button
                                  className="bg-white border border-black rounded-sm px-3 py-1 col-span-2 md:col-span-1"
                                  onClick={() => handleSelect(null, null, null, null)}
                                >
                                  Cancel
                                </button>
                                <div className="flex items-center w-full justify-between border rounded-sm overflow-hidden col-span-2 md:col-span-1">
                                  <button
                                    className="bg-gray-300 px-3 py-1 h-full"
                                    onClick={() =>
                                      setBetOdds((prev) =>
                                        prev > 1 ? prev - 0.1 : prev
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="mx-3">
                                    {betOdds.toFixed(2)}
                                  </span>
                                  <button
                                    className="bg-gray-300 px-3 py-1 h-full"
                                    onClick={() =>
                                      setBetOdds((prev) => prev + 0.1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>

                                <input
                                  type="number"
                                  value={betAmount}
                                  onChange={(e) =>
                                    setBetAmount(Number(e.target.value))
                                  }
                                  placeholder="Enter Bet Amount"
                                  className="w-full bg-white text-black p-2 col-span-2 md:col-span-1"
                                />

                                <button
                                  onClick={() =>
                                    placeBet(
                                      bookmakerData[0]?.mname,
                                      bookmakerData[0]?.mname,
                                      BookmakerList[0]?.max
                                    ) && setBetAmount(0)
                                  }
                                  disabled={loading}
                                  className={`flex items-center justify-center gap-2 bg-blue text-white px-3 py-1 col-span-2 md:col-span-1 rounded-sm transition-all duration-300 ${loading
                                    ? "opacity-70 cursor-not-allowed"
                                    : ""
                                    }`}
                                >
                                  {loading ? (
                                    <>
                                      <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                        />
                                      </svg>
                                      Placing...
                                    </>
                                  ) : (
                                    "Place Bet"
                                  )}
                                </button>
                              </div>

                              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                                {[
                                  100, 200, 500, 1000, 2000, 3000, 5000,
                                  10000,
                                ].map((amt) => (
                                  <button
                                    key={amt}
                                    onClick={() => setBetAmount(amt)}
                                    className={`px-3 py-2 rounded-sm border border-black col-span-1
                            ${betAmount === amt
                                        ? "bg-green-600 text-white"
                                        : "bg-white"
                                      }`}
                                  >
                                    {amt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookMaker
