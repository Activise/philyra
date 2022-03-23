import { CodeExtension } from "./CodeExtension";

export {}

declare global {
  interface String {
    capitalize(): string;
    lowercaseFirst(): string;
  }
}

class StringExtensions {
  @CodeExtension(String)
  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  @CodeExtension(String)
  lowercaseFirst(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
}