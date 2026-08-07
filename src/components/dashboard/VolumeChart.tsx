interface VolumeDay {
  date: string;
  count: number;
}

const DAY_NAMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function VolumeChart({ data }: { data: VolumeDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const formatLabel = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const dow = DAY_NAMES[d.getDay()];
    return { date: `${day}/${month}`, dow };
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-bold uppercase mb-3.5" style={{ letterSpacing: "0.14em", color: "var(--color-neutral-600)" }}>
        Volume por dia
      </div>
      <div className="flex items-end gap-1.5 h-[88px]">
        {data.map((d, i) => {
          const label = formatLabel(d.date);
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full min-h-[2px] rounded-t-sm transition-colors cursor-default"
                style={{
                  height: `${Math.max((d.count / max) * 100, 2)}%`,
                  background: i === data.length - 1 ? "var(--color-accent)" : "var(--color-neutral-400)",
                }}
                title={`${label.date} — ${d.count.toLocaleString("pt-BR")} artigos`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex text-[10px] mt-2" style={{ color: "var(--color-neutral-500)" }}>
        {data.map((d) => {
          const label = formatLabel(d.date);
          return (
            <div key={d.date} className="flex-1 text-center leading-tight">
              <div className="font-bold" style={{ color: "var(--color-neutral-600)" }}>{label.date}</div>
              <div>{label.dow}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
