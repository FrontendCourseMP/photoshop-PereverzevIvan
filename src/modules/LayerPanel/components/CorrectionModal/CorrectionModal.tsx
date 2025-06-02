import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import { useLayers } from "../../../../contexts/LayersContext/LayersContext";
import { CurvesEditor } from "../CurvesEditor/CurvesEditor";
import {
  getGrayscaleHistogram,
  getRGBHistograms,
} from "../../../../utils/histogram";
import { applyCurvesCorrection } from "../../../../utils/correction";
import { imageDataToURL } from "../../../../utils/imageDataToURL";

type InterpolationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Point = { input: number; output: number };

export function CorrectionModal(props: InterpolationModalProps) {
  const title = "Градационная коррекция";
  const { layers, activeLayerId } = useLayers();
  const layer = activeLayerId !== null ? layers[activeLayerId] : null;
  const imageData = layer?.originalImageData || null;
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

  const [isColor, setIsColor] = useState<boolean | null>(null);

  const histograms = useMemo(() => {
    if (!imageData) return null;

    // const r = new Array(256).fill(0);
    // const g = new Array(256).fill(0);
    // const b = new Array(256).fill(0);

    const gray = getGrayscaleHistogram(imageData);
    const { r: hr, g: hg, b: hb } = getRGBHistograms(imageData);

    // Определяем, цветное ли изображение
    let grayscaleLike = true;
    for (let i = 0; i < 256; i++) {
      if (hr[i] !== hg[i] || hr[i] !== hb[i]) {
        grayscaleLike = false;
        break;
      }
    }
    setIsColor(!grayscaleLike);

    return {
      gray,
      r: hr,
      g: hg,
      b: hb,
    };
  }, [imageData]);

  useEffect(() => {
    if (props.isOpen) {
      // Сброс кривых при открытии
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
    }
  }, [props.isOpen]);

  return (
    <Modal {...props} title={title}>
      {imageData && histograms ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
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
              channel="a" // используем как "gray"
              controlPoints={curveGray}
              onChange={setCurveGray}
            />
          )}
          {imagePreviewURL && (
            <img src={imagePreviewURL} alt="Preview" width={200} height={200} />
          )}
          <button
            onClick={() => {
              if (isColor) {
                const newImgData = applyCurvesCorrection(imageData, {
                  r: curveR,
                  g: curveG,
                  b: curveB,
                  // gray: curveGray,
                });
                setImagePreviewURL(imageDataToURL(newImgData));
              } else {
                const newImgData = applyCurvesCorrection(imageData, {
                  gray: curveGray,
                });
                setImagePreviewURL(imageDataToURL(newImgData));
              }

              // props.onClose();
            }}
          >
            Применить
          </button>
        </div>
      ) : (
        <p>Изображение не загружено</p>
      )}
    </Modal>
  );
}
