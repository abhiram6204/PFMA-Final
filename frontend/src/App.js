import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./components/home/Home"
import Login from "./components/login/Login"
import Register from "./components/register/Register"
import Income from "./components/income/Income"
import Expense from "./components/expense/Expense"
import Budget from "./components/budget/Budget"
import Goals from "./components/goals/Goals"
import Investment from "./components/investment/Investment"
import Savings from "./components/savings/Savings";
import App1 from "./components/Tester/tester"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token"));
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username")
    setIsLoggedIn(false);
  };

  return (
    <>
      <BrowserRouter>
        <div className="nav">
          {!isLoggedIn ? (
            <ul>
              <li>
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="">
              <li><Link className="nav-link" to="/">Home</Link></li>
              <li><Link className="nav-link" to="/income">Income</Link></li>
              <li><Link className="nav-link" to="/expense">Expense</Link></li>
              <li><Link className="nav-link" to="/budget">Budget</Link></li>
              <li><Link className="nav-link" to="/saving">Investments</Link></li>
              <li><Link className="nav-link" to="/goal">Goals</Link></li>
              <li><Link className="nav-link" to="/savings">Savings</Link></li>
              <h4>USER: {localStorage.getItem("username")}</h4>
              <li><Link className="nav-link" to="/" onClick={handleLogout}>LogOut</Link></li>
              {/*<li><Link className="nav-link" to="/Tester">Tester</Link></li>*/}
            </ul>
          )}
        </div>
        <Routes>
          <Route index element={<Home />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/saving" element={<Investment />} />
          <Route path="/goal" element={<Goals />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/Tester" element={<App1 />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
