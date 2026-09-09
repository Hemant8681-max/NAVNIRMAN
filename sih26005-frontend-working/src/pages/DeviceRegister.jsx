import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDevice } from "../api/device.api";
import { apiError } from "../api/axios";
import { PageTitle } from "../components/common";

export default function DeviceRegister() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    deviceCode: "",
    macAddress: "",
    hardwareId: "",
    name: "",
    location: "",
    district: "",
    state: "North Eastern Region",
    latitude: "",
    longitude: "",
    targetTempC: "4",
    maxTempThresholdC: "12",
    minBatterySoc: "15",
    cutoutVoltage: "10.5",
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...f };
      for (const k of [
        "latitude",
        "longitude",
        "targetTempC",
        "maxTempThresholdC",
        "minBatterySoc",
        "cutoutVoltage",
      ])
        if (payload[k] !== "") payload[k] = Number(payload[k]);
        else delete payload[k];
      const r = await registerDevice(payload);
      nav(`/devices/${r.data.device.id}`);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Register device"
        subtitle="Add an ESP32 cold-storage unit to the network"
      />
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
        {[
          ["deviceCode", "Device code", "SIH-NER-0001"],
          ["name", "Device name", "Cold Store 01"],
          ["macAddress", "MAC address", "AA:BB:CC:DD:EE:FF"],
          ["hardwareId", "Hardware ID", "ESP32-..."],
          ["location", "Location", "Village / site"],
          ["district", "District", "District"],
          ["state", "State", "North Eastern Region"],
          ["latitude", "Latitude", ""],
          ["longitude", "Longitude", ""],
          ["targetTempC", "Target temperature °C", "4"],
          ["maxTempThresholdC", "Max temp threshold °C", "12"],
          ["minBatterySoc", "Minimum battery SOC %", "15"],
          ["cutoutVoltage", "Solar cutout voltage V", "10.5"],
        ].map(([k, l, p]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input
              className="input"
              required={[
                "deviceCode",
                "name",
                "macAddress",
                "hardwareId",
              ].includes(k)}
              placeholder={p}
              value={f[k]}
              onChange={(e) => set(k, e.target.value)}
            />
          </div>
        ))}
        <div className="sm:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => nav("/devices")}
          >
            Cancel
          </button>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Registering..." : "Register device"}
          </button>
        </div>
      </form>
    </>
  );
}
