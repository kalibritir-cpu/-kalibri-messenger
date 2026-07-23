// Компонент: RailItem
export function RailItem({ Icon, l, b, active, onClick }) {
  return (
    <div className={"rail-item"+(active?" active":"")} onClick={onClick}>
      {b>0 && <span className="badge">{b}</span>}
      <Icon size={22}/><span>{l}</span>
    </div>
  );
}

