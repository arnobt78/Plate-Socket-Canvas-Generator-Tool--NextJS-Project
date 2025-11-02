/**
 * ========================================
 * PLATE & SOCKET GENERATOR - TYPE DEFINITIONS
 * ========================================
 * This file defines all TypeScript interfaces and validation logic
 * based on the job assessment requirements.
 */

/**
 * Plate Interface
 * - Represents a plate with dimensions in centimeters
 * - Constraints: Width 20-300cm, Height 30-128cm
 * - Must be at least 40x40cm to accept sockets
 */
export interface Plate {
  id: string;
  width: number; // in cm (20-300)
  height: number; // in cm (30-128)
}

/**
 * Socket Group Interface
 * - Represents a group of sockets on a plate
 * - Anchored at bottom-left center of first socket
 * - Constraints: Count 1-5 sockets, min 3cm from edges, min 4cm from other groups
 */
export interface SocketGroup {
  id: string;
  plateId: string;
  count: number; // 1-5 sockets per group
  direction: "horizontal" | "vertical";
  positionX: number; // distance from left in cm (measured to anchor point at bottom-left center)
  positionY: number; // distance from bottom in cm (measured to anchor point at bottom-left center)
}

export interface PlateDimensions {
  width: number;
  height: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Validated Position Result
 * - Returned after validating socket placement
 * - Includes error message if position is invalid
 */
export interface ValidatedPosition {
  valid: boolean;
  error?: string;
  positionX: number;
  positionY: number;
}

// ========================================
// CONSTANTS - FROM TASK REQUIREMENTS
// ========================================
export const SOCKET_SIZE = 7; // cm - Each socket is 7x7 cm
export const SOCKET_GAP = 0.2; // cm - Gap between sockets in a group
export const MIN_EDGE_DISTANCE = 3; // cm - Minimum distance from plate edges
export const MIN_GROUP_DISTANCE = 4; // cm - Minimum distance between socket groups
export const MIN_PLATE_SIZE_FOR_SOCKETS = 40; // cm - Minimum plate size to accept sockets

/**
 * Calculate Socket Group Dimensions
 *
 * Task Requirement: "Each socket is 7x7 cm. Gap between sockets is 0.2 cm."
 * Example: "A horizontal group of 3 sockets = 21.4 cm wide"
 *
 * Logic:
 * - For horizontal: width = (count * 7) + (count-1) * 0.2, height = 7
 * - For vertical: height = (count * 7) + (count-1) * 0.2, width = 7
 *
 * Example (3 horizontal): 3*7 + 2*0.2 = 21.0 + 0.4 = 21.4 cm ✓
 */
export const calculateSocketGroupDimensions = (
  count: number,
  direction: "horizontal" | "vertical"
): { width: number; height: number } => {
  const totalSocketSpace = count * SOCKET_SIZE;
  const gaps = (count - 1) * SOCKET_GAP;
  const totalDimension = totalSocketSpace + gaps;

  if (direction === "horizontal") {
    return { width: totalDimension, height: SOCKET_SIZE };
  } else {
    return { height: totalDimension, width: SOCKET_SIZE };
  }
};

/**
 * Check if Plate is Large Enough for Sockets
 *
 * Task Requirement: "Plates must be at least 40x40 cm to accept sockets."
 *
 * Logic: Both width AND height must be >= 40cm
 */
export const isPlateLargeEnoughForSockets = (plate: Plate): boolean => {
  return (
    plate.width >= MIN_PLATE_SIZE_FOR_SOCKETS &&
    plate.height >= MIN_PLATE_SIZE_FOR_SOCKETS
  );
};

/**
 * Validate Socket Position
 *
 * Task Requirements:
 * 1. "Socket groups must be at least 3 cm from plate edges"
 * 2. "Socket groups must be at least 4 cm from other socket groups"
 * 3. "Sockets cannot overlap or go outside the plate area"
 * 4. "Anchor point is the bottom-left center of the first socket"
 *
 * Logic:
 * - Anchor point is 3.5cm from both left and bottom edges of the 7x7cm socket
 * - positionX and positionY are distances from plate edges TO the anchor point
 * - Check edge distances (must be >= 3cm from all edges)
 * - Check group distances (must be >= 4cm from all other groups)
 * - Use Euclidean distance between rectangles for accurate measurement
 */
export const validateSocketPosition = (
  socketGroup: SocketGroup,
  positionX: number,
  positionY: number,
  plate: Plate,
  allSocketGroups: SocketGroup[]
): ValidatedPosition => {
  const { width: groupWidth, height: groupHeight } =
    calculateSocketGroupDimensions(socketGroup.count, socketGroup.direction);

  // Anchor point is at 3.5cm from both left and bottom edges of the 7x7cm first socket
  // positionX and positionY are distances from plate edges TO the anchor point
  const ANCHOR_OFFSET_CM = 3.5;

  // Calculate the actual position of the socket group's boundaries
  // Anchor is at positionX from left and positionY from bottom
  // First socket's left edge = positionX - ANCHOR_OFFSET_CM (3.5cm left of anchor)
  // First socket's bottom edge = positionY - ANCHOR_OFFSET_CM (3.5cm up from anchor)
  // Group's left edge = first socket's left edge
  // Group's bottom edge = first socket's bottom edge
  // Group's right edge = first socket's left edge + groupWidth
  // Group's top edge = first socket's bottom edge + groupHeight
  const groupLeftX = positionX - ANCHOR_OFFSET_CM;
  const groupBottomY = positionY - ANCHOR_OFFSET_CM;
  const groupRightX = groupLeftX + groupWidth;
  const groupTopY = groupBottomY + groupHeight;

  // Check if socket group fits within plate bounds
  // Task Requirement: "Socket groups must be at least 3 cm from plate edges"
  // Logic: Check if socket group is at least 3 cm from plate edges
  if (groupLeftX < MIN_EDGE_DISTANCE) {
    const minAllowedGroupLeftX = MIN_EDGE_DISTANCE;
    const minAllowedPositionX = minAllowedGroupLeftX + ANCHOR_OFFSET_CM;
    return {
      valid: false,
      error: `Steckdosengruppe zu nah am linken Rand. Minimale Position von links: ${minAllowedPositionX.toFixed(
        1
      )} cm (Rückwandbreite: ${plate.width.toFixed(
        1
      )} cm, Steckdosengruppenbreite: ${groupWidth.toFixed(
        1
      )} cm, Mindestabstand: ${MIN_EDGE_DISTANCE} cm)`,
      positionX,
      positionY,
    };
  }

  if (groupBottomY < MIN_EDGE_DISTANCE) {
    const minAllowedGroupBottomY = MIN_EDGE_DISTANCE;
    const minAllowedPositionY = minAllowedGroupBottomY + ANCHOR_OFFSET_CM;
    return {
      valid: false,
      error: `Steckdosengruppe zu nah am unteren Rand. Minimale Position von unten: ${minAllowedPositionY.toFixed(
        1
      )} cm (Rückwandhöhe: ${plate.height.toFixed(
        1
      )} cm, Steckdosengruppenhöhe: ${groupHeight.toFixed(
        1
      )} cm, Mindestabstand: ${MIN_EDGE_DISTANCE} cm)`,
      positionX,
      positionY,
    };
  }

  // Check if socket group fits within plate bounds
  // Task Requirement: "Socket groups must be at least 3 cm from plate edges"
  if (groupRightX > plate.width - MIN_EDGE_DISTANCE) {
    const maxAllowedGroupLeftX = plate.width - MIN_EDGE_DISTANCE - groupWidth;
    const maxAllowedPositionX = maxAllowedGroupLeftX + ANCHOR_OFFSET_CM;
    return {
      valid: false,
      error: `Steckdosengruppe überschreitet die Rückwandbreite. Maximale Position von links: ${maxAllowedPositionX.toFixed(
        1
      )} cm (Rückwandbreite: ${plate.width.toFixed(
        1
      )} cm, Steckdosengruppenbreite: ${groupWidth.toFixed(
        1
      )} cm, Mindestabstand: ${MIN_EDGE_DISTANCE} cm)`,
      positionX,
      positionY,
    };
  }

  // Check if socket group fits within plate bounds
  // Task Requirement: "Socket groups must be at least 3 cm from plate edges"
  if (groupTopY > plate.height - MIN_EDGE_DISTANCE) {
    const maxAllowedGroupTopY = plate.height - MIN_EDGE_DISTANCE;
    const maxAllowedGroupBottomY = maxAllowedGroupTopY - groupHeight;
    // Anchor is 3.5cm above socket bottom, so positionY = groupBottomY + 3.5
    const maxAllowedPositionY = maxAllowedGroupBottomY + ANCHOR_OFFSET_CM;
    return {
      valid: false,
      error: `Steckdosengruppe überschreitet die Rückwandhöhe. Maximale Position von unten: ${maxAllowedPositionY.toFixed(
        1
      )} cm (Rückwandhöhe: ${plate.height.toFixed(
        1
      )} cm, Steckdosengruppenhöhe: ${groupHeight.toFixed(
        1
      )} cm, Mindestabstand: ${MIN_EDGE_DISTANCE} cm)`,
      positionX,
      positionY,
    };
  }

  // Check distance from other socket groups
  // Task Requirement: "Socket groups must be at least 4 cm from other socket groups"
  // Logic: Calculate Euclidean distance between two rectangles
  for (const other of allSocketGroups) {
    if (other.id === socketGroup.id || other.plateId !== socketGroup.plateId)
      continue;

    // Calculate the dimensions of the other socket group
    // Task Requirement: "Each socket is 7x7 cm. Gap between sockets is 0.2 cm."
    // Example: "A horizontal group of 3 sockets = 21.4 cm wide"
    // Logic:
    // - For horizontal: width = (count * 7) + (count-1) * 0.2, height = 7
    // - For vertical: height = (count * 7) + (count-1) * 0.2, width = 7
    //
    // Example (3 horizontal): 3*7 + 2*0.2 = 21.0 + 0.4 = 21.4 cm ✓
    const { width: otherWidth, height: otherHeight } =
      calculateSocketGroupDimensions(other.count, other.direction);

    // Calculate distance between two rectangles (rectangles are used to represent the socket groups)
    // Rectangle 1: current group (socketGroup) - using bottom-left coordinate system
    const r1Left = positionX - ANCHOR_OFFSET_CM;
    const r1Right = r1Left + groupWidth;
    const r1Bottom = positionY - ANCHOR_OFFSET_CM;
    const r1Top = r1Bottom + groupHeight;

    // Rectangle 2: other group (other) - using bottom-left coordinate system
    const r2Left = other.positionX - ANCHOR_OFFSET_CM;
    const r2Right = r2Left + otherWidth;
    const r2Bottom = other.positionY - ANCHOR_OFFSET_CM;
    const r2Top = r2Bottom + otherHeight;

    // Calculate horizontal distance (x-axis)
    let hDistance = 0;
    if (r1Right < r2Left) {
      hDistance = r2Left - r1Right;
    } else if (r2Right < r1Left) {
      hDistance = r1Left - r2Right;
    }

    // Calculate vertical distance (y-axis) - in bottom coordinate system, higher values are above
    let vDistance = 0;
    if (r1Bottom > r2Top) {
      // r1 is above r2
      vDistance = r1Bottom - r2Top;
    } else if (r2Bottom > r1Top) {
      // r2 is above r1
      vDistance = r2Bottom - r1Top;
    }

    // The actual distance is the combined horizontal and vertical distances
    // Task Requirement: "4 cm from other socket groups" - uses Euclidean distance
    const totalDistance = Math.sqrt(
      hDistance * hDistance + vDistance * vDistance
    );

    // Task Requirement: "Socket groups must be at least 4 cm from other socket groups"
    if (totalDistance < MIN_GROUP_DISTANCE) {
      return {
        valid: false,
        error: `Steckdosengruppen müssen mindestens ${MIN_GROUP_DISTANCE} cm voneinander entfernt sein. Aktueller Abstand: ${totalDistance.toFixed(
          1
        )} cm (Mindestabstand: ${MIN_GROUP_DISTANCE} cm)`,
        positionX,
        positionY,
      };
    }
  }

  return { valid: true, positionX, positionY };
};
