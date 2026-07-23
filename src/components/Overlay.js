// Компонент: Overlay
import { useRef, useEffect } from "react";

export function Overlay({ children, onClose }) {
  const guard = useRef(true);
  useEffect(() => {
    // Блокируем ЗАКРЫТИЕ первые 300ms — чтобы touch passthrough
    // от закрывающегося ctx-overlay не закрыл нас мгновенно.
    // Важно: гасим только клик по фону, не мешая нажатиям внутри модалки.
    guard.current = true;
    const t = setTimeout(() => { guard.current = false; }, 300);
    return () => clearTimeout(t);
  }, []);
  const handleClose = (e) => {
    if (e.target !== e.currentTarget) return; // клик пришёл из содержимого — игнорируем
    if (!guard.current) onClose();
  };
  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
}
