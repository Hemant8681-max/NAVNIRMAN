import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  WifiOff,
} from "lucide-react";

export function Spinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {text}
    </div>
  );
}

export function ErrorState({ message, retry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Unable to load data</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {retry && (
          <button onClick={retry} className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "No data",
  text = "There is nothing to display yet.",
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <WifiOff className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function StatusBadge({ children, tone = "gray" }) {
  const map = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${map[tone] || map.gray}`}
    >
      {children}
    </span>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  note,
  tone = "green",
}) {
  const bg =
    {
      green: "bg-green-50 text-green-700",
      blue: "bg-blue-50 text-blue-700",
      yellow: "bg-yellow-50 text-yellow-700",
      red: "bg-red-50 text-red-700",
      gray: "bg-slate-50 text-slate-700",
    }[tone] || "bg-slate-50 text-slate-700";
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {value ?? "—"}
            </span>
            {unit && (
              <span className="pb-0.5 text-sm font-semibold text-slate-500">
                {unit}
              </span>
            )}
          </div>
          {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${type === "error" ? "bg-red-700 text-white" : "bg-slate-900 text-white"}`}
    >
      <CheckCircle2 className="h-4 w-4" />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
