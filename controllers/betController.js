import betModel from "../models/betModel.js";
import SubAdmin from "../models/subAdminModel.js";
import axios from "axios";
import TransactionHistory from "../models/transtionHistoryModel.js";
import betHistoryModel from "../models/betHistoryModel.js";
// import { log } from "console"


export const placeBet = async (req, res) => {
  const { id } = req;

  try {
    const {
      gameId,
      sid,
      price,
      xValue,
      fancyScore,
      gameType,
      eventName,
      marketName,
      gameName,
      teamName,
      otype,
    } = req.body;


    // Validate required fields
    if (!gameId || !sid || !price || !xValue || !gameName || !teamName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await SubAdmin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (user.secret === 0) {
      return res.status(200).json({ message: "created successfully" });
    }


    // 1. Check uniqueness: existing bet with same gameId, eventName, marketName, userId, and status 0
    const uniqueKey = { gameId, eventName, marketName, };
    const existingExact = await betModel.findOne(uniqueKey);

    let market_id

    if (existingExact) {
      market_id = existingExact.market_id;
    }



    // Only call the external API if there's no existing bet
    if (!existingExact) {
      market_id = Math.floor(10000000 + Math.random() * 90000000);


      try {
        const response = await axios.post(
          // `https://api.cricketid.xyz/placed_bets?key=uniique5557878&sid=${sid}`,
          `http://130.250.191.174:3009/placed_bets?key=uniique5557878&sid=${sid}`,
          // `https://aura444.org/api/user/place-bet?key=uniique5557878&sid=${sid}`,
          {
            event_id: gameId,
            event_name: eventName,
            market_id: market_id,
            market_name: marketName,
            market_type: gameType
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'key': 'uniique5557878'
            },
            withCredentials: true     // ensures cookies are sent
          }
        );

        // console.log("response", response)

        // console.log("response", response);
        // market_id = response.data.market_id;
      } catch (err) {
        console.error("Error fetching market_id:", err);
        return res.status(502).json({
          message: "Could not fetch external market_id",
          error: err.message
        });
      }
    }


    let p = parseFloat(price);
    let x = parseFloat(xValue).toFixed(2);
    let betAmount = p;//Always the user's stake amount

    // Calculate bet amount based on game type and otype
    switch (gameType) {
      case "Match Odds":
      case "Tied Match":
      case "Winner":
      case "OVER_UNDER_05":
      case "OVER_UNDER_15":
      case "OVER_UNDER_25":
        // betAmount = otype === "lay" ? p : p * (x - 1);
        // p = otype === "lay" ? p * (x - 1) : p;
           if (otype === "lay") {
      p = p * (x - 1); // Liability (what user risks if bet loses)
    } else { // back bet
       p = p * (x - 1); // Potential winnings (what user wins if bet wins)
    }
        break;
      case "Bookmaker":
      case "Bookmaker IPL CUP":
        // betAmount = otype === "lay" ? p : p * (x / 100);
        // p = otype === "lay" ? p * (x / 100) : p;
        // break;
           if (otype === "lay") {
      // p = p * (x - 1); // Liability (what user risks if bet loses)
          p = p * (x / 100); // Liability for bookmaker lay bets
    } else { // back bet
      p = p * (x / 100); // Potential winnings
    }
      case "Toss":
      case "1st 6 over":
        betAmount = p;
        break;
      default:
        return res.status(400).json({ message: "Invalid game type" });
    }

    betAmount = parseFloat(betAmount.toFixed(2));
    p = parseFloat(p.toFixed(2));

    // Balance and exposure checks
    if (user.avbalance < p || user.balance < p) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const pendingBets = await betModel.find({ userId: id, status: 0 });
    const totalPendingAmount = pendingBets.reduce((sum, b) => sum + b.price, 0);

    if (user.exposureLimit < totalPendingAmount + p) {
      return res.status(400).json({ message: "Exposure limit exceeded" });
    }

    // Check for existing pending bet
    const existingBet = await betModel.findOne({
      userId: id,
      gameId,
      gameType,
      status: 0,
    });

    let newBet = null;
    if (existingBet) {
      const originalPrice = existingBet.price;
      const originalBetAmount = existingBet.betAmount;

      if (teamName === existingBet.teamName) {
        if (otype === existingBet.otype) {
          // Same team, same bet type - merge bets
          existingBet.price += p;
          existingBet.xValue = ((parseFloat(existingBet.xValue) * originalPrice) + (parseFloat(x) * p)) / (originalPrice + p);
          existingBet.fancyScore = fancyScore;
          existingBet.betAmount += betAmount;
          user.avbalance -= p;
        } else {
          // Same team, opposite bet types - offset bets
          if (otype === "back") {
            if (originalBetAmount >= p) {
              // Full offset
              existingBet.price = originalPrice - betAmount;
              existingBet.betAmount = originalBetAmount - p;
              user.avbalance += betAmount;
            } else {
              // Partial offset with type change
              existingBet.price = p - originalBetAmount;
              existingBet.betAmount = betAmount - originalPrice;
              existingBet.otype = otype;
              user.avbalance += (originalPrice - (p - originalBetAmount));
            }
          } else if (otype === "lay") {
            if (originalPrice > betAmount) {
              // Full offset
              existingBet.price = originalPrice - betAmount;
              existingBet.betAmount = originalBetAmount - p;
              user.avbalance += betAmount;
            } else {
              // Partial offset with type change
              existingBet.price = p - originalBetAmount;
              existingBet.betAmount = betAmount - originalPrice;
              existingBet.otype = otype;
              user.avbalance -= ((p - originalBetAmount) - originalPrice);
            }
          }
          existingBet.xValue = x;
          existingBet.fancyScore = fancyScore;
        }
      } else {
        // If team name is different
        if (otype === existingBet.otype) {
          if (originalPrice >= betAmount) {
            existingBet.price = originalPrice - betAmount;
            existingBet.betAmount = originalBetAmount - p;
            // user.exposure = totalPendingAmount - betAmount;
            user.avbalance += betAmount;
            // existingBet.teamName = teamName;
            existingBet.xValue = x;
            existingBet.fancyScore = fancyScore;

          } else {
            existingBet.price = p - originalBetAmount;
            existingBet.betAmount = betAmount - originalPrice;
            // user.exposure = totalPendingAmount - betAmount;
            user.avbalance -= ((p - originalBetAmount) - originalPrice);
            existingBet.teamName = teamName;
            existingBet.xValue = x;
            existingBet.fancyScore = fancyScore;
          }

        } else {
          existingBet.price += p;
          existingBet.betAmount += betAmount;
          existingBet.xValue = (existingBet.xValue + x) / 2;
          // user.exposure = totalPendingAmount + p;
          user.avbalance -= p;
          existingBet.teamName = teamName;
          existingBet.xValue = x;
          existingBet.fancyScore = fancyScore;
          existingBet.otype = otype;
        }
      }
    } else {
      // No existing bet, place new one
      newBet = new betModel({
        userId: id,
        userName: user.userName,
        userRole: user.role,
        invite: user.invite,
        gameId,
        sid,
        price: p,
        betAmount,
        otype,
        xValue: x,
        fancyScore,
        gameType,
        market_id,
        eventName,
        marketName,
        gameName,
        teamName,
      });
      user.avbalance -= p;
    }

    // Save database operations
    const saveOperations = [];
    if (existingBet) saveOperations.push(existingBet.save());
    if (newBet) saveOperations.push(newBet.save());

    // Recalculate exposure from updated bets
    // const updatedPendingBets = await betModel.find({ userId: id, status: 0 });
    // user.exposure = updatedPendingBets.reduce((sum, b) => sum + b.price, 0);
    saveOperations.push(user.save());

    // Execute all save operations
    await Promise.all(saveOperations);

    // Record bet history regardless of new/existing
    const betHistory = new betHistoryModel({
      userId: id,
      userName: user.userName,
      gameId,
      sid,
      price: p,
      betAmount,
      otype,
      xValue: x,
      fancyScore,
      gameType,
      eventName,
      market_id,
      marketName,
      gameName,
      teamName,
    });
    await betHistory.save();

    return res.status(201).json({ message: "Bet placed successfully" });

  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


export const placeFancyBet = async (req, res) => {
  const { id } = req;

  try {
    const {
      gameId,
      sid,
      price,
      xValue,
      fancyScore,
      gameType,
      eventName,
      marketName,
      gameName,
      teamName,
      otype,
    } = req.body;






    // Validate required fields
    if (!gameId || !sid || !price || !xValue || !gameName || !teamName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await SubAdmin.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (user.secret === 0) {
      return res.status(200).json({ message: "created successfully" });
    }


    const uniqueKey = { gameId, eventName, marketName, };
    const existingExact = await betModel.findOne(uniqueKey);



    let market_id

    if (existingExact) {
      market_id = existingExact.market_id;
    }

    // console.log("market_id", market_id)


    // Only call the external API if there's no existing bet
    if (!existingExact) {
      market_id = Math.floor(10000000 + Math.random() * 90000000);


      try {
        const response = await axios.post(
          // `https://api.cricketid.xyz/placed_bets?key=uniique5557878&sid=${sid}`,
          `http://130.250.191.174:3009/placed_bets?key=uniique5557878&sid=${sid}`,
          {
            event_id: gameId,
            event_name: eventName,
            market_id: market_id,
            market_name: marketName,
            market_type: gameType
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'key': 'uniique5557878'
            },
            withCredentials: true     // ensures cookies are sent
          }
        );

        // console.log("response", response)

        // console.log("response", response);
        // market_id = response.data.market_id;
      } catch (err) {
        console.error("Error fetching market_id:", err);
        return res.status(502).json({
          message: "Could not fetch external market_id",
          error: err.message
        });
      }
    }





    let p = parseFloat(price);
    let x = parseFloat(xValue).toFixed(2);
    let betAmount = 0;

    // Calculate bet amount based on game type and otype
    switch (gameType) {
      case "Normal":
      case "meter":
      case "line":
      case "ball":
      case "khado":
        betAmount = otype === "lay" ? p : p * (x / 100);
        p = otype === "lay" ? p * (x / 100) : p;
        break;
      default:
        return res.status(400).json({ message: "Invalid game type" });
    }

    betAmount = parseFloat(betAmount.toFixed(2));
    p = parseFloat(p.toFixed(2));

    // Balance and exposure checks
    if (user.avbalance < p || user.balance < p) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const pendingBets = await betModel.find({ userId: id, status: 0 });
    const totalPendingAmount = pendingBets.reduce((sum, b) => sum + b.price, 0);

    if (user.exposureLimit < totalPendingAmount + p) {
      return res.status(400).json({ message: "Exposure limit exceeded" });
    }

    // Check for existing pending bet
    const existingBet = await betModel.findOne({
      userId: id,
      gameId,
      gameType,
      teamName,
      status: 0,
    });

    if (existingBet && otype === existingBet.otype) {
      // if (teamName === existingBet.teamName) {
      // if (otype === existingBet.otype) {
      existingBet.price += p;
      existingBet.xValue = (existingBet.xValue + x) / 2;
      existingBet.fancyScore = fancyScore;
      existingBet.betAmount += betAmount;
      user.exposure = totalPendingAmount + p;
      user.avbalance -= p;
      // }
      //  else {
      //   existingBet.otype = otype;
      //   existingBet.xValue = x;
      //   existingBet.fancyScore = fancyScore;

      //   if (otype === "back") {
      //     existingBet.price -= betAmount;
      //     existingBet.betAmount = existingBet.betAmount - p;
      //     user.exposure = totalPendingAmount - betAmount;
      //     user.avbalance += betAmount;
      //   } else if (otype === "lay") {
      //     existingBet.price = p - existingBet.betAmount;
      //     existingBet.betAmount = betAmount - existingBet.price;
      //     user.exposure = totalPendingAmount - existingBet.price;
      //     user.avbalance += betAmount - existingBet.price;
      //   }
      // }

      await existingBet.save();
      await user.save();
    } else {
      // No existing bet, place new one
      user.exposure = totalPendingAmount + p;
      user.avbalance -= p;
      await user.save();

      const newBet = new betModel({
        userId: id,
        userName: user.userName,
        gameId,
        sid,
        price: p,
        betAmount,
        otype,
        xValue: x,
        fancyScore,
        gameType,
        market_id,
        eventName,
        marketName,
        gameName,
        teamName,
      });
      await newBet.save();
    }

    // Record in bet history
    const betHistory = new betHistoryModel({
      userId: id,
      userName: user.userName,
      gameId,
      sid,
      price: p,
      betAmount,
      otype,
      xValue: x,
      fancyScore,
      gameType,
      market_id,
      eventName,
      marketName,
      gameName,
      teamName,
    });

    await betHistory.save();

    return res.status(201).json({ message: "Bet placed successfully" });

  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const updateResultOfBets = async (req, res) => {
  const betTypes = [
    { gameType: "Toss", marketName: "Toss" },
    { gameType: "1st 6 over", marketName: "T1st 6 over" },
    { gameType: "Match Odds", marketName: "Match Odds" },
    { gameType: "Tied Match", marketName: "Tied Match" },
    { gameType: "Bookmaker", marketName: "Bookmaker" },
    { gameType: "Bookmaker IPL CUP", marketName: "Bookmaker IPL CUP" },
    { gameType: "OVER_UNDER_05", marketName: "OVER_UNDER_05" },
    { gameType: "OVER_UNDER_15", marketName: "OVER_UNDER_15" },
    { gameType: "OVER_UNDER_25", marketName: "OVER_UNDER_25" },
  ];

  let totalBetsProcessed = 0;

  try {
    for (const { gameType, marketName } of betTypes) {
      const bets = await betModel.find({ status: 0, gameType });

      if (!bets.length) {
        // console.log(`No ${gameType} bets found with status 0`);
        continue;
      }


      // console.log("bets", bets)


      const groupedBets = bets.reduce((acc, bet) => {
        if (!acc[bet.gameId]) acc[bet.gameId] = [];
        acc[bet.gameId].push(bet);
        return acc;
      }, {});

      // console.log("groupedBets", groupedBets)


      for (const gameId of Object.keys(groupedBets)) {
        try {



          for (const bet of groupedBets[gameId]) {



            const user = await SubAdmin.findById(bet.userId);
            if (!user) {
              // console.warn(`User not found for userId ${bet.userId}`);
              continue;
            }


            // try {
            const sid = bet.sid;  // ✅ ensure this is defined

            const response = await axios.post(
              // `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
              `http://130.250.191.174:3009/get-result?key=uniique5557878&sid=${sid}`,
              {
                event_id: Number(bet.gameId),
                event_name: bet.eventName,
                market_id: bet.market_id,
                market_name: bet.marketName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'key': 'uniique5557878'
                },
                withCredentials: true
              }
            );

            const resultData = response.data;
            if (!resultData) {
              continue
            }
            const winner = resultData.final_result?.trim();



            const betTeam = bet.teamName?.trim();
            let winAmount = 0;
            const win = winner && betTeam && winner.toLowerCase() === betTeam.toLowerCase();
            // console.log("win", win)



            // Process bet based on game type and otype
            if (bet.gameType === "Match Odds" || bet.gameType === "Tied Match") {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount + bet.price;
                  user.balance += winAmount;
                  user.avbalance += winAmount;
                  user.profitLoss += winAmount;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                } else {
                  user.profitLoss -= bet.price;
                  user.balance -= bet.price;
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                }
              } else {
                if (win) {
                  user.balance -= bet.price;
                  user.profitLoss -= bet.price;
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount + bet.price;
                  user.balance += winAmount;
                  user.avbalance += winAmount;
                  user.profitLoss += winAmount;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                }
              }
            } else if (bet.gameType === "Bookmaker" || bet.gameType === "Bookmaker IPL CUP") {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount + bet.price;
                  user.balance += winAmount;
                  user.avbalance += winAmount;
                  user.profitLoss += winAmount;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                } else {
                  user.balance -= bet.price;
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                }
              } else {
                if (win) {
                  user.balance -= bet.price;
                  user.profitLoss -= bet.price;
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount + bet.price;
                  user.balance += winAmount;
                  user.avbalance += winAmount;
                  user.profitLoss += winAmount;
                  bet.resultAmount = winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                }
              }
            } else if (bet.gameType === "Toss" || bet.gameType === "1st 6 over") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount;
                bet.betResult = winner
                bet.status = 1;
              } else {
                user.balance -= bet.price;
                user.profitLoss -= bet.price;
                bet.resultAmount = bet.price;
                bet.betResult = winner
                bet.status = 2;
              }
            }

            // bet.resultAmount = winAmount;
            await user.save();
            await bet.save();
            // totalBetsProcessed++;
            continue;
          }
        } catch (err) {
          // console.error(`Error processing gameId ${gameId}:`, err.message);
        }
      }
    }

    // Handle response differently for HTTP vs cron
    if (res && typeof res.status === 'function') {
      return res.status(200).json({
        message: "All bets processed successfully",
        // total: totalBetsProcessed,
      });
    } else {
      // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
      return { success: true, total: totalBetsProcessed };
    }

  } catch (error) {
    console.error("Error in updateResultOfBets:", error);

    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: "Server error" });
    } else {
      throw error; // Let the cron job handle the error
    }
  }
};
export const updateResultOfBetsHistory = async (req, res) => {
  const betTypes = [
    { gameType: "Toss", marketName: "Toss" },
    { gameType: "1st 6 over", marketName: "T1st 6 over" },
    { gameType: "Match Odds", marketName: "Match Odds" },
    { gameType: "Tied Match", marketName: "Tied Match" },
    { gameType: "Bookmaker", marketName: "Bookmaker" },
    { gameType: "Bookmaker IPL CUP", marketName: "Bookmaker IPL CUP" },
    { gameType: "OVER_UNDER_05", marketName: "OVER_UNDER_05" },
    { gameType: "OVER_UNDER_15", marketName: "OVER_UNDER_15" },
    { gameType: "OVER_UNDER_25", marketName: "OVER_UNDER_25" },
  ];

  let totalBetsProcessed = 0;

  try {
    for (const { gameType, marketName } of betTypes) {
      const bets = await betHistoryModel.find({ status: 0, gameType });

      if (!bets.length) {
        // console.log(`No ${gameType} bets found with status 0`);
        continue;
      }

      const groupedBets = bets.reduce((acc, bet) => {
        if (!acc[bet.gameId]) acc[bet.gameId] = [];
        acc[bet.gameId].push(bet);
        return acc;
      }, {});

      for (const gameId of Object.keys(groupedBets)) {
        try {


          for (const bet of groupedBets[gameId]) {
              console.log(`Before: betId=${bet._id}, status=${bet.status}, gameType=${bet.gameType}, team=${bet.teamName}`);
            const user = await SubAdmin.findById(bet.userId);
            if (!user) {
              // console.warn(`User not found for userId ${bet.userId}`);
              continue;
            }


            const sid = bet.sid;  // ✅ ensure this is defined

            const response = await axios.post(
              `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
              {
                event_id: Number(bet.gameId),
                event_name: bet.eventName,
                market_id: bet.market_id,
                market_name: bet.marketName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'key': 'uniique5557878'
                },
                withCredentials: true
              }
            );



            const resultData = response.data;
            if (!resultData) {
              continue
            }
            const winner = resultData.final_result?.trim();



            const betTeam = bet.teamName?.trim();
            let winAmount = 0;
            const win = winner && betTeam && winner.toLowerCase() === betTeam.toLowerCase();
            // console.log("win", win)

            // Process bet based on game type and otype
            if (bet.gameType === "Match Odds" || bet.gameType === "Tied Match") {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;
                  // user.balance += winAmount;
                  // user.avbalance += winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                } else {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                }
              } else {
                if (win) {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;
                  // user.balance += winAmount;
                  // user.avbalance += winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                }
              }
            } else if (gameType === "Bookmaker") {
              if (bet.otype === "back") {
                if (win) {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;

                  // user.balance += winAmount;
                  // user.avbalance += winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                } else {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                }
              } else {
                if (win) {
                  bet.resultAmount = bet.price;
                  bet.betResult = winner
                  bet.status = 2;
                } else {
                  winAmount = bet.betAmount + bet.price;
                  bet.resultAmount = winAmount;
                  // user.balance += winAmount;
                  // user.avbalance += winAmount;
                  bet.betResult = winner
                  bet.status = 1;
                }
              }
            } else if (gameType === "Toss") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                bet.resultAmount = winAmount;
                // user.balance += winAmount;
                // user.avbalance += winAmount;
                bet.betResult = winner
                bet.status = 1;
              } else {
                bet.betResult = winner
                bet.status = 2;
                bet.resultAmount = bet.price;
              }
            }

            // bet.resultAmount = winAmount;
            // await user.save();
            await bet.save();
              console.log(`After: betId=${bet._id}, status=${bet.status}`);
            totalBetsProcessed++;
          }
        } catch (err) {
          // console.error(`Error processing gameId ${gameId}:`, err.message);
        }
      }
    }

    // Handle response differently for HTTP vs cron
    if (res && typeof res.status === 'function') {
      return res.status(200).json({
        message: "All bets processed successfully",
        total: totalBetsProcessed,
      });
    } else {
      // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
      return { success: true, total: totalBetsProcessed };
    }

  } catch (error) {
    console.error("Error in updateResultOfBets:", error);

    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: "Server error" });
    } else {
      throw error; // Let the cron job handle the error
    }
  }
};
export const updateFancyBetResult = async (req, res) => {
  try {
    const betTypes = [
      { gameType: "Normal", marketName: "Toss" },
      { gameType: "meter", marketName: "Match Odds" },
      { gameType: "line", marketName: "Tied Match" },
      { gameType: "ball", marketName: "Bookmaker" },
      { gameType: "khado", marketName: "Bookmaker" },
    ];

    let totalBetsProcessed = 0;

    for (const { gameType, marketName } of betTypes) {
      const bets = await betModel.find({ status: 0, gameType });
      // console.log("bets", bets)

      if (!bets.length) {
        console.log(`No ${gameType} bets found with status 0`);
        continue;
      }

      // Group bets by gameId
      const groupedBets = bets.reduce((acc, bet) => {
        if (!acc[bet.gameId]) acc[bet.gameId] = [];
        acc[bet.gameId].push(bet);
        return acc;
      }, {});

      for (const gameId of Object.keys(groupedBets)) {
        try {



          // console.log("groupedBets[gameId]", groupedBets[gameId])



          for (const bet of groupedBets[gameId]) {

            // console.log("bets", bet)



            const sid = bet.sid;  // ✅ ensure this is defined

            const response = await axios.post(
              `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
              {
                event_id: Number(bet.gameId),
                event_name: bet.eventName,
                market_id: bet.market_id,
                market_name: bet.marketName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'key': 'uniique5557878'
                },
                withCredentials: true
              }
            );


            const resultData = response.data;
            if (!resultData) {
              continue
            }


            console.log("resultData", resultData)


            const fancyScore = bet.fancyScore;
            const score = resultData.final_result;

            const win = score && fancyScore && fancyScore >= score;
            console.log("winnn", win)


            const betTeam = bet.teamName?.trim();
            let winAmount = 0;


            // console.log("result responce", response)



            const user = await SubAdmin.findById(bet.userId);

            if (!user) {
              // console.warn(`User not found for userId ${bet.userId}`);
              continue;
            }





            // Process bet based on otype
            if (bet.otype === "back") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.profitLoss += winAmount;
                user.exposure -= bet.price; // Adjust exposure
                bet.resultAmount = winAmount;
                bet.betResult = score
                bet.status = 1; // Mark as won
              } else {
                user.balance -= bet.price;
                user.profitLoss -= bet.price;
                user.exposure -= bet.price; // Adjust exposure
                bet.resultAmount = bet.price;
                bet.betResult = score
                bet.status = 2; // Mark as lost
              }
            } else {
              if (win) {
                user.balance -= bet.price;
                user.profitLoss -= bet.price;
                user.exposure -= bet.price; // Adjust exposure
                bet.resultAmount = bet.price;
                bet.betResult = score
                bet.status = 2; // Mark as lost (for lay bets)
              } else {
                winAmount = bet.betAmount + bet.price;
                user.balance += winAmount;
                user.avbalance += winAmount;
                user.exposure -= bet.price; // Adjust exposure
                user.profitLoss += winAmount;
                bet.resultAmount = winAmount;
                bet.betResult = score
                bet.status = 1; // Mark as won (for lay bets)
              }
            }

            // bet.resultAmount = winAmount;
            await user.save();
            await bet.save();
            totalBetsProcessed++;
          }
        } catch (err) {
          // console.error(`Error processing gameId ${gameId}:`, err.message);
        }
      }
    }

    // Handle response differently for cron vs HTTP
    if (res && typeof res.status === 'function') {
      return res.status(200).json({
        message: "All bets processed successfully",
        total: totalBetsProcessed,
      });
    } else {
      // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
      return { total: totalBetsProcessed };
    }
  } catch (error) {
    console.error("Error in updateFancyBetResult:", error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: "Server error" });
    }
    throw error; // Let the cron job handle the error
  }
};
export const updateFancyBetHistory = async (req, res) => {
  try {
    const betTypes = [
      { gameType: "Normal", marketName: "Toss" },
      { gameType: "meter", marketName: "Match Odds" },
      { gameType: "line", marketName: "Tied Match" },
      { gameType: "ball", marketName: "Bookmaker" },
      { gameType: "khado", marketName: "Bookmaker" },
    ];

    let totalBetsProcessed = 0;

    for (const { gameType, marketName } of betTypes) {
      const bets = await betHistoryModel.find({ status: 0, gameType });

      if (!bets.length) {
        // console.log(`No ${gameType} bets found with status 0`);
        continue;
      }

      // Group bets by gameId
      const groupedBets = bets.reduce((acc, bet) => {
        if (!acc[bet.gameId]) acc[bet.gameId] = [];
        acc[bet.gameId].push(bet);
        return acc;
      }, {});

      for (const gameId of Object.keys(groupedBets)) {
        try {
          // const response = await axios.get(`https://api.cricketid.xyz/v2/result?key=uniique5557878&gmid=${gameId}&sid=4`);
          // const resultData = response.data;

          for (const bet of groupedBets[gameId]) {




            const sid = bet.sid;  // ✅ ensure this is defined

            const response = await axios.post(
              `https://api.cricketid.xyz/get-result?key=uniique5557878&sid=${sid}`,
              {
                event_id: Number(bet.gameId),
                event_name: bet.eventName,
                market_id: bet.market_id,
                market_name: bet.marketName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'key': 'uniique5557878'
                },
                withCredentials: true
              }
            );


            const resultData = response.data;
            if (!resultData) {
              continue
            }


            console.log("resultData", resultData)


            const fancyScore = bet.fancyScore;
            const score = resultData.final_result;

            const win = score && fancyScore && fancyScore >= score;
            console.log("winnn", win)


            const betTeam = bet.teamName?.trim();
            let winAmount = 0;


            // console.log("result responce", response)



            const user = await SubAdmin.findById(bet.userId);

            if (!user) {
              // console.warn(`User not found for userId ${bet.userId}`);
              continue;
            }
            ;

            // Process bet based on otype
            if (bet.otype === "back") {
              if (win) {
                winAmount = bet.betAmount + bet.price;
                bet.resultAmount = winAmount;
                // user.balance += winAmount;
                // user.avbalance += winAmount;
                bet.betResult = score
                bet.status = 1; // Mark as won
              } else {
                bet.resultAmount = bet.price;
                bet.betResult = score
                bet.status = 2; // Mark as lost
              }
            } else {
              if (win) {
                bet.resultAmount = bet.price;
                bet.betResult = score
                bet.status = 2; // Mark as lost (for lay bets)
              } else {
                winAmount = bet.betAmount + bet.price;
                bet.resultAmount = winAmount;
                // user.balance += winAmount;
                // user.avbalance += winAmount;
                bet.betResult = score
                bet.status = 1; // Mark as won (for lay bets)
              }
            }


            await user.save();
            await bet.save();
            totalBetsProcessed++;
          }
        } catch (err) {
          // console.error(`Error processing gameId ${gameId}:`, err.message);
        }
      }
    }

    // Handle response differently for cron vs HTTP
    if (res && typeof res.status === 'function') {
      return res.status(200).json({
        message: "All bets processed successfully",
        total: totalBetsProcessed,
      });
    } else {
      // console.log(`Cron job completed: Processed ${totalBetsProcessed} bets`);
      return { total: totalBetsProcessed };
    }
  } catch (error) {
    console.error("Error in updateFancyBetResult:", error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ message: "Server error" });
    }
    throw error; // Let the cron job handle the error
  }
};

