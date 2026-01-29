import { useEffect, useState } from "react";
import io from "socket.io-client";

const LiveScoreSocket = ({ gameId }) => {
    const [scoreData, setScoreData] = useState(null);

    // console.log("gameId", gameId)

    useEffect(() => {
        const options = {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true,
        };
        const socket = io("https://d-score.scoreswift.xyz", options);

        // Connection event handlers
        socket.on("connect", () => {
            console.log("Connected to server");

            // this number is 462034047 oldgmid which you can get from "Match details endpoint"
            socket.emit("subscribe", { type: 1, rooms: [gameId] });
            console.log("data has been send, waiting for score update");
        });

        socket.on("update", (data) => {
            console.log("score update has been arrived", data);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        // Error handling
        socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });

        socket.on("connect_timeout", () => {
            console.error("Connection timeout");
        });


        // score udpate will came here


        return () => {
            socket.disconnect();
        };
    }, [gameId]);

    return (
        <div className="p-4">
            <h2 className="font-bold text-lg">Live Score Updates</h2>
            {scoreData ? (
                <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">{JSON.stringify(scoreData, null, 2)}</pre>
            ) : (
                <p>No updates received yet...</p>
            )}
        </div>
    );
};

export default LiveScoreSocket;
