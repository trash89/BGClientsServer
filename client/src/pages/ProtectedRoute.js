import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { axiosInstance } from "../axiosInstance";
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.user);
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
  if (!user) {
    return Navigate({ to: "/register", replace: true });
  }
  return children;
};
export default ProtectedRoute;
