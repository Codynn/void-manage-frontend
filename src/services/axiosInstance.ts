import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || "https://manage-api.voidnepal.com.np/api",
});

API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(
      error.response.data,
      "DIOHGDSIOGHDFSOIGJDFGOIDFSJGIODFSGJSFDOIGJGIO[SDJFGIOJDFGO[I"
    );
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("token");
      window.location.href = (process.env.NEXT_PUBLIC_DOMAIN_PREFIX || "") + '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default API;
