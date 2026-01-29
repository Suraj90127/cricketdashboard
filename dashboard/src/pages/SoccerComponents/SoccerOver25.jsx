import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
// import {
//     getPendingBetAmo,
// } from "../../redux/reducer/marketAnalyzeReducer";
import { HiOutlineExclamationCircle } from 'react-icons/hi2';




const SoccerOver25 = ({ matcUnder25List, gameid }) => {
    const dispatch = useDispatch();
    const { pendingBet } = useSelector((state) => state.market);

    const matcUnder25 =
        Array.isArray(matcUnder25List) &&
            matcUnder25List.length > 0 &&
            matcUnder25List[0].section
            ? matcUnder25List[0].section.map((sec) => ({
                team: sec.nat,
                sid: sec.sid,
                odds: sec.odds,
                mname: matcUnder25List[0].mname, // ✅ Access from first item
                status: matcUnder25List[0].status, // ✅ Access from first item
            }))
            : [];

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

    // Inside your React functional component (e.g., in a file like MyComponent.jsx)
    function MyComponent({ team, matchData, pendingBet }) {
        const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
            pendingBet,
            matchData,
            team
        );

        // console.log("seletTeamName", seletTeamName)
        // console.log("teamName", teamName)

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
                        {displayValue}

                    </p>
                </div>
            </div>
        );

    }


    // useEffect(() => {
    //     dispatch(getPendingBetAmo(gameid));
    // }, [dispatch]);



    return (
        <div>
            <div>
                {matcUnder25.length > 0 && (
                    <div>
                        <div className="mx-auto text-[13px] bg-gray-200 ">
                            <div className="flex justify-between items-center rounded-t-md bg-white">
                                <div className="font-bold bg-blue p-2 px-4 rounded-tr-3xl text-white flex gap-3">
                                    <span>{matcUnder25[0]?.mname}</span>

                                    <span className="mt-1 text-lg font-black">
                                        <HiOutlineExclamationCircle />
                                    </span>
                                </div>
                                <div className="font-bold">Matched € 204.7K</div>
                            </div>

                            {matcUnder25[0]?.status === "SUSPENDED" ? (
                                <div className="border-2 border-red-500 relative mx-auto">
                                    <div className="absolute flex items-center justify-centerz-10 bg-[#e1e1e17e] h-full w-full">
                                        <p className="text-red-700 absolute left-1/2 transform -translate-x-1/2  font-bold text-3xl ">
                                            SUSPENDED
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-9 text-center border-b border-gray-300 bg-white">
                                        <div className="col-span-5 md:col-span-5"></div>
                                        <div className="bg-[#72bbef] text-slate-800 p-1 col-span-2 md:col-span-1 font-bold md:rounded-t-2xl">
                                            Back
                                        </div>
                                        <div className="bg-[#faa9ba] text-slate-800 p-1 col-span-2  md:col-span-1 font-bold md:rounded-t-2xl">
                                            Lay
                                        </div>
                                        <div className="font-semibold p-1 text-[11px] rounded-lg col-span-2 hidden md:block">
                                            <div className="bg-[#bed5d8] rounded-md p-0.5">
                                                <span className="text-[#315195]">Min/Max </span>
                                                100-100000
                                            </div>
                                        </div>
                                    </div>
                                    {matcUnder25.map(({ team, odds }, index) => (
                                        <div key={index}>
                                            <div
                                                className="grid grid-cols-9 text-center text-[10px] opacity-30 font-semibold border-b bg-white border-gray-300 cursor-pointer hover:bg-gray-200"

                                            >
                                                <div className="col-span-5 md:col-span-3  text-sm md:text-[11px] font-bold  p-1  text-left pl-4">
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
                                                        <div className="text-gray-800">{odd?.size}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-9 text-center border-b border-gray-300 bg-white">
                                        <div className="col-span-5 md:col-span-5"></div>
                                        <div className="bg-[#72bbef] text-slate-800 p-1 col-span-2 md:col-span-1 font-bold md:rounded-t-2xl">
                                            Back
                                        </div>
                                        <div className="bg-[#faa9ba] text-slate-800 p-1 col-span-2  md:col-span-1 font-bold md:rounded-t-2xl">
                                            Lay
                                        </div>
                                        <div className="font-semibold p-1 text-[11px] rounded-lg col-span-2 hidden md:block">
                                            <div className="bg-[#bed5d8] rounded-md p-0.5">
                                                <span className="text-[#315195]">Min/Max </span>
                                                {matcUnder25List[0]?.min || 1}-{matcUnder25List[0]?.maxb}
                                            </div>
                                        </div>
                                    </div>
                                    {matcUnder25.map(({ team, odds }, index) => (
                                        <div key={index}>
                                            <div
                                                className="grid grid-cols-9 text-center text-[10px] font-semibold border-b bg-white border-gray-300 cursor-pointer hover:bg-gray-200"

                                            >
                                                <MyComponent
                                                    key={team}
                                                    team={team}
                                                    matchData={matcUnder25[0]}
                                                    pendingBet={pendingBet}
                                                    index={index}

                                                />
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

                                                        >
                                                            <div className="font-bold">{odd?.odds}</div>
                                                            <div className="text-gray-800">
                                                                {odd?.size}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SoccerOver25
