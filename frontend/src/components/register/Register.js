import React from 'react'
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import "./Register.css"

export default function Register({setIsLoggedIn}) {
  const navigate = useNavigate();
  setIsLoggedIn(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    const response = await axios.post("http://localhost:3001/api/auth/register", {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value

    })
    if (response.status === 201) {
      navigate("/login");
    }
    else
    {
      alert("User with the same email or username already exists")
    }
  }
  catch(error)
  {
    alert("User with the same email or username already exists")

  }
  }
  return (
    <div className='register'>
      <h2 className='component-heading'>Register</h2>
      <form className='register-form'>
        <input type='text' id='username' placeholder='Enter Username...' required /> <br />
        <input type='email' id='email' placeholder='abc@gmail.com' required /> <br />
        <input type='password' id='password' placeholder="Enter password..." required /> <br />
        <input type='submit' id="submit" onClick={handleSubmit} />
      </form>
    </div>
  )
}
