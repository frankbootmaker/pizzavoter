'use client'
import React, { useState, useEffect } from 'react';
import { Pizza, Users, Trophy, QrCode, Wifi, WifiOff } from 'lucide-react';
import { db, auth } from './firebase-config';
import { collection, onSnapshot, doc, updateDoc, increment, writeBatch, getDocs, arrayUnion, runTransaction, getDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

interface Pizza {
  id: string;
  name: string;
  emoji: string;
  color: string;
  votes: number;
  voters: string[];
}


const getHexColor = (tailwindColor) => {
    const colorMap = {
        'bg-red-500': '#EF4444',
        'bg-green-500': '#22C55E',
        'bg-yellow-500': '#EAB308',
        'bg-emerald-500': '#10B981',
        'bg-orange-500': '#F97316',
    };
    return colorMap[tailwindColor] || '#000000';
};

const PizzaChart = ({ pizzas }) => {
    const totalVotes = pizzas.reduce((sum, pizza) => sum + pizza.votes, 0);
    if (totalVotes === 0) return null;

    let accumulatedAngle = 0;
    const radius = 50;
    const cx = 50;
    const cy = 50;

    return (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pizza Diagram</h3>
            <svg viewBox="0 0 100 100" className="w-64 h-64 transform -rotate-90">
                {pizzas.map((pizza) => {
                    const percentage = pizza.votes / totalVotes;
                    const angle = percentage * 360;
                    
                    if (percentage === 0) return null;

                    const startAngle = accumulatedAngle;
                    const endAngle = accumulatedAngle + angle;

                    const x1 = cx + radius * Math.cos(Math.PI * startAngle / 180);
                    const y1 = cy + radius * Math.sin(Math.PI * startAngle / 180);
                    
                    accumulatedAngle += angle;
                    
                    const x2 = cx + radius * Math.cos(Math.PI * endAngle / 180);
                    const y2 = cy + radius * Math.sin(Math.PI * endAngle / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    return (
                        <path
                            key={pizza.id}
                            d={`M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`}
                            fill={getHexColor(pizza.color)}
                        />
                    );
                })}
            </svg>
            <div className="mt-4 flex flex-wrap justify-center">
                {pizzas.map(pizza => (
                    pizza.votes > 0 &&
                    <div key={pizza.id} className="flex items-center m-2">
                        <span className={`w-4 h-4 rounded-full mr-2`} style={{backgroundColor: getHexColor(pizza.color)}}></span>
                        <span>{pizza.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PizzaOrderCalculator = ({ pizzas }) => {
  const avgSlicesPerPerson = 3.5;
  const slicesPerPizza = 8;

  const pizzasWithVotes = pizzas.filter(p => p.votes > 0);
  if (pizzasWithVotes.length === 0) return null;

  const pizzaOrders = pizzasWithVotes.map(pizza => {
      const pizzasToOrder = Math.ceil((pizza.votes * avgSlicesPerPerson) / slicesPerPizza);
      return { ...pizza, pizzasToOrder };
  });

  const totalPizzasToOrder = pizzaOrders.reduce((sum, pizza) => sum + pizza.pizzasToOrder, 0);
  const totalSlicesOrdered = totalPizzasToOrder * slicesPerPizza;
  const totalSlicesNeeded = pizzasWithVotes.reduce((sum, pizza) => sum + pizza.votes * avgSlicesPerPerson, 0);
  const leftoverSlices = totalSlicesOrdered - totalSlicesNeeded;

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center mb-4">
        <Pizza className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Mennyi pizzát rendeljünk?</h3>
      </div>
      <div className="space-y-2 text-gray-600">
        <p>Mivel a pizzéria nem készít felezett pizzákat, itt egy javaslat a rendeléshez (3.5 szelet/fővel számolva):</p>
        <ul>
            {pizzaOrders.map(pizza => (
                <li key={pizza.id}><strong>{pizza.name}:</strong> {pizza.pizzasToOrder} pizza</li>
            ))}
        </ul>
        <p className="text-2xl font-bold text-blue-600">Összesen: {totalPizzasToOrder} pizza</p>
        <p>Így marad <strong>{Math.floor(leftoverSlices)}</strong> szelet pizza, amit el lehet csomagolni.</p>
      </div>
    </div>
  );
};

const PizzaVotingApp = () => {
  const [pizzas, setPizzas] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const checkAdmin = async () => {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            if (adminDoc.exists()) {
                setIsAdmin(true);
            }
        };
        checkAdmin();

        const pizzaCollection = collection(db, 'pizzas');
        const pizzaUnsubscribe = onSnapshot(pizzaCollection, (snapshot) => {
          const pizzaData: Pizza[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pizza));
          setPizzas(pizzaData);
          const userVoted = pizzaData.some(p => p.voters && p.voters.includes(user.uid));
          setHasVoted(userVoted);
          if (userVoted) {
            setShowResults(true);
          }
          setIsConnected(true);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching pizzas: ", error);
          setIsConnected(false);
          setLoading(false);
        });
        return () => pizzaUnsubscribe();
      } else {
        signInAnonymously(auth);
      }
    });

    const seedPizzas = async () => {
        const pizzaCollection = collection(db, 'pizzas');
        const querySnapshot = await getDocs(pizzaCollection);
        if (querySnapshot.empty) {
            const batch = writeBatch(db);
            const initialPizzas = [
                { id: 'pepperoni', name: 'Pepperonii', emoji: '🍕', color: 'bg-red-500', votes: 0, voters: [] },
                { id: 'margherita', name: 'Margherita', emoji: '🍅', color: 'bg-green-500', votes: 0, voters: [] },
                { id: 'hawaiian', name: 'Hawaii', emoji: '🍍', color: 'bg-yellow-500', votes: 0, voters: [] },
                { id: 'veggie', name: 'Vegán Különleges', emoji: '🥬', color: 'bg-emerald-500', votes: 0, voters: [] },
                { id: 'meatLovers', name: 'Hús Imádó', emoji: '🥓', color: 'bg-orange-500', votes: 0, voters: [] }
            ];
            initialPizzas.forEach(pizza => {
                const docRef = doc(pizzaCollection, pizza.id);
                batch.set(docRef, pizza);
            });
            await batch.commit();
        }
    };
    seedPizzas();

    return () => authUnsubscribe();
  }, []);

  const handleVote = async (pizzaId) => {
    if (hasVoted || !user) return;

    await runTransaction(db, async (transaction) => {
        const pizzaRef = doc(db, "pizzas", pizzaId);
        const pizzaDoc = await transaction.get(pizzaRef);
        if (!pizzaDoc.exists()) {
            throw "Document does not exist!";
        }

        const allPizzas = await Promise.all(pizzas.map(p => transaction.get(doc(db, "pizzas", p.id))));
        const userHasVotedForAny = allPizzas.some(p => p.data().voters && p.data().voters.includes(user.uid));

        if (userHasVotedForAny) {
            return;
        }

        transaction.update(pizzaRef, { 
            votes: increment(1),
            voters: arrayUnion(user.uid)
        });
    });

    setShowThanksPage(true);
    setTimeout(() => {
      setShowThanksPage(false);
      setShowResults(true);
    }, 2000);
  };

  const resetVoting = async () => {
    if (!isAdmin) return;
    const pizzaCollection = collection(db, 'pizzas');
    const batch = writeBatch(db);
    pizzas.forEach(pizza => {
        const docRef = doc(pizzaCollection, pizza.id);
        batch.update(docRef, { votes: 0, voters: [] });
    });
    await batch.commit();
    setHasVoted(false);
    setShowResults(false);
  };

  const totalVotes = pizzas.reduce((sum, pizza) => sum + pizza.votes, 0);
  const winner = pizzas.length > 0 ? pizzas.reduce((a, b) => (a.votes > b.votes ? a : b)) : null;

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

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center p-4">
            <div className="text-white text-2xl font-bold">Loading...</div>
        </div>
    )
  }

  if (showThanksPage) {
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

  if (showResults || hasVoted) {
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
              {pizzas
                .sort((a, b) => b.votes - a.votes)
                .map((pizza, index) => {
                  const percentage = totalVotes > 0 ? (pizza.votes / totalVotes) * 100 : 0;
                  const isWinner = winner && pizza.id === winner.id && pizza.votes > 0;

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
                            {pizza.votes} szavazat
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

            {totalVotes > 0 && winner && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl mb-6">
                  <h2 className="text-2xl font-bold mb-2">🎉 A győztes... 🎉</h2>
                  <div className="text-4xl font-bold">
                    {winner.emoji} {winner.name}!
                  </div>
                  <p className="text-lg mt-2">Ideje megrendelni a finom pizzát! 🍕</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={resetVoting}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
                  >
                    Új Szavazás
                  </button>
                )}
              </div>
            )}
            <PizzaChart pizzas={pizzas} />
            <PizzaOrderCalculator pizzas={pizzas} />
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
            <p className="text-xl text-gray-600">Válaszd ki a kedvenc pizzádat uzsonnára!</p>
            <div className="flex items-center justify-center mt-4 text-gray-500">
              <Users className="w-5 h-5 mr-2" />
              <span>{totalVotes} szavazat eddig</span>
            </div>
            <div className="mt-2">
              <ConnectionStatus />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pizzas.map((pizza) => (
              <div
                key={pizza.id}
                onClick={() => handleVote(pizza.id)}
                className={`group cursor-pointer transform transition-all duration-200 ${hasVoted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}`}
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-400 transition-colors duration-200">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:animate-bounce">
                      {pizza.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pizza.name}</h3>
                    <div className={`text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 ${hasVoted ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
                      {hasVoted ? 'Már szavaztál' : 'Szavazok! 🗳️'}
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
              {isAdmin && (
                <button
                  onClick={resetVoting}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
                >
                  Nullázás 🔄
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <QrCode className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Valós Idejű Szavazás:</h3>
          </div>
          <div className="space-y-2 text-gray-600">
            <p><strong>🚀 Élesítve:</strong> Ez az alkalmazás mostmár Firebase-t használ a valós idejű szavazáshoz!</p>
            <p><strong>🔐 Biztonság:</strong> A szavazás mostmár biztonságos, minden felhasználó csak egyszer szavazhat.</p>
            <p><strong>👑 Admin:</strong> A szavazás nullázása csak admin felhasználóknak engedélyezett.</p>
            <p><strong>📱 Több eszköz:</strong> Nyisd meg az alkalmazást több eszközön és szavazz - látni fogod az élő frissítéseket!</p>
            {user && <p><strong>Az Ön User ID-ja:</strong> {user.uid}</p>}
            {isAdmin && (<a href="/admin" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Admin Felület</a>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <PizzaVotingApp />;
}
