function EmptyState({ title, detail }) {
  return (
    <div className="grid min-h-36 content-center justify-items-center p-6 text-center">
      <span className="mb-2.5 grid size-9 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500">⌁</span>
      <strong className="text-sm font-semibold text-slate-700">{title}</strong>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
export default EmptyState;