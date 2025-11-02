/**
 * ========================================
 * APP WRAPPER COMPONENT
 * ========================================
 * Client-side wrapper that handles welcome screen logic.
 * This keeps app/page.tsx clean as a server component entry point.
 *
 * Responsibilities:
 * - Check localStorage for welcome screen state
 * - Manage welcome screen display/hide
 * - Prevent hydration mismatches
 */

"use client";

import React, { useState, useEffect } from "react";
import SocketGenerator from "@/components/socket-generator";
import WelcomeScreen from "@/components/welcome-screen";

export default function AppWrapper() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage to see if user has seen welcome screen
    const hasSeenWelcome = localStorage.getItem(
      "socket-generator-has-seen-welcome"
    );
    if (hasSeenWelcome !== "true") {
      setShowWelcome(true);
    }
    setIsLoading(false);
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // Save that user has seen welcome screen
    localStorage.setItem("socket-generator-has-seen-welcome", "true");
  };

  // Show loading state briefly to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-[#0a0a0a] items-center justify-center">
        <div className="opacity-0">
          <SocketGenerator />
        </div>
      </div>
    );
  }

  // Show welcome screen first time
  if (showWelcome) {
    return <WelcomeScreen onClose={handleWelcomeClose} />;
  }

  // Show main application
  return <SocketGenerator />;
}
