// From https://stackoverflow.com/a/11697909
export class UnitBezier {
  constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
    // pre-calculate the polynomial coefficients
    // First and last control points are implied to be (0,0) and (1.0, 1.0)
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;

    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;
  }

  private cx: number;
  private bx: number;
  private ax: number;
  private cy: number;
  private by: number;
  private ay: number;

  private sampleCurveX(t: number) {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
  }
  private sampleCurveY(t: number) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
  }
  private sampleCurveDerivativeX(t: number) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
  }

  private solveCurveX(x: number, epsilon: number) {
    let t0;
    let t1;
    let t2;
    let x2;
    let d2;
    let i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = this.sampleCurveX(t2) - x;
      if (Math.abs(x2) < epsilon) return t2;
      d2 = this.sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < epsilon) break;
      t2 = t2 - x2 / d2;
    }

    // No solution found - use bi-section
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {
      x2 = this.sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;

      t2 = (t1 - t0) * 0.5 + t0;
    }

    // Give up
    return t2;
  }

  // Find new T as a function of Y along curve X
  solve(x: number, epsilon: number = 1e-6) {
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
  }
}

export const ease = [0.25, 0.1, 0.25, 1.0] as const;
export const linear = [0.0, 0.0, 1.0, 1.0] as const;
export const easeIn = [0.42, 0, 1.0, 1.0] as const;
export const easeOut = [0, 0, 0.58, 1.0] as const;
export const easeInOut = [0.42, 0, 0.58, 1.0] as const;
