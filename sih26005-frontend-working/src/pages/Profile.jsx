import { useEffect, useState } from "react";
import { getProfile } from "../api/user.api";
import { apiError } from "../api/axios";
import {
  ErrorState,
  PageTitle,
  Spinner,
  StatusBadge,
} from "../components/common";

export default function Profile() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    getProfile()
      .then((r) => setUser(r.data.user))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return (
    <>
      <PageTitle title="Profile" subtitle="Authenticated user information" />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : (
        <div className="card max-w-2xl p-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-2xl font-black text-green-800">
            {user?.name?.slice(0, 1)}
          </div>
          <h2 className="mt-5 text-xl font-bold">{user?.name}</h2>
          <StatusBadge tone="green">{user?.role}</StatusBadge>
          <dl className="mt-6 space-y-4 text-sm">
            {[
              ["Email", user?.email],
              ["Phone", user?.phone],
              ["FPO", user?.fpoName],
              ["Location", user?.location],
              ["District", user?.district],
              ["State", user?.state],
            ].map((x) => (
              <div
                key={x[0]}
                className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between"
              >
                <dt className="text-slate-500">{x[0]}</dt>
                <dd className="font-semibold">{x[1] || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  );
}
