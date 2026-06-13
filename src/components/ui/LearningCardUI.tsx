"use client";

import React, { useState, useEffect } from 'react';
import { useLearningStore } from '@/store/useLearningStore';
import { useGameStore } from '@/store/useGameStore';

export default function LearningCardUI() {
  const { activeEntity, nearbyEntity, setActiveEntity, completedExercises, markExerciseCompleted } = useLearningStore();
  const { addXP, setInteracting } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Smooth appearance
  useEffect(() => {
    if (activeEntity) {
      setIsVisible(true);
      setInteracting(true); // Freeze player when card opens
    } else {
      setIsVisible(false);
      setSelectedOption(null);
      setFeedback(null);
      setIsQuizMode(false);
      setInteracting(false); // Unfreeze player when card closes
    }
  }, [activeEntity, setInteracting]);

  // Handle keyboard interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open card if nearby
      if (e.code === 'Space' && nearbyEntity && !activeEntity) {
        setActiveEntity(nearbyEntity);
      }
      // Close card
      if (e.code === 'Escape' && activeEntity) {
        setActiveEntity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyEntity, activeEntity, setActiveEntity]);

  const closeCard = () => {
    setActiveEntity(null);
  };

  if (!activeEntity && !isVisible && !nearbyEntity) return null;

  const handleOptionClick = (index: number) => {
    if (!activeEntity || !activeEntity.exercise) return;
    
    setSelectedOption(index);
    
    if (index === activeEntity.exercise.correctAnswer) {
      setFeedback(activeEntity.exercise.feedbackSuccess);
      if (!isCompleted) {
        addXP(10);
        useGameStore.getState().addBiodiversity(5); // +5 ODD 15
        markExerciseCompleted(activeEntity.id);
      }
      setTimeout(() => {
        closeCard();
      }, 2000);
    } else {
      setFeedback(activeEntity.exercise.feedbackFail);
      addXP(-5);
      setTimeout(() => {
        closeCard();
      }, 2000);
    }
  };

  const isCompleted = activeEntity && completedExercises.includes(activeEntity.id);

  return (
    <>
      {/* INTERACTION PROMPT */}
      {nearbyEntity && !activeEntity && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-amber-950/80 border-2 border-amber-500/50 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold">
            <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">ESPACE</kbd>
            <span>Interagir avec {nearbyEntity.frenchName}</span>
          </div>
        </div>
      )}

      {/* CARD OVERLAY */}
      <div 
        className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-500 z-50 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Dimmed Background */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={closeCard}></div>

        {/* Container for the 3 panels or Quiz */}
        <div className="flex flex-row items-stretch justify-center gap-6 w-full max-w-7xl px-8 pointer-events-auto relative">
          
          {/* CLOSE BUTTON */}
          <button 
            onClick={closeCard}
            className="absolute -top-12 right-8 bg-red-600 hover:bg-red-500 text-white w-10 h-10 rounded-full font-bold shadow-lg transition-transform hover:scale-110 flex items-center justify-center z-50 border-2 border-red-300"
          >
            ✕
          </button>
          
          {!isQuizMode ? (
            <>
              {/* LEFT PANEL - Brown Board */}
              <div className="flex-1 bg-amber-900/90 border-4 border-amber-800 rounded-xl p-6 shadow-2xl text-amber-50 backdrop-blur-md transform transition-transform duration-500 translate-y-0">
                <h3 className="text-2xl font-bold mb-4 border-b border-amber-700 pb-2 text-amber-200">
                  Informations
                </h3>
                <p className="text-sm leading-relaxed mb-6 italic opacity-90 border-l-2 border-amber-500 pl-3">
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
              <div className="w-[350px] flex-shrink-0 relative transform hover:scale-105 transition-transform duration-300 self-center">
                
                {/* 2D Image behind the card frame (shows through the transparent window) */}
                <div className="absolute top-[8%] left-[8%] right-[8%] h-[45%] flex items-center justify-center z-0">
                  {activeEntity?.modelPath && activeEntity.modelPath.includes('/flowers/') ? (
                    <img 
                      src={`/assets/flowers_2d/${activeEntity.modelPath.split('/').pop()?.replace('.glb', '.png')}`} 
                      alt={activeEntity?.frenchName} 
                      className="w-full h-full object-contain drop-shadow-xl scale-125" 
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-900/50 flex items-center justify-center text-amber-200/50 font-bold">
                      IMAGE 2D
                    </div>
                  )}
                </div>

                {/* Card Frame Image */}
                <img 
                  src={activeEntity?.cardType || '/assets/card/SilverCard.png'} 
                  alt="Card Background" 
                  className="w-full h-auto drop-shadow-2xl relative z-10 pointer-events-none"
                />
                
                {/* Overlay Text on the card */}
                <div className="absolute inset-0 z-20 font-bold font-story">
                  
                  {/* Box 1: French Name (First Red Box) */}
                  <div className="absolute left-[10%] right-[10%] h-[12%] flex items-center justify-center px-4" style={{ top: '54%' }}>
                    <h2 className="text-2xl font-black text-center text-amber-50 leading-none drop-shadow-md">
                      {activeEntity?.frenchName}
                    </h2>
                  </div>
                  
                  {/* Box 2: Scientific Name, Type & Status (Second Red Box) */}
                  <div className="absolute left-[10%] right-[10%] h-[25%] flex flex-col justify-center px-6 text-amber-50 text-sm" style={{ top: '71%' }}>
                    <p className="italic text-center text-lg drop-shadow-md border-b border-amber-200/30 pb-2 mb-2">
                      {activeEntity?.scientificName}
                    </p>
                    <div className="flex justify-between mb-1">
                      <span className="opacity-90">Famille:</span>
                      <span className="text-right font-black drop-shadow-sm">{activeEntity?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Statut:</span>
                      <span className="text-right font-black drop-shadow-sm text-xs mt-1">{activeEntity?.status}</span>
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

                {/* TAKE NOTES BUTTON */}
                {activeEntity?.exercise && !isCompleted && (
                  <button 
                    onClick={() => setIsQuizMode(true)}
                    className="w-full mt-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold py-4 px-6 rounded-lg shadow-md border-2 border-amber-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
                  >
                    <span>📝</span> Prendre des notes
                  </button>
                )}
                {activeEntity?.exercise && isCompleted && (
                  <div className="mt-4 bg-green-900/50 border-2 border-green-700 text-green-200 p-4 rounded-lg text-center font-bold">
                    ✓ Déjà documenté dans l'encyclopédie !
                  </div>
                )}
              </div>
            </>
          ) : (
            /* QUIZ PANEL */
            <div className="w-full max-w-3xl bg-amber-900/95 border-4 border-amber-700 rounded-2xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-amber-50 backdrop-blur-lg animate-in fade-in zoom-in duration-300">
              <h2 className="text-3xl font-black text-amber-200 mb-6 flex items-center gap-3 border-b-2 border-amber-800 pb-4">
                <span>📝</span> Prendre des notes...
              </h2>
              <p className="text-xl font-medium mb-8 leading-relaxed">
                {activeEntity?.exercise?.question}
              </p>
              
              <div className="space-y-4">
                {activeEntity?.exercise?.options.map((option, idx) => {
                  let btnClass = "w-full text-left p-5 rounded-xl text-lg font-medium transition-all duration-300 border-2 shadow-md ";
                  if (selectedOption === idx) {
                    if (idx === activeEntity.exercise?.correctAnswer) {
                      btnClass += "bg-green-600 border-green-400 text-white transform scale-[1.02]";
                    } else {
                      btnClass += "bg-red-600 border-red-400 text-white transform scale-[0.98]";
                    }
                  } else {
                    btnClass += "bg-amber-800/80 border-amber-600 hover:bg-amber-700 hover:border-amber-400 text-amber-50 hover:transform hover:translate-x-2";
                  }

                  return (
                    <button 
                      key={idx} 
                      className={btnClass}
                      onClick={() => handleOptionClick(idx)}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div className={`mt-8 p-6 rounded-xl text-lg font-bold border-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${selectedOption === activeEntity?.exercise?.correctAnswer ? 'bg-green-900/80 border-green-500 text-green-100' : 'bg-red-900/80 border-red-500 text-red-100'}`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
