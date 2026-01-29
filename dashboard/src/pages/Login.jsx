import React, { useState } from "react";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import logo from "../assets/icons/theme-1709828838678-aura555.png";
import { useDispatch, useSelector } from "react-redux";
import { getAdmin, loginAdmin } from "../redux/reducer/authReducer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(loginAdmin(formData)).unwrap();
      toast.success(data.message);
      dispatch(getAdmin());
      console.log("use login");
      
      navigate("/home");
    } catch (error) {
      toast.error(error);
    }
  };

  const handlePass = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-color relative">
      <button className="absolute top-4 right-4 text-black text-xl hover:text-gray-700 bg-color p-1 rounded-md font-bold">
        <IoMdClose />
      </button>

      <form className="bg-color w-full md:w-lg p-6 rounded-lg text-center">
        <img src={logo} className="h-[70px] w-auto" alt="logo" />
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.userName}
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
            className="w-full px-4 py-2 text-white bg-white/10 border border-white/50 rounded-md placeholder-gray-300 focus:outline-none"
          />
          <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
        <p className="text-gray-300 text-sm -mt-3 mb-4 text-left px-2">
          Please enter username.
        </p>

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2 text-white bg-white/10 border border-white/50 rounded-md placeholder-gray-300 focus:outline-none"
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
            onClick={handlePass}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-color text-white py-2 rounded-md mb-2"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
