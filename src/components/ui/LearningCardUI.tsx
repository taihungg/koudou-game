"use client";

import React, { useState, useEffect } from 'react';
import { useLearningStore } from '@/store/useLearningStore';
import { useGameStore } from '@/store/useGameStore';
import confetti from "canvas-confetti";

export default function LearningCardUI() {
  const { activeEntity, nearbyEntity, setActiveEntity, completedExercises, markExerciseCompleted } = useLearningStore();
  const { addXP, setInteracting } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, type: 'bonus' | 'fail'}[]>([]);

  const isCompleted = activeEntity ? completedExercises.includes(activeEntity.id) : false;
  const isVisible = !!activeEntity;
  const nextFloatingId = React.useRef(0);

  // Sync interaction state
  useEffect(() => {
    setInteracting(!!activeEntity);
  }, [activeEntity, setInteracting]);

  const closeCard = React.useCallback(() => {
    setActiveEntity(null);
    setSelectedOption(null);
    setFeedback(null);
    setIsQuizMode(false);
  }, [setActiveEntity]);

  const handleReplay = () => {
    setSelectedOption(null);
    setFeedback(null);
  };

  // Handle keyboard interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open card if nearby
      if ((e.code === 'Space' || e.code === 'KeyE') && nearbyEntity && !activeEntity) {
        setActiveEntity(nearbyEntity);
      }
      // Close card
      if (e.code === 'Escape' && activeEntity) {
        closeCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyEntity, activeEntity, setActiveEntity, closeCard]);

  const handleOptionClick = (index: number) => {
    if (!activeEntity || !activeEntity.exercise) return;
    
    setSelectedOption(index);
    const newFloatings: {id: number, text: string, type: 'bonus' | 'fail'}[] = [];
    
    if (index === activeEntity.exercise.correctAnswer) {
      setFeedback(activeEntity.exercise.feedbackSuccess);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#fbbf24', '#f87171', '#60a5fa']
      });

      if (!isCompleted) {
        markExerciseCompleted(activeEntity.id);
      }
      addXP(5);
      useGameStore.getState().addBiodiversity(5); // +5 ODD 15
      newFloatings.push({ id: ++nextFloatingId.current, text: '+5 XP', type: 'bonus' });
      newFloatings.push({ id: ++nextFloatingId.current, text: '+5 ODD 15', type: 'bonus' });
      
      setFloatingTexts(prev => [...prev, ...newFloatings]);
      
      // Nếu làm đúng: trở lại màn hình thông tin card sau 1.8s (để người chơi xem feedback & confetti)
      setTimeout(() => {
        setIsQuizMode(false);
        setSelectedOption(null);
        setFeedback(null);
      }, 1800);
    } else {
      setFeedback(activeEntity.exercise.feedbackFail);
      addXP(-5);
      newFloatings.push({ id: ++nextFloatingId.current, text: '-5 XP', type: 'fail' });
      
      setFloatingTexts(prev => [...prev, ...newFloatings]);
      // Nếu làm sai: KHÔNG tự đóng card — giữ nguyên màn hình và hiện nút replay
    }
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => !newFloatings.find(n => n.id === f.id)));
    }, 2000);
  };



  const usages = 
    activeEntity?.leftPanel?.Usages || 
    activeEntity?.leftPanel?.usages || 
    (activeEntity?.leftPanel && Object.entries(activeEntity.leftPanel).find(([k]) => k.toLowerCase() === 'usages')?.[1]) ||
    "Non spécifié";

  const generalInfo = activeEntity?.description || "Aucune information générale disponible.";

  return (
    <>
      {/* FLOATING TEXTS */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-2">
        {floatingTexts.map(f => (
          <div key={f.id} className={`text-5xl font-black drop-shadow-xl ${f.type === 'bonus' ? 'text-green-400 animate-float-up' : 'text-red-500 animate-drop-fade'}`}>
            {f.text}
          </div>
        ))}
      </div>

      {/* INTERACTION PROMPT */}
      {nearbyEntity && !activeEntity && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-amber-950/80 border-2 border-amber-500/50 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold">
            <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">ESPACE</kbd>
            <span>Interagir avec {nearbyEntity.frenchName}</span>
            <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300 ml-2">F</kbd>
            <span>Observer</span>
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
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeCard}></div>

        {/* 2-PANEL CONTAINER */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 w-full max-w-5xl px-6 pointer-events-auto relative z-10">
          
          {/* CLOSE BUTTON */}
          <button 
            onClick={closeCard}
            className="absolute -top-12 right-6 md:right-2 bg-red-600/90 hover:bg-red-500 text-white w-10 h-10 rounded-full font-bold shadow-lg transition-transform hover:scale-110 flex items-center justify-center z-50 border-2 border-red-300 cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
          
          {/* LEFT PANEL - Species Card (Preserved from center card) */}
          <div className="w-[340px] md:w-[350px] flex-shrink-0 relative transform hover:scale-[1.02] transition-transform duration-300 self-center">
            
            {/* 2D Image behind the card frame (shows through the transparent window) */}
            <div className="absolute top-[8%] left-[8%] right-[8%] h-[45%] flex items-center justify-center z-0">
              {activeEntity?.modelPath && activeEntity.modelPath.includes('/flowers/') ? (
                /* eslint-disable-next-line @next/next/no-img-element */
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeEntity?.cardType || '/assets/card/SilverCard.png'} 
              alt="Card Background" 
              className="w-full h-auto drop-shadow-2xl relative z-10 pointer-events-none"
            />
            
            {/* Overlay Text on the card */}
            <div className="absolute inset-0 z-20 font-bold font-story">
              
              {/* Box 1: French Name */}
              <div className="absolute left-[10%] right-[10%] h-[12%] flex items-center justify-center px-4" style={{ top: '54%' }}>
                <h2 className="text-2xl font-black text-center text-amber-50 leading-none drop-shadow-md">
                  {activeEntity?.frenchName}
                </h2>
              </div>
              
              {/* Box 2: Scientific Name, Type & Status */}
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

          {/* RIGHT PANEL - Information Board */}
          <div className="w-full md:w-[480px] lg:w-[520px] min-h-[488px] bg-gradient-to-b from-[#3a1f11]/95 via-[#2c160b]/95 to-[#221008]/95 border-4 border-amber-700/80 rounded-[28px] p-7 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-md text-amber-50 flex flex-col justify-between relative">
            {!isQuizMode ? (
              <>
                <div className="space-y-6">
                  {/* Section 1: Information générale */}
                  <div>
                    <h3 className="font-story text-2xl md:text-3xl font-bold text-amber-200 tracking-wide mb-2">
                      Information générale
                    </h3>
                    <p className="text-amber-100/90 leading-relaxed text-base font-sans">
                      {generalInfo}
                    </p>
                  </div>

                  {/* Subtle divider */}
                  <div className="h-px bg-gradient-to-r from-amber-700/60 via-amber-600/30 to-transparent" />

                  {/* Section 2: Usages */}
                  <div>
                    <h3 className="font-story text-2xl md:text-3xl font-bold text-amber-200 tracking-wide mb-2">
                      Usages
                    </h3>
                    <p className="text-amber-100/90 leading-relaxed text-base font-sans">
                      {usages}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 mt-auto">
                  {activeEntity?.exercise && !isCompleted && (
                    <button 
                      onClick={() => setIsQuizMode(true)}
                      className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-bold py-4 px-6 rounded-2xl shadow-[0_6px_20px_rgba(217,119,6,0.35)] border-2 border-amber-300/80 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg font-story tracking-wide cursor-pointer"
                    >
                      <span>📝</span> Prendre des notes
                    </button>
                  )}
                  {activeEntity?.exercise && isCompleted && (
                    <div className="flex flex-col gap-2.5">
                      <div className="w-full bg-green-900/60 border-2 border-green-500/60 text-green-200 py-3 px-6 rounded-2xl text-center font-bold font-story text-base flex items-center justify-center gap-2 shadow-inner">
                        <span>✓</span> Déjà documenté dans l&apos;encyclopédie !
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedOption(null);
                          setFeedback(null);
                          setIsQuizMode(true);
                        }}
                        className="w-full bg-amber-700/80 hover:bg-amber-600 text-amber-50 font-bold py-2.5 px-4 rounded-xl border border-amber-500 shadow-md transition-all flex items-center justify-center gap-2 font-story text-sm cursor-pointer hover:scale-[1.01]"
                      >
                        <span>🔄</span> Refaire l&apos;exercice pour réviser
                      </button>
                    </div>
                  )}
                  {!activeEntity?.exercise && (
                    <button
                      onClick={closeCard}
                      className="w-full bg-amber-800/80 hover:bg-amber-700 text-amber-100 font-bold py-3.5 px-6 rounded-2xl border-2 border-amber-600 transition-all flex items-center justify-center gap-2 text-base font-story cursor-pointer"
                    >
                      Continuer l&apos;exploration
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* QUIZ VIEW IN RIGHT PANEL */
              <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center justify-between border-b border-amber-700/60 pb-3 mb-4">
                    <h3 className="font-story text-2xl font-bold text-amber-200 flex items-center gap-2">
                      <span>📝</span> Prendre des notes...
                    </h3>
                    <button 
                      onClick={() => setIsQuizMode(false)}
                      className="text-xs text-amber-300/80 hover:text-amber-100 hover:underline flex items-center gap-1 font-sans cursor-pointer transition-colors"
                    >
                      ← Revoir la fiche
                    </button>
                  </div>

                  <p className="text-base md:text-lg font-medium text-amber-100 leading-snug mb-4">
                    {activeEntity?.exercise?.question}
                  </p>
                  
                  <div className="space-y-2.5">
                    {activeEntity?.exercise?.options.map((option, idx) => {
                      let btnClass = "w-full text-left p-3.5 rounded-xl text-sm md:text-base font-medium transition-all duration-200 border-2 shadow-sm cursor-pointer ";
                      if (selectedOption === idx) {
                        if (idx === activeEntity.exercise?.correctAnswer) {
                          btnClass += "bg-green-600 border-green-400 text-white transform scale-[1.01]";
                        } else {
                          btnClass += "bg-red-600 border-red-400 text-white transform scale-[0.99]";
                        }
                      } else {
                        btnClass += "bg-amber-900/60 border-amber-700/70 hover:bg-amber-800 hover:border-amber-500 text-amber-50 hover:translate-x-1";
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
                </div>

                {feedback && (
                  <div className={`mt-4 p-3.5 rounded-xl text-sm md:text-base font-bold border-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    selectedOption === activeEntity?.exercise?.correctAnswer 
                      ? 'bg-green-900/80 border-green-500 text-green-100' 
                      : 'bg-red-900/80 border-red-500 text-red-100 animate-shake-fail'
                  }`}>
                    <div>{feedback}</div>
                    {/* Replay button when answer was wrong */}
                    {selectedOption !== activeEntity?.exercise?.correctAnswer && (
                      <button
                        onClick={handleReplay}
                        className="w-full mt-3 bg-amber-700 hover:bg-amber-600 active:scale-[0.98] text-amber-50 font-bold py-2.5 px-4 rounded-xl border-2 border-amber-500 shadow-md transition-all flex items-center justify-center gap-2 font-story text-base cursor-pointer hover:scale-[1.02]"
                      >
                        <span>🔄</span> Réessayer
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
