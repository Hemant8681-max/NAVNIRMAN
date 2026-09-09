import { useEffect, useState } from "react";
import { acknowledgeAlerts, listAlerts } from "../api/alert.api";
import { listDevices } from "../api/device.api";
import { apiError } from "../api/axios";
import {
  ConfirmModal,
  EmptyState,
  ErrorState,
  PageTitle,
  Spinner,
  StatusBadge,
  Toast,
} from "../components/common";

export default function Alerts() {
  const [items, setItems] = useState([]),
    [devices, setDevices] = useState([]),
    [filter, setFilter] = useState({
      severity: "",
      status: "ACTIVE",
      type: "",
      deviceId: "",
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([
        listAlerts({ ...filter, limit: 200 }),
        listDevices({ limit: 200 }),
      ]);
      setItems(a.data?.alerts || []);
      setDevices(d.data?.devices || []);
      setError("");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [filter.severity, filter.status, filter.type, filter.deviceId]);
  const ack = async () => {
    setBusy(true);
    try {
      await acknowledgeAlerts({
        alertIds: [selected.id],
        note: "Acknowledged from command center",
      });
      setSelected(null);
      setToast("Alert acknowledged.");
      load();
    } catch (e) {
      setToast(apiError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Alerts"
        subtitle="Monitor and acknowledge cold-storage safety events"
      />
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="input"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option>ACTIVE</option>
          <option>ACKNOWLEDGED</option>
          <option>RESOLVED</option>
        </select>
        <select
          className="input"
          value={filter.severity}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
        >
          <option value="">All severity</option>
          <option>CRITICAL</option>
          <option>WARNING</option>
          <option>INFO</option>
        </select>
        <select
          className="input"
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="">All types</option>
          {[
            "HIGH_TEMPERATURE",
            "LOW_BATTERY",
            "DOOR_OPEN_PROLONGED",
            "LOW_SOLAR_VOLTAGE",
            "SENSOR_FAULT",
            "DEVICE_OFFLINE",
            "COMPRESSOR_FAULT",
            "CUSTOM",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          className="input"
          value={filter.deviceId}
          onChange={(e) => setFilter({ ...filter, deviceId: e.target.value })}
        >
          <option value="">All devices</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.deviceCode}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : items.length ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="p-4">Alert</th>
                  <th>Device</th>
                  <th>Severity</th>
                  <th>Metric</th>
                  <th>Threshold</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <p className="font-bold">{a.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{a.type}</p>
                    </td>
                    <td>{a.device?.deviceCode || "—"}</td>
                    <td>
                      <StatusBadge
                        tone={
                          a.severity === "CRITICAL"
                            ? "red"
                            : a.severity === "WARNING"
                              ? "yellow"
                              : "blue"
                        }
                      >
                        {a.severity}
                      </StatusBadge>
                    </td>
                    <td>{a.metricValue ?? "—"}</td>
                    <td>{a.thresholdValue ?? "—"}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      {a.status === "ACTIVE" ? (
                        <button
                          className="btn-secondary"
                          onClick={() => setSelected(a)}
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <StatusBadge tone="gray">{a.status}</StatusBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No alerts"
          text="No alerts match the current filters."
        />
      )}
      <ConfirmModal
        open={!!selected}
        title="Acknowledge alert?"
        message={selected?.message}
        onConfirm={ack}
        onCancel={() => setSelected(null)}
        loading={busy}
      />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
