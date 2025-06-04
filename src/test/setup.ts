// src/test/setup.ts
import "@testing-library/jest-dom"; // или любые глобальные импорты
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Создаем заглушку для ImageData, так как jsdom не имеет её реализации
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(width: number, height: number);
  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(arg1: number | Uint8ClampedArray, arg2: number, arg3?: number) {
    if (typeof arg1 === "number") {
      this.width = arg1;
      this.height = arg2;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = arg1;
      this.width = arg2;
      this.height = arg3 || this.data.length / (4 * this.width);
    }
  }
}

// Добавляем заглушку в глобальный объект
(globalThis as any).ImageData = MockImageData;
