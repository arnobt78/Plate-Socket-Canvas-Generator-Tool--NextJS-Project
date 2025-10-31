/**
 * ========================================
 * PLATE & SOCKET GENERATOR - MAIN COMPONENT
 * ========================================
 * This is the main client component that orchestrates the entire application.
 *
 * Task Overview:
 * Build an interactive Plate & Socket Generator interface that visually displays
 * plates and socket groups on the left side of the screen (referred to as the canvas).
 * The app must maintain realistic proportions between plates and sockets, support
 * user input, and be responsive across different screen sizes including mobile.
 *
 * Key Responsibilities:
 * 1. State management for plates, sockets, drag operations
 * 2. Canvas scaling and responsive behavior
 * 3. Socket positioning and validation
 * 4. Drag-and-drop with live guidelines
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import {
  Plate,
  SocketGroup,
  SOCKET_SIZE,
  MIN_EDGE_DISTANCE,
  validateSocketPosition,
  calculateSocketGroupDimensions,
  isPlateLargeEnoughForSockets,
} from "@/lib/types";
import { clamp } from "@/lib/utils";
import PlateCanvas from "@/components/plate-canvas";
import ControlPanel from "@/components/control-panel";
import { toast } from "sonner";

// localStorage keys - defined outside component as constants
const STORAGE_KEYS = {
  PLATES: "socket-generator-plates",
  SOCKET_GROUPS: "socket-generator-socket-groups",
  IS_EDITING_SOCKET: "socket-generator-is-editing-socket",
  SOCKET_TOGGLE: "socket-generator-socket-toggle",
} as const;

// Default plates as per task requirement - always use these for initial render to prevent hydration mismatch
// Both server and client will render with these defaults, then client loads from localStorage after hydration
const DEFAULT_PLATES: Plate[] = [
  { id: "1", width: 151.5, height: 36.8 },
  { id: "2", width: 200, height: 100 },
];

export default function SocketGenerator() {
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Task Requirement: "On load, generate a default plate with predefined dimensions."
  // Logic: Always initialize with defaults to ensure server and client render the same HTML (prevents hydration mismatch)
  // Then load from localStorage in useEffect AFTER hydration completes
  const [plates, setPlates] = useState<Plate[]>(DEFAULT_PLATES);
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the state of the socket groups.
  // Always initialize with empty array to ensure server and client render the same HTML
  const [socketGroups, setSocketGroups] = useState<SocketGroup[]>([]);
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the state of the socket toggle.
  // Always initialize with false to ensure server and client render the same HTML
  const [socketToggle, setSocketToggle] = useState(false);
  const [selectedSocketGroup, setSelectedSocketGroup] =
    useState<SocketGroup | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<string>("");
  const [socketCount, setSocketCount] = useState(1);
  const [socketDirection, setSocketDirection] = useState<
    "horizontal" | "vertical"
  >("vertical");
  const [positionX, setPositionX] = useState("");
  const [positionY, setPositionY] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    socketGroupId: string | null;
    offset: { x: number; y: number };
    livePosition?: { x: number; y: number };
    liveDistanceX?: number;
    liveDistanceY?: number;
  } | null>(null);

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useRef to manage the canvas reference.
  const canvasRef = useRef<HTMLDivElement>(null);
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Use useState to manage the canvas dimensions.
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [plateScales, setPlateScales] = useState<{ [key: string]: number }>({});
  // Zoom state for canvas
  const [canvasZoom, setCanvasZoom] = useState(1);
  // Ref to track last error message shown in toast during drag (to prevent spam)
  const lastDragErrorToastRef = useRef<string>("");
  // Centering offset for multi-plate mode (when content width < viewport width)
  const [centeringOffset, setCenteringOffset] = useState(0);
  // Track if we should center plates (content width < viewport width)
  const [shouldCenterPlates, setShouldCenterPlates] = useState(false);

  // Responsive sidebar state (mobile/tablet < xl)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBelowXl, setIsBelowXl] = useState(false);

  /**
   * ========================================
   * LOCALSTORAGE PERSISTENCE
   * ========================================
   * Logic: Track editing state to show/hide edit UI vs configured groups section
   * - true = user is actively editing/adding sockets → show edit UI
   * - false = user is done editing → show configured groups only
   * Always initialize with true (default) to ensure server and client render the same HTML
   */
  const [isEditingSocket, setIsEditingSocket] = useState(true);

  // Flag to prevent auto-save on initial mount (before localStorage is loaded)
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  // Flag to prevent auto-save from overwriting localStorage during toggle ON restoration
  const [isRestoringSocketGroups, setIsRestoringSocketGroups] = useState(false);
  // Track the last saved plate state to detect changes after "Steckdose hinzufügen" is clicked
  // When plates change, automatically show edit UI again
  const [lastSavedPlatesForEditMode, setLastSavedPlatesForEditMode] = useState<
    Plate[]
  >([]);

  /**
   * ========================================
   * LOAD FROM LOCALSTORAGE AFTER HYDRATION
   * ========================================
   * Logic: Load saved data from localStorage AFTER hydration completes
   * This prevents hydration mismatch - server and client both render defaults first
   * Then we update state from localStorage once the component has mounted on client
   * This ensures hydration succeeds, then we sync with localStorage
   */
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    try {
      // Track loaded plates for initializing lastSavedPlatesForEditMode
      let loadedPlatesForState: Plate[] = DEFAULT_PLATES;

      // Load plates - if no saved data, use defaults
      const savedPlates = localStorage.getItem(STORAGE_KEYS.PLATES);
      if (savedPlates) {
        try {
          const parsedPlates = JSON.parse(savedPlates);
          if (Array.isArray(parsedPlates) && parsedPlates.length > 0) {
            setPlates(parsedPlates);
            loadedPlatesForState = parsedPlates; // Use loaded plates for state tracking
          } else {
            // Save defaults if invalid data
            localStorage.setItem(
              STORAGE_KEYS.PLATES,
              JSON.stringify(DEFAULT_PLATES)
            );
            loadedPlatesForState = DEFAULT_PLATES;
          }
        } catch (error) {
          localStorage.setItem(
            STORAGE_KEYS.PLATES,
            JSON.stringify(DEFAULT_PLATES)
          );
          loadedPlatesForState = DEFAULT_PLATES;
        }
      } else {
        // No saved data - save defaults
        localStorage.setItem(
          STORAGE_KEYS.PLATES,
          JSON.stringify(DEFAULT_PLATES)
        );
        loadedPlatesForState = DEFAULT_PLATES;
      }

      // Load socket groups
      const savedSocketGroups = localStorage.getItem(
        STORAGE_KEYS.SOCKET_GROUPS
      );
      if (savedSocketGroups) {
        try {
          const parsedSocketGroups = JSON.parse(savedSocketGroups);
          if (Array.isArray(parsedSocketGroups)) {
            setSocketGroups(parsedSocketGroups);
          }
        } catch (error) {
          // Error parsing socketGroups
        }
      }

      // Load isEditingSocket state
      const savedIsEditingSocket = localStorage.getItem(
        STORAGE_KEYS.IS_EDITING_SOCKET
      );
      if (savedIsEditingSocket !== null) {
        setIsEditingSocket(savedIsEditingSocket === "true");
        // Initialize saved plate state for change detection
        // Use the loaded plates (not current state, which might be stale)
        setLastSavedPlatesForEditMode(
          JSON.parse(JSON.stringify(loadedPlatesForState))
        );
      } else {
        localStorage.setItem(STORAGE_KEYS.IS_EDITING_SOCKET, "true");
        // Initialize saved plate state with loaded/default plates
        setLastSavedPlatesForEditMode(
          JSON.parse(JSON.stringify(loadedPlatesForState))
        );
      }

      // Load socket toggle state
      const savedSocketToggle = localStorage.getItem(
        STORAGE_KEYS.SOCKET_TOGGLE
      );
      if (savedSocketToggle !== null) {
        setSocketToggle(savedSocketToggle === "true");
      } else {
        localStorage.setItem(STORAGE_KEYS.SOCKET_TOGGLE, "false");
      }

      // Mark as loaded to allow auto-save to work properly
      setHasLoadedFromStorage(true);
    } catch (error) {
      // On error, still mark as loaded to prevent blocking
      setHasLoadedFromStorage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * ========================================
   * AUTO-SAVE PLATES TO LOCALSTORAGE
   * ========================================
   * Logic: Save plates to localStorage whenever they change
   * Only save after initial load from localStorage to prevent overwriting loaded data
   * IMPORTANT: Don't save if plates match DEFAULT_PLATES exactly (prevents overwriting saved data with defaults)
   */
  useEffect(() => {
    if (!hasLoadedFromStorage) return; // Don't save before loading is complete

    // CRITICAL FIX: Don't save DEFAULT_PLATES to localStorage
    // This prevents overwriting saved plates with defaults on refresh
    // Check if current plates match DEFAULT_PLATES exactly (same IDs and dimensions)
    const matchesDefaults =
      plates.length === DEFAULT_PLATES.length &&
      plates.every((plate, index) => {
        const defaultPlate = DEFAULT_PLATES[index];
        return (
          plate.id === defaultPlate.id &&
          plate.width === defaultPlate.width &&
          plate.height === defaultPlate.height
        );
      });

    if (matchesDefaults) {
      // Check if localStorage has different data
      try {
        const savedPlates = localStorage.getItem(STORAGE_KEYS.PLATES);
        if (savedPlates) {
          const parsedPlates = JSON.parse(savedPlates);
          // If saved plates exist and are different from defaults, don't overwrite
          if (
            Array.isArray(parsedPlates) &&
            (parsedPlates.length !== DEFAULT_PLATES.length ||
              !parsedPlates.every(
                (p: Plate, i: number) =>
                  p.id === DEFAULT_PLATES[i]?.id &&
                  p.width === DEFAULT_PLATES[i]?.width &&
                  p.height === DEFAULT_PLATES[i]?.height
              ))
          ) {
            return; // Don't overwrite saved data with defaults
          }
        }
      } catch (error) {
        // Continue with save if we can't check localStorage
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PLATES, JSON.stringify(plates));
    } catch (error) {
      // Error saving plates
    }
  }, [plates, hasLoadedFromStorage]);

  /**
   * ========================================
   * AUTO-SAVE SOCKET GROUPS TO LOCALSTORAGE
   * ========================================
   * Logic: Save socketGroups to localStorage whenever they change
   * Only save after initial load from localStorage to prevent overwriting loaded data
   * IMPORTANT: Only save when socketToggle is ON - when OFF, preserve existing socketGroups in localStorage
   * IMPORTANT: Do NOT save empty array if localStorage already has data (prevents overwriting during restoration)
   * IMPORTANT: Do NOT save if we're currently restoring socket groups (would overwrite with empty array)
   */
  useEffect(() => {
    if (!hasLoadedFromStorage) return; // Don't save before loading is complete
    if (!socketToggle) return; // Don't save empty array when toggle is OFF - preserve existing data
    if (isRestoringSocketGroups) {
      return; // Don't save during restoration - would overwrite with potentially empty state
    }

    // Critical fix: Don't overwrite localStorage with empty array if it already has data
    // This prevents the race condition where toggle ON triggers auto-save with empty array
    // before restoration completes
    if (socketGroups.length === 0) {
      try {
        const existingData = localStorage.getItem(STORAGE_KEYS.SOCKET_GROUPS);
        if (existingData) {
          return; // Don't overwrite existing data with empty array
        }
      } catch (error) {
        // Continue with save if we can't check localStorage
      }
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.SOCKET_GROUPS,
        JSON.stringify(socketGroups)
      );
    } catch (error) {
      // Error saving socketGroups
    }
  }, [
    socketGroups,
    hasLoadedFromStorage,
    socketToggle,
    isRestoringSocketGroups,
  ]);

  /**
   * ========================================
   * AUTO-SAVE IS_EDITING_SOCKET TO LOCALSTORAGE
   * ========================================
   * Logic: Save isEditingSocket state to localStorage whenever it changes
   * IMPORTANT: Only save after initial load from localStorage to prevent overwriting loaded data
   */
  useEffect(() => {
    if (!hasLoadedFromStorage) return; // Don't save before loading is complete
    try {
      localStorage.setItem(
        STORAGE_KEYS.IS_EDITING_SOCKET,
        String(isEditingSocket)
      );
    } catch (error) {
      // Error saving isEditingSocket
    }
  }, [isEditingSocket, hasLoadedFromStorage]);

  /**
   * ========================================
   * AUTO-SAVE SOCKET TOGGLE TO LOCALSTORAGE
   * ========================================
   * Logic: Save socketToggle state to localStorage whenever it changes
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCKET_TOGGLE, String(socketToggle));
    } catch (error) {
      // Error saving socketToggle
    }
  }, [socketToggle]);

  /**
   * ========================================
   * COMPARE PLATES WITH LOCALSTORAGE
   * ========================================
   * Logic: Check if current plates match saved plates in localStorage
   * Returns true if plates have changed (different count or dimensions)
   */
  const havePlatesChanged = useCallback((): boolean => {
    try {
      const savedPlates = localStorage.getItem(STORAGE_KEYS.PLATES);
      if (!savedPlates) return true; // No saved data, consider it changed

      const parsedPlates: Plate[] = JSON.parse(savedPlates);
      if (!Array.isArray(parsedPlates)) return true;

      // Check if count is different
      if (plates.length !== parsedPlates.length) return true;

      // Check if any plate dimensions changed
      for (let i = 0; i < plates.length; i++) {
        const currentPlate = plates[i];
        const savedPlate = parsedPlates.find((p) => p.id === currentPlate.id);
        if (
          !savedPlate ||
          savedPlate.width !== currentPlate.width ||
          savedPlate.height !== currentPlate.height
        ) {
          return true;
        }
      }

      return false; // No changes detected
    } catch (error) {
      return true; // On error, consider it changed
    }
  }, [plates]);

  /**
   * ========================================
   * MONITOR PLATE CHANGES FOR AUTO-SHOW EDIT UI
   * ========================================
   * Logic: After "Steckdose hinzufügen" is clicked (isEditingSocket = false),
   * if plates change (new plate added or dimensions changed), automatically show edit UI again
   * This ensures users can configure sockets for new/changed plates
   */
  useEffect(() => {
    // Only watch for changes when toggle is ON and not currently editing
    if (!socketToggle) {
      return;
    }
    if (isEditingSocket) {
      return;
    }
    // Only watch if we have a saved plate state to compare against
    if (lastSavedPlatesForEditMode.length === 0) {
      return;
    }
    // Skip if we haven't loaded from storage yet (to prevent false positives on initial load)
    if (!hasLoadedFromStorage) {
      return;
    }

    // Check if plates have changed compared to last saved state
    const platesChanged =
      plates.length !== lastSavedPlatesForEditMode.length ||
      plates.some((currentPlate) => {
        const savedPlate = lastSavedPlatesForEditMode.find(
          (p) => p.id === currentPlate.id
        );
        return (
          !savedPlate ||
          savedPlate.width !== currentPlate.width ||
          savedPlate.height !== currentPlate.height
        );
      }) ||
      lastSavedPlatesForEditMode.some(
        (savedPlate) => !plates.find((p) => p.id === savedPlate.id)
      );

    if (platesChanged) {
      setIsEditingSocket(true);
      // CRITICAL: Save isEditingSocket = true to localStorage
      // This prevents the socketToggle effect from overwriting it when it runs
      try {
        localStorage.setItem(STORAGE_KEYS.IS_EDITING_SOCKET, "true");
      } catch (error) {
        // Error saving isEditingSocket
      }
      // Update saved state to current plates
      setLastSavedPlatesForEditMode(JSON.parse(JSON.stringify(plates)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    plates,
    socketToggle,
    isEditingSocket,
    lastSavedPlatesForEditMode,
    hasLoadedFromStorage,
  ]);

  /**
   * ========================================
   * SOCKET TOGGLE EFFECT
   * ========================================
   * Task Requirement: "When OFF, all socket groups are deleted."
   * Task Requirement: "When ON, one default socket group is added to the first eligible plate."
   *
   * Logic:
   * - When toggle is turned ON:
   *   1. FIRST restore socketGroups from localStorage if they exist
   *   2. Check if plates have changed compared to localStorage
   *   3. If plates changed → force isEditingSocket = true (show edit UI)
   *   4. If plates unchanged → load isEditingSocket from localStorage (preserve false if it was false)
   *   5. If isEditingSocket = true and no sockets exist after restore → auto-create socket on first valid plate
   * - When toggle is turned OFF → delete all socket groups but preserve isEditingSocket state
   * - Valid plates must be at least 40x40cm
   */
  useEffect(() => {
    if (socketToggle) {
      // Set flag to prevent auto-save from overwriting localStorage during restoration
      // This is critical: auto-save runs BEFORE this effect, so we need to block it immediately
      setIsRestoringSocketGroups(true);

      // When toggle is turned ON, FIRST restore socketGroups from localStorage if they exist
      let restoredSocketGroups: SocketGroup[] = [];
      try {
        const savedSocketGroups = localStorage.getItem(
          STORAGE_KEYS.SOCKET_GROUPS
        );
        if (savedSocketGroups) {
          const parsedSocketGroups = JSON.parse(savedSocketGroups);
          if (
            Array.isArray(parsedSocketGroups) &&
            parsedSocketGroups.length > 0
          ) {
            // Restore socket groups from localStorage
            restoredSocketGroups = parsedSocketGroups;
            setSocketGroups(parsedSocketGroups);
          }
        }
      } catch (error) {
        // Error restoring socketGroups
      }

      // Clear restoration flag after state has updated
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        setIsRestoringSocketGroups(false);
      }, 150);

      // When toggle is turned ON, check plate changes
      const platesChanged = havePlatesChanged();

      if (platesChanged) {
        // Plates have changed → force editing mode
        setIsEditingSocket(true);
        // Update saved plate state to current plates for future comparisons
        const updatedSavedState = JSON.parse(JSON.stringify(plates));
        setLastSavedPlatesForEditMode(updatedSavedState);
      } else {
        // Plates unchanged → load saved state from localStorage
        // This preserves isEditingSocket = false if user clicked "Steckdose hinzufügen" before
        // BUT if isEditingSocket is already true in state (e.g., set by monitoring effect),
        // don't override it - this prevents race conditions
        try {
          const savedIsEditingSocket = localStorage.getItem(
            STORAGE_KEYS.IS_EDITING_SOCKET
          );
          // IMPORTANT: If isEditingSocket is already true, don't override it
          // This handles the case where the monitoring effect just set it due to plate changes
          if (isEditingSocket) {
            // Still update saved plate state to current plates for future comparisons
            const updatedSavedState = JSON.parse(JSON.stringify(plates));
            setLastSavedPlatesForEditMode(updatedSavedState);
          } else if (savedIsEditingSocket !== null) {
            const shouldBeEditing = savedIsEditingSocket === "true";
            setIsEditingSocket(shouldBeEditing);
            // Update saved plate state to match current plates
            // This ensures future plate changes will be detected
            const updatedSavedState = JSON.parse(JSON.stringify(plates));
            setLastSavedPlatesForEditMode(updatedSavedState);
          } else {
            // Default to true if no saved state
            setIsEditingSocket(true);
            const updatedSavedState = JSON.parse(JSON.stringify(plates));
            setLastSavedPlatesForEditMode(updatedSavedState);
          }
        } catch (error) {
          // Error loading isEditingSocket
          // If isEditingSocket is already true, don't override
          if (!isEditingSocket) {
            setIsEditingSocket(true);
          }
          setLastSavedPlatesForEditMode(JSON.parse(JSON.stringify(plates)));
        }
      }

      // When ON and isEditingSocket is true, add one default socket group to the first eligible plate if none exist AFTER restore
      // BUT don't set selectedSocketGroup to enable plate selection mode
      // Check the restored socketGroups directly, not the state (which is async)
      // Determine if we should be in editing mode (check localStorage directly)
      const shouldBeEditing = platesChanged
        ? true
        : (() => {
            try {
              const savedIsEditingSocket = localStorage.getItem(
                STORAGE_KEYS.IS_EDITING_SOCKET
              );
              return savedIsEditingSocket !== null
                ? savedIsEditingSocket === "true"
                : true;
            } catch {
              return true;
            }
          })();

      if (shouldBeEditing && restoredSocketGroups.length === 0) {
        const firstValidPlate = plates.find(isPlateLargeEnoughForSockets);
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Check if the first valid plate is found.
        if (firstValidPlate) {
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Create a new socket group.
          const newSocketGroup: SocketGroup = {
            id: Date.now().toString(),
            plateId: firstValidPlate.id,
            count: 1,
            direction: "vertical",
            positionX: MIN_EDGE_DISTANCE,
            positionY: MIN_EDGE_DISTANCE,
          };
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Set the socket groups.
          setSocketGroups([newSocketGroup]);
          // Don't set selectedSocketGroup to allow plate selection
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Set the selected plate.
          setSelectedPlate(firstValidPlate.id);
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Set the socket count.
          setSocketCount(1);
          setSocketDirection("vertical");
          setPositionX(MIN_EDGE_DISTANCE.toString());
          setPositionY(MIN_EDGE_DISTANCE.toString());
        }
      }
    } else {
      // When OFF, FIRST save current socket groups to localStorage (if any exist)
      // This ensures socket groups created before clicking "Steckdose hinzufügen" are preserved
      // Then delete all socket groups from state
      if (socketGroups.length > 0) {
        try {
          // Save current socket groups to localStorage BEFORE clearing state
          // This preserves socket groups even if user hasn't clicked "Steckdose hinzufügen"
          const socketGroupsJson = JSON.stringify(socketGroups);
          localStorage.setItem(STORAGE_KEYS.SOCKET_GROUPS, socketGroupsJson);
        } catch (error) {
          // Error saving socketGroups
        }
        // Then clear from state
        setSocketGroups([]);
        setSelectedSocketGroup(null);
        setSelectedPlate("");
        setErrorMessage("");
      }
      // Note: isEditingSocket state is preserved (not reset) so it can be restored when toggle ON again
      // Note: socketGroups are preserved in localStorage even though state is cleared
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketToggle, plates, havePlatesChanged]);

  /**
   * ========================================
   * CANVAS RESIZE HANDLER
   * ========================================
   * Task Requirement: "The canvas resizes dynamically with the browser window."
   * Task Requirement: "On resize, all plates and sockets are recalculated and re-rendered."
   *
   * Logic: Track canvas dimensions on window resize for proportional scaling
   */
  useEffect(() => {
    const updateCanvasDimensions = () => {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Check if the canvas reference is found.
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Set the canvas dimensions.
        setCanvasDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Update the canvas dimensions.
    updateCanvasDimensions();
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set a timeout to update the canvas dimensions.
    const timeout = setTimeout(updateCanvasDimensions, 100);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Add a resize event listener to update the canvas dimensions.
    window.addEventListener("resize", updateCanvasDimensions);
    return () => {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Clear the timeout.
      clearTimeout(timeout);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Remove the resize event listener.
      window.removeEventListener("resize", updateCanvasDimensions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track breakpoint (< xl) and keep sidebar closed by default
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkBp = () => {
      const below = window.innerWidth < 1280; // xl breakpoint
      setIsBelowXl(below);
      // Keep sidebar closed by default - only open when user clicks burger icon
      // If moving to desktop, ensure overlay is closed
      if (!below) setIsSidebarOpen(false);
    };
    checkBp();
    window.addEventListener("resize", checkBp);
    return () => window.removeEventListener("resize", checkBp);
  }, []);

  /**
   * ========================================
   * PLATE SCALING CALCULATION
   * ========================================
   * Task Requirement: "All sizes are defined in centimeters (cm). 1 cm = 1 unit internally."
   * Task Requirement: "The plate must scale to fit the canvas while maintaining aspect ratio."
   * Task Requirement: "If multiple plates exist, all must be scaled proportionally to each other."
   * Task Requirement: "Example: A 20x20 cm plate and a 40x40 cm plate are rendered at 1:2 ratio."
   * Task Requirement: "If many exist, all are scaled down to fit horizontally (based on size)."
   * Task Requirement: "Plates are shown side by side horizontally in the canvas."
   *
   * Logic:
   * - Calculate total width of all plates if rendered at 1:1 scale
   * - Calculate scale based on width and height constraints to fit horizontally
   * - Apply same scale to all plates to maintain proportions
   * - Use minimum scale threshold to ensure socket positioning remains accurate
   * - If plates are too many to fit, they will scroll horizontally (via CSS overflow)
   * - Responsive padding: smaller on mobile screens to allow more space
   * - When a single plate is selected, scale it larger to fill the screen for better visibility
   */
  useEffect(() => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the canvas dimensions are 0 or if there are no plates.
    if (canvasDimensions.width === 0 || plates.length === 0) return;

    // Determine if we're showing a single plate (either editing mode or plate selected mode)
    const isSinglePlateMode =
      selectedSocketGroup !== null || selectedPlate !== "";

    // Responsive padding: smaller on mobile to allow more space for plates
    const isMobile = canvasDimensions.width < 640; // sm breakpoint
    const padding = isMobile ? 20 : 80;

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the max canvas width.
    const maxCanvasWidth = canvasDimensions.width - padding * 2;
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the max canvas height.
    const maxCanvasHeight = canvasDimensions.height - padding * 2;

    let finalScale: number;

    if (isSinglePlateMode) {
      // When showing a single plate, scale it as large as possible while maintaining aspect ratio
      // This ensures easy visibility and dragging of socket groups
      const plateToScale = plates.find((p) =>
        selectedSocketGroup
          ? p.id === selectedSocketGroup.plateId
          : p.id === selectedPlate
      );

      if (plateToScale) {
        // Calculate scale to fit this single plate as large as possible
        const scaleByWidth = maxCanvasWidth / plateToScale.width;
        const scaleByHeight = maxCanvasHeight / plateToScale.height;
        finalScale = Math.min(scaleByWidth, scaleByHeight, 2); // Cap at 200% for very small plates
      } else {
        // Fallback: use all plates calculation
        const totalRealWidth = plates.reduce(
          (sum, plate) => sum + plate.width,
          0
        );
        const maxPlateHeight = Math.max(...plates.map((p) => p.height));
        const scaleByWidth = maxCanvasWidth / totalRealWidth;
        const scaleByHeight = maxCanvasHeight / maxPlateHeight;
        finalScale = Math.min(scaleByWidth, scaleByHeight, 1);
      }
    } else {
      // Calculate total width if all plates were at 1:1 scale
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Calculate the total real width.
      const totalRealWidth = plates.reduce(
        (sum, plate) => sum + plate.width,
        0
      );
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Calculate the max plate height.
      const maxPlateHeight = Math.max(...plates.map((p) => p.height));

      // Calculate scale based on width constraint (to fit horizontally)
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Calculate the scale by width.
      const scaleByWidth = maxCanvasWidth / totalRealWidth;
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Calculate the scale by height.
      // Calculate scale based on height constraint
      const scaleByHeight = maxCanvasHeight / maxPlateHeight;

      // Use the smaller scale to ensure everything fits
      // Task Requirement: All plates must be scaled proportionally (same scale for all)
      // Logic: Calculate the final scale.
      finalScale = Math.min(scaleByWidth, scaleByHeight, 1);
    }

    // CRITICAL: Set a minimum scale threshold to ensure socket positioning remains accurate
    // When scale is too small, socket positions calculated in cm don't translate correctly to pixels
    // Use a higher minimum scale on mobile devices to prevent socket positioning issues
    // Minimum scale of 0.3 (30% of actual size) on mobile ensures plates are visible and socket calculations work accurately
    const minScale = isMobile ? 0.3 : 0.2;
    finalScale = Math.max(minScale, finalScale);

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the plate scales.
    const scales: { [key: string]: number } = {};
    plates.forEach((plate) => {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the plate scale.
      scales[plate.id] = finalScale;
    });
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the plate scales.
    setPlateScales(scales);

    // Calculate centering offset for multi-plate mode (when content width < viewport width)
    // This ensures frames are centered by default when they fit, but left-aligned when they need scrolling
    if (!isSinglePlateMode && plates.length > 0) {
      // Calculate total content width: sum of scaled plate widths + gaps between plates
      const gap = isMobile ? 16 : 24; // gap-4 sm:gap-6
      const totalContentWidth =
        plates.reduce((sum, plate) => sum + plate.width * finalScale, 0) +
        (plates.length - 1) * gap +
        padding * 2;

      // Viewport width (canvas width)
      const viewportWidth = canvasDimensions.width;

      // If content width < viewport width, center the plates
      if (totalContentWidth < viewportWidth) {
        const calculatedCenteringOffset =
          (viewportWidth - totalContentWidth) / 2;
        setCenteringOffset(calculatedCenteringOffset);
        setShouldCenterPlates(true);
      } else {
        // Content width >= viewport width, use left alignment (no centering offset)
        setCenteringOffset(0);
        setShouldCenterPlates(false);
      }
    } else {
      // Single plate mode or no plates - no centering needed
      setCenteringOffset(0);
      setShouldCenterPlates(false);
    }
  }, [canvasDimensions, plates, selectedSocketGroup, selectedPlate]);

  /**
   * ========================================
   * UPDATE PLATE DIMENSIONS
   * ========================================
   * Task Requirement: "Users can input custom plate dimensions: Width: 20 to 300 cm, Height: 30 to 128 cm"
   * Task Requirement: "Input is clamped to valid limits."
   * Task Requirement: "When dimensions are updated, the plate is redrawn."
   * Task Requirement: "Any sockets on the plate are removed on resize."
   *
   * Logic:
   * - Clamp dimensions to valid ranges
   * - Update plate with new dimensions
   * - Remove all sockets from this plate when resized
   */
  const updatePlate = (plateId: string, width?: number, height?: number) => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Update the plate.
    setPlates((prev) =>
      prev.map((plate) =>
        plate.id === plateId
          ? {
              ...plate,
              width: width !== undefined ? clamp(width, 20, 300) : plate.width,
              height:
                height !== undefined ? clamp(height, 30, 128) : plate.height,
            }
          : plate
      )
    );
    // Remove sockets when plate is resized
    if (width !== undefined || height !== undefined) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Remove the socket groups.
      setSocketGroups((prev) => prev.filter((sg) => sg.plateId !== plateId));
    }
  };

  /**
   * ========================================
   * ADD NEW PLATE
   * ========================================
   * Task Requirement: "Add new plates (no limit)"
   *
   * Logic:
   * - Creates a new plate with default dimensions
   * - Adds toast notification showing success with plate details
   */
  const addPlate = () => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Add a new plate.
    const newPlate: Plate = {
      id: Date.now().toString(),
      width: 151.5,
      height: 36.8,
    };
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the plates.
    setPlates((prev) => [...prev, newPlate]);

    // Show success toast notification
    const plateNumber = plates.length + 1;
    toast.success("Rückwand hinzugefügt", {
      description: `Rückwand #${plateNumber}: ${newPlate.width.toFixed(
        1
      )} × ${newPlate.height.toFixed(1)} cm erfolgreich erstellt`,
    });
  };

  /**
   * ========================================
   * DELETE PLATE
   * ========================================
   * Task Requirement: "Delete plates (minimum 1 plate must remain)"
   *
   * Logic:
   * - Prevent deletion if only 1 plate remains
   * - Remove plate and all its associated sockets
   * - Show toast notification with plate details
   */
  const deletePlate = (plateId: string) => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the plates length is greater than 1.
    if (plates.length > 1) {
      // Find the plate being deleted to show its details in the toast
      const deletedPlate = plates.find((p) => p.id === plateId);
      const plateNumber = plates.findIndex((p) => p.id === plateId) + 1;

      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Remove the plates.
      setPlates((prev) => prev.filter((p) => p.id !== plateId));
      setSocketGroups((prev) => prev.filter((sg) => sg.plateId !== plateId));

      // Show success toast notification with plate details
      if (deletedPlate) {
        toast.success("Rückwand gelöscht", {
          description: `Rückwand #${plateNumber}: ${deletedPlate.width.toFixed(
            1
          )} × ${deletedPlate.height.toFixed(1)} cm wurde entfernt`,
        });
      }
    } else {
      // Show error toast if trying to delete the last plate
      toast.error("Löschen nicht möglich", {
        description: "Mindestens eine Rückwand muss vorhanden sein",
      });
    }
  };
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle the socket group selection.
  const handleSocketGroupSelection = (groupId: string) => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Find the socket group.
    const group = socketGroups.find((sg) => sg.id === groupId);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the socket group is found.
    if (group) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the selected socket group.
      setSelectedSocketGroup(group);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the selected plate.
      setSelectedPlate(group.plateId);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the socket count.
      setSocketCount(group.count);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the socket direction.
      setSocketDirection(group.direction);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the position X.
      setPositionX(group.positionX.toString());
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the position Y.
      setPositionY(group.positionY.toString());

      // Set isEditingSocket = true to show edit UI when editing existing socket
      setIsEditingSocket(true);
    }
  };

  /**
   * ========================================
   * VIEW SOCKET GROUP (DISPLAY IN CANVAS)
   * ========================================
   * Logic: When clicking on a socket group item in the configured list (when not editing),
   * display that plate with its socket groups in larger size on the canvas without entering edit mode
   */
  const handleSocketGroupView = (groupId: string) => {
    const group = socketGroups.find((sg) => sg.id === groupId);
    if (group) {
      // Set selected socket group and plate to display on canvas
      // This will make the canvas show only that plate (see plate-canvas.tsx logic)
      setSelectedSocketGroup(group);
      setSelectedPlate(group.plateId);
      // Do NOT set isEditingSocket = true - keep it false to show configured groups section
      // The canvas will display the plate in larger size because selectedSocketGroup is set
    }
  };

  /**
   * ========================================
   * ADD NEW SOCKET GROUP
   * ========================================
   * Task Requirement: "Add new plates (no limit)" - Implicitly allows adding multiple socket groups
   *
   * Logic:
   * - This function resets the form to allow configuring a NEW socket group
   * - When the user clicks "Steckdose hinzufügen", they're preparing to add another socket group
   * - The form is reset with default values, but no socket is created yet
   * - Socket is only created when "Steckdose bestätigen" is clicked (via handleConfirmSocketGroup)
   * - This provides a clean slate to configure the next socket group
   * - Additionally, set isEditingSocket = false to hide edit UI and show configured groups section
   */
  const handleAddSocketGroup = () => {
    // Reset selection to allow adding a NEW socket group (not editing an existing one)
    setSelectedSocketGroup(null);
    // Find the first valid plate (40x40cm or larger) to set as default selection
    setSelectedPlate(plates.find(isPlateLargeEnoughForSockets)?.id || "");
    // Reset all configuration fields to default values
    setSocketCount(1);
    setSocketDirection("vertical");
    setPositionX(MIN_EDGE_DISTANCE.toString());
    setPositionY(MIN_EDGE_DISTANCE.toString());
    // Clear any previous error messages
    setErrorMessage("");

    // Set isEditingSocket to false to hide edit UI and show configured groups section
    // This signals that user is "done editing" for now
    setIsEditingSocket(false);

    // Save current plate state so we can detect changes later
    // If plates change after this point, we'll automatically show edit UI again
    const savedPlatesState = JSON.parse(JSON.stringify(plates));
    setLastSavedPlatesForEditMode(savedPlatesState);

    // Show info toast notification
    toast.info("Neue Steckdosen-Konfiguration", {
      description:
        "Bitte wählen Sie eine Rückwand und konfigurieren Sie die Steckdosen",
    });
  };

  /**
   * ========================================
   * CONFIRM SOCKET GROUP PLACEMENT
   * ========================================
   * Task Requirement: "All sockets and plates are validated before any change is applied"
   * Task Requirement: "If the user enters an invalid position or overlaps another socket, block the action."
   * Task Requirement: "All blocked actions must provide clear visual feedback explaining the reason."
   *
   * Logic:
   * - Validate plate selection (must be >= 40x40cm)
   * - Validate socket position (edge distances, group distances, overlaps)
   * - Show error message if validation fails
   * - Update or create socket group if valid
   */
  const handleConfirmSocketGroup = () => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the selected plate is not found.
    if (!selectedPlate) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the error message.
      setErrorMessage("Please select a plate");
      toast.error("Fehler", {
        description: "Bitte wählen Sie eine Rückwand aus",
      });
      return;
    }

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Find the plate.
    const plate = plates.find((p) => p.id === selectedPlate);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the plate is not found or if the plate is not large enough for sockets.
    if (!plate || !isPlateLargeEnoughForSockets(plate)) {
      setErrorMessage("Plate must be at least 40x40cm");
      toast.error("Fehler", {
        description: "Rückwand muss mindestens 40 × 40 cm groß sein",
      });
      return;
    }

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the position X.
    const posX = parseFloat(positionX);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the position Y.
    const posY = parseFloat(positionY);

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Create a new socket group.
    const socketGroup: SocketGroup = {
      id: selectedSocketGroup?.id || Date.now().toString(),
      plateId: selectedPlate,
      count: socketCount,
      direction: socketDirection,
      positionX: posX,
      positionY: posY,
    };

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Validate the socket position.
    const validation = validateSocketPosition(
      socketGroup,
      posX,
      posY,
      plate,
      socketGroups
    );

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the validation is not valid.
    if (!validation.valid) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the error message.
      setErrorMessage(validation.error || "Invalid position");
      toast.error("Fehler", {
        description: validation.error || "Ungültige Position",
      });
      return;
    }

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the selected socket group is found.
    const isUpdate = selectedSocketGroup !== null;
    if (selectedSocketGroup) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Update the socket groups.
      setSocketGroups((prev) =>
        prev.map((sg) => (sg.id === selectedSocketGroup.id ? socketGroup : sg))
      );
    } else {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Add a new socket group.
      setSocketGroups((prev) => [...prev, socketGroup]);
    }

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the error message to empty.
    setErrorMessage("");
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the selected socket group to null.
    setSelectedSocketGroup(null);

    // Reset form fields to allow adding more socket groups immediately
    // Keep isEditingSocket = true so user can continue adding more sockets
    // Find the first valid plate (40x40cm or larger) to set as default selection
    const currentPlate = plates.find((p) => p.id === selectedPlate);
    const validPlateForReset =
      currentPlate && isPlateLargeEnoughForSockets(currentPlate)
        ? currentPlate
        : plates.find(isPlateLargeEnoughForSockets);

    setSelectedPlate(validPlateForReset?.id || "");
    setSocketCount(1);
    setSocketDirection("vertical");
    setPositionX(MIN_EDGE_DISTANCE.toString());
    setPositionY(MIN_EDGE_DISTANCE.toString());

    // Keep isEditingSocket = true so user can continue adding more sockets immediately
    // User can click "Steckdose hinzufügen" when they're done editing to hide the edit UI
    setIsEditingSocket(true);

    // Show success toast notification
    const directionText =
      socketDirection === "horizontal" ? "Horizontal" : "Vertikal";
    const positionText = `Position: ${posX.toFixed(
      1
    )} cm von links, ${posY.toFixed(1)} cm von unten`;

    toast.success(
      isUpdate ? "Steckdose aktualisiert" : "Steckdose hinzugefügt",
      {
        description: `Rückwand ${plate.width.toFixed(
          1
        )} × ${plate.height.toFixed(
          1
        )} cm | ${socketCount}x Steckdose (${directionText}) | ${positionText}`,
      }
    );
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle the delete socket group.
  const handleDeleteSocketGroup = (groupId: string) => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Remove the socket group.
    setSocketGroups((prev) => prev.filter((sg) => sg.id !== groupId));
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the selected socket group is found.
    if (selectedSocketGroup?.id === groupId) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the selected socket group to null.
      setSelectedSocketGroup(null);
    }
  };

  /**
   * Calculate position for drag calculations (anchor point logic)
   *
   * Task Requirement: "The anchor point is the bottom-left center of the first socket"
   * Logic: positionX and positionY are measured from plate edges TO the anchor point
   * This is used for drag offset calculations only.
   *
   * Note: plate-canvas.tsx has the actual rendering logic which uses CSS 'bottom' property
   * This function returns the position using 'left' and 'bottom' CSS properties
   */
  const getSocketGroupPosition = (socketGroup: SocketGroup, plate: Plate) => {
    const scale = plateScales[plate.id] || 0;
    const { height: groupHeight } = calculateSocketGroupDimensions(
      socketGroup.count,
      socketGroup.direction
    );

    // Anchor point is bottom-left center of first socket (at 3.5cm from socket edges)
    // positionX and positionY are anchor points (distance from plate edges)
    // Convert to first socket's bottom-left corner
    const ANCHOR_OFFSET_CM = 3.5;

    // Calculate position of first socket's bottom-left corner
    const firstSocketLeft = socketGroup.positionX - ANCHOR_OFFSET_CM;
    const firstSocketBottom = socketGroup.positionY + ANCHOR_OFFSET_CM;

    return {
      // 'left' property: distance from left edge
      x: firstSocketLeft * scale,
      // 'bottom' property: distance from bottom edge
      y: firstSocketBottom * scale,
    };
  };

  // In future, this function will be used to get the socket group size.
  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Get the socket group size.
  const getSocketGroupSize = (socketGroup: SocketGroup) => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Calculate the socket group dimensions.
    const { width, height } = calculateSocketGroupDimensions(
      socketGroup.count,
      socketGroup.direction
    );
    const scale = plateScales[socketGroup.plateId] || 0;
    return { width: width * scale, height: height * scale };
  };

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle the socket mouse down.
  const handleSocketMouseDown = (
    e: React.MouseEvent,
    socketGroup: SocketGroup
  ) => {
    e.preventDefault();
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Find the plate.
    const plate = plates.find((p) => p.id === socketGroup.plateId);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the plate is not found.
    if (!plate) return;

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the scale.
    const scale = plateScales[socketGroup.plateId] || 0;
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the socket group position.
    const pos = getSocketGroupPosition(socketGroup, plate);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the canvas bounding client rect.
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // CRITICAL: Calculate plate offsets to match the move handler
    const isSinglePlateMode =
      selectedSocketGroup !== null || selectedPlate !== "";
    let plateOffsetX = 0;
    let plateOffsetY = 0;

    if (isSinglePlateMode) {
      // Single plate mode: plate is centered in the container
      const padding = rect.width < 640 ? 20 : 40;
      const containerContentWidth = rect.width - padding * 2;
      const containerContentHeight = rect.height - padding * 2;
      const plateScaledWidth = plate.width * scale;
      const plateScaledHeight = plate.height * scale;
      const centeringOffsetX = (containerContentWidth - plateScaledWidth) / 2;
      const centeringOffsetY = (containerContentHeight - plateScaledHeight) / 2;
      plateOffsetX = padding + centeringOffsetX;
      plateOffsetY = padding + centeringOffsetY;
    } else {
      // Multiple plate mode: calculate offset from previous plates
      const padding = rect.width < 640 ? 20 : 40;
      const gap = rect.width < 640 ? 16 : 24; // gap-4 sm:gap-6
      let isFirstPlate = true;
      for (const p of plates) {
        if (p.id === plate.id) break;
        plateOffsetX += p.width * (plateScales[p.id] || 0);
        if (!isFirstPlate) {
          plateOffsetX += gap; // Add gap between plates
        }
        isFirstPlate = false;
        plateOffsetY = 0;
      }
      plateOffsetX += padding;
      // Add centering offset if plates are centered (content width < viewport width)
      if (shouldCenterPlates) {
        plateOffsetX += centeringOffset;
      }
    }

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the drag state.
    // pos.y is in 'bottom' coordinates (distance from plate bottom)
    // We need to convert to screen coordinates for mouse offset calculation
    const plateHeightPx = plate.height * scale;
    const posTopY = plateHeightPx - pos.y; // Convert bottom to top coordinate

    setDragState({
      isDragging: true,
      socketGroupId: socketGroup.id,
      offset: {
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Set the offset X.
        x: e.clientX - rect.left - pos.x - plateOffsetX,
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Set the offset Y (converted from bottom to top coordinate).
        y: e.clientY - rect.top - posTopY - plateOffsetY,
      },
    });
  };

  /**
   * ========================================
   * SOCKET TOUCH HANDLER FOR MOBILE
   * ========================================
   * Task Requirement: "The canvas is mobile-friendly and supports touch interaction"
   *
   * Logic: Similar to mouse handler but uses TouchEvent for mobile devices
   */
  const handleSocketTouchStart = (
    e: React.TouchEvent,
    socketGroup: SocketGroup
  ) => {
    e.preventDefault();
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Find the plate.
    const plate = plates.find((p) => p.id === socketGroup.plateId);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the plate is not found.
    if (!plate) return;

    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the scale.
    const scale = plateScales[socketGroup.plateId] || 0;
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the socket group position.
    const pos = getSocketGroupPosition(socketGroup, plate);
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Get the canvas bounding client rect.
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // CRITICAL: Calculate plate offsets to match the move handler
    const isSinglePlateMode =
      selectedSocketGroup !== null || selectedPlate !== "";
    let plateOffsetX = 0;
    let plateOffsetY = 0;

    if (isSinglePlateMode) {
      // Single plate mode: plate is centered in the container
      const padding = rect.width < 640 ? 20 : 40;
      const containerContentWidth = rect.width - padding * 2;
      const containerContentHeight = rect.height - padding * 2;
      const plateScaledWidth = plate.width * scale;
      const plateScaledHeight = plate.height * scale;
      const centeringOffsetX = (containerContentWidth - plateScaledWidth) / 2;
      const centeringOffsetY = (containerContentHeight - plateScaledHeight) / 2;
      plateOffsetX = padding + centeringOffsetX;
      plateOffsetY = padding + centeringOffsetY;
    } else {
      // Multiple plate mode: calculate offset from previous plates
      const padding = rect.width < 640 ? 20 : 40;
      const gap = rect.width < 640 ? 16 : 24; // gap-4 sm:gap-6
      let isFirstPlate = true;
      for (const p of plates) {
        if (p.id === plate.id) break;
        plateOffsetX += p.width * (plateScales[p.id] || 0);
        if (!isFirstPlate) {
          plateOffsetX += gap; // Add gap between plates
        }
        isFirstPlate = false;
        plateOffsetY = 0;
      }
      plateOffsetX += padding;
      // Add centering offset if plates are centered (content width < viewport width)
      if (shouldCenterPlates) {
        plateOffsetX += centeringOffset;
      }
    }

    const touch = e.touches[0];
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Set the drag state.
    // pos.y is in 'bottom' coordinates (distance from plate bottom)
    // We need to convert to screen coordinates for touch offset calculation
    const plateHeightPx = plate.height * scale;
    const posTopY = plateHeightPx - pos.y; // Convert bottom to top coordinate

    setDragState({
      isDragging: true,
      socketGroupId: socketGroup.id,
      offset: {
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Set the offset X.
        x: touch.clientX - rect.left - pos.x - plateOffsetX,
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Set the offset Y (converted from bottom to top coordinate).
        y: touch.clientY - rect.top - posTopY - plateOffsetY,
      },
    });
  };

  /**
   * ========================================
   * SOCKET DRAG HANDLER - MOUSE MOVE
   * ========================================
   * Task Requirement: "Sockets can be moved using drag or manual input."
   * Task Requirement: "During dragging, show two guideline lines with live cm values"
   * Task Requirement: "During dragging, if the socket group is dragged to an invalid position
   *                    then the drag event is blocked, the visual representation stays in the
   *                    last valid position."
   * Task Requirement: "All blocked actions must provide clear visual feedback explaining the reason."
   *
   * Logic:
   * - Track mouse position and convert to plate coordinates
   * - Calculate live distances for guidelines
   * - Validate position in real-time
   * - Update socket position only if valid
   * - Show error message if position is invalid
   * - Visual representation stays at last valid position if dragged to invalid area
   */
  const handleSocketMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !canvasRef.current) return;
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Get the canvas bounding client rect.
      const rect = canvasRef.current.getBoundingClientRect();
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Find the socket group.
      const socketGroup = socketGroups.find(
        (sg) => sg.id === dragState.socketGroupId
      );
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Check if the socket group is not found.
      if (!socketGroup) return;

      const plate = plates.find((p) => p.id === socketGroup.plateId);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Check if the plate is not found.
      if (!plate) return;

      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the mouse X.
      const mouseX = e.clientX - rect.left - dragState.offset.x;
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the mouse Y.
      const mouseY = e.clientY - rect.top - dragState.offset.y;

      // Convert screen coordinates to plate coordinates
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the scale.
      const scale = plateScales[socketGroup.plateId] || 0;

      // Determine if we're showing a single plate (which is centered)
      const isSinglePlateMode =
        selectedSocketGroup !== null || selectedPlate !== "";

      // CRITICAL: Calculate plate offsets differently for single vs multiple plate modes
      // In single plate mode: plate is centered, so offset is padding + centering
      // In multiple plate mode: plate is positioned after previous plates
      let plateOffsetX = 0;
      let plateOffsetY = 0;

      if (isSinglePlateMode) {
        // Single plate mode: plate is centered in the container
        const padding = rect.width < 640 ? 20 : 40;
        const containerContentWidth = rect.width - padding * 2;
        const containerContentHeight = rect.height - padding * 2;
        const plateScaledWidth = plate.width * scale;
        const plateScaledHeight = plate.height * scale;
        const centeringOffsetX = (containerContentWidth - plateScaledWidth) / 2;
        const centeringOffsetY =
          (containerContentHeight - plateScaledHeight) / 2;
        plateOffsetX = padding + centeringOffsetX;
        plateOffsetY = padding + centeringOffsetY;
      } else {
        // Multiple plate mode: calculate offset from previous plates
        // Find plate offset (horizontal only, plates are side by side)
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Loop through the plates.
        const padding = rect.width < 640 ? 20 : 40;
        const gap = rect.width < 640 ? 16 : 24; // gap-4 sm:gap-6
        let isFirstPlate = true;
        for (const p of plates) {
          if (p.id === plate.id) break;
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Set the plate offset X.
          plateOffsetX += p.width * (plateScales[p.id] || 0);
          if (!isFirstPlate) {
            plateOffsetX += gap; // Add gap between plates
          }
          isFirstPlate = false;
          // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
          // Logic: Set the plate offset Y.
          plateOffsetY = 0; // Plates are side by side, not stacked
        }
        plateOffsetX += padding; // Add padding for the first plate
        // Add centering offset if plates are centered (content width < viewport width)
        if (shouldCenterPlates) {
          plateOffsetX += centeringOffset;
        }
      }

      // Convert to plate coordinates
      // mouseX and mouseY are in screen coordinates (from event)
      // We need to convert to plate coordinates where positionX and positionY are distances to anchor
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the plate X (mouse position in plate coordinates).
      const mousePlateX = (mouseX - plateOffsetX) / scale;
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the plate Y (distance from bottom edge to mouse).
      // mouseY is distance from top in screen coordinates (in pixels)
      // Need to subtract plateOffsetY (for vertical centering in single plate mode)
      // (mouseY - plateOffsetY) / scale converts to cm distance from top of plate
      // To get distance from bottom: plate.height - (distance from top)
      const mousePlateY = plate.height - (mouseY - plateOffsetY) / scale;

      // Calculate anchor position from mouse position
      // The mouse represents where we're dragging the socket group's bottom-left corner
      // Anchor is at 3.5cm from bottom-left corner (center of 7x7cm socket)
      // From bottom-left corner: anchor is 3.5cm to the right and 3.5cm up
      const ANCHOR_OFFSET_CM = 3.5;
      const plateX = mousePlateX + ANCHOR_OFFSET_CM; // Anchor is 3.5cm to the right of mouse
      const plateY = mousePlateY - ANCHOR_OFFSET_CM; // Anchor is 3.5cm up from bottom-left, but in bottom coords we subtract

      // Calculate live distance for guidelines (from edges to anchor point)
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the live distance X.
      const liveDistanceX = plateX;
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the live distance Y.
      const liveDistanceY = plateY;

      // Always update drag state with live position for visual feedback
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the drag state.
      setDragState({
        ...dragState,
        livePosition: { x: plateX, y: plateY },
        liveDistanceX,
        liveDistanceY,
      });

      // Validate new position
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Validate the socket position.
      const validation = validateSocketPosition(
        socketGroup,
        plateX,
        plateY,
        plate,
        socketGroups
      );

      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Check if the validation is valid.
      if (validation.valid) {
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Update the socket group position.
        // Update socket group position if valid
        const updatedGroup = { ...socketGroup };
        setSocketGroups((prev) =>
          prev.map((sg) =>
            sg.id === socketGroup.id
              ? {
                  ...updatedGroup,
                  positionX: plateX,
                  positionY: plateY,
                }
              : sg
          )
        );
        setErrorMessage("");
        // Clear last error toast ref when position becomes valid
        lastDragErrorToastRef.current = "";
      } else {
        const errorMsg = validation.error || "Cannot place socket here";
        setErrorMessage(errorMsg);

        // Show toast notification for error during drag (only if different from last shown)
        if (lastDragErrorToastRef.current !== errorMsg) {
          lastDragErrorToastRef.current = errorMsg;
          toast.error("Positionierung nicht möglich", {
            description: errorMsg,
          });
        }
      }
    },
    [
      dragState,
      socketGroups,
      plates,
      plateScales,
      selectedSocketGroup,
      selectedPlate,
      shouldCenterPlates,
      centeringOffset,
    ]
  );

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle the socket mouse up.
  const handleSocketMouseUp = useCallback(() => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the drag state is not null.
    if (dragState) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Set the drag state to null.
      setDragState(null);
      setErrorMessage("");
    }
  }, [dragState]);

  // Wrapper to convert TouchEvent to MouseEvent for reuse of mouse handlers
  const handleSocketTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      // Convert touch to mouse event
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: e.touches[0]?.clientX || 0,
        clientY: e.touches[0]?.clientY || 0,
      });
      handleSocketMouseMove(mouseEvent);
    },
    [handleSocketMouseMove]
  );

  const handleSocketTouchUp = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      handleSocketMouseUp();
    },
    [handleSocketMouseUp]
  );

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Handle the drag state.
  useEffect(() => {
    // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
    // Logic: Check if the drag state is not null.
    if (dragState) {
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Add the mouse move event.
      document.addEventListener("mousemove", handleSocketMouseMove);
      // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
      // Logic: Add the mouse up event.
      document.addEventListener("mouseup", handleSocketMouseUp);

      // Also add touch events for mobile support
      document.addEventListener("touchmove", handleSocketTouchMove);
      document.addEventListener("touchend", handleSocketTouchUp);

      return () => {
        // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
        // Logic: Remove the mouse move event.
        document.removeEventListener("mousemove", handleSocketMouseMove);
        document.removeEventListener("mouseup", handleSocketMouseUp);
        document.removeEventListener("touchmove", handleSocketTouchMove);
        document.removeEventListener("touchend", handleSocketTouchUp);
      };
    }
  }, [
    dragState,
    handleSocketMouseMove,
    handleSocketMouseUp,
    handleSocketTouchMove,
    handleSocketTouchUp,
  ]);

  // Task Requirement: "The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile."
  // Logic: Return the JSX.
  // Zoom handlers
  const handleZoomIn = () => setCanvasZoom((prev) => Math.min(prev + 0.2, 5));
  const handleZoomOut = () =>
    setCanvasZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleZoomReset = () => setCanvasZoom(1);

  // Prevent flicker: Only render main content after data is loaded from localStorage
  // This ensures the UI shows correct saved data immediately, not defaults
  if (!hasLoadedFromStorage) {
    return (
      <div className="flex h-screen w-screen bg-[#0a0a0a] text-white items-center justify-center">
        {/* Minimal loading state - prevents flicker by not showing default values */}
        <div className="opacity-0">
          {/* Invisible placeholder to maintain layout */}
          <div className="flex h-screen w-screen">
            <div className="w-[60%]"></div>
            <div className="w-[40%]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-[#0a0a0a] text-white">
      {/* Plate Canvas - full width on mobile, shares space on desktop */}
      <div className="h-full w-full xl:flex">
        <PlateCanvas
          ref={canvasRef}
          plates={plates}
          socketGroups={socketGroups}
          selectedSocketGroup={selectedSocketGroup}
          selectedPlate={selectedPlate}
          plateScales={plateScales}
          canvasZoom={canvasZoom}
          dragState={dragState}
          onSocketMouseDown={handleSocketMouseDown}
          onSocketTouchStart={handleSocketTouchStart}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          shouldCenterPlates={shouldCenterPlates}
        />

        {/* Desktop control panel (xl and up) */}
        <div className="hidden xl:block xl:w-[40%] xl:flex-shrink-0 h-full">
          <ControlPanel
            plates={plates}
            socketGroups={socketGroups}
            socketToggle={socketToggle}
            setSocketToggle={setSocketToggle}
            selectedPlate={selectedPlate}
            setSelectedPlate={setSelectedPlate}
            socketCount={socketCount}
            setSocketCount={setSocketCount}
            socketDirection={socketDirection}
            setSocketDirection={setSocketDirection}
            positionX={positionX}
            setPositionX={setPositionX}
            positionY={positionY}
            setPositionY={setPositionY}
            errorMessage={errorMessage}
            updatePlate={updatePlate}
            addPlate={addPlate}
            deletePlate={deletePlate}
            handleConfirmSocketGroup={handleConfirmSocketGroup}
            handleAddSocketGroup={handleAddSocketGroup}
            handleSocketGroupSelection={handleSocketGroupSelection}
            handleSocketGroupView={handleSocketGroupView}
            handleDeleteSocketGroup={handleDeleteSocketGroup}
            selectedSocketGroup={selectedSocketGroup}
            isEditingSocket={isEditingSocket}
            setIsEditingSocket={setIsEditingSocket}
          />
        </div>
      </div>

      {/* Mobile/Tablet burger or close icon (top-right) */}
      <button
        aria-label={
          isSidebarOpen ? "Seitenleiste schließen" : "Seitenleiste öffnen"
        }
        onClick={() => setIsSidebarOpen((v) => !v)}
        className="xl:hidden absolute top-4 right-4 z-[60] p-2 rounded-lg bg-gray-900/80 hover:bg-gray-800 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Backdrop when sidebar open (tap to close) */}
      {isSidebarOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile/Tablet sidebar overlay from right */}
      <div
        className={`xl:hidden fixed top-0 right-0 h-full z-50 overflow-x-hidden transition-transform duration-300 ease-out bg-white text-black shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "80vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full overflow-y-auto">
          <ControlPanel
            plates={plates}
            socketGroups={socketGroups}
            socketToggle={socketToggle}
            setSocketToggle={setSocketToggle}
            selectedPlate={selectedPlate}
            setSelectedPlate={setSelectedPlate}
            socketCount={socketCount}
            setSocketCount={setSocketCount}
            socketDirection={socketDirection}
            setSocketDirection={setSocketDirection}
            positionX={positionX}
            setPositionX={setPositionX}
            positionY={positionY}
            setPositionY={setPositionY}
            errorMessage={errorMessage}
            updatePlate={updatePlate}
            addPlate={addPlate}
            deletePlate={deletePlate}
            handleConfirmSocketGroup={handleConfirmSocketGroup}
            handleAddSocketGroup={handleAddSocketGroup}
            handleSocketGroupSelection={handleSocketGroupSelection}
            handleSocketGroupView={handleSocketGroupView}
            handleDeleteSocketGroup={handleDeleteSocketGroup}
            selectedSocketGroup={selectedSocketGroup}
            isEditingSocket={isEditingSocket}
            setIsEditingSocket={setIsEditingSocket}
          />
        </div>
      </div>
    </div>
  );
}
