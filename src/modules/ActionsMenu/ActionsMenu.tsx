import { useContext, useRef, useState } from "react";
import s from "./ActionsMenu.module.scss";
import { ActionsGroup } from "./components/ActionGroup/ActionsGroup";
import { ImageContext } from "../../contexts/ImageContext/ImageContext";
import { open_icon } from "../../assets/images";
import { InterpolationModal } from "./components/ImterpolationModal/InterpolationModal";
import { FillImageColorModal } from "./components/FillImageColorModal/FillImageColorModal";
// import { CorrectionModal } from "../LayerPanel/components/CorrectionModal/CorrectionModal";
import { FilterKernelModal } from "./components/FilterModal/FilterModal";
import { SaveImageModal } from "./components/SaveImageModal/SaveImageModal";
import React, { Suspense } from "react";

const LazyCorrectionModal = React.lazy(async () => {
  const module = await import(
    "../LayerPanel/components/CorrectionModal/CorrectionModal"
  );
  return { default: module.CorrectionModal };
});

export function ActionsMenu() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { loadImage } = useContext(ImageContext);
  const [isOpenInterpolation, setIsOpenInterpolation] = useState(false);
  const [isOpenFillLayerWithColor, setIsOpenFillLayerWithColor] =
    useState(false);
  const [isOpenCorrection, setIsOpenCorrection] = useState(false);
  const [isOpenFilterKernel, setIsOpenFilterKernel] = useState(false);
  const [isOpenSaveImage, setIsOpenSaveImage] = useState(false);

  function handleFileOpen() {
    if (inputRef.current) inputRef.current.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      alert("Файл не загружен. Не переданы файлы");
      return;
    }
    const file = event.target.files[0];

    if (file) {
      loadImage(file);
    }
  }

  const actionsGroups = [
    {
      title: "Файл",
      items: [
        {
          text: "Загрузить изображение",
          icon: open_icon,
          onClick: handleFileOpen,
        },
        {
          text: "Сохранить изображение",
          onClick: () => {
            setIsOpenSaveImage(true);
          },
        },
      ],
    },
    {
      title: "Слой",
      items: [
        {
          text: "Интерполяция",
          onClick: () => {
            // resizeImage(1230, 1560, "bilinear");
            setIsOpenInterpolation(true);
          },
        },
        {
          text: "Заливка цветом",
          onClick: () => {
            setIsOpenFillLayerWithColor(true);
          },
        },
        {
          text: "Градационная коррекция",
          onClick: () => {
            setIsOpenCorrection(true);
          },
        },
        {
          text: "Фильтрация ядром",
          onClick: () => {
            setIsOpenFilterKernel(true);
          },
        },
      ],
    },
  ];

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gb7"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <FillImageColorModal
        isOpen={isOpenFillLayerWithColor}
        onClose={() => setIsOpenFillLayerWithColor(false)}
      />
      <InterpolationModal
        isOpen={isOpenInterpolation}
        onClose={() => setIsOpenInterpolation(false)}
      />
      <FilterKernelModal
        isOpen={isOpenFilterKernel}
        onClose={() => setIsOpenFilterKernel(false)}
      />
      <SaveImageModal
        isOpen={isOpenSaveImage}
        onClose={() => setIsOpenSaveImage(false)}
      />

      <Suspense fallback={<div>Загрузка…</div>}>
        <LazyCorrectionModal
          isOpen={isOpenCorrection}
          onClose={() => setIsOpenCorrection(false)}
        />
      </Suspense>

      <div className={s.actionsMenu}>
        {actionsGroups.map((group, index) => (
          <ActionsGroup key={index} {...group} />
        ))}
      </div>
    </>
  );
}
