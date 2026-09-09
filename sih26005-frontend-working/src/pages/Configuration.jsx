import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { listDevices, updateConfig } from "../api/device.api";
import { apiError } from "../api/axios";
import { PageTitle, Toast } from "../components/common";

export default function Configuration() {
  const [devices, setDevices] = useState([]),
    [id, setId] = useState(""),
    [f, setF] = useState({}),
    [loading, setLoading] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    listDevices({ limit: 200 }).then((r) => {
      const d = r.data?.devices || [];
      setDevices(d);
      if (d[0]) {
        setId(d[0].id);
        setF(d[0]);
      }
    });
  }, []);
  const choose = (e) => {
    const d = devices.find((x) => x.id === e.target.value);
    setId(e.target.value);
    setF(d || {});
  };
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const save = async () => {
    setLoading(true);
    try {
      const payload = {
        targetTempC: Number(f.targetTempC),
        maxTempThresholdC: Number(f.maxTempThresholdC),
        minBatterySoc: Number(f.minBatterySoc),
        cutoutVoltage: Number(f.cutoutVoltage),
        doorOpenAlertSec: Number(f.doorOpenAlertSec),
        name: f.name,
        status: f.status,
      };
      await updateConfig(id, payload);
      setToast("Configuration updated.");
    } catch (e) {
      setToast(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Device configuration"
        subtitle="Edit only fields supported by the backend API"
      />
      <div className="card p-5">
        <label className="label">Device</label>
        <select className="input max-w-xl" value={id} onChange={choose}>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.deviceCode}
            </option>
          ))}
        </select>
      </div>
      {id && (
        <div className="card mt-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-700">
              <Settings2 />
            </div>
            <div>
              <h2 className="font-bold">Configuration</h2>
              <p className="text-xs text-slate-500">
                Values are sent to PATCH /devices/:id/config.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["name", "Device name"],
              ["targetTempC", "Target temperature °C"],
              ["maxTempThresholdC", "Max temperature threshold °C"],
              ["minBatterySoc", "Minimum battery SOC %"],
              ["cutoutVoltage", "Solar cutout voltage V"],
              ["doorOpenAlertSec", "Door-open alert seconds"],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input
                  className="input"
                  type={k === "name" ? "text" : "number"}
                  step="0.1"
                  value={f[k] ?? ""}
                  onChange={(e) => set(k, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="label">Device status</label>
              <select
                className="input"
                value={f.status || "ACTIVE"}
                onChange={(e) => set("status", e.target.value)}
              >
                {["ACTIVE", "INACTIVE", "MAINTENANCE", "DECOMMISSIONED"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary" disabled={loading} onClick={save}>
              {loading ? "Saving..." : "Save configuration"}
            </button>
          </div>
        </div>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
