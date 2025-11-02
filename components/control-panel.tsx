/**
 * ========================================
 * PLATE & SOCKET GENERATOR - CONTROL PANEL
 * ========================================
 * This component handles all user input and configuration UI.
 *
 * Task Requirements Implemented:
 * 1. "Users can input custom plate dimensions: Width 20-300cm, Height 30-128cm"
 * 2. "Add new plates (no limit)"
 * 3. "Delete plates (minimum 1 plate must remain)"
 * 4. "A socket section can be toggled ON or OFF"
 * 5. "Plate selector: Changes the plate it is attached to (only if the plate is valid)"
 * 6. "Number selector: Choose 1 to 5 sockets in the group"
 * 7. "Direction selector: Horizontal or Vertical"
 * 8. "Position inputs: Distance from left and bottom (in cm)"
 * 9. "Plates must be at least 40x40 cm to accept sockets"
 * 10. "Show configured socket groups with plate dimensions and cost"
 *
 * Key Features:
 * - Section 1: Plate dimension management (add, delete, input validation)
 * - Section 2: Socket configuration (toggle, plate selection, count, direction, position)
 * - Interactive UI based on selection state
 * - Error messages for invalid operations
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import StackedIndicator from "@/components/stacked-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Minus, Plus, MoreVertical, AlertTriangle } from "lucide-react";
import { Plate, SocketGroup, isPlateLargeEnoughForSockets } from "@/lib/types";
import { toast } from "sonner";

// Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
// Logic: Interface for the control panel props.
interface ControlPanelProps {
  plates: Plate[];
  socketGroups: SocketGroup[];
  socketToggle: boolean;
  setSocketToggle: (value: boolean) => void;
  selectedPlate: string;
  setSelectedPlate: (value: string) => void;
  socketCount: number;
  setSocketCount: (value: number) => void;
  socketDirection: "horizontal" | "vertical";
  setSocketDirection: (value: "horizontal" | "vertical") => void;
  positionX: string;
  setPositionX: (value: string) => void;
  positionY: string;
  setPositionY: (value: string) => void;
  errorMessage: string;
  updatePlate: (plateId: string, width?: number, height?: number) => void;
  addPlate: () => void;
  deletePlate: (plateId: string) => void;
  handleConfirmSocketGroup: () => void;
  handleAddSocketGroup: () => void;
  handleSocketGroupSelection: (groupId: string) => void;
  handleSocketGroupView: (groupId: string) => void;
  handleDeleteSocketGroup: (groupId: string) => void;
  selectedSocketGroup: SocketGroup | null;
  isEditingSocket: boolean;
  setIsEditingSocket: (value: boolean) => void;
}

// Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
// Logic: Display name for the control panel.
export default function ControlPanel({
  plates,
  socketGroups,
  socketToggle,
  setSocketToggle,
  selectedPlate,
  setSelectedPlate,
  socketCount,
  setSocketCount,
  socketDirection,
  setSocketDirection,
  positionX,
  setPositionX,
  positionY,
  setPositionY,
  errorMessage,
  updatePlate,
  addPlate,
  deletePlate,
  handleConfirmSocketGroup,
  handleAddSocketGroup,
  handleSocketGroupSelection,
  handleSocketGroupView,
  handleDeleteSocketGroup,
  selectedSocketGroup,
  isEditingSocket,
  setIsEditingSocket,
}: ControlPanelProps) {
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the state of the selected plate input (for visual highlighting).
  const [selectedPlateInput, setSelectedPlateInput] = useState<string>(
    plates.length > 0 ? `${plates[0].id}-width` : ""
  );
  // Track which input actually has DOM focus (for preventing overwrites while typing)
  const [focusedInput, setFocusedInput] = useState<string>("");
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the state of the selected section.
  const [selectedSection, setSelectedSection] = useState<string>("section1");
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [socketGroupToDelete, setSocketGroupToDelete] =
    useState<SocketGroup | null>(null);
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the input values for each plate.
  // Initialize with current plate values to prevent empty state issues
  const [plateInputs, setPlateInputs] = useState<{
    [key: string]: { width: string; height: string; error: string };
  }>(() => {
    const initial: {
      [key: string]: { width: string; height: string; error: string };
    } = {};
    plates.forEach((plate) => {
      initial[plate.id] = {
        width: plate.width.toString(),
        height: plate.height.toString(),
        error: "",
      };
    });
    return initial;
  });

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Sync plate inputs with plates prop
  // IMPORTANT: Update when plates change (new plates added OR dimensions change)
  // BUT: Don't overwrite if user is currently typing (has actual DOM focus on that input)
  React.useEffect(() => {
    const inputs: {
      [key: string]: { width: string; height: string; error: string };
    } = {};
    let hasChanges = false;

    plates.forEach((plate) => {
      const existingInput = plateInputs[plate.id];
      const newWidth = plate.width.toString();
      const newHeight = plate.height.toString();

      // Only update if:
      // 1. No input state exists for this plate (new plate), OR
      // 2. Plate dimensions changed AND user is NOT currently typing (has actual focus) in this plate's inputs
      // IMPORTANT: Use focusedInput (actual DOM focus) not selectedPlateInput (visual highlighting)
      const isCurrentlyTyping =
        focusedInput === `${plate.id}-width` ||
        focusedInput === `${plate.id}-height`;

      if (!existingInput) {
        // New plate - always initialize
        inputs[plate.id] = {
          width: newWidth,
          height: newHeight,
          error: "",
        };
        hasChanges = true;
      } else if (!isCurrentlyTyping) {
        // Existing plate - update if dimensions changed
        if (
          existingInput.width !== newWidth ||
          existingInput.height !== newHeight
        ) {
          inputs[plate.id] = {
            width: newWidth,
            height: newHeight,
            error: existingInput.error, // Preserve error state
          };
          hasChanges = true;
        }
      }
      // If user is typing (has actual focus), keep existing input state to prevent overwriting
    });

    if (hasChanges) {
      setPlateInputs((prev) => ({ ...prev, ...inputs }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plates, focusedInput]); // Trigger when plates change (dimensions or count) or focus changes

  // Task Requirement: "Plates must be at least 40x40 cm to accept sockets"
  // Logic: Show warning toast when plates are too small for sockets
  useEffect(() => {
    if (socketToggle && isEditingSocket) {
      const tooSmallPlates = plates.filter(
        (p) => !isPlateLargeEnoughForSockets(p)
      );
      if (tooSmallPlates.length > 0) {
        const plateList = tooSmallPlates
          .map(
            (plate) =>
              `#${
                plates.findIndex((p) => p.id === plate.id) + 1
              }: ${plate.width.toFixed(1)} × ${plate.height.toFixed(1)} cm`
          )
          .join(", ");

        toast.warning("Einige Rückwände sind zu klein", {
          description: `Rückwände müssen mindestens 40 × 40 cm groß sein, um Steckdosen zu akzeptieren. Zu kleine Rückwände: ${plateList}`,
          duration: 5000,
          id: "plate-size-warning", // Use id to prevent duplicate toasts
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plates, socketToggle, isEditingSocket]); // Trigger when plates change or editing state changes

  // Sync section 2 plate selection to section 1 visual highlighting
  // This provides visual feedback so user knows which plate they're working with
  // Priority: User input focus takes precedence over section 2 selection
  useEffect(() => {
    // Only sync if user is not currently typing in an input field
    // This ensures user input focus has priority (section 1 priority)
    if (focusedInput !== "") {
      // User is typing - don't override their input focus
      return;
    }

    // If a plate is selected in section 2, highlight it in section 1
    if (selectedPlate && selectedPlate !== "") {
      const selectedPlateObj = plates.find((p) => p.id === selectedPlate);
      if (selectedPlateObj) {
        // Highlight the plate by setting selectedPlateInput to its width input
        // This will make isSelected true for that plate's width/height inputs
        setSelectedPlateInput(`${selectedPlate}-width`);
      }
    } else if (selectedPlate === "") {
      // No plate selected in section 2 - clear highlight if not from user input
      // But keep current selection if user had manually selected something
      // Only clear if it was previously set by section 2 selection
      // (This is handled by user input focus taking priority above)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlate, focusedInput, plates]); // Sync when selectedPlate changes or focus changes

  // Scroll selected plate into view on mobile to prevent it from going off-screen when expanded
  // This ensures the expanded plate card stays visible when selected
  useEffect(() => {
    if (selectedPlateInput && selectedPlateInput !== "") {
      // Extract plate ID from selectedPlateInput (format: "plateId-width" or "plateId-height")
      const plateId = selectedPlateInput.split("-")[0];
      const plateElement = document.getElementById(`plate-card-${plateId}`);
      if (plateElement) {
        // Use scrollIntoView with smooth behavior and ensure the element is visible
        // block: 'nearest' prevents excessive scrolling, 'start' aligns to top of container
        plateElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [selectedPlateInput]); // Trigger when selectedPlateInput changes

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Task Requirement: "Input is clamped to valid limits."
  // Logic: Handle width input change with clamping.
  const handleWidthChange = (plateId: string, value: string) => {
    // Only allow numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value !== "" && !regex.test(value)) {
      return; // Ignore invalid characters
    }

    // Validate format: maximum 3 digits before decimal, maximum 2 digits after decimal (format: 111.11)
    if (value !== "" && value !== ".") {
      const parts = value.split(".");
      const beforeDecimal = parts[0];
      const afterDecimal = parts[1];

      // Check if more than 3 digits before decimal
      if (beforeDecimal.length > 3) {
        return; // Ignore if exceeds 3 digits before decimal
      }

      // Check if more than 2 digits after decimal
      if (afterDecimal && afterDecimal.length > 2) {
        return; // Ignore if exceeds 2 digits after decimal
      }
    }

    // Always update the input state, allowing empty values
    setPlateInputs((prev) => ({
      ...prev,
      [plateId]: {
        width: value,
        height: prev[plateId]?.height || "",
        error: "",
      },
    }));

    // Only update plate if it's a valid complete number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value !== "" && value !== ".") {
      if (numValue < 20 || numValue > 300) {
        setPlateInputs((prev) => ({
          ...prev,
          [plateId]: {
            ...prev[plateId],
            error: "Breite muss zwischen 20 - 300 cm liegen",
          },
        }));
      } else if (numValue >= 20 && numValue <= 300) {
        updatePlate(plateId, numValue);
      }
    }
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Task Requirement: "Input is clamped to valid limits."
  // Logic: Handle height input change with clamping.
  const handleHeightChange = (plateId: string, value: string) => {
    // Only allow numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value !== "" && !regex.test(value)) {
      return; // Ignore invalid characters
    }

    // Validate format: maximum 3 digits before decimal, maximum 2 digits after decimal (format: 111.11)
    if (value !== "" && value !== ".") {
      const parts = value.split(".");
      const beforeDecimal = parts[0];
      const afterDecimal = parts[1];

      // Check if more than 3 digits before decimal
      if (beforeDecimal.length > 3) {
        return; // Ignore if exceeds 3 digits before decimal
      }

      // Check if more than 2 digits after decimal
      if (afterDecimal && afterDecimal.length > 2) {
        return; // Ignore if exceeds 2 digits after decimal
      }
    }

    // Always update the input state, allowing empty values
    setPlateInputs((prev) => ({
      ...prev,
      [plateId]: {
        width: prev[plateId]?.width || "",
        height: value,
        error: "",
      },
    }));

    // Only update plate if it's a valid complete number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value !== "" && value !== ".") {
      if (numValue < 30 || numValue > 128) {
        setPlateInputs((prev) => ({
          ...prev,
          [plateId]: {
            ...prev[plateId],
            error: "Höhe muss zwischen 30 - 128 cm liegen",
          },
        }));
      } else if (numValue >= 30 && numValue <= 128) {
        updatePlate(plateId, undefined, numValue);
      }
    }
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Task Requirement: "Input is clamped to valid limits."
  // Logic: Handle width input blur to clamp final value.
  const handleWidthBlur = (plateId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || value === "" || value === ".") {
      // Reset to current plate value if invalid
      const currentPlate = plates.find((p) => p.id === plateId);
      if (currentPlate) {
        setPlateInputs((prev) => ({
          ...prev,
          [plateId]: {
            ...prev[plateId],
            width: currentPlate.width.toString(),
            error: "",
          },
        }));
      }
      return;
    }
    // Clamp to valid range
    const clampedValue = Math.max(20, Math.min(300, numValue));
    updatePlate(plateId, clampedValue);
    setPlateInputs((prev) => ({
      ...prev,
      [plateId]: {
        ...prev[plateId],
        width: clampedValue.toString(),
        error: "",
      },
    }));
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Task Requirement: "Input is clamped to valid limits."
  // Logic: Handle height input blur to clamp final value.
  const handleHeightBlur = (plateId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || value === "" || value === ".") {
      // Reset to current plate value if invalid
      const currentPlate = plates.find((p) => p.id === plateId);
      if (currentPlate) {
        setPlateInputs((prev) => ({
          ...prev,
          [plateId]: {
            ...prev[plateId],
            height: currentPlate.height.toString(),
            error: "",
          },
        }));
      }
      return;
    }
    // Clamp to valid range
    const clampedValue = Math.max(30, Math.min(128, numValue));
    updatePlate(plateId, undefined, clampedValue);
    setPlateInputs((prev) => ({
      ...prev,
      [plateId]: {
        ...prev[plateId],
        height: clampedValue.toString(),
        error: "",
      },
    }));
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle position X (distance from left) input change with format validation.
  const handlePositionXChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value !== "" && !regex.test(value)) {
      return; // Ignore invalid characters
    }

    // Validate format: maximum 3 digits before decimal, maximum 2 digits after decimal (format: 111.11)
    if (value !== "" && value !== ".") {
      const parts = value.split(".");
      const beforeDecimal = parts[0];
      const afterDecimal = parts[1];

      // Check if more than 3 digits before decimal
      if (beforeDecimal.length > 3) {
        return; // Ignore if exceeds 3 digits before decimal
      }

      // Check if more than 2 digits after decimal
      if (afterDecimal && afterDecimal.length > 2) {
        return; // Ignore if exceeds 2 digits after decimal
      }
    }

    // Update position X value
    setPositionX(value);
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle position Y (distance from bottom) input change with format validation.
  const handlePositionYChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value !== "" && !regex.test(value)) {
      return; // Ignore invalid characters
    }

    // Validate format: maximum 3 digits before decimal, maximum 2 digits after decimal (format: 111.11)
    if (value !== "" && value !== ".") {
      const parts = value.split(".");
      const beforeDecimal = parts[0];
      const afterDecimal = parts[1];

      // Check if more than 3 digits before decimal
      if (beforeDecimal.length > 3) {
        return; // Ignore if exceeds 3 digits before decimal
      }

      // Check if more than 2 digits after decimal
      if (afterDecimal && afterDecimal.length > 2) {
        return; // Ignore if exceeds 2 digits after decimal
      }
    }

    // Update position Y value
    setPositionY(value);
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle delete button click - open confirmation dialog
  const handleDeleteClick = (socketGroup: SocketGroup) => {
    setSocketGroupToDelete(socketGroup);
    setDeleteDialogOpen(true);
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle delete confirmation - delete the socket group
  const handleDeleteConfirm = () => {
    if (socketGroupToDelete) {
      const plate = plates.find((p) => p.id === socketGroupToDelete.plateId);
      const socketGroupIndex = socketGroups.findIndex(
        (sg) => sg.id === socketGroupToDelete.id
      );

      // Delete the socket group
      handleDeleteSocketGroup(socketGroupToDelete.id);

      // Show success toast notification with dynamic information
      toast.success("Steckdose gelöscht", {
        description: `Rückwand #${socketGroupIndex + 1}: ${plate?.width.toFixed(
          1
        )} × ${plate?.height.toFixed(1)} cm | ${
          socketGroupToDelete.count
        } × Steckdose + 20.00 € wurde entfernt`,
      });

      setDeleteDialogOpen(false);
      setSocketGroupToDelete(null);
    }
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle delete cancel - close dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSocketGroupToDelete(null);
  };

  return (
    <div className="w-full h-full bg-white text-black px-2 md:px-4 py-4 overflow-y-auto overflow-x-hidden scrollbar-mobile-hide">
      {/* Section 1: Plate Dimensions */}
      <div className="mb-6" onClick={() => setSelectedSection("section1")}>
        {/* Title with numbered badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors flex-shrink-0 ${
              selectedSection === "section1"
                ? "bg-black text-white"
                : "bg-white border-2 border-gray-300 text-gray-800"
            }`}
          >
            1
          </div>
          <div className="flex flex-row items-center min-w-0 flex-1">
            <h2 className="text-xl font-semibold whitespace-nowrap">Maße.</h2>
            <h2 className="text-xl font-medium whitespace-nowrap">
              {" "}
              &nbsp;Eingeben.
            </h2>
          </div>
        </div>

        {/* Plates with vertical line */}
        <div className="relative">
          {/* Vertical line that extends throughout section 1 */}
          <div className="hidden md:block absolute left-[14px] top-0 bottom-0 w-0.5 bg-gray-100"></div>

          {/* Plates list */}
          <div className="grid grid-cols-1 gap-2 sm:gap-4 ml-0 md:ml-10">
            {plates.map((plate, idx) => {
              const isSelected =
                selectedPlateInput === `${plate.id}-width` ||
                selectedPlateInput === `${plate.id}-height`;
              return (
                <div
                  key={plate.id}
                  id={`plate-card-${plate.id}`}
                  className="relative"
                >
                  {/* Plate card */}
                  <div
                    className={`bg-gray-100 rounded-lg px-1 md:px-4 w-full box-border ${
                      isSelected ? "py-2 sm:py-4" : "py-4"
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 w-full">
                      {/* Item number badge - inside card, on left side */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isSelected
                            ? "bg-black text-white"
                            : "bg-white border-2 border-gray-500 text-gray-700"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      {/* Input fields */}
                      <div className="flex flex-row items-center gap-2 md:gap-4 w-full">
                        {/* Width */}
                        <div className="flex-1 min-w-0 sm:min-w-[150px] md:min-w-[170px]">
                          {isSelected && (
                            <div className="flex items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                              <span className="text-[10px] sm:text-xs text-gray-600 font-semibold whitespace-nowrap">
                                Breite
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-500 font-normal whitespace-nowrap">
                                20 - 300 cm
                              </span>
                            </div>
                          )}
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="40.0"
                              value={plateInputs[plate.id]?.width || ""}
                              onFocus={() => {
                                setSelectedPlateInput(`${plate.id}-width`);
                                setFocusedInput(`${plate.id}-width`);
                              }}
                              onChange={(e) =>
                                handleWidthChange(plate.id, e.target.value)
                              }
                              onBlur={(e) => {
                                setFocusedInput("");
                                handleWidthBlur(plate.id, e.target.value);
                              }}
                              className={`bg-white border-none rounded-lg px-3 py-2 font-bold w-full text-left xl:text-center ${
                                isSelected ? "text-md" : "text-md"
                              }`}
                            />
                            <span className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-normal">
                              cm
                            </span>
                          </div>
                          {isSelected && (
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 text-center">
                              {Math.round(plate.width * 10)} mm
                            </div>
                          )}
                        </div>

                        {/* X separator */}
                        <div className="text-xl text-gray-600 flex-shrink-0">
                          ×
                        </div>

                        {/* Height */}
                        <div className="flex-1 min-w-0 sm:min-w-[150px] md:min-w-[170px]">
                          {isSelected && (
                            <div className="flex items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                              <span className="text-[10px] sm:text-xs text-gray-600 font-semibold whitespace-nowrap">
                                Höhe
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-500 font-normal whitespace-nowrap">
                                30 - 128 cm
                              </span>
                            </div>
                          )}
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="40.0"
                              value={plateInputs[plate.id]?.height || ""}
                              onFocus={() => {
                                setSelectedPlateInput(`${plate.id}-height`);
                                setFocusedInput(`${plate.id}-height`);
                              }}
                              onChange={(e) =>
                                handleHeightChange(plate.id, e.target.value)
                              }
                              onBlur={(e) => {
                                setFocusedInput("");
                                handleHeightBlur(plate.id, e.target.value);
                              }}
                              className={`bg-white border-none rounded-lg px-3 py-2 font-bold w-full text-left xl:text-center ${
                                isSelected ? "text-md" : "text-md"
                              }`}
                            />
                            <span className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-normal">
                              cm
                            </span>
                          </div>
                          {isSelected && (
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 text-center">
                              {Math.round(plate.height * 10)} mm
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      {plates.length > 1 && (
                        <button
                          onClick={() => deletePlate(plate.id)}
                          className="w-7 h-7 rounded-full bg-red-200 flex items-center justify-center hover:bg-red-300 transition-colors flex-shrink-0"
                        >
                          <Minus className="h-4 w-4 text-red-400 hover:text-red-500 transition-colors stroke-[3]" />
                        </button>
                      )}
                    </div>
                    {/* Error message for this plate */}
                    {plateInputs[plate.id]?.error && (
                      <div className="text-red-600 text-xs mt-2 ml-12">
                        {plateInputs[plate.id].error}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centered stacked indicator overlayed (doesn't affect spacing) */}
          <div className="hidden md:block absolute left-[0px] top-1/2 -translate-y-1/2 pointer-events-none">
            <StackedIndicator number={2} />
          </div>

          {/* Add plate item button */}
          <div className="flex justify-end mt-4 mb-8">
            <Button
              onClick={addPlate}
              size={undefined}
              className="w-fit h-auto px-6 py-2.5 bg-green-50 border-2 border-green-300 text-green-500 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-200 hover:text-green-600 shadow-lg active:bg-green-300 active:text-green-700"
            >
              Rückwand hinzufügen
              <Plus className="h-4 w-4 stroke-[3] text-green-500 hover:text-green-600 transition-colors" />
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Socket Configuration */}
      <div
        className="relative mb-6"
        onClick={() => setSelectedSection("section2")}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors flex-shrink-0 ${
              selectedSection === "section2"
                ? "bg-black text-white"
                : "bg-white border-2 border-gray-300 text-gray-800"
            }`}
          >
            2
          </div>
          <div className="flex flex-row items-center min-w-0 flex-1">
            <h2 className="text-xl font-semibold whitespace-nowrap">
              Steckdosen.
            </h2>
            <h2 className="text-xl font-medium whitespace-nowrap">
              {" "}
              &nbsp;Auswählen.
            </h2>
          </div>
        </div>

        {/* Continue vertical line from section 1 */}
        <div className="hidden md:block absolute left-[14px] top-[50px] bottom-0 w-0.5 bg-gray-100"></div>

        <div className="relative ml-0 md:ml-10">
          <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <span
                className={`text-md ${
                  socketToggle ? "font-semibold" : "font-medium"
                } text-gray-700 flex-1`}
              >
                Ausschnitte für Steckdosen angeben?
              </span>
              <Toggle
                pressed={socketToggle}
                onPressedChange={setSocketToggle}
                className="data-[state=on]:bg-green-600 flex-shrink-0"
              />
            </div>
          </div>

          {socketToggle && (
            <>
              {/* Reused stacked circles indicator before configured list */}
              <div className="relative md:ml-0 md:h-0 mt-2">
                <div className="absolute left-[0px] md:left-[-40px] top-0">
                  <StackedIndicator number={3} />
                </div>
              </div>

              {/* Section 2: Edit UI - Shown when isEditingSocket = true */}
              {isEditingSocket && (
                <>
                  <div className="">
                    <p className="text-md text-gray-700 font-medium mb-2">
                      Wähle die Rückwand für die Steckdose
                    </p>

                    {/* Plate selection list */}
                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap bg-gray-100 rounded-lg p-4">
                        {plates
                          .filter(isPlateLargeEnoughForSockets)
                          .map((plate) => {
                            // Calculate aspect ratio to maintain proportions
                            const aspectRatio = plate.width / plate.height;

                            // Scale based on actual dimensions within valid ranges
                            // Width range: 20-300 cm -> Map to display size: 30-100px
                            // Height range: 30-128 cm -> Map to display size: 30-100px
                            const widthScale =
                              ((plate.width - 20) / (300 - 20)) * 70 + 30;
                            const heightScale =
                              ((plate.height - 30) / (128 - 30)) * 70 + 30;

                            // Use the larger scale to reflect overall plate size
                            const maxDisplaySize = Math.max(
                              widthScale,
                              heightScale
                            );

                            let displayWidth = maxDisplaySize;
                            let displayHeight = maxDisplaySize / aspectRatio;

                            // If height would be larger, scale by height instead
                            if (displayHeight > maxDisplaySize) {
                              displayHeight = maxDisplaySize;
                              displayWidth = maxDisplaySize * aspectRatio;
                            }

                            return (
                              <div
                                key={plate.id}
                                className="flex flex-col items-center"
                              >
                                {/* Fixed-size outer card with inner dynamic frame */}
                                {/* Fixed sizes: mobile 2 per row (w-28), tablet 3 per row (sm:w-32), desktop 4 per row (md:w-36) */}
                                <button
                                  onClick={() => setSelectedPlate(plate.id)}
                                  className={`w-28 sm:w-32 md:w-36 aspect-square border-2 rounded-lg flex items-center justify-center transition-colors ${
                                    selectedPlate === plate.id
                                      ? "border-green-100 bg-green-50"
                                      : "border-gray-100 bg-white"
                                  }`}
                                >
                                  {/* Dynamic inner frame based on plate dimensions */}
                                  {/* Maintain exact aspect ratio using calculated display size relative to 144px container */}
                                  {/* The CSS aspectRatio property ensures 1:1 frame dimensions are preserved regardless of container size */}
                                  <div
                                    className={`rounded-lg ${
                                      selectedPlate === plate.id
                                        ? "bg-green-100 border-2 border-green-300"
                                        : "bg-gray-100 border-2 border-gray-300"
                                    }`}
                                    style={{
                                      // Use calculated display size converted to percentage of 144px (desktop base size)
                                      // The percentage scales proportionally: Mobile w-28 (112px), Tablet w-32 (128px), Desktop w-36 (144px)
                                      // CSS aspectRatio property ensures exact plate proportions are maintained regardless of container size
                                      width: `${(displayWidth / 144) * 100}%`,
                                      // This is the KEY: CSS aspectRatio maintains exact 1:1 frame dimensions (actual plate.width / plate.height ratio)
                                      aspectRatio: `${plate.width} / ${plate.height}`,
                                      // Ensure frame doesn't exceed container boundaries
                                      maxWidth: "90%",
                                      maxHeight: "90%",
                                    }}
                                  />
                                </button>
                                <div className="text-xs text-center mt-2 text-gray-600 w-28 sm:w-32 md:w-36">
                                  {plate.width.toFixed(1)} x{" "}
                                  {plate.height.toFixed(1)} cm
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Socket Count and direction selection */}
                  {selectedPlate && (
                    <div className="">
                      {/* Reused stacked circles indicator before configured list */}
                      <div className="relative md:ml-0 md:h-0 mt-2">
                        <div className="absolute left-[0px] md:left-[-40px] top-0">
                          <StackedIndicator number={4} />
                        </div>
                      </div>
                      <div>
                        <p className="text-md text-gray-700 font-medium mb-2">
                          Bestimme Anzahl und Ausrichtung der Steckdosen
                        </p>
                        {/* Socket count and direction selection container */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4  w-full bg-gray-100 rounded-lg p-4">
                          <div>
                            <span className="text-sm text-gray-700 font-medium">
                              Anzahl
                            </span>
                            {/* Socket count buttons */}
                            <div className="flex mt-1 w-fit border border-gray-300 rounded-lg overflow-hidden bg-white">
                              {[1, 2, 3, 4, 5].map((num, index) => (
                                <button
                                  key={num}
                                  onClick={() => setSocketCount(num)}
                                  className={`
                            flex items-center justify-center
                            w-12 h-10
                            font-semibold text-gray-800
                            transition-colors
                            ${
                              socketCount === num
                                ? "bg-green-100  text-gray-800 transition-colors hover:bg-green-200 hover:text-green-600"
                                : "bg-white text-gray-800 hover:bg-gray-50"
                            }
                            ${
                              index === 0
                                ? "rounded-l-lg"
                                : index === 4
                                ? "rounded-r-lg"
                                : ""
                            }
                            ${index !== 0 ? "border-l border-gray-300" : ""}
                          `}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Direction selection */}
                          <div>
                            <span className="text-sm text-gray-700 font-medium">
                              Steckdosen-Ausrichtung
                            </span>
                            {/* Direction buttons */}
                            <div className="flex mt-1 w-fit border border-gray-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => setSocketDirection("horizontal")}
                                className={`
                          flex items-center justify-center
                          px-4 h-10
                          font-semibold text-gray-800
                          transition-all
                          ${
                            socketDirection === "horizontal"
                              ? "bg-green-50 border-2 border-green-300 text-green-500 transition-colors hover:bg-green-200 hover:text-green-600"
                              : "bg-white text-gray-800 hover:bg-gray-50"
                          }
                        `}
                              >
                                Horizontal
                              </button>
                              <button
                                onClick={() => setSocketDirection("vertical")}
                                className={`
                          flex items-center justify-center
                          px-4 h-10
                          font-semibold text-gray-800
                          transition-all
                          border-l border-gray-300
                          ${
                            socketDirection === "vertical"
                              ? "bg-green-50 border-2 border-green-300 text-green-500 transition-colors hover:bg-green-200 hover:text-green-600"
                              : "bg-white text-gray-800 hover:bg-gray-50"
                          }
                        `}
                              >
                                Vertikal
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Socket position selection */}
                      <div className="mt-4">
                        {/* Reused stacked circles indicator before configured list */}
                        <div className="relative md:ml-0 md:h-0 mt-2">
                          <div className="absolute left-[0px] md:left-[-40px] top-0">
                            <StackedIndicator number={5} />
                          </div>
                        </div>
                        <p className="text-md text-gray-700 font-medium mb-2">
                          Positioniere die Steckdose
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex items-end gap-2 md:gap-4">
                            {/* X position input */}
                            <div className="relative flex-1">
                              <label className="text-sm text-gray-700 font-medium mb-1 block">
                                Abstand von Links
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="3.0"
                                  value={positionX}
                                  onChange={(e) =>
                                    handlePositionXChange(e.target.value)
                                  }
                                  className="bg-white border-none rounded-lg px-3 py-2 text-md font-bold w-full text-center"
                                />
                                <span className="absolute right-1 md:right-3 bottom-3 text-sm text-gray-600 font-normal">
                                  cm
                                </span>
                              </div>
                            </div>

                            {/* X separator */}
                            <div className="text-xl text-gray-600 mb-2">×</div>

                            {/* Y position input */}
                            <div className="relative flex-1">
                              <label className="text-sm text-gray-700 font-medium mb-1 block">
                                Abstand von unten
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="3.0"
                                  value={positionY}
                                  onChange={(e) =>
                                    handlePositionYChange(e.target.value)
                                  }
                                  className="bg-white border-none rounded-lg px-3 py-2 text-md font-bold w-full text-center"
                                />
                                <span className="absolute right-1 md:right-3 bottom-3 text-sm text-gray-600 font-normal">
                                  cm
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {errorMessage && (
                        <div className="text-red-600 text-xs mt-2">
                          {errorMessage}
                        </div>
                      )}

                      {/* Confirm socket group button */}
                      <div className="flex justify-end mt-4 mb-8">
                        <Button
                          onClick={handleConfirmSocketGroup}
                          size={undefined}
                          className="w-fit h-auto px-6 py-2.5 bg-green-50 border-2 border-green-300 text-green-500 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-200 hover:text-green-600 shadow-lg active:bg-green-300 active:text-green-700"
                        >
                          Steckdose bestätigen
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reused stacked circles indicator before configured list */}
              <div className="relative md:ml-0 md:h-0 mt-2">
                <div className="absolute left-[0px] md:left-[-40px] top-0">
                  <StackedIndicator number={6} />
                </div>
              </div>

              {/* Configured socket groups - Always show when socketToggle is true */}
              {socketGroups.length > 0 && (
                <div className={`mt-4 ${!isEditingSocket ? "" : ""}`}>
                  <p className="text-md text-gray-700 font-medium mb-2">
                    Konfigurierte Steckdosen bestätigen
                  </p>
                  {socketGroups.map((sg, idx) => {
                    const plate = plates.find((p) => p.id === sg.plateId);
                    const isSelected = selectedSocketGroup?.id === sg.id;
                    return (
                      <div
                        key={sg.id}
                        onClick={() => {
                          // When not editing, clicking the item displays it on canvas
                          if (!isEditingSocket) {
                            handleSocketGroupView(sg.id);
                          }
                        }}
                        className={`flex items-center justify-between p-3 transition-colors border rounded-lg mb-2 cursor-pointer ${
                          isSelected && !isEditingSocket
                            ? "bg-green-50 hover:bg-green-100 border-green-300"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        <div className="text-md font-medium">
                          <span className="text-gray-700">
                            {idx + 1}. Rückwand - {plate?.width} x{" "}
                            {plate?.height}
                          </span>
                          <span className="text-gray-300">{" | "}</span>
                          <span className="text-gray-700">
                            {sg.count} x Steckdose
                          </span>
                          <span className="text-gray-500"> + 20.00 €</span>
                        </div>

                        <div className="flex gap-1">
                          {/* Task Requirement: Edit/Delete socket groups */}
                          {selectedSocketGroup?.id === sg.id &&
                          isEditingSocket ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering parent onClick
                                handleDeleteClick(sg);
                              }}
                              className="h-8 px-3 text-xs rounded-lg"
                              title="Delete"
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering parent onClick
                                handleSocketGroupSelection(sg.id);
                              }}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200"
                              title="Edit"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add socket group button */}
                  <div className="flex justify-end mt-4 mb-4">
                    <Button
                      onClick={handleAddSocketGroup}
                      size={undefined}
                      className="w-fit h-auto px-6 py-2.5 bg-green-50 border-2 border-green-300 text-green-500 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-200 hover:text-green-600 shadow-lg active:bg-green-300 active:text-green-700"
                    >
                      Steckdose hinzufügen
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Steckdose löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {socketGroupToDelete &&
                (() => {
                  const plate = plates.find(
                    (p) => p.id === socketGroupToDelete.plateId
                  );
                  const socketGroupIndex = socketGroups.findIndex(
                    (sg) => sg.id === socketGroupToDelete.id
                  );
                  return (
                    <>
                      Möchten Sie diese Steckdosen-Konfiguration wirklich
                      löschen?
                      <br />
                      <strong>
                        Rückwand #{socketGroupIndex + 1} -{" "}
                        {plate?.width.toFixed(1)} × {plate?.height.toFixed(1)}{" "}
                        cm | {socketGroupToDelete.count} × Steckdose + 20.00 €
                      </strong>
                    </>
                  );
                })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="mr-2"
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
