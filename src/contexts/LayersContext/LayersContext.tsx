import React, { createContext, useContext, useEffect, useState } from "react";

type BlendMode = "normal" | "multiply" | "screen" | "overlay";

export function newEmptyLayer(): TLayer {
  return {
    id: 0,
    originalImageData: null,
    editedImageData: null,
    offsetX: 0,
    offsetY: 0,
    blendMode: "normal",
    opacity: 1,
    hasAlphaChannel: true,
    alphaChannelVisible: true,
    visible: true,
    preview: "",
    alphaChannelPreview: "",
  };
}

export type TLayer = {
  id: number;
  originalImageData: ImageData | null;
  editedImageData: ImageData | null;
  offsetX: number;
  offsetY: number;
  blendMode: BlendMode;
  opacity: number; // 0–1
  hasAlphaChannel: boolean;
  alphaChannelVisible: boolean;
  visible: boolean;
  preview: string;
  alphaChannelPreview: string;
};

type LayersContextType = {
  layers: TLayer[];
  activeLayerId: number | null;

  setActiveLayerId: (id: number | null) => void;
  setOriginalImageData: (id: number, data: ImageData) => void;
  addLayer: (layer: TLayer) => void;
  removeLayer: (id: number) => void;
  setOpacity: (id: number, opacity: number) => void;
  toggleAlphaVisibility: (id: number) => void;
  deleteAlphaChannel: (id: number) => void;
  changeBlendMode: (id: number, mode: BlendMode) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  setVisible: (id: number, visible: boolean) => void;
};

const LayersContext = createContext<LayersContextType | undefined>(undefined);

export const useLayers = () => {
  const context = useContext(LayersContext);
  if (!context)
    throw new Error("useLayers must be used within a LayersProvider");
  return context;
};

const max_layers = 2;

export const LayersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [layers, setLayers] = useState<TLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<number | null>(null);

  const addLayer = (layer: Omit<TLayer, "id">) => {
    setLayers((prev) => {
      if (prev.length >= max_layers) return prev;

      const newLayer = { ...layer, id: prev.length };
      const updatedLayers = [...prev, newLayer];

      // Если это первый слой, сделать его активным
      if (updatedLayers.length === 1) setActiveLayerId(0);

      return updatedLayers;
    });
  };

  const removeLayer = (id: number) => {
    setLayers((prev) => {
      const filtered = prev.filter((l) => l.id !== id);

      // Переиндексация
      const reindexed = filtered.map((layer, index) => ({
        ...layer,
        id: index,
      }));

      // Обновление активного слоя
      if (reindexed.length > 0) {
        setActiveLayerId(0);
      } else {
        setActiveLayerId(null);
      }

      return reindexed;
    });
  };

  const setOriginalImageData = (id: number, data: ImageData) => {
    const preview = getImagePreview(data);
    const alphaPreview = generateAlphaPreview(data);

    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              originalImageData: data,
              editedImageData: data,
              preview,
              alphaChannelPreview: alphaPreview,
            }
          : l,
      ),
    );
  };

  const setVisible = (id: number, visible: boolean) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible } : l)));
  };

  const setOpacity = (id: number, opacity: number) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  const toggleAlphaVisibility = (id: number) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const alphaVisible = !l.alphaChannelVisible;

        const editedImageData = alphaVisible
          ? l.originalImageData
          : removeAlphaFromCopy(l.originalImageData);

        return {
          ...l,
          alphaChannelVisible: alphaVisible,
          editedImageData,
        };
      }),
    );
  };

  const deleteAlphaChannel = (id: number) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const newImageData = removeAlphaFromCopy(l.originalImageData);
        return {
          ...l,
          hasAlphaChannel: false,
          alphaChannelVisible: false,
          originalImageData: newImageData,
          editedImageData: newImageData,
        };
      }),
    );
  };

  const changeBlendMode = (id: number, mode: BlendMode) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, blendMode: mode } : l)),
    );
  };

  const moveLayer = (from: number, to: number) => {
    setLayers((prev) => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length)
        return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  useEffect(() => {
    console.log(layers);
  }, [layers]);

  return (
    <LayersContext.Provider
      value={{
        layers,
        activeLayerId,
        addLayer,
        removeLayer,
        setOpacity,
        toggleAlphaVisibility,
        deleteAlphaChannel,
        changeBlendMode,
        setActiveLayerId,
        setOriginalImageData,
        moveLayer,
        setVisible,
      }}
    >
      {children}
    </LayersContext.Provider>
  );
};

// Удаление альфа-канала: установка alpha = 255 для каждого пикселя
function removeAlphaFromCopy(imageData: ImageData | null): ImageData {
  if (!imageData) return new ImageData(0, 0);

  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255;
  }
  return new ImageData(data, imageData.width, imageData.height);
}

function getImagePreview(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

function generateAlphaPreview(imageData: ImageData): string {
  const { width, height, data } = imageData;
  const alphaCanvas = document.createElement("canvas");
  alphaCanvas.width = width;
  alphaCanvas.height = height;

  const ctx = alphaCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not supported");

  const alphaImageData = ctx.createImageData(width, height);
  const alphaData = alphaImageData.data;

  // Преобразуем альфу в серую картинку
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]; // значение альфа-канала
    alphaData[i] = alpha; // R
    alphaData[i + 1] = alpha; // G
    alphaData[i + 2] = alpha; // B
    alphaData[i + 3] = 255; // Полностью непрозрачный пиксель
  }

  ctx.putImageData(alphaImageData, 0, 0);
  return alphaCanvas.toDataURL("image/png");
}
