import { useState } from "react";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import { useLayers } from "../../../../contexts/LayersContext/LayersContext";
import { ChromePicker } from "react-color";

type InterpolationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FillImageColorModal(props: InterpolationModalProps) {
  const title = "Залить слой цветом";
  const { layers, activeLayerId, fillLayerWithColor } = useLayers();
  const [color, setColor] = useState<string | null>("#000000");

  function onSubmit() {
    props.onClose();
    if (activeLayerId !== null && color !== null) {
      fillLayerWithColor(activeLayerId, color);
    }
  }

  return (
    <Modal {...props} title={title}>
      {activeLayerId === null ? (
        <p>Активный слой не выбран</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <p>Текущий слой: {layers[activeLayerId]?.id}</p>
          <p>Выберите цвет</p>
          <ChromePicker
            color={color}
            alpha={0}
            onChange={(e) => setColor(e.hex)}
          />
          <button onClick={onSubmit}>Применить</button>
        </div>
      )}
    </Modal>
  );
}
