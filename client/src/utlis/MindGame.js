import React, { useState } from "react";
import toast from "react-hot-toast";

export default function MindGame() {
  const [targetNumber, setTargetNumber] = useState(generateRandomNumber());
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10; // Maximum number of attempts

  function generateRandomNumber() {
    return Math.floor(Math.random() * 100) + 1;
  }

  const handleGuess = () => {
    const guessNumber = parseInt(guess, 10);

    if (attempts >= maxAttempts) {
      setMessage("🎮 Game over! You've reached the maximum attempts.");
      toast.error("🎮 Game over! You've reached the maximum attempts.");
      handleRestart();
      return;
    }

    setAttempts(attempts + 1);

    if (guessNumber === targetNumber) {
      setMessage(
        `🎉 Congratulations! You guessed it in ${attempts + 1} attempts.`
      );
      toast.success(
        `🎉 Congratulations! You guessed it in ${attempts + 1} attempts.`
      );
      handleRestart();
    } else if (guessNumber < targetNumber) {
      setMessage("Too low! Try a higher number.");
    } else {
      setMessage("Too high! Try a lower number.");
    }
  };

  const handleRestart = () => {
    setTargetNumber(generateRandomNumber());
    setGuess("");
    setMessage("");
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[30rem] w-[30rem] rounded-lg shadow-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        Mind Game: Guess the Number
      </h2>
      <p className="text-white text-lg mb-6">
        Try to guess the number between 1 and 100!
      </p>

      <div className="flex items-center space-x-4 mb-6">
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter your guess"
          className="px-4 py-2 w-32 text-gray-800 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleGuess}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none transition-colors duration-200"
        >
          Guess
        </button>
        <button
          onClick={handleRestart}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg shadow-lg hover:bg-pink-700 focus:outline-none transition-colors duration-200"
        >
          Restart Game
        </button>
      </div>

      {message && (
        <p className="text-white text-xl font-semibold mt-4">{message}</p>
      )}

      <p className="text-white text-lg mt-4">
        Attempts: {attempts}/{maxAttempts}
      </p>
    </div>
  );
}
