function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function randInt(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start)) + start;
}

function randChoice<T>(arr: Array<T>): T {
  return arr[randInt(0, arr.length)];
}

export default {
  radToDeg,
  randInt,
  randChoice
};
