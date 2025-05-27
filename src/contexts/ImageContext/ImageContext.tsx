import React, { createContext, useContext, useEffect, useState } from "react";
import { detectImageFormat } from "../../utils/ImageTypeGetter";
import { loadGB7Image, loadStandardImage } from "../../utils/loadImage";
import { getColorDepthOfImage } from "../../utils/ColorDepthGetter";
import { resizeImageByMethod } from "../../utils/resize";
import { findClosestScaleBelow, scaleImage } from "../../utils/scaleImage";
import { useLayers } from "../LayersContext/LayersContext";

export type ImageContextProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null> | null;
  setCanvasRef: (ref: React.RefObject<HTMLCanvasElement | null> | null) => void;

  imageData: ImageData | null;
  scalledImageData: ImageData | null;
  width: number;
  height: number;
  colorDepth: number;
  scaleValue: number;
  renderMethod: "normal" | "pixelated";
  offsetX: number;
  offsetY: number;
  setOffsetX: (value: React.SetStateAction<number>) => void;
  setOffsetY: (value: React.SetStateAction<number>) => void;
  setRenderMethod: (method: "normal" | "pixelated") => void;
  setScaleValue: (value: number) => void;

  loadImage: (file: File) => void;
  clearImage: () => void;
  resizeImage: (
    newWidth: number,
    newHeight: number,
    method: "nearest" | "bilinear",
  ) => void;
  drawImageOnCanvas: (data: ImageData) => void;
};

const defaultContext: ImageContextProps = {
  canvasRef: null,
  setCanvasRef: () => {},

  imageData: null,
  scalledImageData: null,
  width: 0,
  height: 0,
  colorDepth: 0,
  scaleValue: 1,
  renderMethod: "normal",
  offsetX: 0,
  offsetY: 0,
  setOffsetX: () => {},
  setOffsetY: () => {},
  setRenderMethod: () => {},
  setScaleValue: () => {},

  loadImage: () => {},
  clearImage: () => {},
  resizeImage: () => {},
  drawImageOnCanvas: () => {},
};

