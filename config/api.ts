import axios from "axios";
import { showNotification } from "@mantine/notifications";

const api = axios.create();

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // if response status is 401 or 403, check if user has authorizationChanged
    if (error.response.status && [401, 403].includes(error.response.status)) {
      const user = await api.get("/api/me").then(res => res.data);
      if (!user) return Promise.reject(error);
      // if authorizationChanged then notify and return no other error
      if (user.authorizationChanged === true) {
        showNotification({
          title: "Your access has changed",
          message: "You have to login again",
          color: "red",
          autoClose: false,
        });
        return;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
