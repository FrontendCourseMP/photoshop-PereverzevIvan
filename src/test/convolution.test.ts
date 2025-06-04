import { describe, it, expect } from "vitest";
import { applyConvolution, ConvolutionPresets } from "../utils/convolution";

function createTestImageData(
  width: number,
  height: number,
  color: [number, number, number, number],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const [r, g, b, a] = color;
    data.set([r, g, b, a], i * 4);
  }
  return new ImageData(data, width, height);
}

function arraysAlmostEqual(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  expect(a.length).toBe(b.length);
  for (let i = 0; i < a.length; i++) {
    expect(Math.abs(a[i] - b[i])).toBeLessThanOrEqual(1);
  }
}

describe("applyConvolution — базовые случаи", () => {
  it("Фильтр 'Identity' возвращает исходное изображение без изменений", () => {
    const image = createTestImageData(3, 3, [100, 150, 200, 255]);
    const result = applyConvolution(image, ConvolutionPresets.Identity);
    arraysAlmostEqual(result.data, image.data);
  });

  it("Фильтр 'Box Blur' размазывает (среднее сглаживание)", () => {
    const image = createTestImageData(3, 3, [100, 100, 100, 255]);
    image.data.set([200, 200, 200, 255], (1 * 3 + 1) * 4); // Центр
    const result = applyConvolution(image, ConvolutionPresets["Box Blur"]);
    expect(result.data).not.toEqual(image.data);
  });

  it("Фильтр 'Sharpen' делает изображение более резким", () => {
    const image = createTestImageData(3, 3, [100, 100, 100, 255]);
    image.data.set([50, 50, 50, 255], (1 * 3 + 1) * 4);
    const result = applyConvolution(image, ConvolutionPresets.Sharpen);
    expect(result.data).not.toEqual(image.data);
  });

  it("Корректно применяет фильтрацию только к RGB, не изменяя альфу", () => {
    const image = createTestImageData(3, 3, [100, 100, 100, 128]);
    const result = applyConvolution(
      image,
      ConvolutionPresets["Box Blur"],
      "rgb",
    );
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i + 3]).toBe(128);
    }
  });
});

describe("applyConvolution — дополнительные случаи", () => {
  it("Обрабатывает края изображения путём репликации граничных пикселей", () => {
    const data = new Uint8ClampedArray([
      10, 20, 30, 255, 40, 50, 60, 255, 70, 80, 90, 255, 100, 110, 120, 255,
    ]);
    const input = new ImageData(data, 2, 2);
    const output = applyConvolution(input, ConvolutionPresets.Identity);
    arraysAlmostEqual(output.data, input.data);
  });

  it("Применяет асимметричное ядро (Prewitt Horizontal)", () => {
    const data = new Uint8ClampedArray([
      10, 10, 10, 255, 200, 200, 200, 255, 10, 10, 10, 255, 200, 200, 200, 255,
      10, 10, 10, 255, 200, 200, 200, 255,
    ]);
    const input = new ImageData(data, 2, 3);
    const output = applyConvolution(
      input,
      ConvolutionPresets["Prewitt Horizontal"],
    );
    expect(output.data).not.toEqual(input.data);
  });

  it("Корректно нормализует ядро с суммой > 1", () => {
    const kernel = [
      [1, 1, 1],
      [1, 2, 1],
      [1, 1, 1],
    ]; // сумма = 10
    const input = createTestImageData(3, 3, [100, 100, 100, 255]);
    const output = applyConvolution(input, kernel);
    arraysAlmostEqual(output.data, input.data);
  });

  it("Обрабатывает ядро с нулевой суммой, не делит на 0", () => {
    const kernel = [
      [1, -1, 1],
      [-1, 0, -1],
      [1, -1, 1],
    ]; // сумма = 0
    const input = createTestImageData(3, 3, [100, 100, 100, 255]);
    const output = applyConvolution(input, kernel);
    expect(output.data.length).toBe(input.data.length);
    expect(output.data).not.toEqual(input.data);
  });
});