export const ImageContext = createContext<ImageContextProps>(defaultContext);

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [canvasRef, setCanvasRef] =
    useState<React.RefObject<HTMLCanvasElement | null> | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [scalledImageData, setScalledImageData] = useState<ImageData | null>(
    null,
  );
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [colorDepth, setColorDepth] = useState(0);
  const [scaleValue, setScaleValue] = useState(1);
  const [renderMethod, setRenderMethod] = useState<"normal" | "pixelated">(
    "normal",
  );

  const {
    layers,
    activeLayerId,
    setOriginalImageData,
    setColorDepth: setLayerColorDepth,
  } = useLayers();

  // Очистка изображения
  function clearImage() {
    const canvas = canvasRef?.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      setImageData(null);
      setScalledImageData(null);
      setWidth(0);
      setHeight(0);
      setOffsetX(0);
      setOffsetY(0);
      setColorDepth(0);
    } else {
      alert("Canvas не найден");
    }
  }

  // Загрузка изображения
  async function loadImage(file: File) {
    let fileType = "";

    try {
      fileType = await detectImageFormat(file);
    } catch (error) {
      alert("Ошибка при определении формата изображения: " + error);
      return;
    }

    let newImageData: ImageData | null = null;

    if (fileType === "png" || fileType === "jpeg")
      newImageData = await loadStandardImage(file);
    else if (fileType === "graybit-7") newImageData = await loadGB7Image(file);
    else {
      alert("Неподдерживаемый формат изображения");
      return;
    }

    if (!newImageData) {
      alert("Не удалось загрузить изображение");
      return;
    }

    if (activeLayerId === null || !layers[activeLayerId]) {
      alert("Активный слой не найден");
      return;
    }

    const canvas = canvasRef?.current;
    if (canvas) {
      setScaleValue(
        findClosestScaleBelow(
          canvas.width,
          canvas.height,
          newImageData.width,
          newImageData.height,
        ),
      );
    }

    setOriginalImageData(activeLayerId, newImageData); // ← Заменяем изображение в активном слое
    console.log("load image");

    const depth = await getColorDepthOfImage(file, fileType);
    if (depth) setLayerColorDepth(activeLayerId, depth);
  }

  // Изменение размера изображения
  async function resizeImage(
    newWidth: number,
    newHeight: number,
    method: "nearest" | "bilinear",
  ) {
    if (activeLayerId === null || !layers[activeLayerId]) {
      alert("Активный слой не найден");
      return;
    }

    const layerImage = layers[activeLayerId]?.originalImageData;
    if (!layerImage) return;

    const newImageData = await resizeImageByMethod(
      layerImage,
      newWidth,
      newHeight,
      method,
    );

    if (!newImageData) {
      alert("Не удалось изменить размер изображения");
      return;
    }

    setOriginalImageData(activeLayerId, newImageData);
  }

  async function drawImageOnCanvas(data: ImageData, offsetX = 0, offsetY = 0) {
    const canvas = canvasRef?.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(data, offsetX, offsetY);
      }
    } else {
      alert("Canvas не найден");
    }
  }

  function mergeLayers(): ImageData | null {
    const visibleLayers = layers.filter(
      (l) => l.visible && l.editedImageData,
    ) as {
      editedImageData: ImageData;
      blendMode: BlendMode;
    }[];

    if (visibleLayers.length === 0) {
      return new ImageData(600, 600);
    }

    const maxWidth = Math.max(
      ...visibleLayers.map((l) => l.editedImageData.width),
    );
    const maxHeight = Math.max(
      ...visibleLayers.map((l) => l.editedImageData.height),
    );

    const result = new ImageData(maxWidth, maxHeight);

    for (let i = 0; i < visibleLayers.length; i++) {
      const { editedImageData, blendMode } = visibleLayers[i];
      const layerData = editedImageData.data;
      const offsetX =
        i === 0 ? 0 : Math.floor((maxWidth - editedImageData.width) / 2);
      const offsetY =
        i === 0 ? 0 : Math.floor((maxHeight - editedImageData.height) / 2);

      for (let y = 0; y < editedImageData.height; y++) {
        for (let x = 0; x < editedImageData.width; x++) {
          const srcIndex = (y * editedImageData.width + x) * 4;
          const dstX = x + offsetX;
          const dstY = y + offsetY;

          if (dstX < 0 || dstX >= maxWidth || dstY < 0 || dstY >= maxHeight)
            continue;

          const dstIndex = (dstY * maxWidth + dstX) * 4;

          const [r1, g1, b1, a1] = [
            result.data[dstIndex],
            result.data[dstIndex + 1],
            result.data[dstIndex + 2],
            result.data[dstIndex + 3] / 255,
          ];
          const [r2, g2, b2, a2] = [
            layerData[srcIndex],
            layerData[srcIndex + 1],
            layerData[srcIndex + 2],
            layerData[srcIndex + 3] / 255,
          ];

          const blended = applyBlendMode(
            [r1, g1, b1],
            [r2, g2, b2],
            a1,
            a2,
            blendMode,
          );
          const outAlpha = a2 + a1 * (1 - a2);

          result.data[dstIndex] = blended[0];
          result.data[dstIndex + 1] = blended[1];
          result.data[dstIndex + 2] = blended[2];
          result.data[dstIndex + 3] = Math.round(outAlpha * 255);
        }
      }
    }

    return result;
  }

  useEffect(() => {
    console.log("merge layers");
    const merged = mergeLayers();
    if (!merged || !canvasRef?.current) return;

    setImageData(merged);
    setWidth(merged.width);
    setHeight(merged.height);
  }, [setOriginalImageData]);

  useEffect(() => {
    async function scale() {
      if (!imageData || !canvasRef?.current) return;

      const scale = await scaleImage({
        canvas: canvasRef.current,
        imageData,
        scale: scaleValue,
      });

      if (!scale || !scale.scaledImageData) return;
      setScalledImageData(scale.scaledImageData);
      setOffsetX(scale.imageOffsetX);
      setOffsetY(scale.imageOffsetY);
    }

    scale();
    console.log("scale image");
  }, [imageData, scaleValue, canvasRef]);

  useEffect(() => {
    if (scalledImageData) {
      drawImageOnCanvas(scalledImageData, offsetX, offsetY);
      console.log("draw image on canvas");
    }
  }, [scalledImageData, offsetX, offsetY]);

  return (
    <ImageContext.Provider
      value={{
        canvasRef,
        setCanvasRef,
        imageData,
        scalledImageData,
        width,
        height,
        scaleValue,
        setScaleValue,
        colorDepth,
        loadImage,
        renderMethod,
        setRenderMethod,
        clearImage,
        resizeImage,
        drawImageOnCanvas,
        offsetX,
        offsetY,
        setOffsetX,
        setOffsetY,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImageContext() {
  return useContext(ImageContext);
}

type RGB = [number, number, number];
type BlendMode = "normal" | "multiply" | "screen" | "overlay";

function applyBlendMode(
  base: RGB,
  top: RGB,
  baseAlpha: number,
  topAlpha: number,
  mode: BlendMode,
): RGB {
  const blend = (cb: number, ct: number): number => {
    switch (mode) {
      case "multiply":
        return (cb * ct) / 255;
      case "screen":
        return 255 - ((255 - cb) * (255 - ct)) / 255;
      case "overlay":
        return cb < 128
          ? (2 * cb * ct) / 255
          : 255 - (2 * (255 - cb) * (255 - ct)) / 255;
      case "normal":
      default:
        return ct;
    }
  };

  const r = (1 - topAlpha) * base[0] + topAlpha * blend(base[0], top[0]);
  const g = (1 - topAlpha) * base[1] + topAlpha * blend(base[1], top[1]);
  const b = (1 - topAlpha) * base[2] + topAlpha * blend(base[2], top[2]);

  return [r, g, b].map((v) => Math.round(v)) as RGB;
}
