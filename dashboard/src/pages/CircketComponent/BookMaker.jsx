import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { getPendingBetAmo } from '../../redux/reducer/marketAnalyzeReducer';
import { toast } from 'react-toastify';


import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import Spinner2 from '../../components/Spinner2';

const BookMaker = ({ BookmakerList, gameid, match }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { pendingBet } = useSelector((state) => state.market);

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

  // useEffect(() => {
  //   dispatch(getPendingBetAmo(gameid));
  // }, [dispatch]);
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

  function MyComponent({ team, matchData, pendingBet, }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      matchData,
      team
    );

    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();



    let betColor =
      otype === "lay" ? (isMatchedTeam ? "green" : "red") :
        otype === "back" ? (isMatchedTeam ? "red" : "green") :
          "red";


    const displayValue = (() => {
      if (otype === "lay") {
        return isMatchedTeam ? totalPrice : totalBetAmount;
      } else if (otype === "back") {
        return isMatchedTeam ? totalBetAmount : totalPrice;
      } else {
        return isMatchedTeam ? totalPrice : totalBetAmount;
      }
    })();


    return (
      <div className="col-span-5 md:col-span-3 text-sm md:text-[11px] font-bold p-1 text-left pl-4">
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>
            {displayValue || "0.00"}

          </p>
        </div>
      </div>
    );

  }
  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };


  // console.log("pendingBet1111", pendingBet);
  return (
    <div>
      {/* {loading ? (
        <div className="text-center py-4">
          <Spinner2 />
        </div>) : ("")} */}
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
                      Min/Max {BookmakerList[0]?.min}-{formatToK(BookmakerList[0]?.maxb)}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds, sid }, index) => (
                    <div key={index}>
                      <div
                        className="grid grid-cols-9 text-center text-[10px] opacity-30 font-semibold border-b bg-[#faf8d8] border-gray-300 cursor-block"

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

                          >
                            <div
                              className="font-bold"

                            >
                              {odd?.odds}
                            </div>
                            <div className="text-gray-800">  {formatToK(odd?.size)}</div>
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
                      Min/Max {BookmakerList[0]?.min}-{formatToK(BookmakerList[0]?.maxb)}
                    </div>
                  </div>
                  {bookmakerData.map(
                    ({ team, odds }, index) => (
                      <div key={index}>
                        <div
                          className="grid grid-cols-9 text-center text-[10px] font-semibold border-b bg-[#faf8d8] border-gray-300 cursor-pointer hover:bg-gray-200"

                        >
                          <MyComponent
                            key={team}
                            team={team}
                            matchData={bookmakerData[0]}
                            pendingBet={pendingBet}

                            index={index}

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

                            >
                              <div

                              >
                                <div className="font-bold">{odd?.odds}</div>
                                <div className="text-gray-800">
                                  {formatToK(odd?.size)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

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
