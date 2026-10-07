export default function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">⌁</span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}
