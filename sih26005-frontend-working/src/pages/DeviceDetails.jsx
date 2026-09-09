import {
  Activity,
  BatteryCharging,
  DoorOpen,
  Fan,
  MapPin,
  Radio,
  RefreshCw,
  Sun,
  Thermometer,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDevice, getLiveStatus } from "../api/device.api";
import { apiError } from "../api/axios";
import {
  ErrorState,
  MetricCard,
  PageTitle,
  Spinner,
  StatusBadge,
} from "../components/common";

export default function DeviceDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null),
    [live, setLive] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    try {
      setError("");
      const [a, b] = await Promise.all([getDevice(id), getLiveStatus(id)]);
      setD(a.data.device);
      setLive(b.data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [id]);
  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} retry={load} />;
  const l = live?.latest;
  const stale = live?.isStale;
  return (
    <>
      <PageTitle
        title={d.name}
        subtitle={`${d.deviceCode} · ${d.location || d.district || "Location not set"}`}
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to="/telemetry">
              Telemetry
            </Link>
            <button className="btn-secondary" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone={stale ? "yellow" : "green"}>
          {!l ? "No telemetry" : stale ? "Stale telemetry" : "Online"}
        </StatusBadge>
        <span className="text-xs text-slate-500">
          {l?.time
            ? `Last telemetry ${new Date(l.time).toLocaleString()}`
            : "No telemetry received yet"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Thermometer}
          label="Chamber temperature"
          value={l?.chamberTempC}
          unit="°C"
          tone={l?.chamberTempC > d.maxTempThresholdC ? "red" : "blue"}
          note={`Target ${d.targetTempC}°C · Max ${d.maxTempThresholdC}°C`}
        />
        <MetricCard
          icon={Activity}
          label="Humidity"
          value={l?.humidityPct}
          unit="%"
          tone="blue"
        />
        <MetricCard
          icon={BatteryCharging}
          label="Battery SOC"
          value={l?.batterySoc}
          unit="%"
          tone={l?.batterySoc < d.minBatterySoc ? "red" : "green"}
          note={`Minimum ${d.minBatterySoc}%`}
        />
        <MetricCard
          icon={Sun}
          label="Solar voltage"
          value={l?.solarVoltage}
          unit="V"
          tone={l?.solarVoltage < d.cutoutVoltage ? "red" : "yellow"}
          note={`Cutout ${d.cutoutVoltage}V`}
        />
        <MetricCard
          icon={Radio}
          label="Solar current"
          value={l?.solarCurrent}
          unit="A"
          tone="yellow"
        />
        <MetricCard
          icon={Fan}
          label="Compressor"
          value={l?.compressorOn == null ? "—" : l.compressorOn ? "ON" : "OFF"}
          tone={l?.compressorOn ? "green" : "gray"}
        />
        <MetricCard
          icon={DoorOpen}
          label="Door"
          value={l?.doorState || "—"}
          tone={l?.doorState === "OPEN" ? "yellow" : "green"}
        />
        <MetricCard
          icon={MapPin}
          label="Location"
          value={d.district || d.location || "—"}
          tone="gray"
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Device information</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Hardware ID</dt>
              <dd className="mt-1 font-semibold">{d.hardwareId}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">MAC address</dt>
              <dd className="mt-1 font-semibold">{d.macAddress}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Firmware</dt>
              <dd className="mt-1 font-semibold">{d.firmwareVersion || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Status</dt>
              <dd className="mt-1 font-semibold">{d.status}</dd>
            </div>
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Connectivity</h2>
          <p className="mt-3 text-sm text-slate-600">
            {stale
              ? "Device data is stale. Do not treat the displayed values as real-time."
              : l
                ? "Device is reporting normally."
                : "The device has not reported telemetry yet."}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Live endpoint is polled every 10 seconds while this page is open.
          </p>
        </div>
      </div>
    </>
  );
}
