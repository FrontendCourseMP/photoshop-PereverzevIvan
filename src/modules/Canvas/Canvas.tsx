import { useEffect, useRef, useState } from "react";
import s from "./Canvas.module.scss";
import { useImageContext } from "../../contexts/ImageContext/ImageContext";
import { useTool } from "../../contexts/ToolContext/ToolContext";
import { useColorPickerContext } from "../../contexts/ColorPickerContext/ColorPickerContext";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const thubnailSize = 40;

export function CanvasModule() {
  const {
    setCanvasRef,
    renderMethod,
    setOffsetX,
    setOffsetY,
    offsetX,
    offsetY,
    scalledImageData,
  } = useImageContext();
  const { activeToolID } = useTool();
  const {
    setFirstPickedColor,
    setSecondPickedColor,
    setFirstPickedColorCoords,
    setSecondPickedColorCoords,
  } = useColorPickerContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const draggingRef = useRef<null | {
    axis: "x" | "y";
    start: number;
    startScroll: number;
  }>(null);

  function getCursor(activeToolID: number) {
    if (activeToolID == 1) {
      if (isDragging) {
        return "move";
      }
      return "grab";
    }

    if (activeToolID == 2) {
      return "crosshair";
    }

    return "default";
  }

  const startDragging = (e: React.MouseEvent, axis: "x" | "y") => {
    e.preventDefault();
    const start = axis === "x" ? e.clientX : e.clientY;
    const currentScroll = axis === "x" ? scrollX : scrollY;
    draggingRef.current = { axis, start, startScroll: currentScroll };
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDragging);
  };

  const handleDrag = (e: MouseEvent) => {
    if (!draggingRef.current) return;

    const { axis, start, startScroll } = draggingRef.current;
    const delta = (axis === "x" ? e.clientX : e.clientY) - start + startScroll;
    const trackSize =
      axis === "x"
        ? (canvasRef.current?.clientWidth ?? 1)
        : (canvasRef.current?.clientHeight ?? 1);

    const newScroll = clamp(
      startScroll + delta / (trackSize - thubnailSize),
      0,
      1,
    );
    if (axis === "x") {
      setScrollX(newScroll);
      updateOffsetX(newScroll);
    } else {
      setScrollY(newScroll);
      updateOffsetY(newScroll);
    }
  };

  const stopDragging = () => {
    draggingRef.current = null;
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", stopDragging);
  };

  const updateOffsetX = (value: number) => {
    if (!scalledImageData || !canvasRef.current) return;
    const imageWidth = scalledImageData.width;
    const canvasWidth = canvasRef.current.clientWidth;
    const min = -imageWidth + 100;
    const max = canvasWidth - 100;
    const offset = min + (max - min) * value;
    setOffsetX(clamp(offset, min, max));
  };

  const updateOffsetY = (value: number) => {
    if (!scalledImageData || !canvasRef.current) return;
    const imageHeight = scalledImageData.height;
    const canvasHeight = canvasRef.current.clientHeight;
    const min = -imageHeight + 100;
    const max = canvasHeight - 100;
    const offset = min + (max - min) * value;
    setOffsetY(clamp(offset, min, max));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeToolID === 1) {
      setIsDragging(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }

    if (activeToolID === 2) {
      const canvas = canvasRef.current;
      if (!canvas || !scalledImageData) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const imageX = x - offsetX;
      const imageY = y - offsetY;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const [r, g, b, a] = pixel;

      if (e.button == 0) {
        if (e.ctrlKey) {
          setSecondPickedColor([r, g, b, a]);
          setSecondPickedColorCoords({ x: imageX, y: imageY });
        } else {
          setFirstPickedColor([r, g, b, a]);
          setFirstPickedColorCoords({ x: imageX, y: imageY });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeToolID === 1) {
      if (!isDragging) return;
      if (!lastPos.current || !canvasRef.current || !scalledImageData) return;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      const imageWidth = scalledImageData.width;
      const imageHeight = scalledImageData.height;
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;

      setOffsetX((prevX) => {
        const newX = prevX + dx;
        const minX = -imageWidth + 100;
        const maxX = canvasWidth - 100;
        return clamp(newX, minX, maxX);
      });

      setOffsetY((prevY) => {
        const newY = prevY + dy;
        const minY = -imageHeight + 100;
        const maxY = canvasHeight - 100;
        return clamp(newY, minY, maxY);
      });

      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastPos.current = null;
  };

  useEffect(() => {
    if (!scalledImageData || !canvasRef.current) return;

    const imageWidth = scalledImageData.width;
    const canvasWidth = canvasRef.current.clientWidth;
    const min = -imageWidth + 100;
    const max = canvasWidth - 100;
    setScrollX((offsetX - min) / (max - min));
  }, [offsetX]);

  useEffect(() => {
    if (!scalledImageData || !canvasRef.current) return;

    const imageHeight = scalledImageData.height;
    const canvasHeight = canvasRef.current.clientHeight;
    const min = -imageHeight + 100;
    const max = canvasHeight - 100;
    setScrollY((offsetY - min) / (max - min));
  }, [offsetY]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Функция обновления размеров канваса
    const updateCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    // Сразу выставляем начальные размеры
    updateCanvasSize();
    setCanvasRef(canvasRef);
  }, [canvasRef, setCanvasRef, canvasRef.current?.clientWidth]);

  return (
    <div className={s.canvasContainer}>
      <canvas
        className={s.canvas}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          imageRendering: renderMethod === "pixelated" ? "pixelated" : "auto",
          cursor: getCursor(activeToolID),
        }}
      />

      {/* Горизонтальный скролл */}
      <div className={s.scrollTrackX}>
        <div
          className={s.scrollThumbX}
          style={{
            left: `max(calc(${scrollX * 100}% - ${thubnailSize}px), 0px)`,
          }}
          onMouseDown={(e) => startDragging(e, "x")}
        />
      </div>

      {/* Вертикальный скролл */}
      <div className={s.scrollTrackY}>
        <div
          className={s.scrollThumbY}
          style={{
            top: `max(calc(${scrollY * 100}% - ${thubnailSize}px), 0px)`,
          }}
          onMouseDown={(e) => startDragging(e, "y")}
        />
      </div>
    </div>
  );
}
