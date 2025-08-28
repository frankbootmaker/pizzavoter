'use client'
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { collection, addDoc, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import EmojiPickerModal from '../components/EmojiPickerModal'; // Import the new component
import Link from 'next/link'; // Import Link for navigation
import { ArrowLeft } from 'lucide-react'; // Import an icon for back navigation

interface Pizza {
    id: string;
    name: string;
    emoji: string;
    color: string;
    votes: number;
    voters: string[];
}


const AdminPage = () => {
    const [pizzas, setPizzas] = useState([]);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newPizza, setNewPizza] = useState({ name: '', emoji: '', color: 'bg-red-500' });
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // New state for modal visibility

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                const checkAdmin = async () => {
                    const adminDoc = await getDoc(doc(db, "admins", user.uid));
                    if (adminDoc.exists()) {
                        setIsAdmin(true);
                    }
                    setLoading(false);
                };
                checkAdmin();
            } else {
                setLoading(false);
            }
        });

        const pizzaCollection = collection(db, 'pizzas');
        const pizzaUnsubscribe = onSnapshot(pizzaCollection, (snapshot) => {
            const pizzaData: Pizza[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pizza));
            setPizzas(pizzaData);
        });

        return () => {
            authUnsubscribe();
            pizzaUnsubscribe();
        };
    }, []);

    const handleAddPizza = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        await addDoc(collection(db, 'pizzas'), { ...newPizza, votes: 0, voters: [] });
        setNewPizza({ name: '', emoji: '', color: 'bg-red-500' });
    };

    const handleDeletePizza = async (id) => {
        if (!isAdmin) return;
        await deleteDoc(doc(db, 'pizzas', id));
    };
    
    if (loading) {
        return <div>Töltés...</div>
    }

    if (!isAdmin) {
        return <div>Nincs jogosultságod megtekinteni ezt az oldalt.</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Vissza a főoldalra
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Admin - Pizzák testreszabása</h1>
                    <form onSubmit={handleAddPizza} className="mb-8 p-6 bg-gray-50 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Új Pizza Hozzáadása</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Pizza Neve"
                                value={newPizza.name}
                                onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Emoji"
                                    value={newPizza.emoji}
                                    onChange={(e) => setNewPizza({ ...newPizza, emoji: e.target.value })}
                                    className="w-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(true)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Válassz Emojit
                                </button>
                                {newPizza.emoji && <span className="ml-2 text-3xl">{newPizza.emoji}</span>}
                            </div>
                        </div>
                        <div className="mb-6">
                            <select
                                value={newPizza.color}
                                onChange={(e) => setNewPizza({ ...newPizza, color: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="bg-red-500">Piros</option>
                                <option value="bg-green-500">Zöld</option>
                                <option value="bg-yellow-500">Sárga</option>
                                <option value="bg-emerald-500">Smaragd</option>
                                <option value="bg-orange-500">Narancs</option>
                                <option value="bg-blue-500">Kék</option>
                                <option value="bg-indigo-500">Indigó</option>
                                <option value="bg-purple-500">Lila</option>
                                <option value="bg-pink-500">Rózsaszín</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md">
                            Pizza Hozzáadása
                        </button>
                    </form>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Jelenlegi Pizzák</h2>
                        <div className="space-y-3">
                            {pizzas.map(pizza => (
                                <div key={pizza.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <span className={`w-5 h-5 rounded-full mr-3 ${pizza.color}`}></span>
                                        <span className="text-lg font-medium text-gray-700">{pizza.name} {pizza.emoji}</span>
                                    </div>
                                    <button onClick={() => handleDeletePizza(pizza.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                                        Törlés
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showEmojiPicker && (
                        <EmojiPickerModal
                            onSelectEmoji={(emoji) => setNewPizza({ ...newPizza, emoji: emoji })}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;