/**
 * ========================================
 * PLATE & SOCKET GENERATOR - UTILITY FUNCTIONS
 * ========================================
 * This file contains utility functions and constants used throughout the app.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clamp a value between min and max
 *
 * Task Requirement: "Input is clamped to valid limits"
 * Used for plate dimensions (width: 20-300cm, height: 30-128cm)
 */
export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

// ========================================
// NOTE: Constants (SOCKET_SIZE, SOCKET_GAP, etc.) are defined in lib/types.ts
// This file only contains utility functions
// ========================================
