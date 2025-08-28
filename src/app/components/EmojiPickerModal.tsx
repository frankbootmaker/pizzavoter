import React from 'react';

const pizzaEmojis = [
    '🍕', '🍅', '🍍', '🥬', '🥓', '🌶️', '🍄', '🧅', '🫑', '🧀', '🍖', '🍗', '🐟', '🍤', '🫒', '🌽', '🥚', '🥔', '🥦', '🥕'
];

const EmojiPickerModal = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Válassz Emojit</h2>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {pizzaEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => { onSelectEmoji(emoji); onClose(); }}
              className="text-3xl p-2 hover:bg-gray-200 rounded-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="text-right">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Bezár
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerModal;
