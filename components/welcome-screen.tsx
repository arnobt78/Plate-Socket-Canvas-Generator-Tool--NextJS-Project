/**
 * ========================================
 * WELCOME SCREEN COMPONENT
 * ========================================
 * This component displays a welcoming splash screen for first-time users.
 *
 * Features:
 * - Typewriter animation for engaging user experience
 * - Automatic close after animation completes
 * - Shows only once per user (localStorage persistence)
 * - Fully responsive for mobile and desktop
 */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

interface WelcomeScreenProps {
  onClose: () => void;
}

export default function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const [showSubtitle, setShowSubtitle] = useState(false);

  const { displayText: typewriterText, isComplete: isMainComplete } =
    useTypewriter({
      text: "> INITIALIZING PLATE SOCKET GENERATOR...",
      speed: 70,
      delay: 500,
    });

  const { displayText: subtitleText } = useTypewriter({
    text: "Powered by R24 - Technical Assessment Team",
    speed: 50,
    delay: 3500,
  });

  // Show subtitle when main text completes
  useEffect(() => {
    if (isMainComplete) {
      setShowSubtitle(true);
    }
  }, [isMainComplete]);

  // Auto-close after all animations complete (total ~8 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background Images */}
      <div className="absolute w-full h-full flex items-center justify-center opacity-15 pointer-events-none">
        <Image
          src="/scrum-board.svg"
          alt="Decorative background"
          width={800}
          height={714}
          priority
          className="w-full lg:w-1/2 max-w-[800px] h-auto animate-float"
        />
      </div>

      {/* Main Content Container - Centered */}
      <div className="relative z-[2] flex flex-col items-center justify-center w-full">
        {/* Animated Icon Section */}
        <div className="flex flex-col items-center pointer-events-none mb-4">
          {/* Welcome Text */}
          <div className="text-center mb-4 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#00ff99] drop-shadow-[0_0_15px_rgba(0,255,153,0.6)] animate-pulse">
              Welcome!
            </h1>
          </div>
          {/* R24 Logo */}
          <div className="w-40 h-40 animate-gradient-pulse drop-shadow-[0_0_3rem_rgba(244,47,95,0.5)]">
            <Image
              src="/favicon.ico"
              alt="R24 Logo"
              width={160}
              height={160}
              priority
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Typewriter Container Section - With controlled gap */}
        <div className="flex flex-col items-center gap-4 animate-fade-in px-2">
          {/* Typewriter Container */}
          <div className="bg-[rgba(20,20,30,0.8)] border-2 border-[#7b8ebc] rounded-2xl px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <pre className="font-mono text-[1.2rem] sm:text-[1.4rem] text-[#00ff99] drop-shadow-[0_0_10px_rgba(0,255,153,0.5)] whitespace-pre-wrap leading-tight">
              {typewriterText}
              {isMainComplete && (
                <span className="inline-block text-[#00ff99] font-bold text-[1.2rem] sm:text-[1.4rem] animate-cursor-blink">
                  _
                </span>
              )}
            </pre>
          </div>

          {/* Subtitle */}
          {showSubtitle && (
            <div className="font-sans text-[1rem] sm:text-[1.2rem] text-[#7b8ebc] text-center animate-slide-up">
              {subtitleText}
              <span className="inline-block text-[#7b8ebc] font-bold text-[1.2rem] animate-cursor-blink">
                _
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
