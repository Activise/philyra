export function CodeExtension(ctor: any, isStatic: boolean = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalFunction = descriptor.value;

    if (isStatic) {
      ctor[propertyKey] = function (...args: any[]) {
        return originalFunction(...args);
      }
    } else {
      ctor.prototype[propertyKey] = function (...args: any[]) {
        return originalFunction(this, ...args);
      }
    }
  }
}