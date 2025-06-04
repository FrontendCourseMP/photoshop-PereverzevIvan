import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import {
  TLayer,
  useLayers,
} from "../../../../contexts/LayersContext/LayersContext";
import { CurvesEditor } from "../CurvesEditor/CurvesEditor";
import {
  getAlphaHistogram,
  getGrayscaleHistogram,
  getRGBHistograms,
} from "../../../../utils/histogram";
import { applyCurvesCorrection } from "../../../../utils/correction";
import { imageDataToURL } from "../../../../utils/imageDataToURL";
import { isGrayscaleImage } from "../../../../utils/isGrayscale";
import s from "./CorrectionModal.module.scss";

type InterpolationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Point = { input: number; output: number };

export function CorrectionModal(props: InterpolationModalProps) {
  const title = "Градационная коррекция";
  const { layers, activeLayerId, setOriginalImageData } = useLayers();
  const [layer, setLayer] = useState<TLayer | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imagePreviewURL, setImagePreviewURL] = useState<string | null>(null);

  const [curveR, setCurveR] = useState<[Point, Point]>([
    { input: 0, output: 0 },
    { input: 255, output: 255 },
  ]);
  const [curveG, setCurveG] = useState<[Point, Point]>([
    { input: 0, output: 0 },
    { input: 255, output: 255 },
  ]);
  const [curveB, setCurveB] = useState<[Point, Point]>([
    { input: 0, output: 0 },
    { input: 255, output: 255 },
  ]);
  const [curveGray, setCurveGray] = useState<[Point, Point]>([
    { input: 0, output: 0 },
    { input: 255, output: 255 },
  ]);
  const [curveAlpha, setCurveAlpha] = useState<[Point, Point]>([
    { input: 0, output: 0 },
    { input: 255, output: 255 },
  ]);

  const [isColor, setIsColor] = useState<boolean | null>(null);

  const histograms = useMemo(() => {
    if (!imageData) return null;

    const alpha = getAlphaHistogram(imageData);
    const gray = getGrayscaleHistogram(imageData);
    const { r: hr, g: hg, b: hb } = getRGBHistograms(imageData);

    // Определяем, цветное ли изображение
    setIsColor(!isGrayscaleImage(imageData));

    return {
      alpha,
      gray,
      r: hr,
      g: hg,
      b: hb,
    };
  }, [imageData]);

  function createPreview() {
    if (!imageData) return;

    if (isColor) {
      const newImgData = applyCurvesCorrection(imageData, {
        r: curveR,
        g: curveG,
        b: curveB,
        alpha: curveAlpha,
      });
      setImagePreviewURL(imageDataToURL(newImgData));
    } else {
      const newImgData = applyCurvesCorrection(imageData, {
        gray: curveGray,
        alpha: curveAlpha,
      });
      setImagePreviewURL(imageDataToURL(newImgData));
    }
  }

  function applyCorrection() {
    if (!imageData) return;
    if (activeLayerId === null) return;

    if (isColor) {
      const newImgData = applyCurvesCorrection(imageData, {
        r: curveR,
        g: curveG,
        b: curveB,
        alpha: curveAlpha,
      });
      setOriginalImageData(activeLayerId, newImgData);
    } else {
      const newImgData = applyCurvesCorrection(imageData, {
        gray: curveGray,
        alpha: curveAlpha,
      });
      setOriginalImageData(activeLayerId, newImgData);
    }

    props.onClose();
  }

  function reset() {
    setCurveR([
      { input: 0, output: 0 },
      { input: 255, output: 255 },
    ]);
    setCurveG([
      { input: 0, output: 0 },
      { input: 255, output: 255 },
    ]);
    setCurveB([
      { input: 0, output: 0 },
      { input: 255, output: 255 },
    ]);
    setCurveGray([
      { input: 0, output: 0 },
      { input: 255, output: 255 },
    ]);
    setCurveAlpha([
      { input: 0, output: 0 },
      { input: 255, output: 255 },
    ]);

    setImagePreviewURL(null);
  }

  useEffect(() => {
    if (activeLayerId !== null) {
      const layer = layers.find((l) => l.id === activeLayerId);
      setLayer(layer || null);
    } else {
      setLayer(null);
    }
  }, [activeLayerId, layers]);

  useEffect(() => {
    if (layer) {
      setImageData(layer.originalImageData);
    } else {
      setImageData(null);
    }
  }, [layer]);

  useEffect(() => {
    if (props.isOpen) {
      // Сброс кривых при открытии
      reset();
    }
  }, [props.isOpen]);

  return (
    <Modal {...props} title={title}>
      {imageData && histograms ? (
        <div className={s.container}>
          <div className={s.curvesContainer}>
            {isColor ? (
              <>
                <CurvesEditor
                  histogram={histograms.r}
                  channel="r"
                  controlPoints={curveR}
                  onChange={setCurveR}
                />
                <CurvesEditor
                  histogram={histograms.g}
                  channel="g"
                  controlPoints={curveG}
                  onChange={setCurveG}
                />
                <CurvesEditor
                  histogram={histograms.b}
                  channel="b"
                  controlPoints={curveB}
                  onChange={setCurveB}
                />
              </>
            ) : (
              <CurvesEditor
                histogram={histograms.gray}
                channel="l" // используем как "light"
                controlPoints={curveGray}
                onChange={setCurveGray}
              />
            )}
            <CurvesEditor
              histogram={histograms.alpha}
              channel="a" // используем как "light"
              controlPoints={curveAlpha}
              onChange={setCurveAlpha}
            />
          </div>
          <div className={s.buttonBox}>
            <button onClick={() => reset()}>Сброс</button>
            <button onClick={() => createPreview()}>Предпросмотр</button>
            <button onClick={() => applyCorrection()}>Применить</button>
          </div>
          {imagePreviewURL && (
            <img
              src={imagePreviewURL}
              alt="Preview"
              className={s.previewImage}
            />
          )}
        </div>
      ) : (
        <p>Изображение не загружено</p>
      )}
    </Modal>
  );
}
