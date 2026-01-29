import { useEffect, useState } from "react";
import {
  IoMdArrowDropdown,
  IoMdClose,
  IoMdRefresh,
  IoMdMenu,
} from "react-icons/io";
import { Link } from "react-router-dom";
import { BsPersonCircle } from "react-icons/bs";
import { MdLogout, MdOutlineArrowDropDown } from "react-icons/md";
import logo from "../assets/icons/theme-1709828838678-aura555.png";
import { useDispatch, useSelector } from "react-redux";
import { getAdmin, user_reset, userLogout } from "../redux/reducer/authReducer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from 'axios';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, errorMessage, successMessage, loading } = useSelector(
    (state) => state.auth
  );

  // console.log("updateAdmin", userInfo)
  const [activeItem, setActiveItem] = useState("Home");
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });


  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const navItems = [
    { name: "Dashboard", path: "/home" },
    {
      name: "Downlist",
      submenu: [
        { name: "User Downline List", path: "/user-download-list" },
        {
          name: "Agent Downline List",
          path: "/agent-download-list",
          reload: true,
        },
      ],
    },
    { name: "My account", path: "/my-account" },
    { name: "Security", path: "/secureauth" },
    {
      name: "My Report",
      submenu: [
        { name: "Event Profit/Loss", path: "/eventpl" },
        { name: "Downline Profit/Loss", path: "/downpl" },
      ],
    },
    { name: "BetList", path: "/betlist" },
    { name: "Market Analysis", path: "/my-market" },
    {
      name: "Banking",
      submenu: [
        { name: "User Banking", path: "/banking" },
        { name: "Master Banking", path: "/master-banking" },
      ],
    },
    { name: "Commision", path: "/commission" },
    { name: "Password History", path: "/password-history" },
    { name: "Restore User", path: "/restore-user" },
    { name: "Withdrawal", path: "/withdrawal" },
  ];

  const logout = async () => {
    try {
      const data = await dispatch(userLogout()).unwrap();
      localStorage.removeItem("auth");
      toast.success(data.message);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    } catch (error) {
      toast.error(error);
    }
  };

  const reload = () => {
    dispatch(getAdmin());
  };

  const toggleMobileSubmenu = (itemName, event) => {
    if (mobileSubmenuOpen === itemName) {
      setMobileSubmenuOpen(null);
    } else {
      // Calculate position relative to viewport
      const rect = event.target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // Approximate dropdown height

      // Position dropdown above if near bottom of screen
      if (rect.bottom + dropdownHeight > viewportHeight) {
        setDropdownPosition({
          top: rect.top - dropdownHeight,
          left: rect.left,
          position: 'fixed'
        });
      } else {
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          position: 'fixed'
        });
      }
      setMobileSubmenuOpen(itemName);
    }
  };

  return (
    <div
      className={`w-full sticky top-0 z-10 ${location.pathname == "/login" ? "hidden" : "block"
        }`}
    >
      {/* Mobile Header - Split into two rows */}
      <div className="lg:hidden">
        {/* Top row - Role and Name */}
        <header className="flex items-center justify-between p-2 bg-color border-b border-gray-800">
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-[40px] md:h-[50px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="bg-[#292929] text-white px-2 text-[12px]">
                {userInfo?.role}
              </p>
              <p className="text-white text-sm">{userInfo?.name}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-white text-xs font-semibold">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <p>
                    IRP (<span className="">{userInfo?.avbalance || 0}</span>)
                  </p>
                )}
              </div>
              <button
                onClick={reload}
                className="bg-[#2a2a2a] text-[20px] text-white p-1 cursor-pointer"
              >
                <IoMdRefresh />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between p-2 bg-color border-b border-gray-800 md:px-20">
        <img src={logo} alt="logo" className="h-[60px]" />
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 font-semibold">
            <p className="bg-[#292929] text-white px-2 text-[12px]">
              {userInfo?.role}
            </p>
            <p className="text-white text-sm">{userInfo?.name}</p>
            <div className="text-white text-sm font-semibold">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <p>
                  IRP (<span className="">{userInfo?.avbalance || 0}</span>)
                </p>
              )}
            </div>
            <button
              onClick={reload}
              className="bg-[#2a2a2a] text-[20px] text-white p-1 cursor-pointer"
            >
              <IoMdRefresh />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Horizontal Scrollable) */}
      <nav className="lg:hidden bg-color text-white overflow-x-auto whitespace-nowrap relative">
        <ul className="flex">
          {navItems.map((item, i) => (
            <li
              key={i}
              className="relative inline-block"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`block px-3 py-2 font-semibold transition-colors text-[13px] border-r border-gray-500 ${activeItem === item.name ? "text-white" : "text-white"
                    }`}
                  onClick={() => setActiveItem(item.name)}
                >
                  {item.name}
                </Link>
              ) : (
                <div className="relative">
                  <span
                    className="flex items-center px-3 py-2 font-semibold text-[13px] cursor-pointer border-r border-gray-500 text-white"
                    onClick={(e) => toggleMobileSubmenu(item.name, e)}
                  >
                    {item.name}
                    <IoMdArrowDropdown className="h-5 w-5" />
                  </span>

                  {/* Mobile Submenu Dropdown - positioned absolutely within viewport */}
                  {mobileSubmenuOpen === item.name && (
                      <ul
                      className="bg-color text-white font-semibold w-40 z-20 shadow-lg border border-gray-700"
                      style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        position: dropdownPosition.position
                      }}
                    >
                      {item.submenu
                        .filter(
                          (sub) =>
                            !(
                              userInfo?.role === "agent" &&
                              sub.name === "Agent Downline List"
                            )
                        )
                        .map((sub, index) => (
                          <li
                            key={index}
                            className="border-b border-gray-700 last:border-b-0 hover:bg-gray-800"
                          >
                            <Link
                              to={sub.path}
                              className="block px-3 py-2 text-[13px]"
                              onClick={(e) => {
                                setActiveItem(item.name);
                                setMobileSubmenuOpen(null);
                                if (sub.reload) {
                                  e.preventDefault();
                                  navigate(sub.path);
                                  window.location.reload();
                                }
                              }}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
          {/* Logout button in scrollable menu */}
          <li className="inline-block">
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-2 font-semibold text-[13px] text-white border-r border-gray-500"
            >
              Logout <MdLogout />
            </button>
          </li>
        </ul>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-color text-white md:px-20">
        <ul className="flex flex-row relative">
          {navItems.map((item, i) => (
            <li
              key={i}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`block px-3 py-2 font-semibold whitespace-nowrap transition-colors text-[13px] border-r border-gray-500 ${activeItem === item.name ? "text-white" : "text-white"
                    }`}
                  onClick={() => setActiveItem(item.name)}
                >
                  {item.name}
                </Link>
              ) : (
                <span className="flex items-center px-3 py-2 whitespace-nowrap font-semibold text-[13px] cursor-pointer border-r border-gray-500 text-white">
                  {item.name}
                  <IoMdArrowDropdown className="h-5 w-5" />
                </span>
              )}

              {/* Submenu Dropdown */}
              {item.submenu && hoveredItem === item.name && (
                <ul className="absolute left-0 top-full bg-color text-white font-semibold w-40 z-20 shadow-lg">
                  {item.submenu
                    .filter(
                      (sub) =>
                        !(
                          userInfo?.role === "agent" &&
                          sub.name === "Agent Downline List"
                        )
                    )
                    .map((sub, index) => (
                      <li
                        key={index}
                        className="border-b border-gray-700 last:border-b-0"
                      >
                        <Link
                          to={sub.path}
                          className="block px-3 py-1 text-[13px]"
                          onClick={(e) => {
                            setActiveItem(item.name);
                            if (sub.reload) {
                              e.preventDefault();
                              navigate(sub.path);
                              window.location.reload();
                            }
                          }}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
          <li
            onClick={logout}
            className="absolute right-0 flex items-center gap-1 cursor-pointer px-3 py-2 whitespace-nowrap font-semibold transition-colors text-[13px] text-white hover:text-white"
          >
            Logout <MdLogout />
          </li>
        </ul>
      </nav>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="bg-color text-white p-4 w-full md:max-w-lg shadow-lg relative z-10 mx-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-center">
                Non-Gambling Territories.
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-xl bg-color p-1 rounded-md"
              >
                <IoMdClose />
              </button>
            </div>
            <hr className="my-2 border-white" />
            <p className="text-sm">
              Connecting to our site from non-gambling countries, it will be
              User's responsibility to ensure that their use of the service is
              lawful.
            </p>
            <h3 className="font-bold text-center my-3">
              Underage gambling is prohibited.
            </h3>
            <p className="text-sm text-center">
              Please confirm if you are 18 years old and above as of today.
            </p>
            <hr className="my-2 border-white" />
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="bg-white text-black w-[130px] py-1 rounded hover:bg-gray-300"
                onClick={() => setShowPopup(false)}
              >
                Confirm
              </button>
              <button
                className="bg-black text-white w-[130px] py-1 border border-white rounded"
                onClick={() => setShowPopup(false)}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;