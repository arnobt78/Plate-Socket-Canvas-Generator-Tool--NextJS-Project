"use client";

import React from "react";

interface StackedIndicatorProps {
  number: number;
}

export default function StackedIndicator({ number }: StackedIndicatorProps) {
  return (
    <div className="hidden md:block relative w-8 h-8">
      <div className="absolute left-[0px] top-1/2 -translate-y-1/2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white border-2 border-gray-100 text-gray-500 relative z-10">
          {number}
        </div>
        <div
          className="absolute top-[6px] left-[0px] w-8 h-8 rounded-full bg-white border-2 border-gray-100"
          style={{ zIndex: 9 }}
        ></div>
        <div
          className="absolute top-[12px] left-[0px] w-8 h-8 rounded-full bg-white border-2 border-gray-100"
          style={{ zIndex: 8 }}
        ></div>
        <div
          className="absolute top-[18px] left-[0px] w-8 h-8 rounded-full bg-white border-2 border-gray-100"
          style={{ zIndex: 7 }}
        ></div>
      </div>
    </div>
  );
}
