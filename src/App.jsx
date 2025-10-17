import React, { useEffect, useMemo, useState } from "react";
import AgentCard from "./components/AgentCard";
import AllCards from "../data/AllCards";
import ShuffleCard from "./GameProccess/ShuffleCard";
import "./index.css";

// ===================================================================================
// --- DECORATIVE ICONS (SVG) ---
// ===================================================================================
const MuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);
const UnmuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);


function App() {
  // ===================================================================================
  // --- AUDIO SETUP ---
  // useMemo() ensures that audio files are loaded only once, preventing bugs.
  // ===================================================================================
  const lostSound = useMemo(() => new Audio("sounds/lost.mp3"), []);
  const shot1 = useMemo(() => new Audio("sounds/r1.mp3"), []);
  const shot2 = useMemo(() => new Audio("sounds/r2.mp3"), []);
  const shot3 = useMemo(() => new Audio("sounds/r3.mp3"), []);
  const shot4 = useMemo(() => new Audio("sounds/r4.mp3"), []);
  const shot5 = useMemo(() => new Audio("sounds/r5.mp3"), []);
  const themeMusic = useMemo(() => {
    const audio = new Audio("sounds/theme1.mp3");
    audio.loop = true; // Theme music ko loop par set kiya
    audio.volume = 0.3; // Volume thoda kam rakha
    return audio;
  }, []);


  // ===================================================================================
  // --- GAME STATE MANAGEMENT ---
  // ===================================================================================
  const [playerCards, setPlayerCards] = useState([]);
  const [aiCards, setAiCards] = useState([]);
  const [turn, setTurn] = useState("");
  const [winStreak, setWinStreak] = useState(0);
  const [selectedStat, setSelectedStat] = useState(null);
  const [roundResult, setRoundResult] = useState("");
  // ✅ FIX: Default state ko 'true' kar diya taaki music shuru se ON rahe
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [gameState, setGameState] = useState('pre-game'); // 'pre-game', 'playing', 'round-end', 'game-over'


  // ===================================================================================
  // --- CORE GAME LOGIC ---
  // ===================================================================================

  // Function to start or reset the game
  const startGame = () => {
    const { PlayerCards, AICards, firstTurn } = ShuffleCard(AllCards);
    setPlayerCards(PlayerCards);
    setAiCards(AICards);
    setTurn(firstTurn);
    setSelectedStat(null);
    setRoundResult("");
    setWinStreak(0);
    setGameState('playing');
    console.clear(); // Console saaf karo
    console.log(`%c[GAME START] First turn is for: ${firstTurn}`, "color: #00ff00; font-weight: bold;");
  };

  // ✅ NEW: Yeh useEffect music ko control karega
  // Jab game 'playing' state mein aayega aur music ON hoga, tab play karega.
  useEffect(() => {
    if (gameState === 'playing' && isMusicPlaying) {
      themeMusic.play().catch(e => console.error("Music autoplay was blocked by browser."));
    } else {
      themeMusic.pause();
    }
    
    // Cleanup function: Jab component band ho toh music pause ho jaaye
    return () => {
      themeMusic.pause();
    }
  }, [gameState, isMusicPlaying, themeMusic]);

  // AI's turn logic: Runs whenever it's AI's turn
  useEffect(() => {
    if (turn === "AI" && !selectedStat && gameState === 'playing') {
      // DEBUG LOG: AI ka turn start hua
      console.log(`%c[AI TURN] AI is thinking...`, "color: #ff4d4d;");

      setTimeout(() => {
        const currentAiCard = aiCards[0];
        const statKeys = Object.keys(currentAiCard.stats);
        const randomStatIndex = Math.floor(Math.random() * statKeys.length);
        const randomStatKey = statKeys[randomStatIndex];

        // DEBUG LOG: AI ne kya stat chuna
        console.log(`%c[AI TURN] AI chose the stat: ${randomStatKey}`, "color: #ff4d4d; font-weight: bold;");

        setSelectedStat(randomStatKey);
        compareCards(randomStatKey);
      }, 1500);
    }
  }, [turn, selectedStat, aiCards, gameState]);


  // Player's turn logic: Called when player clicks a stat
  const handleStatSelect = (statKey) => {
    if (turn !== "Player" || selectedStat) return;

    // DEBUG LOG: Player ne kya stat chuna
    console.log(`%c[PLAYER TURN] Player chose the stat: ${statKey}`, "color: #4d94ff; font-weight: bold;");
    setSelectedStat(statKey);
    compareCards(statKey);
  };


  // Card Comparison Logic: The heart of the game
  const compareCards = (statKey) => {
    setGameState('round-end'); // Round comparison shuru

    const playerCard = playerCards[0];
    const aiCard = aiCards[0];
    const playerStat = playerCard.stats[statKey];
    const aiStat = aiCard.stats[statKey];

    let newPlayerCards = [...playerCards];
    let newAiCards = [...aiCards];
    const playerCardPlayed = newPlayerCards.shift();
    const aiCardPlayed = newAiCards.shift();
    let nextTurn = "";
    let result = "";


    // DEBUG LOG: Round ka comparison details
    console.log("--------------------------------");
    console.log(`[ROUND] Comparing stat: ${statKey.toUpperCase()}`);
    console.log(`[ROUND] Player's ${playerCard.name}: ${playerStat}`);
    console.log(`[ROUND] AI's ${aiCard.name}: ${aiStat}`);
    

    if (playerStat > aiStat) {
      setWinStreak((prevStreak) => prevStreak + 1);
      newPlayerCards.push(playerCardPlayed, aiCardPlayed);
      result = "Player Wins";
      nextTurn = "Player";
    } else if (aiStat > playerStat) {
      lostSound.play();
      setWinStreak(0);
      newAiCards.push(aiCardPlayed, playerCardPlayed);
      result = "AI Wins";
      nextTurn = "AI";
    } else {
      newPlayerCards.push(playerCardPlayed);
      newAiCards.push(aiCardPlayed);
      result = "Draw";
      nextTurn = turn;
    }

    setRoundResult(result);
     // DEBUG LOG: Round ka result
    console.log(`%c[RESULT] ${result}! Next turn for: ${nextTurn}`, "color: #ffff00; font-weight: bold;");


    // Next round ke liye setup
    setTimeout(() => {
      if (newPlayerCards.length === 0) {
        setRoundResult("GAME OVER: AI WINS!");
        setGameState('game-over');
      } else if (newAiCards.length === 0) {
        setRoundResult("GAME OVER: YOU WIN!");
        setGameState('game-over');
      } else {
         setPlayerCards(newPlayerCards);
         setAiCards(newAiCards);
         setTurn(nextTurn);
         setSelectedStat(null);
         setRoundResult("");
         setGameState('playing');
         console.log("--------------------------------\n[NEXT ROUND] Waiting for turn...");
      }
    }, 3000); // Wait time thoda badhaya taaki result aaram se dikhe
  };


  // Sound playing logic for win streak
  useEffect(() => {
    if (winStreak === 0) return;

    const allShots = [shot1, shot2, shot3, shot4, shot5];
    allShots.forEach(shot => {
      shot.pause();
      shot.currentTime = 0;
    });

    // DEBUG LOG: Win streak sound
    console.log(`%c[SOUND] Playing sound for Win Streak: ${winStreak}`, "color: #ff9933;");

    switch (winStreak) {
      case 1: shot1.play(); break;
      case 2: shot2.play(); break;
      case 3: shot3.play(); break;
      case 4: shot4.play(); break;
      case 5: shot5.play(); break;
      case 6: 
        shot5.play(); // ACE ke liye bhi 5th sound play kar rahe hain
        console.log("%c[STREAK] ACE! Streak reset.", "color: orange; font-weight: bold;");
        setWinStreak(0); // Reset streak here
        break;
      default: break;
    }
  }, [winStreak, shot1, shot2, shot3, shot4, shot5]);


  // Music toggle function
  const toggleMusic = () => {
    // Sirf state ko toggle karo. useEffect baaki kaam karega.
    setIsMusicPlaying(prevState => !prevState);
  };


  // ===================================================================================
  // --- RENDER LOGIC ---
  // ===================================================================================
  
  // Pre-Game Screen: User ko start karne ke liye
  if (gameState === 'pre-game') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-8">
        <h1 className="text-6xl font-black text-red-500" style={{ textShadow: '0 0 20px #FF4655' }}>VALORANT WARS</h1>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-500 transition-all shadow-lg shadow-red-500/50"
        >
          Start Game
        </button>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'game-over') {
    return (
       <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-8">
        <h1 className="text-6xl font-black text-yellow-400 animate-pulse">{roundResult}</h1>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-500 transition-all"
        >
          Play Again
        </button>
      </div>
    )
  }

  const playerCurrentCard = playerCards[0];
  const aiCurrentCard = aiCards[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-4">
      <div className="player-ai flex items-center justify-between w-full fixed z-[999] p-[20px] bg-gray-900/80 backdrop-blur-sm top-0 left-0">
        <div className="text-blue-400">
          <strong className="text-xl">PLAYER CARDS: {playerCards.length}</strong>
        </div>
        <div className="text-xl text-center">
          {gameState === 'playing' && turn === "Player" && <h2 className="text-blue-400 font-bold animate-pulse">YOUR TURN</h2>}
          {gameState === 'playing' && turn === "AI" && <h2 className="text-red-400 font-bold">AI's TURN...</h2>}
          {gameState === 'round-end' && <h2 className="text-yellow-400 font-bold">{roundResult}!</h2>}
        </div>
        <div className="text-red-400">
          <strong className="text-xl">AI CARDS: {aiCards.length}</strong>
        </div>
      </div>
      
      {/* Music Toggle Button */}
      <button onClick={toggleMusic} className="fixed bottom-4 right-4 bg-gray-800 p-3 rounded-full z-[999] hover:bg-gray-700 transition-colors">
        {isMusicPlaying ? <UnmuteIcon /> : <MuteIcon />}
      </button>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20">
        <AgentCard
          key={playerCurrentCard.uuid}
          agent={playerCurrentCard}
          isPlayerCard={true}
          onStatSelect={handleStatSelect}
          selectedStat={selectedStat}
          showStats={true}
          isWinner={gameState === 'round-end' && roundResult === 'Player Wins'}
          isLoser={gameState === 'round-end' && roundResult === 'AI Wins'}
        />
        <AgentCard
          key={aiCurrentCard.uuid}
          agent={aiCurrentCard}
          isPlayerCard={false}
          selectedStat={selectedStat}
          showStats={gameState === 'round-end'}
          isWinner={gameState === 'round-end' && roundResult === 'AI Wins'}
          isLoser={gameState === 'round-end' && roundResult === 'Player Wins'}
        />
      </main>
    </div>
  );
}

export default App;

