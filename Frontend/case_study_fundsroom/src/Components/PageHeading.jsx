export default function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-5 max-sm:items-start">
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-slate-500">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
