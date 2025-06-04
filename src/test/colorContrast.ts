// Полезные ссылки:
// - https://colors-picker.com/color-contrast-checker-wcag/

import { getContrast } from "../utils/colorSchemes.ts";

const testCases = [
  {
    color1: [0, 0, 0],
    color2: [255, 255, 255],
    contrast: 21,
  },
  {
    color1: [89, 153, 241],
    color2: [111, 153, 32],
    contrast: 1.16,
  },
  {
    color1: [232, 208, 188],
    color2: [50, 15, 11],
    contrast: 11.73,
  },
  {
    color1: [71, 69, 83],
    color2: [251, 182, 136],
    contrast: 5.41,
  },
  {
    color1: [90, 60, 62],
    color2: [253, 250, 240],
    contrast: 9.35,
  },
  {
    color1: [254, 213, 133],
    color2: [136, 40, 33],
    contrast: 6.35,
  },
  {
    color1: [208, 155, 169],
    color2: [180, 48, 119],
    contrast: 2.46,
  },
];

// Функция для сравнения чисел с плавающей точкой с учетом округления
function almostEqual(a: number, b: number, precision: number = 2): boolean {
  return Math.abs(a - b) < Math.pow(10, -precision) / 2;
}

// Запуск тестов
function runTests() {
  let passed = 0;
  let failed = 0;

  testCases.forEach(({ color1, color2, contrast }, index) => {
    try {
      const result = getContrast(color1, color2);
      const isEqual = almostEqual(result, contrast);

      if (isEqual) {
        passed++;
        console.log(`Тест #${index + 1} пройден`);
      } else {
        failed++;
        console.error(`Тест #${index + 1} не пройден`);
        console.log(`  Ожидалось: ${contrast}`);
        console.log(`  Получено:  ${result}`);
      }
    } catch (error) {
      failed++;
      console.error(`Тест #${index + 1} вызвал ошибку`);
      console.error(error);
    }
  });

  console.log("\nРезультаты:");
  console.log(`Пройдено: ${passed}`);
  console.log(`Не пройдено: ${failed}`);
  console.log(`Всего тестов: ${testCases.length}`);

  process.exit(failed > 0 ? 1 : 0);
}

console.log("Тестирование контраста цветов...");
runTests();
