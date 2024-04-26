import { Vec2 } from "paintvec";

export function proportionalResize(
  startP0: Vec2,
  startP1: Vec2,
  newXs: [number, number],
  newYs: [number, number],
  placement: {
    x: 0 | 1;
    y: 0 | 1;
  }
): Vec2 {
  const startWidth = Math.abs(startP1.x - startP0.x);
  const startHeight = Math.abs(startP1.y - startP0.y);
  const startRatio = Math.abs(startWidth / startHeight);
  const currentHeight = newYs[1] - newYs[0];
  const currentWidth = newXs[1] - newXs[0];
  const currentRatio = Math.abs(currentWidth / currentHeight);

  let y = newYs[placement.y];
  let x = newXs[placement.x];
  if (currentRatio > startRatio) {
    const expectedHeight = Math.abs(currentWidth) / startRatio;
    if (placement.y === 0) {
      y = startP1.y + expectedHeight * (currentHeight < 0 ? 1 : -1);
    } else {
      y = startP0.y + expectedHeight * (currentHeight < 0 ? -1 : 1);
    }
  } else {
    const expectedWidth = Math.abs(currentHeight) * startRatio;
    if (placement.x === 0) {
      x = startP1.x + expectedWidth * (currentWidth < 0 ? 1 : -1);
    } else {
      x = startP0.x + expectedWidth * (currentWidth < 0 ? -1 : 1);
    }
  }
  return new Vec2(x, y);
}
