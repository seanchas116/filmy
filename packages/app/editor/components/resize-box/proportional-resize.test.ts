import { describe, it, expect } from "vitest";
import { Rect, Vec2 } from "paintvec";
import { proportionalResize } from "./proportional-resize";

/**
 *  helper function to make arguments for proportionalResize
 */
function makeArgs(
  /**
   * rect is a rectangle that is being resized.
   */
  rect: Rect,
  /**
   * placement is a position of the point that is being dragged.
   */
  placement: { x: 0 | 1; y: 0 | 1 },
  /**
   * endPoint is a point that is being dragged.
   */
  endPoint: Vec2
) {
  const p0 = rect.topLeft;
  const p1 = rect.bottomRight;
  const xs: [number, number] = [p0.x, p1.x];
  const ys: [number, number] = [p0.y, p1.y];

  xs[placement.x] = endPoint.x;
  ys[placement.y] = endPoint.y;

  return [p0, p1, xs, ys, placement] as const;
}

describe(proportionalResize.name, () => {
  /**
┼──────────────┐
│              │
│              │
└──────────────█(200,100)

┼──────┐
└──█───┘
 (50,50)
*/
  it("resizes proportionally", () => {
    expect(
      proportionalResize(
        ...makeArgs(
          Rect.from({ x: 0, y: 0, width: 200, height: 100 }),
          { x: 1, y: 1 },
          new Vec2(50, 50)
        )
      )
    ).toEqual({
      x: 100,
      y: 50,
    });
  });

  /**
┼──────────────┐
│              │
│              │
└──────────────█(200,100)

┌───────┼
└───█───┘
    (-50,50)

*/
  it("resizes proportionally with horizontal flip", () => {
    expect(
      proportionalResize(
        ...makeArgs(
          Rect.from({ x: 0, y: 0, width: 200, height: 100 }),
          { x: 1, y: 1 },
          new Vec2(-50, 50)
        )
      )
    ).toEqual({
      // bottom-left point
      x: -100,
      y: 50,
    });
  });

  /**
┼──────────────┐
│              │
│              │
└──────────────█(200,100)

    (-50,-50)
┌───█───┐
└───────┼
*/
  it("resizes proportionally with horizontal/vertical flips", () => {
    expect(
      proportionalResize(
        ...makeArgs(
          Rect.from({ x: 0, y: 0, width: 200, height: 100 }),
          { x: 1, y: 1 },
          new Vec2(-50, -50)
        )
      )
    ).toEqual({
      // top-left point
      x: -100,
      y: -50,
    });
  });
});
