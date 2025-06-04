import { useContext, useEffect, useState } from "react";
import s from "./StatusBar.module.scss";
import { ImageContext } from "../../contexts/ImageContext/ImageContext";
import { CScales } from "../../utils/scaleImage";
import { TLayer, useLayers } from "../../contexts/LayersContext/LayersContext";

export function StatusBar() {
  const {
    width,
    height,
    colorDepth,
    setScaleValue,
    scaleValue,
    renderMethod,
    setRenderMethod,
  } = useContext(ImageContext);

  const { activeLayerId, layers } = useLayers();
  const [currentLayer, setCurrentLayer] = useState<TLayer | null>(null);

  function handleChangeScale(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = parseFloat(event.target.value);
    setScaleValue(value);
  }

  function handleChangeRenderMethod(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value = event.target.value as "normal" | "pixelated";
    setRenderMethod(value);
  }

  useEffect(() => {
    if (activeLayerId !== null) {
      setCurrentLayer(layers[activeLayerId]);
    }
  }, [activeLayerId, layers]);

  return (
    <>
      <div className={s.statusBar}>
        <p className={s.property} title={`Размер: ${width}x${height}`}>
          <span className={s.propertyName}>Размер: </span>
          <span className={s.propertyValue}>
            {currentLayer && currentLayer.originalImageData
              ? `${currentLayer.originalImageData?.width}x${currentLayer.originalImageData?.height}`
              : "Нет данных"}
          </span>
        </p>
        <p className={s.property} title={`Глубина цвета: ${colorDepth} bit`}>
          <span className={s.propertyName}>Глубина цвета: </span>
          <span className={s.propertyValue}>
            {currentLayer && currentLayer.originalImageData
              ? currentLayer.colorDepth
              : "Нет данных"}
          </span>
        </p>

        <select
          name="renderMethod"
          id="renderMethod"
          defaultValue={renderMethod}
          onChange={handleChangeRenderMethod}
        >
          <option value="normal">Нормальный</option>
          <option value="pixelated">Пиксели</option>
        </select>

        <select
          name="scale"
          id="scale"
          value={scaleValue}
          onChange={handleChangeScale}
        >
          {Object.values(CScales).map((scale) => (
            <option key={scale} value={scale}>
              {Math.round(scale * 100)}%
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
