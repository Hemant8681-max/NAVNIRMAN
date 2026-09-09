import api, { unwrap } from "./axios";

export const listDevices = async (params = {}) =>
  unwrap(await api.get("/devices", { params }));
export const getDevice = async (id) => unwrap(await api.get(`/devices/${id}`));
export const getLiveStatus = async (id) =>
  unwrap(await api.get(`/devices/${id}/status/live`));
export const getHealth = async (id) =>
  unwrap(await api.get(`/devices/${id}/health`));
export const registerDevice = async (payload) =>
  unwrap(await api.post("/devices/register", payload));
export const updateConfig = async (id, payload) =>
  unwrap(await api.patch(`/devices/${id}/config`, payload));
export const controlCooling = async (id, payload) =>
  unwrap(await api.post(`/devices/${id}/control/cooling`, payload));
export const controlDefrost = async (id, payload) =>
  unwrap(await api.post(`/devices/${id}/control/defrost`, payload));
export const pingDevice = async (id) =>
  unwrap(await api.post(`/devices/${id}/ping`));
