import axios from "axios";
// import { store } from "./store.js";
// import { userLogout } from "./reducer/authReducer.js";
// import { useDispatch } from "react-redux";


const api = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "/api",
});

export default api;

// export const host = "ws://localhost:5000";
export const host = "/";