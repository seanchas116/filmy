import { pointerLockMovement } from "pointer-lock-movement";
import { useEffect, useRef } from "react";

// TODO: direction option
export function usePointerLockDrag(
  value: number,
  onChange: (value: number) => void
) {
  const pointerLockerRef = useRef<HTMLDivElement>(null);
  const pointerLockInitValue = useRef<number | undefined>();

  useEffect(() => {
    if (!pointerLockerRef.current) {
      return;
    }

    return pointerLockMovement(pointerLockerRef.current, {
      onLock(locked) {
        if (!locked) {
          pointerLockInitValue.current = undefined;
        } else {
          pointerLockInitValue.current = value;
        }
      },
      onMove: (evt, { movementX }) => {
        if (pointerLockInitValue.current === undefined) {
          pointerLockInitValue.current = value;
        }
        pointerLockInitValue.current += movementX;
        onChange(pointerLockInitValue.current);
      },
      cursor: "⟺",
    });
  }, [value, onChange]);

  return pointerLockerRef;
}
