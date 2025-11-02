# Task Overview

Build an interactive Plate & Socket Generator interface that visually displays plates and socket groups on the left side of the screen (referred to as the canvas). The app must maintain realistic proportions between plates and sockets, support user input, and be responsive across different screen sizes including mobile.

Initial Plate Generation
On load, generate a default plate with predefined dimensions.
The plate must scale to fit the canvas while maintaining aspect ratio.
If multiple plates exist, all must be scaled proportionally to each other.
Use any visible color for plates that contrasts with the canvas background.

Dimension Representation and Scaling
All sizes are defined in centimeters (cm).
1 cm = 1 unit internally.
The visual rendering is scaled proportionally to fit the canvas area.
Example: A 20x20 cm plate and a 40x40 cm plate are rendered at 1:2 ratio.
If one plate exists, it grows to fit. If many exist, all are scaled down to fit horizontally (based on size).

Canvas Behavior
Plates are shown side by side horizontally in the canvas.
The canvas resizes dynamically with the browser window.
On resize, all plates and sockets are recalculated and re-rendered.
The canvas is mobile-friendly and supports touch interaction.

Plate Management
Users can input custom plate dimensions:
Width: 20 to 300 cm
Height: 30 to 128 cm
Input is clamped to valid limits.
When dimensions are updated, the plate is redrawn.
Any sockets on the plate are removed on resize.
Users can:
Add new plates (no limit)
Delete plates (minimum 1 plate must remain)

Socket Management
A socket section can be toggled ON or OFF.
When OFF, all socket groups are deleted.
When ON, one default socket group is added to the first eligible plate.

Socket rules:
Plates must be at least 40x40 cm to accept sockets.
If plate is resized then its accompanying sockets are removed.
Socket groups cannot be added to plates that don’t meet size requirements.

Socket Group Configuration

Each socket group includes:
Plate selector: Changes the plate it is attached to (only if the plate is valid).
Number selector: Choose 1 to 5 sockets in the group.
Direction selector: Horizontal or Vertical.
Position inputs: Distance from left and bottom (in cm).
The anchor point is the bottom-left center of the first socket.

Socket Group Dimensions and Constraints
Each socket is 7x7 cm.
Gap between sockets is 0.2 cm.
A horizontal group of 3 sockets = 21.4 cm wide.

Socket groups must be at least:
3 cm from plate edges
4 cm from other socket groups (refer to image on right for visual representation)
Sockets cannot overlap or go outside the plate area.
Socket groups cannot be dragged across plates (only one plate is shown in the canvas side when sockets are being edited, refer to design).

Socket Dragging and Feedback
Sockets can be moved using drag or manual input.
During dragging, show two guideline lines:
From left edge to anchor point
From bottom edge to anchor point
Each line displays live cm values next to it (e.g. “23.4 cm”).
During dragging, if the socket group is dragged to an invalid position then the drag event is blocked, the visual representation stays in the last valid position. As the system needs to communicate visually when a drag to position is invalid.
After dragging:
If the position is valid, keep the new position.
If invalid, snap the socket back to its original position and show an error message.

Validation and Blocking Behavior
If the user tries to move a socket group to an invalid plate, block the action and show a clear message.
If the user enters an invalid position or overlaps another socket, block the action.
If no valid plates exist to add a socket group, show an error and do not proceed.
All blocked actions must provide clear visual feedback explaining the reason.

Summary of Constraints
Plate width: 20–300 cmPlate height: 30–128 cmMin size for sockets: 40x40 cmSocket size: 7x7 cmSocket count per group: 1–5Gap between sockets: 0.2 cmMin distance from plate edge: 3 cmMin distance from other socket groups: 4 cmPlates must scale to fit canvasCanvas is responsive and mobile-friendlySocket positioning supports both drag and inputGuidelines show live distance from left and bottom edges during dragAll sockets and plates are validated before any change is applied

Socket image:
![Socket Image](https://cdn.shopify.com/s/files/1/0514/2511/6352/files/steckdose_1.png?v=1738943041)
