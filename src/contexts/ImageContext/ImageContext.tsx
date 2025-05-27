import React, { createContext, useContext, useEffect, useState } from "react";
import { detectImageFormat } from "../../utils/ImageTypeGetter";
import { loadGB7Image, loadStandardImage } from "../../utils/loadImage";
import { getColorDepthOfImage } from "../../utils/ColorDepthGetter";
import { resizeImageByMethod } from "../../utils/resize";
import { scaleImage } from "../../utils/scaleImage";
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

  const { layers, activeLayerId, setOriginalImageData } = useLayers();

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

    setOriginalImageData(activeLayerId, newImageData); // ← Заменяем изображение в активном слое
    console.log("load image");

    const depth = await getColorDepthOfImage(file, fileType);
    if (depth) setColorDepth(depth);
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
    const images = layers
      .map((l) => l.editedImageData)
      .filter(Boolean) as ImageData[];

    console.log("in merge", images);

    if (images.length === 0) return null;

    // const base = images[0];
    const maxWidth = Math.max(...images.map((img) => img.width));
    const maxHeight = Math.max(...images.map((img) => img.height));

    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    images.forEach((img, i) => {
      const offX = i === 0 ? 0 : Math.floor((maxWidth - img.width) / 2);
      const offY = i === 0 ? 0 : Math.floor((maxHeight - img.height) / 2);
      ctx.putImageData(img, offX, offY);
    });

    return ctx.getImageData(0, 0, maxWidth, maxHeight);
  }

  useEffect(() => {
    console.log("merge layers");
    const merged = mergeLayers();
    if (!merged || !canvasRef?.current) return;

    setImageData(merged);
    setWidth(merged.width);
    setHeight(merged.height);
  }, [layers]);

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
