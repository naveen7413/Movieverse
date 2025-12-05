import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // <-- useNavigate hook

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", data);

      if (res.data.success) {
        loginUser(res.data.token);
        alert("Logged In Successfully");
        navigate("/"); // <-- Navigate to home page
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="auth-box">
      <h2>Login</h2>

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

      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
