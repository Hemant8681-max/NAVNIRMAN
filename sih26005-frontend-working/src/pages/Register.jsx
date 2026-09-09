import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/axios";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "FARMER",
    fpoName: "",
    location: "",
    district: "",
    state: "North Eastern Region",
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (f.password !== f.confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const { confirm, ...payload } = f;
      await register(payload);
      nav("/dashboard");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-7 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-700">
              <UserPlus />
            </div>
            <div>
              <p className="text-xl font-extrabold">ColdStore</p>
              <p className="text-xs uppercase tracking-wider text-green-300">
                SIH 26005
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-slate-50 p-6 sm:p-9">
          <h1 className="text-2xl font-black">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a farmer, FPO manager or technical user.
          </p>
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["password", "Password", "password"],
              ["confirm", "Confirm password", "password"],
              ["fpoName", "FPO name", "text"],
              ["location", "Location", "text"],
              ["district", "District", "text"],
              ["state", "State", "text"],
            ].map(([k, l, t]) => (
              <div
                key={k}
                className={
                  k === "fpoName" ||
                  k === "location" ||
                  k === "district" ||
                  k === "state"
                    ? ""
                    : "sm:col-span-1"
                }
              >
                <label className="label">{l}</label>
                <input
                  className="input"
                  type={t}
                  required={!["fpoName", "location", "district"].includes(k)}
                  value={f[k]}
                  onChange={(e) => set(k, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={f.role}
                onChange={(e) => set("role", e.target.value)}
              >
                <option>FARMER</option>
                <option>FPO_MANAGER</option>
                <option>TECHNICIAN</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-3">
              <Link to="/login" className="btn-secondary">
                Back to login
              </Link>
              <button className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
          <p className="mt-5 text-xs text-slate-500">
            ADMIN registration is intentionally not exposed in this normal
            registration screen.
          </p>
        </div>
      </div>
    </div>
  );
}
