// Компонент: RoundBtn
export function RoundBtn({ children, onClick, variant="accent" }) {
  return <button className={"round-btn "+variant} onClick={onClick}>{children}</button>;
}

