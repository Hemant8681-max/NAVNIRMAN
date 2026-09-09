import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Boxes,
  ChevronRight,
  Cpu,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldAlert,
  UserRound,
  X,
  PhoneCall,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Devices", "/devices", Boxes],
  ["Telemetry", "/telemetry", Activity],
  ["Alerts", "/alerts", Bell],
  ["Health", "/health", HeartPulse],
  ["Controls", "/controls", Gauge],
  ["Configuration", "/configuration", Settings2],
  ["Emergency Contacts", "/contacts", PhoneCall],
  ["Profile", "/profile", UserRound],
];

function roleAllowed(label, role) {
  if (label === "Controls" || label === "Configuration")
    return ["ADMIN", "TECHNICIAN", "FPO_MANAGER", "FARMER"].includes(role);
  return true;
}

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile ? "relative h-full w-72" : "hidden lg:flex lg:w-64 lg:flex-col"} border-r border-slate-200 bg-white`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-700 text-white">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <p className="font-extrabold text-slate-900">ColdStore</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">
            Solar IoT Command
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav
          .filter(([label]) => roleAllowed(label, user?.role))
          .map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => mobile && setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-green-50 text-green-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{label}</span>
              <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
            </NavLink>
          ))}
      </div>
      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 rounded-xl bg-slate-50 p-3">
          <p className="truncate text-sm font-bold">{user?.name}</p>
          <p className="mt-0.5 text-xs font-semibold text-green-700">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f7f5]">
      <Sidebar />
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-500 sm:flex">
            <ShieldAlert className="h-4 w-4 text-green-700" />
            Solar Cold Storage Network
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-sm font-extrabold text-green-800">
              {user?.name?.slice(0, 1)?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
