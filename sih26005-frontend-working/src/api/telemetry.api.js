import api, { unwrap } from "./axios";
export const history = async (id, params = {}) =>
  unwrap(await api.get(`/devices/${id}/telemetry/history`, { params }));
