import React from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Top Logo */}
      <div className="mb-8 sm:mb-12 text-center">
        <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-indigo-600 mx-auto" />
        <h1 className="mt-4 text-2xl sm:text-4xl font-bold text-gray-900">MeinBuch Cover Prototyp</h1>
      </div>

      {/* Create Book Button */}
      <button
        onClick={onStart}
        className="group relative w-48 h-48 sm:w-64 sm:h-64 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl sm:text-2xl font-semibold">Cover erstellen</span>
        </div>
      </button>

      {/* Bottom Logo */}
      <div className="mt-8 sm:mt-12 text-center">
        <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />
        <p className="mt-4 text-sm sm:text-base text-gray-500">Hier klicken zum beginnen</p>
      </div>
    </div>
  );
}