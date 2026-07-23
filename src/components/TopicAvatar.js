// Компонент: TopicAvatar
export function TopicAvatar({ emoji, color, size=52 }) {
  return (
    <div className="topic-av" style={{ width:size, height:size,
      background:`linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #1b1b2a))`,
      fontSize:size*0.46 }}>
      <span>{emoji}</span>
    </div>
  );
}

