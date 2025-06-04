// Результаты брались с сайтов:
// - https://colorscheme.ru/color-converter.html?ysclid=mavca6bwqm450532273
// - https://colors-picker.com/color-contrast-checker-wcag/
// - https://www.colorspaceconverter.com/converter/rgb-to-oklch

import { rgbaToOklch, rgbToXyz, xyzToLab } from "../utils/colorSchemes.ts";

// Тестовые данные
const testColors = [
  [202, 208, 42],
  [110, 99, 105],
  [234, 99, 106],
  [249, 234, 224],
  [95, 96, 153],
  [232, 183, 130],
  [191, 153, 130],
  [141, 170, 112],
];

const expectedResults: Record<
  string,
  { xyz: number[]; lab: number[]; oklch: number[] }
> = {
  "202-208-42": {
    xyz: [47, 58, 11],
    lab: [81, -22, 74],
    oklch: [0.83, 0.17, 111.83],
  },
  "110-99-105": {
    xyz: [13, 13, 15],
    lab: [43, 4, -2],
    oklch: [0.51, 0.02, 343.63],
  },
  "234-99-106": {
    xyz: [41, 27, 17],
    lab: [59, 55, 22],
    oklch: [0.67, 0.17, 19.67],
  },
  "249-234-224": {
    xyz: [82, 84, 82],
    lab: [93, 4, 7],
    oklch: [0.95, 0.02, 56.13],
  },
  "95-96-153": {
    xyz: [15, 13, 32],
    lab: [43, 17, -32],
    oklch: [0.51, 0.09, 282],
  },
  "232-183-130": {
    xyz: [54, 53, 28],
    lab: [78, 9, 35],
    oklch: [0.81, 0.09, 68.23],
  },
  "191-153-130": {
    xyz: [37, 35, 26],
    lab: [66, 13, 17],
    oklch: [0.71, 0.06, 52.74],
  },
  "141-170-112": {
    xyz: [28, 36, 21],
    lab: [67, -23, 27],
    oklch: [0.7, 0.09, 129.98],
  },
};

// Функция для сравнения массивов чисел с допустимой погрешностью
function isApproximatelyEqual(
  actual: number[],
  expected: number[],
  epsilon: number = 5,
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => Math.abs(value - expected[index]) <= epsilon)
  );
}

// Основная функция тестирования
function runColorConversionTests() {
  let passedTests = 0;
  let failedTests = 0;

  console.log("Запуск тестов конвертации цветов...\n");

  testColors.forEach((rgbColor) => {
    const colorKey = rgbColor.join("-");
    const expected = expectedResults[colorKey];

    if (!expected) {
      console.warn(`Нет ожидаемых результатов для цвета: ${colorKey}`);
      return;
    }

    // Выполняем конвертации
    const actualXyz = rgbToXyz(rgbColor).map((n) => Math.round(n));
    const actualLab = xyzToLab(rgbToXyz(rgbColor)).map((n) => Math.round(n));
    const actualOklch = rgbaToOklch(rgbColor[0], rgbColor[1], rgbColor[2]);
    const actualOklchArray = [actualOklch.l, actualOklch.c, actualOklch.h];

    // Проверяем результаты
    const isXyzValid = isApproximatelyEqual(actualXyz, expected.xyz);
    const isLabValid = isApproximatelyEqual(actualLab, expected.lab);
    const isOklchValid = isApproximatelyEqual(
      actualOklchArray,
      expected.oklch,
      0.05,
    );

    if (isXyzValid && isLabValid && isOklchValid) {
      passedTests++;
      console.log(`Цвет ${colorKey}: все конвертации верны`);
    } else {
      failedTests++;
      console.error(`Цвет ${colorKey}: обнаружены расхождения`);

      if (!isXyzValid) {
        console.error(
          `   XYZ: получено ${actualXyz}, ожидалось ${expected.xyz}`,
        );
      }
      if (!isLabValid) {
        console.error(
          `   Lab: получено ${actualLab}, ожидалось ${expected.lab}`,
        );
      }
      if (!isOklchValid) {
        console.error(
          `   OKLch: получено ${actualOklchArray}, ожидалось ${expected.oklch}`,
        );
      }
    }
  });

  // Вывод итогов
  console.log("\nИтоговые результаты:");
  console.log(`Успешных тестов: ${passedTests}`);
  console.log(`Проваленных тестов: ${failedTests}`);
  console.log(`Всего тестов: ${testColors.length}`);

  if (failedTests === 0) {
    console.log("\nВсе тесты успешно пройдены!");
  } else {
    console.error("\nОбнаружены ошибки в конвертации цветов!");
  }

  // Возвращаем код завершения для CI/CD
  process.exit(failedTests > 0 ? 1 : 0);
}

// Запускаем тесты
runColorConversionTests();
