import { useState } from "react";
import AuthForm from "./AuthForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // Import message from antd for toast notifications
import { Base_URL } from "../../API/constants";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    if (isLogin) {
      try {
        const response = await axios.post(
          `${Base_URL}/api/auth/login`,
          values
        );
        console.log("Login successful:", response.data);
        localStorage.setItem("token", response.data.token);
        setError("");
        navigate("/");
      } catch (error) {
        console.error("Login failed:", error.response?.data?.message || error.message);
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          `${Base_URL}/api/auth/register`,
          values
        );
        console.log("Registration successful:", response.data);
        setIsLogin(true);
        setError("");
      } catch (error) {
        console.error("Registration failed:", error.response?.data?.message || error.message);
        setError(error.response?.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleGuestLogin = async () => {
    const guestCredentials = {
      username: `Guest_${Math.random().toString(36).substr(2, 9)}`,
      email: `guest_${Math.random().toString(36).substr(2, 9)}@gmail.com`,
      password: "guest",
    };

    try {
      // Show loading toast while processing
      message.loading({ content: "Creating guest account...", key: "guestLogin" });

      // Register the guest account
      const registerResponse = await axios.post(
       `${Base_URL}/api/auth/register`,
        guestCredentials
      );
      console.log("Guest registration successful:", registerResponse.data);

      // Login with guest credentials
      const loginResponse = await axios.post(
        `${Base_URL}/api/auth/login`,
        {
          email: guestCredentials.email,
          password: guestCredentials.password,
        }
      );
      console.log("Guest login successful:", loginResponse.data);

      // Show success toast
      message.success({
        content: "Logged in as guest successfully!",
        key: "guestLogin",
        duration: 2,
      });

      localStorage.setItem("token", loginResponse.data.token);
      setError("");
      navigate("/");
    } catch (error) {
      console.error("Guest login failed:", error.response?.data?.message || error.message);
      
      // Show error toast
      message.error({
        content: error.response?.data?.message || "Guest login failed. Please try again.",
        key: "guestLogin",
        duration: 3,
      });
      
      setError(error.response?.data?.message || "Guest login failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AuthForm
        isLogin={isLogin}
        onSubmit={handleSubmit}
        onToggle={() => setIsLogin(!isLogin)}
        onGuestLogin={handleGuestLogin}
        error={error}
      />
    </div>
  );
};

export default LoginPage;