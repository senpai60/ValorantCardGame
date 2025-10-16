import React from 'react';
import AgentCard from './components/AgentCard'; // Adjust path if needed
import AllCards from '../data/AllCards';       // Adjust path if needed
import './index.css'; // Make sure you import your CSS file with Tailwind directives

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 md:p-12">
      
      {/* --- Header --- */}
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter" style={{ textShadow: '0 0 20px #FF4655' }}>
          Agent Roster
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Select your agent.
        </p>
      </header>

      {/* --- Card Grid --- */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {AllCards.map((agent, index) => (
          <AgentCard
            key={agent.uuid}
            agent={agent}
            
            // You can experiment with other props here.
            // For example, to make the first card the "Player Card":
            // isPlayerCard={index === 0}

            // To demonstrate a winner/loser:
            // isWinner={agent.name === 'Jett'}
            // isLoser={agent.name === 'Phoenix'}
          />
        ))}
      </main>
      
    </div>
  );
}

export default App;