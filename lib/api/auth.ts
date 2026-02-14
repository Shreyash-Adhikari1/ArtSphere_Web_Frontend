// backend api call only
import axios from "axios";
import axiosInstance from "./axios";
import { API } from "./endpoints";

export const registerUser = async (registerData: any) => {
  try {
    const response = await axiosInstance.post(
      API.USER.REGISTER, // backend route path
      registerData, // data to send to backend (req.body)
    );
    return response.data; // response ko body,
    // what is returned from backend- controller
  } catch (err: Error | any) {
    // if 4xx or 5xx counts error
    throw new Error();
    {
      err.response?.data?.message || // from backend
        err.message || // genenral error message
        "Registration Failed"; // failed message
    }
  }
};

export const loginUser = async (loginData: any) => {
  try {
    const response = await axiosInstance.post(
      API.USER.LOGIN, // backend route path
      loginData, // data to send to backend (req.body)
    );
    return response.data; // response ko body,
    // what is returned from backend- controller
  } catch (err: Error | any) {
    // if 4xx or 5xx counts error
    throw new Error();
    {
      err.response?.data?.message || // from backend
        err.message || // genenral error message
        "Login Failed"; // failed message
    }
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(API.USER.REQUEST_PASSWORD_RESET, {
      email,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Request password reset failed",
    );
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axios.post(API.USER.RESET_PASSWORD(token), {
      newPassword: newPassword,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Reset password failed",
    );
  }
};
