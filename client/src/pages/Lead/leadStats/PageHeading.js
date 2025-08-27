import React from "react";
import { MdAnalytics } from "react-icons/md";

const ChartsHero = () => {
  return (
    <div>
      <div className="flex items-center gap-3">
        <MdAnalytics className="text-indigo-600 text-4xl drop-shadow-sm" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Leads Analytics
        </h1>
      </div>
      <p className="mt-2 text-gray-600 text-sm md:text-base">
        Track, visualize and gain insights from your leads performance
      </p>
    </div>
  );
};

export default ChartsHero;
