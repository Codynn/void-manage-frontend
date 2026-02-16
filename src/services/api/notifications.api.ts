import API from "../axiosInstance";
import Cookies from "js-cookie"; // to get JWT from cookies

export const getNotifications = async () => {
  const token = Cookies.get("accessToken"); // <-- get JWT
  const response = await API.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`, // <-- send JWT
    },
  });
  return response.data.data;
};

export const markAllNotificationsRead = async () => {
  const token = Cookies.get("accessToken"); // <-- get JWT
  const response = await API.post(
    "/notifications/mark-all-read",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`, // <-- send JWT
      },
    }
  );
  return response.data;
};
