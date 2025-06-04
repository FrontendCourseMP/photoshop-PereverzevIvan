import { useRef, useEffect } from "react";
import { cross_icon } from "../../assets/images";
import s from "./ModalWindow.module.scss";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Открытие / закрытие в зависимости от состояния
    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Обработчик закрытия диалога (по Esc или через dialog.close())
    const handleClose = () => {
      onClose();
    };

    // Обработчик клика вне модального контента
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClickOutside);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={s.modal}>
      <button type="button" onClick={onClose} className={s.closeButton}>
        <img src={cross_icon} alt="Закрыть" />
      </button>
      <div className={s.modalContent}>
        {title && <p className={s.modalTitle}>{title}</p>}
        {children}
      </div>
    </dialog>
  );
}
