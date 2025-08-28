'use client'
import React, { useState, useEffect } from 'react';
import { Pizza, Users, Trophy, QrCode, Wifi, WifiOff } from 'lucide-react';

const PizzaVotingApp = () => {
  const [votes, setVotes] = useState({
    pepperoni: 0,
    margherita: 0,
    hawaiian: 0,
    veggie: 0,
    meatLovers: 0
  });

  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // 🎯 CUSTOMIZE YOUR PIZZAS HERE! 🎯
  const pizzaOptions = [
    { id: 'pepperoni', name: 'Pepperonii', emoji: '🍕', color: 'bg-red-500' },
    { id: 'margherita', name: 'Margherita', emoji: '🍅', color: 'bg-green-500' },
    { id: 'hawaiian', name: 'Hawaii', emoji: '🍍', color: 'bg-yellow-500' },
    { id: 'veggie', name: 'Vegán Különleges', emoji: '🥬', color: 'bg-emerald-500' },
    { id: 'meatLovers', name: 'Hús Imádó', emoji: '🥓', color: 'bg-orange-500' }
  ];

  // 🔥 REAL-TIME FUNCTIONALITY 🔥
  // This simulates a real-time database connection
  // In production, replace this with Firebase, Supabase, or Socket.io
  
  const API_ENDPOINT = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID'; // Replace with your endpoint
  
  // Load votes from server
  const loadVotes = async () => {
    try {
      // For demo purposes, we'll use localStorage as a "database"
      // In production, this would be a real API call
      const savedVotes = localStorage.getItem('pizzaVotes');
      if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes);
        setVotes(parsedVotes.votes || votes);
        setLastUpdate(Date.now());
      }
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to load votes:', error);
      setIsConnected(false);
    }
  };

  // Save votes to server
  const saveVotes = async (newVotes) => {
    try {
      // For demo purposes, we'll use localStorage as a "database"
      // In production, this would be a real API call
      const voteData = {
        votes: newVotes,
        timestamp: Date.now()
      };
      localStorage.setItem('pizzaVotes', JSON.stringify(voteData));
      
      // Broadcast to other tabs/windows (simulates real-time updates)
      window.dispatchEvent(new CustomEvent('votesUpdated', { detail: newVotes }));
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to save votes:', error);
      setIsConnected(false);
    }
  };

  // Listen for real-time updates
  useEffect(() => {
    // Load initial votes
    loadVotes();

    // Listen for updates from other tabs/windows
    const handleVotesUpdate = (event) => {
      setVotes(event.detail);
      setLastUpdate(Date.now());
    };

    // Listen for storage changes (other tabs voting)
    const handleStorageChange = (event) => {
      if (event.key === 'pizzaVotes') {
        loadVotes();
      }
    };

    window.addEventListener('votesUpdated', handleVotesUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Poll for updates every 2 seconds (simulates real-time)
    const interval = setInterval(loadVotes, 2000);

    return () => {
      window.removeEventListener('votesUpdated', handleVotesUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleVote = async (pizzaId) => {
    if (hasVoted) return;
    
    const newVotes = {
      ...votes,
      [pizzaId]: votes[pizzaId] + 1
    };
    
    setVotes(newVotes);
    setHasVoted(true);
    
    // Save to "database"
    await saveVotes(newVotes);
    
    // Show thank you message for 2 seconds, then show results
    setTimeout(() => {
      setShowResults(true);
    }, 2000);
  };

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const winner = Object.entries(votes).reduce((a, b) => votes[a[0]] > votes[b[0]] ? a : b)[0];

  const resetVoting = async () => {
    const resetVotes = {
      pepperoni: 0,
      margherita: 0,
      hawaiian: 0,
      veggie: 0,
      meatLovers: 0
    };
    
    setVotes(resetVotes);
    setHasVoted(false);
    setShowResults(false);
    
    // Save reset state to "database"
    await saveVotes(resetVotes);
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className={`flex items-center text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 mr-1" />
          <span>Élő kapcsolat</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 mr-1" />
          <span>Kapcsolat megszakadt</span>
        </>
      )}
    </div>
  );

  if (hasVoted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="animate-bounce mb-6">
            <Pizza className="w-24 h-24 text-orange-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Köszönjük a szavazást! 🎉</h2>
          <p className="text-lg text-gray-600">A szavazatod beszámítottuk!</p>
          <div className="mt-6 animate-pulse">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
          <div className="mt-4">
            <ConnectionStatus />
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Pizza Szavazás Eredményei! 🏆</h1>
              <p className="text-xl text-gray-600">Összes szavazat: {totalVotes}</p>
              <div className="mt-2">
                <ConnectionStatus />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {pizzaOptions
                .sort((a, b) => votes[b.id] - votes[a.id])
                .map((pizza, index) => {
                  const percentage = totalVotes > 0 ? (votes[pizza.id] / totalVotes) * 100 : 0;
                  const isWinner = pizza.id === winner && votes[pizza.id] > 0;
                  
                  return (
                    <div 
                      key={pizza.id} 
                      className={`p-4 rounded-2xl border-2 transition-all duration-500 ${
                        isWinner ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {isWinner && <Trophy className="w-6 h-6 text-yellow-500 mr-2" />}
                          <span className="text-2xl mr-3">{pizza.emoji}</span>
                          <span className={`font-bold text-lg ${isWinner ? 'text-yellow-700' : 'text-gray-800'}`}>
                            #{index + 1} {pizza.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-xl ${isWinner ? 'text-yellow-700' : 'text-gray-800'}`}>
                            {votes[pizza.id]} szavazat
                          </div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            isWinner ? 'bg-yellow-500' : pizza.color
                          }`}
                          style={{width: `${percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {totalVotes > 0 && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl mb-6">
                  <h2 className="text-2xl font-bold mb-2">🎉 A győztes... 🎉</h2>
                  <div className="text-4xl font-bold">
                    {pizzaOptions.find(p => p.id === winner)?.emoji} {pizzaOptions.find(p => p.id === winner)?.name}!
                  </div>
                  <p className="text-lg mt-2">Ideje megrendelni a finom pizzát! 🍕</p>
                </div>
                <button 
                  onClick={resetVoting}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
                >
                  Új Szavazás
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Pizza className="w-20 h-20 text-orange-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Pizza Szavazás Ideje! 🍕</h1>
            <p className="text-xl text-gray-600">Válaszd ki a kedvenc pizzádat ebédre!</p>
            <div className="flex items-center justify-center mt-4 text-gray-500">
              <Users className="w-5 h-5 mr-2" />
              <span>{totalVotes} szavazat eddig</span>
            </div>
            <div className="mt-2">
              <ConnectionStatus />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pizzaOptions.map((pizza) => (
              <div 
                key={pizza.id}
                onClick={() => handleVote(pizza.id)}
                className="group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-400 transition-colors duration-200">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">
                      {pizza.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pizza.name}</h3>
                    <div className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200">
                      Szavazok! 🗳️
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalVotes > 0 && (
            <div className="text-center">
              <button 
                onClick={() => setShowResults(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl mr-4 transition-colors duration-200"
              >
                Eredmények 📊
              </button>
              <button 
                onClick={resetVoting}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
              >
                Nullázás 🔄
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <QrCode className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Valós Idejű Szavazás:</h3>
          </div>
          <div className="space-y-2 text-gray-600">
            <p><strong>🔥 Demo verzió:</strong> Ez a verzió localStorage-t használ a szavazatok tárolására.</p>
            <p><strong>📱 Több eszköz:</strong> Nyiss meg több böngésző tabot és szavazz - látni fogod az élő frissítéseket!</p>
            <p><strong>🚀 Éles verzióhoz:</strong> Használj Firebase, Supabase vagy Socket.io-t valós real-time funkcionalitásért.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <PizzaVotingApp />;
}
