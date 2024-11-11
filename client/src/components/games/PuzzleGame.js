import React, { useState, useEffect } from "react";

// Helper function to shuffle the puzzle
const shufflePuzzle = () => {
  let numbers = Array.from({ length: 9 }, (_, index) => index);
  numbers = numbers.sort(() => Math.random() - 0.5);
  return numbers;
};

const PuzzleGame = () => {
  const [puzzle, setPuzzle] = useState(shufflePuzzle());
  const [emptyIndex, setEmptyIndex] = useState(puzzle.indexOf(0));
  const [message, setMessage] = useState("");

  // Moves the tile to the empty space if possible
  const moveTile = (index) => {
    const possibleMoves = [
      emptyIndex - 3,
      emptyIndex + 3,
      emptyIndex - 1,
      emptyIndex + 1,
    ];

    if (possibleMoves.includes(index)) {
      const newPuzzle = [...puzzle];
      newPuzzle[emptyIndex] = newPuzzle[index];
      newPuzzle[index] = 0;
      setPuzzle(newPuzzle);
      setEmptyIndex(index);
    }
  };

  // Check if the puzzle is solved
  const checkWin = () => {
    if (puzzle.every((tile, index) => tile === index)) {
      setMessage("🎉 You solved the puzzle!");
    } else {
      setMessage("");
    }
  };

  // Restart the game
  const restartGame = () => {
    setPuzzle(shufflePuzzle());
    setEmptyIndex(puzzle.indexOf(0));
    setMessage("");
  };

  useEffect(() => {
    checkWin();
  }, [puzzle]);

  return (
    <div className="flex flex-col items-center justify-center h-[30rem] w-[30rem] rounded-lg shadow-sm bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Slider Puzzle Game
      </h2>
      <div
        className="grid grid-cols-3 gap-4"
        style={{ width: "330px", height: "330px" }}
      >
        {puzzle.map((tile, index) => (
          <div
            key={index}
            onClick={() => moveTile(index)}
            className={`flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-2xl font-semibold cursor-pointer transition-all duration-300 ease-in-out rounded-md ${
              tile === 0 ? "bg-white cursor-default" : "hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: tile === 0 ? "white" : "#f3f4f6",
              color: tile === 0 ? "transparent" : "#333",
            }}
          >
            {tile !== 0 ? tile : ""}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xl">{message}</p>
      <button
        onClick={restartGame}
        className="mt-4 py-2 px-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
      >
        Restart Game
      </button>
    </div>
  );
};

export default PuzzleGame;
