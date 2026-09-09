import api, { unwrap } from "./axios";
export const getProfile = async () => unwrap(await api.get("/users/profile"));
