import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listDevices } from "../api/device.api";
import { apiError } from "../api/axios";
import {
  EmptyState,
  ErrorState,
  PageTitle,
  Spinner,
  StatusBadge,
} from "../components/common";
import { useAuth } from "../context/AuthContext";

export default function Devices() {
  const { user } = useAuth();
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const r = await listDevices({ limit: 200, status: status || undefined });
      setItems(r.data?.devices || []);
      setError("");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [status]);
  const filtered = items.filter((d) =>
    [d.name, d.deviceCode, d.location, d.district, d.state]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Devices"
        subtitle="Registered cold-storage units and ESP32 gateways"
        action={
          <Link to="/devices/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Register device
          </Link>
        }
      />
      <div className="card mb-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search device, code, location..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="input md:w-56"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>MAINTENANCE</option>
            <option>DECOMMISSIONED</option>
          </select>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <Link
              to={`/devices/${d.id}`}
              key={d.id}
              className="card p-5 transition hover:-translate-y-0.5 hover:border-green-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold">{d.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    {d.deviceCode}
                  </p>
                </div>
                <StatusBadge
                  tone={
                    d.status === "ACTIVE"
                      ? "green"
                      : d.status === "MAINTENANCE"
                        ? "yellow"
                        : "gray"
                  }
                >
                  {d.status}
                </StatusBadge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="mt-1 font-semibold">{d.location || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">District</p>
                  <p className="mt-1 font-semibold">{d.district || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Owner</p>
                  <p className="mt-1 font-semibold">{d.owner?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last seen</p>
                  <p className="mt-1 font-semibold">
                    {d.lastSeenAt
                      ? new Date(d.lastSeenAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No devices found"
          text="Try another filter or register your first cold-storage unit."
        />
      )}
    </>
  );
}
