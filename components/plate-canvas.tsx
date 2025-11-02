/**
 * ========================================
 * PLATE & SOCKET GENERATOR - CANVAS COMPONENT
 * ========================================
 * This component renders the visual canvas showing plates and sockets.
 *
 * Task Requirements Implemented:
 * 1. "Plates are shown side by side horizontally in the canvas"
 * 2. "During dragging, show two guideline lines with live cm values"
 * 3. "Socket groups cannot be dragged across plates (only one plate is shown when editing)"
 * 4. "Each socket is 7x7 cm rendered with proper scaling"
 * 5. "Realistic proportions between plates and sockets"
 *
 * Key Features:
 * - Conditional rendering: Shows only edited plate OR all plates
 * - Live guidelines during drag with cm values
 * - Socket images properly scaled
 * - Proper anchor point positioning
 */

"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import {
  Plate,
  SocketGroup,
  calculateSocketGroupDimensions,
  SOCKET_GAP,
} from "@/lib/types";
import { useTypewriter } from "@/lib/hooks/useTypewriter";
import favicon from "@/public/favicon.ico";

// Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
// Logic: Interface for the plate canvas props.
interface PlateCanvasProps {
  plates: Plate[];
  socketGroups: SocketGroup[];
  selectedSocketGroup: SocketGroup | null;
  selectedPlate: string;
  plateScales: { [key: string]: number };
  canvasZoom: number;
  dragState: {
    isDragging: boolean;
    socketGroupId: string | null;
    offset: { x: number; y: number };
    livePosition?: { x: number; y: number };
    liveDistanceX?: number;
    liveDistanceY?: number;
  } | null;
  onSocketMouseDown: (e: React.MouseEvent, socketGroup: SocketGroup) => void;
  onSocketTouchStart: (e: React.TouchEvent, socketGroup: SocketGroup) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  shouldCenterPlates: boolean;
}

// Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
// Logic: Forward ref for the plate canvas.
const PlateCanvas = forwardRef<HTMLDivElement, PlateCanvasProps>(
  (
    {
      plates,
      socketGroups,
      selectedSocketGroup,
      selectedPlate,
      plateScales,
      canvasZoom,
      dragState,
      onSocketMouseDown,
      onSocketTouchStart,
      onZoomIn,
      onZoomOut,
      onZoomReset,
      shouldCenterPlates,
    },
    ref
  ) => {
    // Typewriter animation for "R24 Technical task" title
    const { displayText, isComplete } = useTypewriter({
      text: "R24 - Plate Socket Generator",
      speed: 200,
      delay: 1000,
    });

    /**
     * Calculate visual position of socket group on plate
     *
     * Task Requirement: "The anchor point is the bottom-left center of the first socket"
     * Task Requirement: "Position inputs: Distance from left and bottom (in cm)"
     *
     * Logic:
     * - positionX and positionY are measured from plate edges TO the anchor point
     * - Anchor point is at 3.5cm from left and bottom edges of the first socket (center of 7x7cm socket)
     * - We position using CSS absolute with 'left' and 'bottom' properties
     * - 'left' = positionX * scale (distance from left edge to anchor)
     * - 'bottom' = positionY * scale (distance from bottom edge to anchor)
     * - Then adjust by ANCHOR_OFFSET_CM to position the group's top-left corner correctly
     */
    const getSocketGroupPosition = (socketGroup: SocketGroup, plate: Plate) => {
      const scale = plateScales[plate.id] || 0;
      const { height: groupHeight } = calculateSocketGroupDimensions(
        socketGroup.count,
        socketGroup.direction
      );

      // Anchor point is bottom-left center of first socket (at 3.5cm from socket edges)
      // positionX and positionY are the distances from plate edges TO the anchor point
      // We use CSS 'bottom' property, so we position from the plate's bottom edge
      const ANCHOR_OFFSET_CM = 3.5;

      // Calculate position of first socket's bottom-left corner
      // The anchor is at 3.5cm from left edge of first socket, so first socket left = positionX - 3.5
      // The anchor is at 3.5cm from bottom edge of first socket, so first socket bottom = positionY - 3.5
      const firstSocketBottom = socketGroup.positionY - ANCHOR_OFFSET_CM;

      return {
        // 'left' property: distance from left edge to first socket's left edge
        x: (socketGroup.positionX - ANCHOR_OFFSET_CM) * scale,
        // 'bottom' property: distance from bottom edge to group's bottom edge
        // Group's bottom = first socket's bottom = positionY - 3.5
        y: firstSocketBottom * scale,
      };
    };

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the socket group size.
    const getSocketGroupSize = (socketGroup: SocketGroup, plateId: string) => {
      const { width, height } = calculateSocketGroupDimensions(
        socketGroup.count,
        socketGroup.direction
      );
      const scale = plateScales[plateId] || 0;
      return { width: width * scale, height: height * scale };
    };

    /**
     * Task Requirement: "Socket groups cannot be dragged across plates (only one plate
     * is shown in the canvas side when sockets are being edited, refer to design)"
     *
     * Logic:
     * - When editing a socket, show ONLY that socket's plate
     * - When a plate is selected (socket mode on), show ONLY that plate
     * - Otherwise show all plates
     */
    const editingMode = selectedSocketGroup !== null;
    const plateSelectedMode = selectedPlate !== "";

    const platesToShow = editingMode
      ? plates.filter((p) => p.id === selectedSocketGroup?.plateId)
      : plateSelectedMode
      ? plates.filter((p) => p.id === selectedPlate)
      : plates;

    // Determine if we're showing a single plate (which should be centered)
    const isSinglePlate = platesToShow.length === 1;

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Return the JSX.
    return (
      <div ref={ref} className="h-full w-full relative bg-[#0a0a0a]">
        {/* Logo */}
        <div className="absolute top-4 left-4 text-lg sm:text-xl font-semibold z-50 animate-fade-in flex items-center gap-2">
          <Image
            src={favicon}
            alt="R24 Socket Logo"
            width={24}
            height={24}
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
          <span className="text-white">
            {displayText}
            {!isComplete && <span className="typewriter-cursor" />}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 xl:top-4 xl:bottom-auto xl:left-auto xl:right-4 xl:translate-x-0">
          <button
            onClick={onZoomOut}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button
            onClick={onZoomReset}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            title="Reset Zoom"
          >
            {(canvasZoom * 100).toFixed(0)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>

        <div
          className={`absolute inset-0 flex items-center ${
            isSinglePlate
              ? "justify-center"
              : shouldCenterPlates
              ? "justify-center"
              : "justify-start"
          } p-5 sm:p-10 overflow-auto`}
        >
          <div
            className="flex items-center gap-4 sm:gap-6"
            style={{
              transform: `scale(${canvasZoom})`,
              transformOrigin: isSinglePlate ? "center" : "top left",
            }}
          >
            {platesToShow.map((plate) => {
              const scale = plateScales[plate.id] || 0;
              const plateWidth = plate.width * scale;
              const plateHeight = plate.height * scale;
              const plateSocketGroups = socketGroups.filter(
                (sg) => sg.plateId === plate.id
              );

              // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
              // Logic: Check if the plate has a dragged socket.
              const plateHasDraggedSocket =
                dragState?.isDragging &&
                plateSocketGroups.some(
                  (sg) => sg.id === dragState.socketGroupId
                );

              // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
              // Logic: Return the JSX.
              return (
                <div
                  key={plate.id}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="relative bg-white"
                    style={{ width: plateWidth, height: plateHeight }}
                  >
                    {/* Task Requirement: "During dragging, show two guideline lines with live cm values" */}
                    {plateHasDraggedSocket &&
                      dragState?.liveDistanceX !== undefined &&
                      dragState?.liveDistanceY !== undefined && (
                        <>
                          {/* From left edge to anchor point */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-green-500"
                            style={{
                              left: `${dragState.liveDistanceX * scale}px`,
                              zIndex: 40,
                            }}
                          >
                            <div className="absolute top-0 -left-12 bg-green-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                              {dragState.liveDistanceX.toFixed(1)} cm
                            </div>
                          </div>
                          {/* From bottom edge to anchor point */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-0.5 border-b-2 border-dashed border-green-500"
                            style={{
                              bottom: `${dragState.liveDistanceY * scale}px`,
                              zIndex: 40,
                            }}
                          >
                            <div className="absolute left-0 -bottom-6 bg-green-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                              {dragState.liveDistanceY.toFixed(1)} cm
                            </div>
                          </div>
                        </>
                      )}

                    {/* Sockets */}
                    {plateSocketGroups.map((socketGroup) => {
                      const { x, y } = getSocketGroupPosition(
                        socketGroup,
                        plate
                      );
                      const { width, height } = getSocketGroupSize(
                        socketGroup,
                        plate.id
                      );
                      const isDragging =
                        dragState?.socketGroupId === socketGroup.id;
                      const isSelected =
                        selectedSocketGroup?.id === socketGroup.id;

                      return (
                        <div
                          key={socketGroup.id}
                          className={`absolute ${isDragging ? "z-50" : ""} ${
                            isSelected
                              ? "ring-2 ring-green-500 ring-offset-2"
                              : ""
                          } cursor-move touch-manipulation`}
                          style={{
                            // Expand touch area by 10px on all sides while keeping visual position exact
                            // Adjust left/bottom by -10px so the larger wrapper's center aligns with original position
                            left: x - 10,
                            bottom: y - 10,
                            // Increase width/height by 20px total (10px on each side) for larger touch target
                            width: width + 20,
                            height: height + 20,
                            // Ensure touch events work properly and prevent default behaviors
                            touchAction: "none",
                          }}
                          onMouseDown={(e) => onSocketMouseDown(e, socketGroup)}
                          onTouchStart={(e) =>
                            onSocketTouchStart(e, socketGroup)
                          }
                        >
                          <div
                            className="grid absolute"
                            style={{
                              // Position inner content at (10px, 10px) within wrapper to maintain exact visual position
                              // This compensates for the -10px left/bottom adjustment on wrapper
                              left: "10px",
                              bottom: "10px",
                              // Keep the visual size exactly as before
                              width: width,
                              height: height,
                              gridTemplateColumns:
                                socketGroup.direction === "horizontal"
                                  ? `repeat(${socketGroup.count}, 1fr)`
                                  : "1fr",
                              gridTemplateRows:
                                socketGroup.direction === "vertical"
                                  ? `repeat(${socketGroup.count}, 1fr)`
                                  : "1fr",
                              gap: SOCKET_GAP * scale,
                            }}
                          >
                            {Array.from({ length: socketGroup.count }).map(
                              (_, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-200 border border-gray-300 rounded-sm flex items-center justify-center"
                                >
                                  <Image
                                    src="/steckdose.webp"
                                    alt="Socket"
                                    width={Math.max(7 * scale, 20)}
                                    height={Math.max(7 * scale, 20)}
                                    className="object-contain w-full h-full"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Plate dimensions label */}
                  {/* When selectedPlate is set, show "Rückwand" prefix only for selected plate */}
                  {/* When selectedPlate is empty, show all plates without "Rückwand" prefix */}
                  {(!selectedPlate || selectedPlate === plate.id) && (
                    <div className="text-xs text-gray-400">
                      {selectedPlate === plate.id ? "Rückwand " : ""}
                      {plates.findIndex((p) => p.id === plate.id) + 1}:{" "}
                      {plate.width.toFixed(1)} x {plate.height.toFixed(1)} cm
                    </div>
                  )}
                  {/* Socket group positions - only show when single plate is selected */}
                  {isSinglePlate && plateSocketGroups.length > 0 && (
                    <div className="mt-2">
                      {/* Title for socket groups */}
                      <div className="text-[10px] sm:text-xs text-gray-400 font-medium text-center mb-1">
                        Steckdosengr.
                      </div>
                      {/* List of socket group positions */}
                      <div className="max-h-32 overflow-y-auto space-y-1 text-center">
                        {plateSocketGroups.map((sg, idx) => {
                          const isDragging = dragState?.socketGroupId === sg.id;
                          // Use live drag values if dragging, otherwise use stored position values
                          const positionX =
                            isDragging && dragState?.liveDistanceX !== undefined
                              ? dragState.liveDistanceX
                              : sg.positionX;
                          const positionY =
                            isDragging && dragState?.liveDistanceY !== undefined
                              ? dragState.liveDistanceY
                              : sg.positionY;
                          return (
                            <div
                              key={sg.id}
                              className={`text-[10px] sm:text-xs text-gray-400 ${
                                isDragging ? "text-green-400 font-semibold" : ""
                              }`}
                            >
                              {idx + 1}: X: {positionX.toFixed(1)} cm | Y:{" "}
                              {positionY.toFixed(1)} cm
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

// Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
// Logic: Display name for the plate canvas.
PlateCanvas.displayName = "PlateCanvas";

export default PlateCanvas;
