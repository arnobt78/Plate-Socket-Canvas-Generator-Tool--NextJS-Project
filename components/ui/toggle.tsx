import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, defaultPressed, onPressedChange, ...props }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(
      defaultPressed || false
    );
    const isPressed = pressed !== undefined ? pressed : internalPressed;

    const handleClick = () => {
      const newPressed = !isPressed;
      if (pressed === undefined) {
        setInternalPressed(newPressed);
      }
      onPressedChange?.(newPressed);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isPressed}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          isPressed ? "bg-green-600" : "bg-gray-300",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            isPressed ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
