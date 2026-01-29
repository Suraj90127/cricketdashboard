import React from 'react'
import LiveVideo from '../pages/LiveVideo'
import { useState } from 'react';
import axios from 'axios';
import scorecardimg from "../assets/scorecard-bg.png"
import { useEffect } from 'react';

const MarketSidebar = ({ gameid, sid }) => {

    const [scoreUrl, setScoreUrl] = useState(false);
    const [url, setUrl] = useState("");
    const [masterpopup, setMasterpopup] = useState(false);



    useEffect(() => {
        document.body.style.overflow = masterpopup ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [masterpopup]);

    const videoS = async () => {
        if (url) {
            setUrl("");
            return;
        }
        try {
            const response = await axios.get(
                `https://api.cricketid.xyz/tv_url?key=uniique5557878&gmid=${gameid}&sid=${sid}`
            );
            const data = response?.data;
            console.log("API response:", data);
            setUrl(data?.tv_url); // make sure the field is `tv_url`
        } catch (error) {
            console.error("Video API Error:", error?.response?.data || error.message);
        }
    };

    return (
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
                    <img className="h-[150px]" src={scorecardimg} alt="scorecardimg" />
                ) : null}
            </div>
            <div className="mt-4 bg-white">
                <div className="bg-dark text-white px-4 py-1 rounded-t-md font-semibold cursor-pointer">
                    Book
                </div>
                <div className='flex justify-between p-4 w-full'>
                    <button className='bg-dark text-white px-4 py-1 rounded-md font-semibold cursor-pointer w-[47%]' onClick={() => setMasterpopup(true)}>Master Book</button>
                    <button className='bg-dark text-white px-4 py-1 rounded-md font-semibold cursor-pointer w-[47%]'>User Book</button>
                </div>
            </div>
            <div className="mt-4 bg-white">
                <div className="bg-dark text-white px-4 py-1 rounded-t-md  cursor-pointer w-full flex justify-between">

                    <div className='flex justify-between p-4 w-[60%]'>
                        <div className="flex gap-5">
                            <span>Live Bet</span>
                            <div className="inline-flex items-center">
                                <label className="flex items-center cursor-pointer relative">
                                    <input type="checkbox" className="peer bg-white h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" id="uncheck" />
                                    <span className="absolute text-blue-500 bg-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth={1}>
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </label>
                            </div>

                        </div>
                        <div className='flex gap-5'>

                            <span>Partnership Book</span>
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
                    <div className='p-4 w-[40%] text-end flex justify-end'>

                        View More

                    </div>
                </div>
                <div className='text-center items-center py-8'>
                    <h2>There are no any bet.</h2>
                </div>
            </div>

            {masterpopup && (
                <div className="modal-overlay fixed top-5 left-[25%]">
                    <div className="modal-content h-[300px]">
                        <div className="modal-header flex justify-between">
                            <span> Market List</span>
                            <span className='text-2xl' onClick={() => setMasterpopup(false)}> X</span>
                        </div>
                        <div className="modal-body p-4">
                            <div className='border-2 border-gray-600'>

                                <h2 className='p-3 cursor-pointer border-b'>Match Odds</h2>
                                <h2 className='p-3 cursor-pointer border-b'>Match Odds</h2>
                                <h2 className='p-3 cursor-pointer border-b'>Match Odds</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MarketSidebar
