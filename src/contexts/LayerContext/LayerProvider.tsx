import React, { useState } from "react";
import { createCanvasRef, LayerContext } from "./LayerContext";
import { Layer, TBlendMode } from "../../types/layer.type";

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayer] = useState<string | null>(null);

  const addLayer = ({
    name,
    fillColor,
    image,
    isAlpha = false,
  }: {
    name: string;
    fillColor?: string;
    image?: HTMLImageElement;
    isAlpha?: boolean;
  }) => {
    const canvasRef = createCanvasRef();
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name,
      imageData: null,
      visible: true,
      opacity: 1,
      blendMode: "normal",
      isAlpha,
      canvasRef,
    };

    setLayers((prev) => [...prev, newLayer]);
    setActiveLayer(newLayer.id);

    // Инициализация содержимого
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
        }
      }
    });
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (activeLayerId === id) setActiveLayer(null);
  };

  const toggleVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  };

  const setOpacity = (id: string, opacity: number) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  const setBlendMode = (id: string, mode: TBlendMode) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, blendMode: mode } : l)),
    );
  };

  const moveLayer = (fromIndex: number, toIndex: number) => {
    setLayers((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const hideAlphaChannel = (id: string) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id && l.isAlpha ? { ...l, visible: false } : l,
      ),
    );
  };

  const deleteAlphaChannel = (id: string) => {
    setLayers((prev) => prev.filter((l) => !(l.id === id && l.isAlpha)));
  };

  return (
    <LayerContext.Provider
      value={{
        layers,
        activeLayerId,
        setActiveLayer,
        addLayer,
        removeLayer,
        toggleVisibility,
        setOpacity,
        setBlendMode,
        moveLayer,
        hideAlphaChannel,
        deleteAlphaChannel,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
};

export function useLayerContext() {
  const context = React.useContext(LayerContext);
  if (context === undefined) {
    throw new Error("useLayerContext must be used within a LayerProvider");
  }
  return context;
}
