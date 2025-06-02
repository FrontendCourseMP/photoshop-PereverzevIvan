export function imageDataToURL(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось получить контекст");

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL(); // возвращает строку data:image/png;base64,...
}
