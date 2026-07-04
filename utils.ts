function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function randInt(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start)) + start;
}

function randChoice<T>(arr: Array<T>): T {
  return arr[randInt(0, arr.length)];
}

function lerp(a: number, b: number, pct: number) {
  return a + (b - a) * pct;
}

export default {
  radToDeg,
  randInt,
  randChoice,
  lerp
};
