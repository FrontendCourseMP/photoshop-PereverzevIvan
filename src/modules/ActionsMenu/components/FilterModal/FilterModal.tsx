import { useEffect, useRef, useState } from "react";
import s from "./FilterModal.module.scss";
import {
  // applyConvolution,
  ConvolutionPresets,
} from "../../../../utils/convolution";
import {
  TLayer,
  useLayers,
} from "../../../../contexts/LayersContext/LayersContext";
import { imageDataToURL } from "../../../../utils/imageDataToURL";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import ConvolutionWorker from "../../../../workers/convolution.worker?worker";

type FilterKernelModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ConvolutionPresetsNamesRus = {
  Identity: "Тождественное отображение",
  Sharpen: "Повышение резкости",
  "Gaussian Blur": "Фильтр Гаусса (3 на 3)",
  "Box Blur": "Прямоугольное размытие",
  "Prewitt Horizontal": "Оператор Прюитта по X",
  "Prewitt Vertical": "Оператор Прюитта по Y",
};

function getPresetRusName(name: string) {
  return (
    ConvolutionPresetsNamesRus[
      name as keyof typeof ConvolutionPresetsNamesRus
    ] ?? name
  );
}

export function FilterKernelModal({ isOpen, onClose }: FilterKernelModalProps) {
  const presetNames = Object.keys(ConvolutionPresets);

  const [selectedPresetRGB, setSelectedPresetRGB] = useState(presetNames[0]);
  const [selectedPresetAlpha, setSelectedPresetAlpha] = useState(
    presetNames[0],
  );

  const [matrixRGB, setMatrixRGB] = useState<number[][]>(
    ConvolutionPresets["Identity"],
  );
  const [matrixAlpha, setMatrixAlpha] = useState<number[][]>(
    ConvolutionPresets["Identity"],
  );

  const workerRef = useRef<Worker | null>(null);

  const [previewImageURL, setPreviewImageURL] = useState<string | null>(null);
  const [mode, setMode] = useState<"rgb" | "alpha">("rgb");
  const [layer, setLayer] = useState<TLayer | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  const { activeLayerId, layers, setOriginalImageData } = useLayers();

  function createPreview() {
    if (activeLayerId !== null && imageData && workerRef.current) {
      workerRef.current.postMessage({
        imageData,
        kernel: mode === "rgb" ? matrixRGB : matrixAlpha,
        mode,
      });
    }
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value;
    if (mode === "rgb") {
      setSelectedPresetRGB(name);
      setMatrixRGB(ConvolutionPresets[name]);
    } else {
      setSelectedPresetAlpha(name);
      setMatrixAlpha(ConvolutionPresets[name]);
    }
  }

  function handleMatrixInput(i: number, j: number, value: string) {
    const newVal = parseFloat(value);
    const update = (prev: number[][]) => {
      const updated = prev.map((row) => [...row]);
      updated[i][j] = isNaN(newVal) ? 0 : newVal;
      return updated;
    };
    if (mode === "rgb") {
      setMatrixRGB((prev) => update(prev));
    } else {
      setMatrixAlpha((prev) => update(prev));
    }
  }

  function handleReset() {
    if (mode === "rgb") {
      setSelectedPresetRGB("Identity");
      setMatrixRGB(ConvolutionPresets["Identity"]);
    } else {
      setSelectedPresetAlpha("Identity");
      setMatrixAlpha(ConvolutionPresets["Identity"]);
    }
    setPreviewImageURL(null);
  }

  function handleApply() {
    if (previewImageURL && activeLayerId !== null && imageData) {
      const worker = new ConvolutionWorker();

      worker.postMessage({
        imageData,
        kernel: mode === "rgb" ? matrixRGB : matrixAlpha,
        mode,
      });

      worker.onmessage = (e) => {
        const newImage: ImageData = e.data;
        setOriginalImageData(activeLayerId, newImage);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("Worker error:", err);
        worker.terminate();
      };
    }
  }

  useEffect(() => {
    const worker = new ConvolutionWorker();
    workerRef.current = worker;

    worker.onmessage = (e: any) => {
      const result: ImageData = e.data;
      setPreviewImageURL(imageDataToURL(result));
    };

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (layer) {
      setImageData(layer.originalImageData);
    } else {
      setImageData(null);
    }
  }, [layer]);

  useEffect(() => {
    if (activeLayerId !== null) {
      const layer = layers.find((l) => l.id === activeLayerId);
      setLayer(layer || null);
    } else {
      setLayer(null);
    }
  }, [activeLayerId, layers]);

  useEffect(() => {
    handleReset();
  }, [isOpen]);

  const matrix = mode === "rgb" ? matrixRGB : matrixAlpha;
  const selectedPreset =
    mode === "rgb" ? selectedPresetRGB : selectedPresetAlpha;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Фильтрация ядром">
      {activeLayerId === null || !imageData ? (
        <p>Нет активного слоя</p>
      ) : (
        <div className={s.wrapper}>
          <div className={s.modeSelector}>
            <label>
              <input
                type="radio"
                value="rgb"
                checked={mode === "rgb"}
                onChange={() => setMode("rgb")}
              />
              Цвет
            </label>
            <label>
              <input
                type="radio"
                value="alpha"
                checked={mode === "alpha"}
                onChange={() => setMode("alpha")}
              />
              Альфа-канал
            </label>
          </div>

          <label>
            Предустановка:
            <select value={selectedPreset} onChange={handlePresetChange}>
              {presetNames.map((name) => (
                <option key={name} value={name}>
                  {getPresetRusName(name)}
                </option>
              ))}
            </select>
          </label>

          <div className={s.kernelGrid}>
            {matrix.map((row, i) =>
              row.map((val, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  value={val}
                  onChange={(e) => handleMatrixInput(i, j, e.target.value)}
                />
              )),
            )}
          </div>

          <div className={s.buttonRow}>
            <button onClick={handleReset}>Сбросить</button>
            <button onClick={createPreview}>Предпросмотр</button>
            <button onClick={handleApply}>Применить</button>
          </div>

          {previewImageURL && (
            <img src={previewImageURL} className={s.previewImage} />
          )}
        </div>
      )}
    </Modal>
  );
}
