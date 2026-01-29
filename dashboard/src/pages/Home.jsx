import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getGraphData, getGraphTodayData } from "../redux/reducer/downlineReducer";
import { useEffect } from "react";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { graphbackup, graphtoday, loading } = useSelector((state) => state.downline);
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 12);
  const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));

  useEffect(() => {
    dispatch(getGraphData({
      startDate,
      endDate,
    }));
    dispatch(getGraphTodayData({
      startDate: currentDate,
      endDate: currentDate,
    }));
  }, [dispatch]);

  const PLdata = graphbackup?.report;
  const LivePLdata = graphtoday?.report;
  const Totaldata = graphbackup?.total;
  console.log(graphtoday, "myReportseventData");

  // Transform the data for the PieChart
  const transformBackupData = (data) => {
    return data?.map(item => ({
      name: item.name,
      value: Math.abs(item.myProfit), // Using absolute value for display
      originalProfit: item.myProfit // Keeping original value for reference
    }));
  };
  const transformLiveData = (data) => {
    return data?.map(item => ({
      name: item.name,
      value: Math.abs(item.myProfit), // Using absolute value for display
      originalProfit: item.myProfit // Keeping original value for reference
    }));
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  // Custom tooltip formatter to show profit/loss
  const customTooltipFormatter = (value, name, props) => {
    const originalProfit = props.payload.originalProfit;
    const profitText = originalProfit < 0 ? `Loss: ${Math.abs(originalProfit)}` : `Profit: ${originalProfit}`;
    return [`${value}`, `${name} (${profitText})`];
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center flex-col md:flex-row gap-6 p-2 md:p-6 ">
        {/* Backup Sports Profit Graph */}
        <div className="md:w-1/2 bg-white rounded-lg shadow-lg">
          <div className="bg-dark text-white font-bold px-4 py-1 rounded-t-lg text-[15px]">
            Live Sports Profit
          </div>
          <div className="p-2 flex justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={transformLiveData(LivePLdata)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transformLiveData(LivePLdata)?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="md:w-1/2 bg-white rounded-lg shadow-lg">
          <div className="bg-dark text-white font-bold px-4 py-1 rounded-t-lg text-[15px]">
            Backup Sports Profit
          </div>
          <div className="p-2 flex justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={transformBackupData(PLdata)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transformBackupData(PLdata)?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;