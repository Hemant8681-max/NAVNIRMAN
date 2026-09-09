import {
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  Snowflake,
  Sun,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-green-900 p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <Snowflake />
            </div>
            <div>
              <p className="text-xl font-extrabold">ColdStore</p>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-green-200">
                Solar IoT Command Center
              </p>
            </div>
          </div>
          <div className="mt-24 max-w-lg">
            <p className="text-sm font-bold uppercase tracking-widest text-green-200">
              SIH 26005
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              Protect produce with intelligent cooling.
            </h1>
            <p className="mt-6 text-lg leading-8 text-green-100">
              Monitor temperature, energy and device health across solar-powered
              mini cold-storage units.
            </p>
          </div>
        </div>
        <div className="flex gap-5 text-sm text-green-100">
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Solar powered
          </span>
          <span className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Farmer focused
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-2xl font-black text-green-800">ColdStore</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Solar IoT Command Center
            </p>
          </div>
          <div className="card p-7 sm:p-9">
            <h2 className="text-2xl font-extrabold">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to monitor your cold-storage network.
            </p>
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-10"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={show ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              New user?{" "}
              <Link
                className="font-bold text-green-700 hover:underline"
                to="/register"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
