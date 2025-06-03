import { useContext, useState } from "react";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import { ImageContext } from "../../../../contexts/ImageContext/ImageContext";

type SaveImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SaveImageModal({ isOpen, onClose }: SaveImageModalProps) {
  const [fileName, setFileName] = useState("image");
  const [fileType, setFileType] = useState<"png" | "jpeg">("png");
  const { imageData } = useContext(ImageContext);

  function handleSave() {
    if (!imageData) return;

    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.${fileType}`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
      `image/${fileType}`,
      fileType === "jpeg" ? 0.95 : undefined,
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Сохранение изображения">
      {imageData === null ? (
        <p>Нет изображения для сохранения</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>
            Название файла:
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Тип файла:
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as "png" | "jpeg")}
              style={{ width: "100%" }}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
          <button onClick={handleSave}>Сохранить</button>
        </div>
      )}
    </Modal>
  );
}
