type Channel = "R" | "G" | "B" | "A";

/**
 * Создает гистограмму для одного канала (R, G, B, A) из imageData.
 */
export function getChannelHistogram(
  imageData: ImageData,
  channel: Channel,
): number[] {
  const histogram = new Array(256).fill(0);
  const data = imageData.data;
  const channelIndex = { R: 0, G: 1, B: 2, A: 3 }[channel];

  for (let i = 0; i < data.length; i += 4) {
    const value = data[i + channelIndex];
    histogram[value]++;
  }

  return histogram;
}

/**
 * Создает гистограмму градаций серого, усредняя R, G и B.
 */
export function getGrayscaleHistogram(imageData: ImageData): number[] {
  const histogram = new Array(256).fill(0);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    histogram[gray]++;
  }

  return histogram;
}
