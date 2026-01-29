import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { marketGames } from '../redux/reducer/marketAnalyzeReducer'
import Loader from '../components/Loader'

const MyMarket = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [market, setMarket] = useState([])

  const { marketData, loading, errorMessage, successMessage } = useSelector((state) => state.market)

  const cricketGame = Array.isArray(marketData)
    ? marketData.filter(item => item.gameName === "Cricket Game")
    : [];

  const tennisGame = Array.isArray(marketData)
    ? marketData.filter(item => item.gameName === "Tennis Game")
    : [];

  const soccerGame = Array.isArray(marketData)
    ? marketData.filter(item => item.gameName === "Soccer Game")
    : [];


  // console.log("marketData", marketData)

  useEffect(() => {
    dispatch(marketGames())
  }, [dispatch])
  return (
    <div>

      <Navbar />

      <div className=" mx-auto  overflow-hidden relative text-sm p-2 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div>

            <div className="mt-4">
                {cricketGame.length > 0 && (
                  <div>
                    <div className="bg-dark text-white px-4 py-2 font-semibold mb-2">
                      Circket
                    </div>
                    {cricketGame[0]?.events.map((event, index) => (

                      <div key={index} className='flex justify-between px-2 gap-2 border-b-2 border-gray-300 pb-2'>
                        <p className="text-[#2789ce] font-[600] text-[4vw] md:text-xs lg:text-sm leading-[25px] cursor-pointer" onClick={() => navigate(`/cricket-bet/${event.gameId}`)}>{event.eventName}</p>
                        <p className="text-gray-400 ml-1 font-[400]">{event.pendingBetCount}</p>
                      </div>
                    ))}

                  </div>
                )}
              </div>
              <div className="mt-4">
                {tennisGame.length > 0 && (
                  <div>
                    <div className="bg-dark text-white px-4 py-2 font-semibold mb-2">
                      Tennis
                    </div>
                    {tennisGame[0]?.events.map((event, index) => (

                      <div key={index} className='flex justify-between px-2 gap-2 border-b-2 border-gray-300 pb-2'>
                        <p className="text-[#2789ce] font-[600] text-[4vw] md:text-xs lg:text-sm leading-[25px] cursor-pointer" onClick={() => navigate(`/tennis-bet/${event.gameId}`)}>{event.eventName}</p>
                        <p className="text-gray-400 ml-1 font-[400]">{event.pendingBetCount}</p>
                      </div>
                    ))}

                  </div>
                )}
              </div>
              <div className="mt-4">
                {soccerGame.length > 0 && (
                  <div>
                    <div className="bg-dark text-white px-4 py-2 font-semibold mb-2">
                      Soccer
                    </div>
                    {soccerGame[0]?.events.map((event, index) => (

                      <div key={index} className='flex justify-between px-2 gap-2 border-b-2 border-gray-300 pb-2'>
                        <p className="text-[#2789ce] font-[600] text-[4vw] md:text-xs lg:text-sm leading-[25px] cursor-pointer" onClick={() => navigate(`/soccerbet/${event.gameId}`)}>{event.eventName}</p>
                        <p className="text-gray-400 ml-1 font-[400]">{event.pendingBetCount}</p>
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

export default MyMarket
