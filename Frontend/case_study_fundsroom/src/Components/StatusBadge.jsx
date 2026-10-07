export default function StatusBadge({ status }) {
  const value = String(status || "NEW").toUpperCase();
  const tone = {
    NEW: "bg-amber-50 text-amber-700",
    PENDING: "bg-amber-50 text-amber-700",
    QUOTED: "bg-blue-50 text-blue-700",
    WON: "bg-emerald-50 text-emerald-700",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    LOST: "bg-red-50 text-red-700",
    CANCELLED: "bg-red-50 text-red-700",
  }[value] || "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ${tone}`}><i className="size-1.5 rounded-full bg-current" />{value}</span>;
}
