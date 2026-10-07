export default function StatusBadge({ status }) {
  const value = String(status || "NEW").toUpperCase();
  return <span className={`status-badge status-${value.toLowerCase()}`}><i />{value}</span>;
}
