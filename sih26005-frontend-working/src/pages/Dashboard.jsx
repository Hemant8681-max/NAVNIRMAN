import {
  Activity,
  BatteryCharging,
  Bell,
  Boxes,
  MapPin,
  Sun,
  Thermometer,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listDevices, getLiveStatus } from "../api/device.api";
import { listAlerts } from "../api/alert.api";
import { apiError } from "../api/axios";

import {
  EmptyState,
  ErrorState,
  MetricCard,
  PageTitle,
  Spinner,
  StatusBadge,
} from "../components/common";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [live, setLive] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [d, a] = await Promise.all([
        listDevices({ limit: 200 }),
        listAlerts({ status: "ACTIVE", limit: 10 }),
      ]);

      const ds = d.data?.devices || [];

      setDevices(ds);
      setAlerts(a.data?.alerts || []);

      const pairs = await Promise.all(
        ds.slice(0, 20).map(async (x) => {
          try {
            const response = await getLiveStatus(x.id);
            return [x.id, response.data];
          } catch {
            return [x.id, null];
          }
        })
      );

      setLive(Object.fromEntries(pairs));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const online = devices.filter(
    (d) => live[d.id]?.latest && !live[d.id]?.isStale
  ).length;

  const temps = Object.values(live)
    .map((x) => x?.latest?.chamberTempC)
    .filter(Number.isFinite);

  const avg = temps.length
    ? temps.reduce((a, b) => a + b, 0) / temps.length
    : null;

  const battery = Object.values(live)
    .map((x) => x?.latest?.batterySoc)
    .filter(Number.isFinite);

  const avgBat = battery.length
    ? battery.reduce((a, b) => a + b, 0) / battery.length
    : null;

  const solar = Object.values(live)
    .map((x) => x?.latest?.solarVoltage)
    .filter(Number.isFinite);

  const avgSolar = solar.length
    ? solar.reduce((a, b) => a + b, 0) / solar.length
    : null;

  if (loading) {
    return (
      <>
        <PageTitle
          title="Dashboard"
          subtitle="Solar-powered cold-storage network overview"
        />
        <Spinner />
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="A 30-second view of storage safety, energy and connectivity"
        action={
          <button className="btn-secondary" onClick={load}>
            <Activity className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {error && <ErrorState message={error} retry={load} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={Boxes}
          label="Total devices"
          value={devices.length}
          note="Registered units"
        />

        <MetricCard
          icon={Activity}
          label="Online"
          value={online}
          note={`${devices.length - online} offline/stale`}
          tone="blue"
        />

        <MetricCard
          icon={Bell}
          label="Critical alerts"
          value={
            alerts.filter((a) => a.severity === "CRITICAL").length
          }
          note="Active alerts"
          tone="red"
        />

        <MetricCard
          icon={Thermometer}
          label="Avg chamber temp"
          value={avg == null ? "—" : avg.toFixed(1)}
          unit="°C"
          tone="blue"
        />

        <MetricCard
          icon={BatteryCharging}
          label="Avg battery SOC"
          value={avgBat == null ? "—" : avgBat.toFixed(0)}
          unit="%"
          tone={avgBat != null && avgBat < 20 ? "red" : "green"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Device overview</h2>
              <p className="text-xs text-slate-500">
                Current telemetry where available
              </p>
            </div>

            <Link
              to="/devices"
              className="text-sm font-bold text-green-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-3">Device</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Temp</th>
                  <th>Humidity</th>
                  <th>Battery</th>
                  <th>Solar</th>
                </tr>
              </thead>

              <tbody>
                {devices.slice(0, 8).map((d) => {
                  const x = live[d.id];
                  const l = x?.latest;
                  const stale = x?.isStale;

                  return (
                    <tr
                      key={d.id}
                      className="border-b border-slate-50"
                    >
                      <td className="py-3">
                        <Link
                          className="font-bold hover:text-green-700"
                          to={`/devices/${d.id}`}
                        >
                          {d.name}

                          <span className="block text-xs font-normal text-slate-400">
                            {d.deviceCode}
                          </span>
                        </Link>
                      </td>

                      <td>{d.location || d.district || "—"}</td>

                      <td>
                        {!l ? (
                          <StatusBadge>Unknown</StatusBadge>
                        ) : stale ? (
                          <StatusBadge tone="yellow">
                            Stale
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="green">
                            Online
                          </StatusBadge>
                        )}
                      </td>

                      <td className="font-bold">
                        {l ? `${l.chamberTempC}°C` : "—"}
                      </td>

                      <td>
                        {l?.humidityPct != null
                          ? `${l.humidityPct}%`
                          : "—"}
                      </td>

                      <td>
                        {l?.batterySoc != null
                          ? `${l.batterySoc}%`
                          : "—"}
                      </td>

                      <td>
                        {l?.solarVoltage != null
                          ? `${l.solarVoltage}V`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!devices.length && (
              <EmptyState
                title="No devices registered"
                text="Register an ESP32 cold-storage unit to start monitoring."
              />
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Critical attention</h2>

            <Link
              to="/alerts"
              className="text-sm font-bold text-green-700"
            >
              Alerts
            </Link>
          </div>

          {alerts.length ? (
            <div className="mt-4 space-y-3">
              {alerts.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-red-100 bg-red-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      tone={
                        a.severity === "CRITICAL"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {a.severity}
                    </StatusBadge>

                    <span className="text-[11px] text-slate-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold">
                    {a.message}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {a.device?.deviceCode || "Device"} · {a.type}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active alerts"
              text="Your network has no active alerts."
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Sun}
          label="Avg solar voltage"
          value={avgSolar == null ? "—" : avgSolar.toFixed(1)}
          unit="V"
          tone="yellow"
        />

        <MetricCard
          icon={Zap}
          label="Network state"
          value={
            online === devices.length && devices.length
              ? "Healthy"
              : "Needs attention"
          }
          tone={
            online === devices.length && devices.length
              ? "green"
              : "yellow"
          }
        />

        <MetricCard
          icon={MapPin}
          label="Coverage"
          value={
            new Set(
              devices
                .map((d) => d.district || d.location)
                .filter(Boolean)
            ).size || "—"
          }
          note="Locations represented"
          tone="blue"
        />
      </div>
    </>
  );
}