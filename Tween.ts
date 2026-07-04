import Easings from "./Easings.js";
import utils from "./utils.js";

type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T] & string;

export default class Tween<T> {
  obj: T;
  prop: NumericKeys<T>;
  startVal: number;
  target: number;
  duration: number;
  ease: Function = Easings.linear;
  callback?: Function;

  elapsed = 0;
  complete = false;

  constructor(
    obj: T,
    prop: NumericKeys<T>,
    target: number,
    duration: number,
    callback?: Function,
  ) {
    this.obj = obj;
    this.prop = prop;
    this.startVal = obj[prop] as number;
    this.target = target;
    this.duration = duration;
    this.callback = callback;

    return this;
  }

  withEasing(easingFunction: Function) {
    this.ease = easingFunction;
    return this;
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed > this.duration) {
      this.elapsed = this.duration;
      this.complete = true;
      if (this.callback) this.callback();
    }
    (this.obj[this.prop] as unknown as number) = utils.lerp(
      this.startVal,
      this.target,
      this.ease(this.elapsed / this.duration),
    );
  }
}
