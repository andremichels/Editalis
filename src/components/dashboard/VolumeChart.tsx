interface VolumeDay {
  date: string;
  count: number;
}

export function VolumeChart({ data }: { data: VolumeDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-bold uppercase mb-3.5" style={{ letterSpacing: "0.14em", color: "var(--color-neutral-600)" }}>
        Volume por dia
      </div>
      <div className="flex items-end gap-1.5 h-[88px]">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
            <div
              className="w-full min-h-[2px]"
              style={{
                height: `${Math.max((d.count / max) * 100, 2)}%`,
                background: i === data.length - 1 ? "var(--color-accent)" : "var(--color-neutral-400)",
              }}
              title={`${d.count} artigos`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] mt-2" style={{ color: "var(--color-neutral-600)" }}>
        <span>{data.length > 0 ? formatDate(data[0].date) : ""}</span>
        {data.map((d, i) => (
          <span key={d.date} className="text-center" style={{ flex: 1 }}>
            {d.count}
          </span>
        ))}
        <span>{data.length > 0 ? formatDate(data[data.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}
