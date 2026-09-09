import { useEffect, useState } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { getHealth, listDevices } from "../api/device.api";
import { apiError } from "../api/axios";
import {
  EmptyState,
  ErrorState,
  PageTitle,
  Spinner,
  StatusBadge,
} from "../components/common";

const tone = (s) =>
  s === "OPTIMAL" || s === "HEALTHY"
    ? "green"
    : s === "LOW" || s === "DEGRADED"
      ? "yellow"
      : s === "CRITICAL"
        ? "red"
        : "gray";
export default function Health() {
  const [devices, setDevices] = useState([]),
    [id, setId] = useState(""),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    listDevices({ limit: 200 })
      .then((r) => {
        const d = r.data?.devices || [];
        setDevices(d);
        if (d[0]) setId(d[0].id);
      })
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getHealth(id)
      .then((r) => setData(r.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, [id]);
  const h = data?.health;
  return (
    <>
      <PageTitle
        title="Health & diagnostics"
        subtitle="Backend-computed cooling, battery and connectivity health"
      />
      <div className="card mb-4 p-4">
        <select
          className="input max-w-lg"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.deviceCode}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : !h ? (
        <EmptyState
          title="No telemetry available"
          text="Health diagnostics will appear after the device reports telemetry."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-6">
            <HeartPulse className="h-7 w-7 text-green-700" />
            <h2 className="mt-4 font-bold">Cooling health</h2>
            <StatusBadge tone={tone(h.cooling.status)}>
              {h.cooling.status}
            </StatusBadge>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Average temperature", `${h.cooling.avgChamberTempC} °C`],
                ["Target", `${h.cooling.targetTempC} °C`],
                ["Deviation", `${h.cooling.deviationC} °C`],
                ["Volatility", `${h.cooling.volatility} °C`],
                ["Compressor duty", `${h.cooling.compressorDutyCyclePct}%`],
              ].map((x) => (
                <div key={x[0]} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{x[0]}</dt>
                  <dd className="font-bold">{x[1]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6">
            <ShieldCheck className="h-7 w-7 text-green-700" />
            <h2 className="mt-4 font-bold">Battery health</h2>
            <StatusBadge tone={tone(h.battery.status)}>
              {h.battery.status}
            </StatusBadge>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Average SOC", `${h.battery.avgBatterySoc}%`],
                ["Latest SOC", `${h.battery.latestBatterySoc}%`],
                ["Minimum threshold", `${h.battery.minThreshold}%`],
                [
                  "Latest solar voltage",
                  h.battery.latestSolarVoltage != null
                    ? `${h.battery.latestSolarVoltage} V`
                    : "—",
                ],
              ].map((x) => (
                <div key={x[0]} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{x[0]}</dt>
                  <dd className="font-bold">{x[1]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6">
            <h2 className="font-bold">Connectivity</h2>
            <div className="mt-4">
              <StatusBadge tone={h.connectivity.online ? "green" : "red"}>
                {h.connectivity.online ? "ONLINE" : "OFFLINE"}
              </StatusBadge>
            </div>
            <p className="mt-5 text-sm text-slate-600">
              {h.connectivity.lastSeenAt
                ? `Last seen ${new Date(h.connectivity.lastSeenAt).toLocaleString()}`
                : "No last-seen timestamp."}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Samples used: {h.sampleSize}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
