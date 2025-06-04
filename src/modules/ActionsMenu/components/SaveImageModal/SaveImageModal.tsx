import { useContext, useState } from "react";
import { Modal } from "../../../../components/ModalWindow/ModalWindow";
import { ImageContext } from "../../../../contexts/ImageContext/ImageContext";
import { saveGB7 } from "../../../../utils/SaveGB7";

type SaveImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FileType = "png" | "jpeg" | "gb7";

export function SaveImageModal({ isOpen, onClose }: SaveImageModalProps) {
  const [fileName, setFileName] = useState("image");
  const [fileType, setFileType] = useState<FileType>("png");
  const { imageData } = useContext(ImageContext);
  const [gb7UseMask, setGb7UseMask] = useState(false);

  function handleSave() {
    if (!imageData) return;

    if (fileType === "gb7") {
      saveGB7(imageData, fileName, gb7UseMask);
      return;
    }

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
              onChange={(e) => setFileType(e.target.value as FileType)}
              style={{ width: "100%" }}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="gb7">GrayBit-7 (.gb7)</option>
            </select>
          </label>
          {fileType === "gb7" && (
            <label>
              <input
                type="checkbox"
                checked={gb7UseMask}
                onChange={(e) => setGb7UseMask(e.target.checked)}
              />
              Использовать маску
            </label>
          )}
          <button onClick={handleSave}>Сохранить</button>
        </div>
      )}
    </Modal>
  );
}
