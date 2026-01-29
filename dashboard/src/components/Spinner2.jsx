import React, { useState, useEffect } from "react";

const Spinner2 = () => {
  const [count, setCount] = useState(2);
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1);
      }, 1000); // decrease count every second
      return () => clearTimeout(timer);
    }
  }, [count]);
  return (
    <>
      {/* {count !== 0 ? ( */}
      <div className="bg-white h-[116px] w-[185px] rounded-[20px] mx-auto overflow-hidden flex justify-center items-center ">
        <div className="loader">
          <div className="bg-white">

            <svg
              className="shadow-[0_0_40px_rgba(0,0,0,0.0)] h-[200px] w-[120px] rounded-2xl"
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
            >
              <rect width="100%" height="100%" fill="white" rx="16" ry="16" />
              <defs>
                <filter id="goo">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                    result="goo"
                  />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
            </svg>
          </div>

        </div>
      </div>
      {/* ) : null} */}
    </>
  );
};

export default Spinner2;
