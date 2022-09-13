import axios from "axios";
import { APISERVER } from "./utils/constants";
import { getUserFromLocalStorage } from "./utils/localStorage";

let axiosInstance = axios.create({
  withCredentials: true,
  baseURL: APISERVER,
});

const user = getUserFromLocalStorage();
let authorization = null;
if (user) {
  authorization = `Bearer ${user.access_token}`;
}
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.common["Authorization"] = authorization;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosInstance };
