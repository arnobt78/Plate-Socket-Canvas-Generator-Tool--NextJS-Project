# Plate, Socket & Canvas Generator Tool - Next.js Project (Technical Assessment)

A comprehensive, interactive German electrical plate and socket configuration tool built with Next.js 14. This project implements a sophisticated drag-and-drop interface for designing custom electrical plate layouts with real-time validation, responsive design, and precise centimeter-based positioning.

- **Live-Demo:** [https://plate-socket-generator-tool.vercel.app/](https://plate-socket-generator-tool.vercel.app/)

![Screenshot 2025-11-02 at 14 26 49](https://github.com/user-attachments/assets/a6ecf70c-af51-4ab7-954c-e1b2372cd569)

<img width="1895" height="842" alt="Screenshot 2025-11-02 at 19 16 35" src="https://github.com/user-attachments/assets/9b8fcffa-226e-4571-9a93-b2c1dbf144a5" />

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Technical Implementation](#-technical-implementation)
- [Task Requirements](#-task-requirements)
- [Component Architecture](#️-component-architecture)
- [Key Algorithms](#-key-algorithms)
- [Development](#-development)
- [Deployment](#-deployment)
- [Keywords](#️-keywords)
- [Author Information](#-author-information)

---

## 🎯 Overview

The **R24 Plate & Socket Generator** is a professional-grade web application that allows users to design and visualize electrical plate configurations. Built as a technical assessment project, it demonstrates expertise in:

- **Real-time interactive design** with drag-and-drop functionality
- **Precise validation** using geometric algorithms and constraint checking
- **Responsive design** optimized for desktop, tablet, and mobile devices
- **State management** with localStorage persistence
- **Mathematical accuracy** in coordinate transformations and scaling
- **UX excellence** with live feedback, guidelines, and toast notifications

The application maintains **realistic proportions** between plates (Rückwände) and socket groups (Steckdosengruppen) while ensuring all configurations meet German electrical standards.

---

## ✨ Features

### Core Functionality

- ✅ **Plate Management**: Add, delete, and configure multiple plates with custom dimensions
- ✅ **Socket Configuration**: Toggle socket mode, configure groups with 1-5 sockets
- ✅ **Drag-and-Drop**: Intuitive positioning with live guidelines and distance measurements
- ✅ **Real-time Validation**: Instant feedback for invalid positions with detailed error messages
- ✅ **Responsive Scaling**: Automatic proportional scaling for all screen sizes
- ✅ **Touch Support**: Full mobile compatibility with optimized touch interactions
- ✅ **Zoom Controls**: Canvas zoom in/out/reset for detailed work
- ✅ **Persistent Storage**: LocalStorage saves configurations automatically

### Visual Features

- 🎨 **Live Guidelines**: Real-time visual feedback during drag operations showing X/Y distances
- 🎨 **Color-coded Feedback**: Success (green), warning (yellow), error (red) notifications
- 🎨 **Plate Selection UI**: Visual cards with exact aspect ratios for plate preview
- 🎨 **Typewriter Title**: Animated loading title for professional presentation
- 🎨 **Socket Visualization**: High-quality socket images with proper scaling

### UX Enhancements

- 📱 **Mobile-Optimized Sidebar**: Collapsible control panel with burger menu
- 📱 **Touch Target Expansion**: Larger hit areas for easy mobile interaction
- 📱 **Scroll Behavior**: Auto-scrolling to selected items in lists
- 📱 **Centered Single-Plate Mode**: Focused view for detailed socket placement
- 📱 **Stable Scrollbars**: No content shifting with scrollbar appearance

---

## 🛠️ Technology Stack

### Frontend Framework

- **Next.js 14.2.0** - React framework with App Router, Server Components, and optimized builds
- **React 18.2.0** - UI library with hooks and concurrent features
- **TypeScript 5.4.0** - Type-safe development with strict mode

### Styling & UI

- **Tailwind CSS 3.4.0** - Utility-first CSS framework for responsive design
- **Lucide React 0.344.0** - Beautiful icon library (900+ icons)
- **Sonner 2.0.7** - Elegant toast notifications
- **class-variance-authority 0.7.0** - CSS variant management
- **tailwind-merge 2.3.0** - Intelligent Tailwind class merging
- **clsx 2.1.0** - Conditional className utility

### Development Tools

- **ESLint 8.57.0** - Code linting with Next.js config
- **PostCSS 8.4.35** - CSS processing
- **Autoprefixer 10.4.18** - Automatic vendor prefixes

### Deployment

- **Vercel** - Optimized hosting for Next.js applications
- **GitHub** - Version control and repository management

---

## 📁 Project Structure

```bash
socket-generator/
├── app/
│   ├── globals.css              # Global styles, CSS variables, custom utilities
│   ├── layout.tsx               # Root layout with metadata, SEO configuration
│   └── page.tsx                 # Home page (renders SocketGenerator)
├── components/
│   ├── socket-generator.tsx     # Main orchestration component (state, logic, scaling)
│   ├── plate-canvas.tsx         # Visual canvas renderer (plates, sockets, guidelines)
│   ├── control-panel.tsx        # User input UI (dimensions, socket config, toggles)
│   ├── stacked-indicator.tsx    # Stacked socket visualization helper
│   └── ui/                      # Reusable UI components
│       ├── button.tsx           # Button component with variants
│       ├── input.tsx            # Input component with validation states
│       ├── toggle.tsx           # Toggle switch component
│       ├── card.tsx             # Card container component
│       ├── badge.tsx            # Badge/chip component
│       ├── alert-dialog.tsx     # Modal dialog component
│       └── toaster.tsx          # Toast notification configuration
├── lib/
│   ├── types.ts                 # TypeScript interfaces, validation logic, constants
│   ├── utils.ts                 # Utility functions (cn, clamp)
│   └── hooks/
│       └── useTypewriter.ts     # Typewriter animation hook
├── public/
│   ├── favicon.ico              # Site favicon
│   └── steckdose.webp           # Socket image (CDN source)
├── Job-Assesment-Task.md        # Original task requirements
├── next.config.js               # Next.js configuration (image optimization)
├── tailwind.config.ts           # Tailwind CSS theme, plugins, content paths
├── tsconfig.json                # TypeScript compiler configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

### Key Files Explained

**`app/layout.tsx`** - Root layout with SEO metadata, global providers, and Toaster component
**`components/socket-generator.tsx`** - Main component managing all state, drag handlers, scaling logic, localStorage
**`components/plate-canvas.tsx`** - Pure render component for plates, sockets, guidelines, zoom controls
**`components/control-panel.tsx`** - Input handling for plates, sockets, configuration, validation UI
**`lib/types.ts`** - Type definitions, validation algorithms, constant values (SOCKET_SIZE, MIN_EDGE_DISTANCE, etc.)
**`lib/utils.ts`** - Utility functions like `cn()` for class merging and `clamp()` for value limiting

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For cloning the repository

### Step-by-Step Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd socket-generator
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**

   ```bash
   http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

**No environment variables required** for this project. The application works entirely on the client side with localStorage for persistence.

**Note**: If deploying to Vercel, no additional configuration is needed. The `next.config.js` is already configured for image optimization.

---

## 📖 Usage Guide

### Getting Started

1. **Initial State**: The app loads with 2 default plates (151.5x36.8 cm and 200x100 cm)
2. **Plate View**: Multiple plates display side-by-side with proportional scaling
3. **Socket Toggle**: Click "Steckdosen" toggle to enable socket mode

### Plate Management (Section 1)

**Adding a Plate**

- Click the "+ Neue Rückwand" button
- A new plate is created with default dimensions (100x60 cm)

**Modifying Dimensions**

- Enter width (20-300 cm) and height (30-128 cm) in input fields
- Values are automatically clamped to valid ranges
- Plate auto-scales in canvas

**Deleting a Plate**

- Click trash icon on any plate card
- Minimum 1 plate must remain (validation enforced)
- All socket groups on deleted plate are removed

**Mobile**: Use the burger menu (☰) to toggle the sidebar

### Socket Configuration (Section 2)

**Enabling Socket Mode**

- Toggle "Steckdosen" switch
- First eligible plate (≥40x40 cm) receives default socket group

**Selecting Plate**

- Choose plate from "Wähle die Rückwand für die Steckdose" dropdown
- Only plates ≥40x40 cm are eligible

**Configuring Socket Group**

- **Anzahl**: Select 1-5 sockets per group
- **Richtung**: Choose horizontal or vertical arrangement
- **Position X**: Distance from left edge (in cm)
- **Position Y**: Distance from bottom edge (in cm)

**Adding Socket Groups**

- Click "+ Steckdosengruppe hinzufügen" button
- Auto-positioned at first valid location
- Must meet all constraints (edges, other groups)

**Viewing Socket Groups (Section 3)**

- Lists all configured socket groups
- Shows plate dimensions and cost (if applicable)
- Click "Anzeigen" to focus on specific group
- Click trash to delete

### Drag-and-Drop Positioning

**Desktop**

- Click and drag any socket group on canvas
- Live guidelines appear showing X/Y distances
- Release to validate and save

**Mobile/Touch**

- Touch and drag socket group
- Expanded touch targets (20px padding) for easier interaction
- Same guidelines and validation

**Validation During Drag**

- Real-time checks for edge distances (≥3 cm)
- Real-time checks for group distances (≥4 cm)
- Visual feedback if position invalid
- Toast notification for violations

**After Drag**

- Valid position: Socket stays in new location
- Invalid position: Snaps back to previous location
- Success toast confirms saved position

### Canvas Controls

**Zoom In**: Click "+" button (top-right)
**Zoom Out**: Click "-" button
**Reset**: Click "↻" button

**Single-Plate Mode**

- When socket mode ON and plate selected
- Canvas shows only that plate, enlarged and centered
- Optimized for detailed positioning

**Multi-Plate Mode**

- Shows all plates side-by-side
- Horizontal scrolling if needed
- Auto-centers if content narrower than viewport

---

## 🔧 Technical Implementation

### Coordinate System

**Bottom-Left Origin**

- Position coordinates measured from bottom-left corner of plate
- X-axis: Distance from left edge
- Y-axis: Distance from bottom edge
- Consistent across rendering, drag, and validation

**Anchor Point System**

- Socket groups anchored at "bottom-left center of first socket"
- Anchor offset: 3.5 cm from socket edges (center of 7x7 cm socket)
- This ensures visually intuitive positioning

### Scaling Algorithm

**Single Plate Mode**

- Plate scales to fill 80% of viewport
- Maintains aspect ratio
- Centered on screen

**Multi-Plate Mode**

- Calculate total content width: `sum(plate_width × scale) + gaps + padding`
- If < viewport: Scale to fit with centering offset
- If ≥ viewport: Scale to max-width with scrolling

**Formula**:

```typescript
const finalScale = Math.min(
  availableWidth / totalWidth,
  availableHeight / totalHeight
);
```

### Drag-and-Drop Implementation

**Event Flow**

1. `onMouseDown` / `onTouchStart` → Capture start position and offset
2. `onMouseMove` / `onTouchMove` → Calculate live position, render guidelines
3. `onMouseUp` / `onTouchEnd` → Validate position, update state

**Coordinate Conversion**

```typescript
// Mouse position → Plate coordinates
const mousePlateX = (mouseX - plateOffsetX) / scale;
const mousePlateY = plate.height - (mouseY - plateOffsetY) / scale;

// Add anchor offset
const plateX = mousePlateX + ANCHOR_OFFSET_CM;
const plateY = mousePlateY - ANCHOR_OFFSET_CM;
```

**Validation Checks**

- Edge distances: Rectangle collision with plate bounds minus 3 cm
- Group distances: Euclidean distance between rectangle centers
- Real-time during drag with instant feedback

### State Management

**React Hooks**

- `useState`: Local component state (plates, sockets, UI state)
- `useEffect`: Side effects (localStorage sync, canvas resize)
- `useCallback`: Memoized event handlers
- `useRef`: DOM refs, persistent values

**localStorage Persistence**

- `socket-generator-plates`: Plate array
- `socket-generator-socket-groups`: Socket group array
- `socket-generator-is-editing-socket`: Edit mode flag
- `socket-generator-socket-toggle`: Toggle state

**Hydration Safety**

- Initialize state with defaults on server and client
- Load from localStorage in `useEffect` after hydration
- Prevents React hydration mismatches

---

## 📋 Task Requirements

This project implements **100% of the specified requirements** from the job assessment task.

### ✅ Initial Plate Generation

- [x] Default plate on load with predefined dimensions
- [x] Plate scales to fit canvas while maintaining aspect ratio
- [x] Multiple plates scaled proportionally
- [x] Visible color contrasting with background

### ✅ Dimension Representation

- [x] All sizes in centimeters (cm)
- [x] 1 cm = 1 unit internally
- [x] Proportional visual rendering
- [x] Example: 20x20 cm and 40x40 cm rendered at 1:2 ratio
- [x] Single plate grows to fit; multiple scaled down to fit

### ✅ Canvas Behavior

- [x] Plates shown side-by-side horizontally
- [x] Dynamic resize with browser window
- [x] Recalculation and re-rendering on resize
- [x] Mobile-friendly with touch support

### ✅ Plate Management

- [x] Input width (20-300 cm) and height (30-128 cm)
- [x] Input clamped to valid limits
- [x] Plate redrawn on dimension update
- [x] Sockets removed on resize
- [x] Add new plates (unlimited)
- [x] Delete plates (minimum 1 plate must remain)

### ✅ Socket Management

- [x] Socket section toggle ON/OFF
- [x] All socket groups deleted when OFF
- [x] One default socket group added when ON (first eligible plate)
- [x] Plates must be ≥40x40 cm to accept sockets
- [x] Sockets removed on plate resize
- [x] No socket groups on invalid plates

### ✅ Socket Group Configuration

- [x] Plate selector (only valid plates)
- [x] Number selector (1-5 sockets per group)
- [x] Direction selector (horizontal/vertical)
- [x] Position inputs (X from left, Y from bottom in cm)
- [x] Anchor point: bottom-left center of first socket

### ✅ Socket Group Constraints

- [x] Each socket: 7x7 cm
- [x] Gap between sockets: 0.2 cm
- [x] Example: 3 horizontal sockets = 21.4 cm wide
- [x] Minimum 3 cm from plate edges
- [x] Minimum 4 cm from other socket groups
- [x] No overlap with plate area or other groups
- [x] Socket groups cannot be dragged across plates

### ✅ Socket Dragging and Feedback

- [x] Drag or manual input for positioning
- [x] Two guideline lines during dragging:
  - [x] From left edge to anchor point
  - [x] From bottom edge to anchor point
- [x] Live cm values displayed on lines
- [x] Drag blocked for invalid positions (visual stays in last valid position)
- [x] Valid position: keep new position
- [x] Invalid position: snap back, show error message

### ✅ Validation and Blocking

- [x] Block invalid plate moves with clear message
- [x] Block invalid positions/overlaps
- [x] Error when no valid plates exist
- [x] Visual feedback for all blocked actions

---

## 🏗️ Component Architecture

### SocketGenerator (Main Component)

**Responsibilities**:

- Global state management (plates, socketGroups, dragState)
- Canvas scaling calculations
- Event handlers (drag, resize, localStorage sync)
- Zoom controls

**Key Logic**:

```typescript
// Calculate scale for proportional rendering
const calculateScale = (plate, availableWidth, availableHeight) => {
  const widthRatio = availableWidth / plate.width;
  const heightRatio = availableHeight / plate.height;
  return Math.min(widthRatio, heightRatio);
};

// Handle drag events
const handleSocketMouseMove = (e) => {
  // Convert mouse coordinates to plate coordinates
  // Validate position in real-time
  // Update dragState for visual feedback
};
```

### PlateCanvas (Render Component)

**Responsibilities**:

- Visual rendering of plates and socket groups
- Drag guidelines with live measurements
- Zoom controls UI
- Socket images with Next.js Image optimization

**Key Features**:

- Conditional rendering (single vs. multi-plate)
- Forward ref for DOM access
- Typewriter animation for title
- Proper CSS positioning (absolute, bottom-left origin)

### ControlPanel (Input Component)

**Responsibilities**:

- User input for plate dimensions
- Socket configuration UI
- Validation error display
- Plate/socket selection lists

**Key Features**:

- Real-time input validation
- Auto-scrolling to selected items
- Mobile-responsive layout
- Toast notifications for actions

### lib/types.ts (Type Definitions & Validation)

**Interfaces**:

```typescript
interface Plate {
  id: string;
  width: number; // 20-300 cm
  height: number; // 30-128 cm
}

interface SocketGroup {
  id: string;
  plateId: string;
  count: number; // 1-5
  direction: "horizontal" | "vertical";
  positionX: number; // cm from left
  positionY: number; // cm from bottom
}
```

**Validation Logic**:

```typescript
const validateSocketPosition = (
  socketGroup,
  positionX,
  positionY,
  plate,
  allSocketGroups
) => {
  // 1. Check edge distances (≥3 cm)
  // 2. Check group distances (≥4 cm, Euclidean)
  // 3. Return { valid, error, positionX, positionY }
};
```

---

## 🧮 Key Algorithms

### 1. Socket Group Dimension Calculation

```typescript
const calculateSocketGroupDimensions = (count, direction) => {
  const totalSocketSpace = count * SOCKET_SIZE; // count × 7 cm
  const gaps = (count - 1) * SOCKET_GAP; // (count-1) × 0.2 cm
  const totalDimension = totalSocketSpace + gaps;

  return direction === "horizontal"
    ? { width: totalDimension, height: SOCKET_SIZE }
    : { height: totalDimension, width: SOCKET_SIZE };
};
```

**Example**: 3 horizontal sockets

- `3 × 7 = 21 cm` (socket space)
- `2 × 0.2 = 0.4 cm` (gaps)
- **Total width: 21.4 cm** ✅

### 2. Euclidean Distance Between Rectangles

```typescript
const calculateDistance = (r1, r2) => {
  // r1/r2: { left, right, bottom, top }
  const hDistance = r1.right < r2.left
    ? r2.left - r1.right
    : r2.right < r1.left
    ? r1.left - r2.right
    : 0;

  const vDistance = r1.bottom > r2.top
    ? r1.bottom - r2.top
    : r2.bottom > r1.top
    ? r2.bottom - r1.top
    : 0;

  return Math.sqrt(hDistance² + vDistance²);
};
```

### 3. Multi-Plate Centering

```typescript
const shouldCenterPlates = (totalWidth, viewportWidth) => {
  if (totalWidth < viewportWidth) {
    const centeringOffset = (viewportWidth - totalWidth) / 2;
    return { shouldCenter: true, centeringOffset };
  }
  return { shouldCenter: false, centeringOffset: 0 };
};
```

---

## 💻 Development

### Code Quality

**TypeScript Strict Mode**

- No implicit `any`
- Null checks enforced
- Exhaustive type coverage

**ESLint Configuration**

- Next.js recommended rules
- React hooks rules
- Accessibility rules

**Code Organization**

- Modular components
- Separation of concerns (UI, logic, validation)
- Extensive inline documentation

### Best Practices

✅ **Component Structure**

- Single responsibility principle
- Props interfaces for type safety
- Forward refs where needed

✅ **State Management**

- Minimal state elevation
- Local state when possible
- `useCallback` for stability

✅ **Performance**

- Memoized callbacks
- Conditional rendering
- Next.js Image optimization

✅ **Accessibility**

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

---

## 🚀 Deployment

### Vercel Deployment

**Automatic Deployment**

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Vercel auto-detects Next.js configuration
4. Build and deploy automatically

**Manual Deployment**

```bash
npm run build
npm run start
```

**Environment Configuration**

- No environment variables needed
- `next.config.js` already configured
- Image optimization enabled for CDN

### Build Optimization

**Next.js Features**:

- Automatic code splitting
- Tree shaking
- Image optimization
- Static HTML generation where possible

**Bundle Size**:

- Initial load: ~87 kB (shared JS)
- Home page: ~122 kB (First Load JS)
- Optimized for mobile networks

---

## 🏷️ Keywords

**Technologies**: Next.js, React, TypeScript, Tailwind CSS, Vercel, shadcn/ui, Sonner

**Features**: Drag-and-drop, real-time validation, responsive design, touch support, localStorage, zoom controls

**Domain**: Electrical design, socket configuration, plate generator, German standards, Rückwand, Steckdose

**Concepts**: Coordinate systems, Euclidean distance, geometric algorithms, canvas rendering, state management

**Skills**: Frontend development, UI/UX design, algorithm implementation, responsive design, mobile optimization

---

## 👤 Author Information

**Name**: Arnob Mahmud  
**Email**: <arnob_t78@yahoo.com>  
**Portfolio**: [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/)  
**GitHub**: [https://github.com/arnobt78](https://github.com/arnobt78)

This project was developed as a technical assessment demonstrating proficiency in:

- Modern React development with Next.js
- Complex algorithm implementation
- Responsive design and mobile optimization
- TypeScript type safety and validation
- Professional code organization and documentation

---

## 📝 Additional Notes

### Extensibility

**Potential Enhancements**:

- Export to PDF/image functionality
- Socket types selection (different socket styles)
- Grid snapping for precise alignment
- Undo/redo functionality
- Plate templates/presets
- Collaborative editing (real-time sync)

**Reusable Components**:

- `ControlPanel` → Can be adapted for any configuration UI
- `PlateCanvas` → Generic canvas renderer for geometric elements
- Validation logic → Reusable for any constraint-based system
- `useTypewriter` → Utility hook for animations

### Learning Resources

This project is an excellent learning resource for:

- Next.js App Router architecture
- React hooks and state management
- Canvas rendering and coordinate systems
- Drag-and-drop implementation
- Geometric algorithms and validation
- Responsive design patterns
- TypeScript best practices

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
