import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";


export const marketGames = createAsyncThunk(
    "market/getMyRepostsDataByEvents",
    async (_, { rejectWithValue }) => {

        try {

            const res = await api.get(`/market-analyze`, {
                withCredentials: true,
            });
            // console.log("res", res)
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Fetch failed" }
            );
        }
    }
);



export const getPendingBetAmo = createAsyncThunk(
    "market/getPendingBetAmo1",
    async (gameId, { rejectWithValue }) => {
        // console.log("getPendingBetAmo", gameId);
        try {
            const response = await api.get(`/market/pending-amount?gameId=${gameId}`, {
                withCredentials: true,
            });
            // console.log("response", response);
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Something went wrong" }
            );
        }
    }
);


export const fetchCricketBatingData = createAsyncThunk(
    "market/fetchCricketBatingData1",
    async (gameid, { rejectWithValue }) => {

        try {
            const response = await api.get(`/cricket/betting?gameid=${gameid}`); // Your backend API

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch matches"
            );
        }
    }
);

export const fetchTannisBatingData = createAsyncThunk(
    "market/fetchTannisBatingData1",
    async (gameid, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tannis/betting?gameid=${gameid}`); // Your backend API
            // console.log("response", response.data);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch matches"
            );
        }
    }
);

export const fetchSoccerBatingData = createAsyncThunk(
    "market/fetchSoccerBatingData1",
    async (gameid, { rejectWithValue }) => {
        try {
            const response = await api.get(`/soccer/betting?gameid=${gameid}`); // Your backend API
            console.log("response", response.data);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch matches"
            );
        }
    }
);

export const getBetPerents = createAsyncThunk(
    "market/getBetPerents",
    async (id, { rejectWithValue }) => {
        // console.log("userId", id);

        try {

            const res = await api.get(`/get/market-bet-perents/${id}`, {
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const masterBookReducer = createAsyncThunk(
    "market/masterBookReducer",
    async ({ userId, gameid, gameType }, { rejectWithValue }) => {
        // console.log("userId", gameid, gameType);

        try {

            const res = await api.get(`/get/master-book?userId=${userId}&gameId=${gameid}&gameType=${gameType}`, {
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);
export const masterBookReducerDownline = createAsyncThunk(
    "market/masterBookReducerDownline",
    async ({ userId, gameid, gameType }, { rejectWithValue }) => {
        // console.log("userId", gameid, gameType);

        try {

            const res = await api.get(`/get/master-book-downline?userId=${userId}&gameId=${gameid}&gameType=${gameType}`, {
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);






const initialState = {
    message: null,
    errorMessage: null,
    successMessage: null,
    marketData: [],
    pendingBet: [],
    betsData: [],
    battingData: [],
    betPerantsData: [],
    masterData: [],
    masterDataDownline: [],
    loading: false,

};


const marketSlice = createSlice({
    name: "market",
    initialState,
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        clearError: (state) => {
            state.error = null;
        },

        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(marketGames.fulfilled, (state, action) => {
                state.loading = false;
                state.marketData = action.payload.data;
            })
            .addCase(marketGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(getPendingBetAmo.pending, (state) => {
                state.loading = true;
                state.errorMessage = "";
                state.successMessage = "";
            })
            .addCase(getPendingBetAmo.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.pendingBet = payload?.data.data;
                state.betsData = payload?.data.betsData;
                state.successMessage = payload?.message;
            })
            .addCase(getPendingBetAmo.rejected, (state, { payload }) => {
                state.loading = false;
                state.errorMessage = payload?.message || "Something went wrong";
            })
            .addCase(fetchCricketBatingData.pending, (state) => {
                state.loader = true;
                state.error = null;
            })
            .addCase(fetchCricketBatingData.fulfilled, (state, action) => {
                state.loader = false;
                state.battingData = action.payload.data;
            })
            .addCase(fetchCricketBatingData.rejected, (state, action) => {
                state.loader = false;
                state.error = action.payload;
            })
            .addCase(marketGames.pending, (state) => {
                state.loading = true;
            })


            .addCase(fetchTannisBatingData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTannisBatingData.fulfilled, (state, action) => {
                state.loading = false;
                state.battingData = action.payload.data;
            })
            .addCase(fetchTannisBatingData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSoccerBatingData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSoccerBatingData.fulfilled, (state, action) => {
                state.loading = false;
                state.battingData = action.payload.data;
            })
            .addCase(fetchSoccerBatingData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBetPerents.pending, (state) => {
                state.loader = true;
            })
            .addCase(getBetPerents.fulfilled, (state, action) => {
                state.loader = false;
                state.betPerantsData = action.payload.data;
            })
            .addCase(getBetPerents.rejected, (state, action) => {
                state.loader = false;
                state.error = action.payload;
            })
            .addCase(masterBookReducer.pending, (state) => {
                state.loader = true;
            })
            .addCase(masterBookReducer.fulfilled, (state, action) => {
                state.loader = false;
                state.masterData = action.payload.data;
            })
            .addCase(masterBookReducer.rejected, (state, action) => {
                state.loader = false;
                state.error = action.payload;
            })
            .addCase(masterBookReducerDownline.pending, (state) => {
                state.loader = true;
            })
            .addCase(masterBookReducerDownline.fulfilled, (state, action) => {
                state.loader = false;
                state.masterDataDownline = action.payload.data;
            })
            .addCase(masterBookReducerDownline.rejected, (state, action) => {
                state.loader = false;
                state.error = action.payload;
            })

    },
});

export const { clearError } = marketSlice.actions;

export default marketSlice.reducer;
