"use client";

import { useState, useEffect } from 'react';
import { useDialogueStore, kofiDialogue } from '@/store/useDialogueStore';
import { useGameStore } from '@/store/useGameStore';
import confetti from "canvas-confetti";

export default function DialogueUI() {
  const { isOpen, currentSequence, currentStepIndex, closeDialogue, nextStep, nearbyNPCId, openDialogue } = useDialogueStore();
  const { setInteracting, addXP, addTrust } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, type: 'bonus' | 'fail'}[]>([]);

  const step = currentSequence?.[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      setInteracting(true);
    } else {
      setInteracting(false);
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [isOpen, setInteracting]);

  useEffect(() => {
    if (step) {
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open dialogue if near Kofi and space is pressed
      if (e.code === 'Space' && nearbyNPCId === 'kofi' && !isOpen) {
        openDialogue(kofiDialogue);
      }
      // Close dialogue
      if (e.code === 'Escape' && isOpen) {
        closeDialogue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyNPCId, isOpen, openDialogue, closeDialogue]);

  if (!isOpen && !nearbyNPCId) return null;

  const handleOptionClick = (idx: number, isCorrect: boolean) => {
    setSelectedOption(idx);
    
    if (isCorrect) {
      setFeedback("Correct !");
      addXP(5);
      addTrust(5);
      
      const newFloatings: {id: number, text: string, type: 'bonus' | 'fail'}[] = [
        { id: Date.now(), text: '+5 XP', type: 'bonus' },
        { id: Date.now() + 1, text: '+5 ODD 16', type: 'bonus' }
      ];
      setFloatingTexts(prev => [...prev, ...newFloatings]);

      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 },
      });
      
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(f => !newFloatings.find(n => n.id === f.id)));
        if (currentSequence && currentStepIndex < currentSequence.length - 1) {
          nextStep();
        } else {
          // Finished dialogue
          closeDialogue();
        }
      }, 1500);
    } else {
      setFeedback(step?.hint || "Mauvaise réponse. Essayez encore.");
      addXP(-2);
      
      const newFloatings: {id: number, text: string, type: 'bonus' | 'fail'}[] = [
        { id: Date.now(), text: '-2 XP', type: 'fail' }
      ];
      setFloatingTexts(prev => [...prev, ...newFloatings]);

      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(f => !newFloatings.find(n => n.id === f.id)));
        setSelectedOption(null);
        setFeedback(null);
      }, 2000);
    }
  };

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
    {nearbyNPCId && !isOpen && (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[80] pointer-events-none">
        <div className="bg-amber-950/80 border-2 border-amber-500/50 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold font-story">
          <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">ESPACE</kbd>
          <span>Parler à Kofi</span>
        </div>
      </div>
    )}

    {isOpen && step && (
    <div className="fixed inset-0 pointer-events-none z-[90] flex flex-col justify-end items-center pb-8">
      {/* Dialogue Box */}
      <div className="w-full max-w-4xl bg-amber-950/95 border-4 border-amber-600 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col backdrop-blur-md overflow-hidden">
        
        {/* Text Area */}
        <div className="p-6 border-b-2 border-amber-800/50 min-h-[120px] bg-gradient-to-b from-amber-900/50 to-transparent">
          <p className="text-xl font-medium text-amber-50 whitespace-pre-wrap leading-relaxed font-story drop-shadow-md">
            {step.text}
          </p>
        </div>

        {/* Options Area */}
        <div className="p-4 bg-amber-900/30 flex flex-col gap-2">
          {step.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-3 rounded-lg text-lg font-medium transition-all duration-300 border-2 shadow-sm font-story ";
            
            if (selectedOption === idx) {
              if (opt.isCorrect) {
                btnClass += "bg-green-700 border-green-500 text-white";
              } else {
                btnClass += "bg-red-700 border-red-500 text-white animate-shake-fail";
              }
            } else if (selectedOption !== null) {
              btnClass += "bg-amber-800/30 border-amber-700/50 text-amber-300/50 cursor-not-allowed";
            } else {
              btnClass += "bg-amber-800/80 border-amber-600 hover:bg-amber-700 hover:border-amber-400 text-amber-50 hover:translate-x-2";
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionClick(idx, opt.isCorrect)}
                className={btnClass}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
        
        {/* Feedback Area */}
        {feedback && (
          <div className={`p-3 text-center font-bold text-lg border-t-2 animate-in slide-in-from-bottom-2 ${selectedOption !== null && step.options[selectedOption]?.isCorrect ? 'bg-green-900/80 border-green-700 text-green-200' : 'bg-red-900/80 border-red-700 text-red-200'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
    )}
    </>
  );
}
