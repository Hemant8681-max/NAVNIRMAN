import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateContacts } from "../api/alert.api";
import { apiError } from "../api/axios";
import { PageTitle, Toast } from "../components/common";

export default function Contacts() {
  const [contacts, setContacts] = useState([
      { name: "", phone: "", channel: "SMS", isPrimary: true },
    ]),
    [loading, setLoading] = useState(false),
    [toast, setToast] = useState("");
  const add = () =>
    setContacts((x) => [
      ...x,
      { name: "", phone: "", channel: "SMS", isPrimary: false },
    ]);
  const set = (i, k, v) =>
    setContacts((x) => x.map((c, n) => (n === i ? { ...c, [k]: v } : c)));
  const remove = (i) => setContacts((x) => x.filter((_, n) => n !== i));
  const save = async () => {
    setLoading(true);
    try {
      await updateContacts({ contacts });
      setToast("Emergency contacts updated.");
    } catch (e) {
      setToast(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageTitle
        title="Emergency contacts"
        subtitle="Critical alerts can trigger the configured notification channel"
      />
      <div className="card p-6">
        <div className="space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    value={c.name}
                    onChange={(e) => set(i, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    value={c.phone}
                    placeholder="+919876543210"
                    onChange={(e) => set(i, "phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Channel</label>
                  <select
                    className="input"
                    value={c.channel}
                    onChange={(e) => set(i, "channel", e.target.value)}
                  >
                    <option>SMS</option>
                    <option>CALL</option>
                    <option>WHATSAPP</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={c.isPrimary}
                      onChange={(e) => set(i, "isPrimary", e.target.checked)}
                    />{" "}
                    Primary
                  </label>
                  <button
                    className="btn-secondary ml-auto"
                    onClick={() => remove(i)}
                    disabled={contacts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button className="btn-secondary" onClick={add}>
            <Plus className="h-4 w-4" />
            Add contact
          </button>
          <button className="btn-primary" disabled={loading} onClick={save}>
            {loading ? "Saving..." : "Save contacts"}
          </button>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
