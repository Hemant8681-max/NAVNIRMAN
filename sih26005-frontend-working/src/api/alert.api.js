import api, { unwrap } from "./axios";
export const listAlerts = async (params = {}) =>
  unwrap(await api.get("/alerts", { params }));
export const acknowledgeAlerts = async (payload) =>
  unwrap(await api.post("/alerts/acknowledge", payload));
export const updateContacts = async (payload) =>
  unwrap(await api.put("/alerts/contacts", payload));
