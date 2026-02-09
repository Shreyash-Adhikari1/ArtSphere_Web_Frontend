// server side processing
"use server";

import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../api/auth";
import { setUserData, setAuthToken } from "../cookie";

export const handleRegister = async (formData: any) => {
  console.log(formData);
  try {
    // handle data from component file
    const result = await registerUser(formData);
    // handle how to send data back to component
    return {
      success: true,
      message: "Registration Successful",
      data: result.user,
    };
  } catch (err: Error | any) {
    console.log(err, "hahahah");

    return {
      success: false,
      message: err.message || "Regitration Failed",
    };
  }
};

export const handleLogin = async (formData: any) => {
  try {
    // handle data from component file
    const result = await loginUser(formData);
    // handle how to send data back to component
    if (result.success) {
      await setAuthToken(result.token);
      await setUserData(result.user);
      return {
        success: true,
        message: "Login Successful",
        data: result.user,
      };
    }
    return {
      success: false,
      message: result.message || "Login Failed",
    };
  } catch (err: Error | any) {
    return {
      success: false,
      message: err.message || "Login Failed",
    };
  }
};

export const handleRequestPasswordReset = async (email: string) => {
  try {
    const response = await requestPasswordReset(email);
    if (response.success) {
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    }
    return {
      success: false,
      message: response.message || "Request password reset failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Request password reset action failed",
    };
  }
};

export const handleResetPassword = async (
  token: string,
  newPassword: string,
) => {
  try {
    const response = await resetPassword(token, newPassword);
    if (response.success) {
      return {
        success: true,
        message: "Password has been reset successfully",
      };
    }
    return {
      success: false,
      message: response.message || "Reset password failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Reset password action failed",
    };
  }
};
