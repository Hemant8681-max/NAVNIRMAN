import { useEffect, useState } from "react";
import { Fan, Radio, Snowflake } from "lucide-react";
import {
  listDevices,
  controlCooling,
  controlDefrost,
  pingDevice,
} from "../api/device.api";
import { apiError } from "../api/axios";
import {
  ConfirmModal,
  PageTitle,
  Spinner,
  StatusBadge,
  Toast,
} from "../components/common";

export default function Controls() {
  const [devices, setDevices] = useState([]),
    [id, setId] = useState(""),
    [temp, setTemp] = useState("4"),
    [pre, setPre] = useState(false),
    [duration, setDuration] = useState("15"),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    listDevices({ limit: 200 }).then((r) => {
      const d = r.data?.devices || [];
      setDevices(d);
      if (d[0]) {
        setId(d[0].id);
        setTemp(String(d[0].targetTempC));
      }
    });
  }, []);
  const selected = devices.find((d) => d.id === id);
  const run = async () => {
    setBusy(true);
    try {
      if (modal === "cooling")
        await controlCooling(id, {
          targetTempC: Number(temp),
          preCooling: pre,
        });
      if (modal === "defrost")
        await controlDefrost(id, { durationMinutes: Number(duration) });
      if (modal === "ping") await pingDevice(id);
      setToast("Command sent successfully.");
      setModal(null);
    } catch (e) {
      setToast(apiError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Device control"
        subtitle="Send remote MQTT commands through the backend"
      />
      <div className="card p-5">
        <label className="label">Device</label>
        <select
          className="input max-w-xl"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            const d = devices.find((x) => x.id === e.target.value);
            if (d) setTemp(String(d.targetTempC));
          }}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.deviceCode}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-6">
          <Fan className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 text-lg font-bold">Cooling</h2>
          <p className="mt-1 text-sm text-slate-500">
            Publish a SET_COOLING command.
          </p>
          <label className="label mt-5">Target temperature °C</label>
          <input
            className="input"
            type="number"
            step="0.1"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
          />
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={pre}
              onChange={(e) => setPre(e.target.checked)}
            />{" "}
            Pre-cooling
          </label>
          <button
            className="btn-primary mt-5 w-full"
            disabled={!selected}
            onClick={() => setModal("cooling")}
          >
            Send cooling command
          </button>
        </div>
        <div className="card p-6">
          <Snowflake className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 text-lg font-bold">Defrost</h2>
          <p className="mt-1 text-sm text-slate-500">
            Start a controlled defrost cycle.
          </p>
          <label className="label mt-5">Duration minutes</label>
          <input
            className="input"
            type="number"
            min="1"
            max="120"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <button
            className="btn-danger mt-5 w-full"
            disabled={!selected}
            onClick={() => setModal("defrost")}
          >
            Start defrost cycle
          </button>
        </div>
        <div className="card p-6">
          <Radio className="h-7 w-7 text-green-700" />
          <h2 className="mt-4 text-lg font-bold">Ping device</h2>
          <p className="mt-1 text-sm text-slate-500">
            Check command connectivity through the backend MQTT broker.
          </p>
          <button
            className="btn-secondary mt-5 w-full"
            disabled={!selected}
            onClick={() => setModal("ping")}
          >
            Ping device
          </button>
        </div>
      </div>
      <ConfirmModal
        open={!!modal}
        title={
          modal === "cooling"
            ? "Send cooling command?"
            : modal === "defrost"
              ? "Start defrost cycle?"
              : "Ping device?"
        }
        message={
          modal === "cooling"
            ? `Set ${selected?.deviceCode} target to ${temp}°C${pre ? " with pre-cooling" : ""}.`
            : modal === "defrost"
              ? `Start a ${duration}-minute defrost cycle for ${selected?.deviceCode}.`
              : `Send a ping to ${selected?.deviceCode}.`
        }
        onConfirm={run}
        onCancel={() => setModal(null)}
        loading={busy}
      />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
