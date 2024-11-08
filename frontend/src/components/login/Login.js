import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setIsLoggedIn }) {
  setIsLoggedIn(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    try{
    e.preventDefault();
    const response = await axios.post("http://localhost:3001/api/auth/login", {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    });
    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username",response.data.user.username);
      setIsLoggedIn(true);
      navigate("/");
    } else {
      navigate("/register");
    }
  }
  catch(error){
    alert("invalid credentials")
  }
  };
  return (
    <div className="login">
      <h2 className="component-heading">Login</h2>
      <form className="login-form">
        <input type="email" id="email" placeholder="abc@gmail.com" required />{" "}
        <br />
        <input
          type="password"
          id="password"
          placeholder="Enter password..."
          required
        />{" "}
        <br />
        <input type="submit" id="submit" onClick={handleSubmit} />
      </form>
    </div>
  );
}
