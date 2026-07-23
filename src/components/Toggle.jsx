// Компонент: Toggle
export function Toggle({ on, onClick }) {
  return <div className={"tgl"+(on?" on":"")} onClick={onClick} role="switch" aria-checked={on}/>;
}

