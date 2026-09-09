import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { history } from "../api/telemetry.api";
import { listDevices } from "../api/device.api";
import { apiError } from "../api/axios";
import {
  ErrorState,
  EmptyState,
  PageTitle,
  Spinner,
} from "../components/common";

function Chart({ title, data, dataKey, unit, type = "line" }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h2 className="font-bold">{title}</h2>
        <p className="text-xs text-slate-500">
          Historical telemetry from backend
        </p>
      </div>
      {!data.length ? (
        <EmptyState title="No telemetry in this range" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          {type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleString()}
                formatter={(v) => [`${v} ${unit}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleString()}
                formatter={(v) => [`${v} ${unit}`, "Value"]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Telemetry() {
  const [devices, setDevices] = useState([]),
    [id, setId] = useState(""),
    [range, setRange] = useState("24"),
    [data, setData] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    listDevices({ limit: 200 })
      .then((r) => {
        const ds = r.data?.devices || [];
        setDevices(ds);
        if (ds[0]) setId(ds[0].id);
      })
      .catch((e) => setError(apiError(e)));
  }, []);
  useEffect(() => {
    if (!id) return;
    const to = new Date(),
      from = new Date(to.getTime() - Number(range) * 3600000);
    setLoading(true);
    history(id, {
      from: from.toISOString(),
      to: to.toISOString(),
      interval: "raw",
      limit: 1000,
    })
      .then((r) => {
        const logs = (r.data?.logs || [])
          .slice()
          .reverse()
          .map((x) => ({ ...x, time: x.time }));
        setData(logs);
      })
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, [id, range]);
  return (
    <>
      <PageTitle
        title="Telemetry analytics"
        subtitle="Temperature-first monitoring with historical sensor data"
      />
      <div className="card mb-4 p-4 flex flex-col gap-3 sm:flex-row">
        <select
          className="input sm:max-w-sm"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          <option value="">Select device</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.deviceCode}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-xs"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="24">Last 24 hours</option>
          <option value="168">Last 7 days</option>
          <option value="720">Last 30 days</option>
        </select>
        {id && (
          <Link className="btn-secondary" to={`/devices/${id}`}>
            Device details
          </Link>
        )}
      </div>
      {error && <ErrorState message={error} />}{" "}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Chart
            title="Chamber temperature"
            data={data}
            dataKey="chamberTempC"
            unit="°C"
          />
          <Chart title="Humidity" data={data} dataKey="humidityPct" unit="%" />
          <Chart
            title="Battery SOC"
            data={data}
            dataKey="batterySoc"
            unit="%"
            type="area"
          />
          <Chart
            title="Solar voltage"
            data={data}
            dataKey="solarVoltage"
            unit="V"
          />
          <Chart
            title="Solar current"
            data={data}
            dataKey="solarCurrent"
            unit="A"
          />
        </div>
      )}
    </>
  );
}
