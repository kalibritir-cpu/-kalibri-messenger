// Компонент: IconBtn
export function IconBtn({ children, onClick, title, danger, soft }) {
  return (
    <button title={title} onClick={onClick}
      className={"ic-btn"+(soft?" soft":"")+(danger?" danger":"")}>{children}</button>
  );
}

