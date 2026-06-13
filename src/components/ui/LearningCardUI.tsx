"use client";

import React, { useState, useEffect } from 'react';
import { useLearningStore } from '@/store/useLearningStore';
import { useGameStore } from '@/store/useGameStore';

export default function LearningCardUI() {
  const { activeEntity, completedExercises, markExerciseCompleted } = useLearningStore();
  const { addXP } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth appearance
  useEffect(() => {
    if (activeEntity) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [activeEntity]);

  if (!activeEntity && !isVisible) return null;

  const handleOptionClick = (index: number) => {
    if (!activeEntity || !activeEntity.exercise) return;
    if (completedExercises.includes(activeEntity.id)) return; // already completed

    setSelectedOption(index);
    if (index === activeEntity.exercise.correctAnswer) {
      setFeedback(activeEntity.exercise.feedbackSuccess);
      addXP(10);
      markExerciseCompleted(activeEntity.id);
    } else {
      setFeedback(activeEntity.exercise.feedbackFail);
      addXP(-5);
    }
  };

  const isCompleted = activeEntity && completedExercises.includes(activeEntity.id);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-500 z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Container for the 3 panels */}
      <div className="flex flex-row items-stretch justify-center gap-6 w-full max-w-7xl px-8 pointer-events-auto">
        
        {/* LEFT PANEL - Brown Board */}
        <div className="flex-1 bg-amber-900/90 border-4 border-amber-800 rounded-xl p-6 shadow-2xl text-amber-50 backdrop-blur-md transform transition-transform duration-500 translate-y-0">
          <h3 className="text-2xl font-bold mb-4 border-b border-amber-700 pb-2 text-amber-200">
            Informations
          </h3>
          <p className="text-sm italic mb-6 text-amber-100">
            {activeEntity?.description}
          </p>
          <div className="space-y-4 text-sm">
            {activeEntity && Object.entries(activeEntity.leftPanel).map(([key, value]) => (
              <div key={key}>
                <span className="font-bold text-amber-300 block mb-1">{key}</span>
                <span className="text-amber-50 leading-relaxed block">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL - Main Card */}
        <div className="w-[350px] flex-shrink-0 flex flex-col items-center justify-center relative transform hover:scale-105 transition-transform duration-300">
          <img 
            src={activeEntity?.cardType || '/assets/card/SilverCard.png'} 
            alt="Card Background" 
            className="w-full h-auto drop-shadow-2xl"
          />
          {/* Overlay Text on the card */}
          <div className="absolute inset-0 flex flex-col items-center p-8 text-center pt-24 text-gray-800">
            <div className="text-4xl mb-2">{activeEntity?.category === 'animal' ? '🦌' : '🌿'}</div>
            <h2 className="text-2xl font-black mb-1 leading-tight tracking-tighter" style={{ fontFamily: 'var(--font-architects)' }}>
              {activeEntity?.frenchName}
            </h2>
            <p className="text-sm font-bold italic text-gray-600 mb-6">
              {activeEntity?.scientificName}
            </p>
            
            <div className="w-full space-y-2 text-sm font-bold text-left px-4">
              <div className="flex justify-between border-b border-gray-300/50 pb-1">
                <span>Famille:</span>
                <span className="text-right text-gray-600">{activeEntity?.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300/50 pb-1">
                <span>Statut:</span>
                <span className="text-right text-gray-600">{activeEntity?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Brown Board */}
        <div className="flex-1 bg-amber-900/90 border-4 border-amber-800 rounded-xl p-6 shadow-2xl text-amber-50 backdrop-blur-md overflow-y-auto">
          <h3 className="text-2xl font-bold mb-4 border-b border-amber-700 pb-2 text-amber-200">
            Observation
          </h3>
          <div className="space-y-4 text-sm mb-8">
            {activeEntity && Object.entries(activeEntity.rightPanel).map(([key, value]) => (
              <div key={key}>
                <span className="font-bold text-amber-300 block mb-1">{key}</span>
                <span className="text-amber-50 leading-relaxed block">{value}</span>
              </div>
            ))}
          </div>

          {/* EXERCISE SECTION */}
          {activeEntity?.exercise && (
            <div className="mt-8 bg-amber-950/50 rounded-lg p-5 border border-amber-800/50">
              <h4 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
                <span>📝</span> Exercice
              </h4>
              <p className="font-semibold text-sm mb-4 leading-snug">
                {activeEntity.exercise.question}
              </p>
              
              <div className="space-y-2">
                {activeEntity.exercise.options.map((option, idx) => {
                  let btnClass = "w-full text-left p-3 rounded-md text-sm font-medium transition-colors border ";
                  if (selectedOption === idx) {
                    if (idx === activeEntity.exercise?.correctAnswer) {
                      btnClass += "bg-green-600 border-green-500 text-white";
                    } else {
                      btnClass += "bg-red-600 border-red-500 text-white";
                    }
                  } else if (isCompleted && idx === activeEntity.exercise?.correctAnswer) {
                    btnClass += "bg-green-600/50 border-green-500/50 text-white";
                  } else {
                    btnClass += "bg-amber-800 border-amber-700 hover:bg-amber-700 text-amber-100";
                  }

                  return (
                    <button 
                      key={idx} 
                      className={btnClass}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isCompleted || selectedOption !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div className={`mt-4 p-3 rounded-md text-sm font-semibold border ${selectedOption === activeEntity.exercise.correctAnswer ? 'bg-green-900/50 border-green-700 text-green-200' : 'bg-red-900/50 border-red-700 text-red-200'}`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
