// server side processing
"use server";

import { loginUser, registerUser } from "../api/auth";
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
