interface WaveformAnimationProps {
  level: number;
  isActive: boolean;
}

export function WaveformAnimation({ level, isActive }: WaveformAnimationProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: 12 }).map((_, i) => {
        const distance = Math.abs(i - 5.5) / 5.5;
        const base = 8 + (1 - distance) * 8;
        const dynamic = isActive ? level * (20 + (1 - distance) * 12) : 0;
        return (
          <span
            key={i}
            className="w-1.5 bg-rene-greenDark rounded-full transition-all duration-75"
            style={{
              height: `${Math.round(base + dynamic)}px`,
              opacity: isActive ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}

