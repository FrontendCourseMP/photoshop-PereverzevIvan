export type TBlendMode = "normal" | "multiply" | "screen" | "overlay";

export type Layer = {
  id: string;
  imageData: ImageData | null;
  name: string;
  visible: boolean;
  opacity: number; // от 0 до 1
  blendMode: TBlendMode; // 'normal', 'multiply', etc.
  isAlpha: boolean; // true — если это альфа-канал
  canvasRef: React.RefObject<HTMLCanvasElement | null> | null;
};

export type LayerContextType = {
  layers: Layer[];
  activeLayerId: string | null;
  setActiveLayer: (id: string) => void;
  addLayer: (opts: {
    name: string;
    fillColor?: string;
    image?: HTMLImageElement;
    isAlpha?: boolean;
  }) => void;
  removeLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  setOpacity: (id: string, opacity: number) => void;
  setBlendMode: (id: string, mode: TBlendMode) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  hideAlphaChannel: (id: string) => void;
  deleteAlphaChannel: (id: string) => void;
};
