import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";

const Register = () => {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate(); // <-- useNavigate hook

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", data);
      alert(res.data.message);

      if (res.data.success) {
        navigate("/"); // <-- Navigate to home page after successful registration
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="auth-box">
      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
