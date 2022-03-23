import { CodeExtension } from "./CodeExtension";

export { }

declare global {
  interface Array<T> {
    unique<T>(): T[];
  }
}

class ArrayExtensions {
  @CodeExtension(Array)
  unique<T>(value: T[]): T[] {
    let filtered: T[] = [];
    value.forEach((element) => {
      if (!filtered.includes(element)) {
        filtered.push(element);
      }
    });
    return filtered;
  }
}