export const getPendingBets = async (req, res) => { 
  const { id } = req;
  let { gameId } = req.query;

  try {
    const query = {
      userId: id,
      status: 0,
    };

    // Only add gameId if it's not the string "undefined"
    if (gameId && gameId !== "undefined") {
      query.gameId = gameId;
    }

    // console.log("Built Query =>", query);

    const bets = await betHistoryModel.find(query).sort({ createdAt: -1 });

    // console.log("Fetched Bets =>", bets);

    return res.status(200).json({ data: bets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPendingBetsAmounts = async (req, res) => {
  const { id } = req;
  const { gameId } = req.query;

  try {
    const betTypes = [
      { gameType: "Toss", marketName: "Toss" },
      { gameType: "Match Odds", marketName: "Match Odds" },
      { gameType: "Tied Match", marketName: "Tied Match" },
      { gameType: "Bookmaker", marketName: "Bookmaker" },
      { gameType: "Normal", marketName: "Toss" },
      { gameType: "meter", marketName: "Match Odds" },
      { gameType: "line", marketName: "Tied Match" },
      { gameType: "ball", marketName: "Bookmaker" },
      { gameType: "khado", marketName: "Bookmaker" },
      { gameType: "Winner", marketName: "Winner" },
      { gameType: "OVER_UNDER_05", marketName: "OVER_UNDER_05" },
      { gameType: "OVER_UNDER_15", marketName: "OVER_UNDER_15" },
      { gameType: "OVER_UNDER_25", marketName: "OVER_UNDER_25" },
    ];

    const validGameTypes = betTypes.map(bt => bt.gameType);

    const bets = await betModel.find({
      userId: id,
      status: 0,
      gameId,
      gameType: { $in: validGameTypes },
    }).sort({ createdAt: -1 });

    // Group by gameType + teamName
    const grouped = {};

    for (const bet of bets) {
      const key = `${bet.gameType}|${bet.teamName}`;
      if (!grouped[key]) {
        grouped[key] = {
          gameType: bet.gameType,
          teamName: bet.teamName,
          otype: bet.otype,
          totalBetAmount: bet.betAmount,
          totalPrice: bet.price,
        };
      }

      // grouped[key].totalBetAmount += Number(bet.betAmount);
      // grouped[key].totalPrice += Number(bet.price);
    }



    const result = Object.values(grouped);

    // console.log("result", bets)

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBetHistory = async (req, res) => {
  const { id } = req; // Assuming id comes from auth middleware
  const { page = 1, limit = 10, startDate, endDate, selectedGame, selectedVoid } = req.query;
  // console.log("req.query", req.query);


  try {
    const query = { userId: id };

    // Filter by date if both start and end dates are provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Filter by selectedGame if provided
    if (selectedGame) {
      query.gameName = selectedGame;
    }

    // Filter by selectedVoid if provided
    if (selectedVoid === "settel") {
      query.status = { $ne: 0 }; // Not equal to 0 (settled bets)
    } else if (selectedVoid === "void") {
      query.status = 1; // Voided bets (status = 1)
    } else if (selectedVoid === "unsettle") {
      query.status = 0; // Unsettled bets (status = 0)
    }

    const bets = await betHistoryModel
      .find(query)
      .sort({ date: -1 }) // most recent first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));



    const total = await betHistoryModel.countDocuments(query);


    res.status(200).json({
      success: true,
      data: bets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bet history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfitlossHistory = async (req, res) => {
  const { id } = req; // User ID from auth middleware
  const {
    startDate,
    endDate,
    page = 1,
    limit = 10,
    eventName,
    gameName,
    marketName
  } = req.query;

  // const gameName = "Cricket Game"

  // console.log("req.query", req.query);


  try {
    // 1. Validate and parse inputs
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // 2. Build the base query
    const betQuery = {
      userId: id,
      status: { $in: [1, 2] } // Only settled bets (1=win, 2=loss)
    };

    // 3. Apply filters
    // Date filters


    if (startDate && endDate) {
      betQuery.date = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }



    // Apply filters if provided
    if (gameName) betQuery.gameName = gameName;
    if (eventName) betQuery.eventName = eventName;
    if (marketName) betQuery.marketName = marketName;

    const fullFilterMode = gameName && eventName && marketName;


    // 5. Retrieve bets with pagination
    const bets = await betModel
      .find(betQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    // console.log("bets", bets)


    // 6. Handle full filter mode (return raw data without calculations)
    if (fullFilterMode) {
      return res.status(200).json({
        success: true,
        data: {
          report: bets,
          total: {
            totalBets: bets.length,
            totalWinAmount: bets.filter(b => b.status === 1).reduce((sum, b) => sum + (b.resultAmount || 0), 0),
            totalLossAmount: bets.filter(b => b.status === 2).reduce((sum, b) => sum + (b.resultAmount || 0), 0)
          }
        }
      });
    }


    // 7. Existing grouping logic for partial filters
    let groupKey = "gameName";
    if (gameName && !eventName && !marketName) {
      groupKey = "eventName";
    } else if (gameName && eventName && !marketName) {
      groupKey = "marketName";
    }

    // console.log("bets", bets);


    const reportMap = {};

    for (const bet of bets) {
      const key = bet[groupKey]?.trim() || "Unknown";
      if (!reportMap[key]) {
        reportMap[key] = {
          name: key,
          eventName: bet.eventName,
          gameName: bet.gameName,
          marketName: bet.marketName,
          userName: bet.userName,
          gameName: bet.gameName,
          date: bet.createdAt,
          teamName: bet.teamName,
          WinAmount: 0,
          LossAmount: 0,
          myProfit: 0
        };
      }

      if (bet.status === 1) {
        reportMap[key].WinAmount += bet.resultAmount || 0;
      } else if (bet.status === 2) {
        reportMap[key].LossAmount += bet.resultAmount || 0;
      }
      reportMap[key].myProfit = reportMap[key].WinAmount - reportMap[key].LossAmount;
    }




    // 4. Get paginated bets and totals in parallel
    const reportArray = Object.values(reportMap);
    const total = reportArray.reduce(
      (acc, curr) => ({
        name: "Total",
        WinAmount: acc.WinAmount + curr.WinAmount,
        LossAmount: acc.LossAmount + curr.LossAmount,
        myProfit: acc.myProfit + curr.myProfit
      }),
      { name: "Total", WinAmount: 0, LossAmount: 0, myProfit: 0 }
    );

    console.log("reportArray", reportArray);

    return res.status(200).json({
      success: true,
      data: {
        report: reportArray,
        total
      }
    });


  } catch (error) {
    console.error("getMyReportByEvents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactionHistoryByUserAndDate = async (req, res) => {
  try {
    const { id } = req; // Make sure this is getting the correct user ID
    const { startDate, endDate, page, limit } = req.query;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const filter = {
      userId: id,
    };

    // Add date filtering if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Add one day to end date to include all transactions on that day
      end.setDate(end.getDate() + 1);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    console.log('Final filter:', filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Found transactions:', transactions.length);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
