import React, { useEffect, useState } from "react";
import AgentCard from "./components/AgentCard"; // Adjust path if needed
import AllCards from "../data/AllCards"; // Adjust path if needed
import ShuffleCard from "./GameProccess/ShuffleCard";
import "./index.css"; // Make sure you import your CSS file with Tailwind directives

function App() {
  const [playerCards, setPlayerCards] = useState([]);
  const [aiCards, setAiCards] = useState([]);

  const [turn, setTurn] = useState("");

  const [selectedStat, setSelectedStat] = useState(null);
  const [roundResult, setRoundResult] = useState("");

  // Game starts during comp about to render.
  useEffect(() => {
    const startGame = () => {
      const { PlayerCards, AICards, firstTurn } = ShuffleCard(AllCards);

      setPlayerCards(PlayerCards);
      setAiCards(AICards);
      setTurn(firstTurn);
      setSelectedStat(null);
      setRoundResult("");
    };

    startGame();
  }, []);

  // this will run when the turn state will change!
  useEffect(() => {
    if (turn === "AI" && !selectedStat) {
      setTimeout(() => {
        const currentAiCard = aiCards[0];

        // 1. Saare stats ke naam nikalo (e.g., ['damage', 'utility', 'mobility', 'control'])
        const statKeys = Object.keys(currentAiCard.stats);

        // 2. Ek random number chuno (0, 1, 2, ya 3)
        const randomStatIndex = Math.floor(Math.random() * statKeys.length);

        // 3. Uss random number se stat ka naam chuno
        const randomStatKey = statKeys[randomStatIndex]; // e.g., 'utility'

        setSelectedStat(randomStatKey);
        compareCards(randomStatKey);
      }, 1500);
    }
  }, [turn, selectedStat, aiCards]);

  const compareCards = (stateKey) => {
    const playerCard = playerCards[0];
    const aiCard = aiCards[0];
    // ----
    const playerStat = playerCard.stats[stateKey];
    const aiStat = aiCard.stats[stateKey];
    // ----
    let newPlayerCards = [...playerCards];
    let newAiCards = [...aiCards];

    const playerCardPlayed = newPlayerCards.shift();
    const aiCardPlayed = newAiCards.shift();

    let winner = "";
    let nextTurn = "";

    if (playerStat > aiStat) {
      newPlayerCards.push(playerCardPlayed, aiCardPlayed);
      setRoundResult("PlayerWins");
      nextTurn = "Player";
      winner = "Player";
    } else if (aiStat > playerStat) {
      newAiCards.push(aiCardPlayed, playerCardPlayed);
      setRoundResult("AI Wins!");
      nextTurn = "AI";
      winner = "AI";
    } else {
      newPlayerCards.push(playerCardPlayed); // Player ka card wapas uske deck mein
      newAiCards.push(aiCardPlayed); // AI ka card wapas uske deck mein
      setRoundResult("Draw!");
      nextTurn = turn; // Jiska turn tha, usi ka rahega
      winner = "Draw";
    }
    setTimeout(() => {
      setPlayerCards(newPlayerCards);
      setAiCards(newAiCards);

      setTurn(nextTurn);
      setSelectedStat(null);
      setRoundResult("");

      if (newPlayerCards.length === 0) {
        alert("Game Over! AI Wins!");
        // Yahaan game restart kar sakte ho
      } else if (newAiCards.length === 0) {
        alert("Game Over! Player Wins!");
      }
    }, 2500);
  };

  const handleStatSelect = (stateKey) => {
    if (turn !== "Player" || selectedStat) return;
    setSelectedStat(stateKey);

    compareCards(stateKey);
  };

  if (playerCards.length === 0 || aiCards.length === 0) {
    return <div>Loading Game...</div>;
  }

  const playerCurrentCard = playerCards[0];
  const aiCurrentCard = aiCards[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-4">
      <div className="player-ai flex items-center justify-between w-full fixed z-[999] p-[20px] bg-gray-900">
        <div style={{ color: "blue" }}>
          <strong>Player Cards: {playerCards.length}</strong>
        </div>
        {/* --- TURN INDICATOR --- */}
        <div className="text-1xl" style={{ textAlign: "center"}}>
          {turn === "Player" && !selectedStat && (
            <h2 style={{ color: "blue" }}>Your Turn</h2>
          )}
          {turn === "AI" && !selectedStat && (
            <h2 style={{ color: "red" }}>AI's Turn...</h2>
          )}
          {selectedStat && <h2>{roundResult || "Comparing..."}</h2>}
        </div>
        <div style={{ color: "red" }}>
          <strong>AI Cards: {aiCards.length}</strong>
        </div>
      </div>

      {/* --- CARD GRID --- */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20">
        {/* Player Card */}
        <AgentCard
          key={playerCurrentCard.uuid}
          agent={playerCurrentCard}
          isPlayerCard={true} // Taki yeh clickable ho
          onStatSelect={handleStatSelect} // Hamara function pass kiya
          selectedStat={selectedStat} // Kaunsa stat selected hai
          showStats={true} // Stats hamesha dikhao
        />

        {/* AI Card */}
        <AgentCard
          key={aiCurrentCard.uuid}
          agent={aiCurrentCard}
          isPlayerCard={false} // Yeh clickable nahi hoga
          selectedStat={selectedStat}
          // AI ke stats tabhi dikhao jab stat select ho chuka ho
          showStats={selectedStat !== null}
        />
      </main>
    </div>
  );
}

export default App;
