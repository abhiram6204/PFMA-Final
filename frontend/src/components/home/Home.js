import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './home.css';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart'; // Import LineChart

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  
  const [incomeData, setIncomeData] = useState([]); // Store historical income data
  const [expenseData, setExpenseData] = useState([]); // Store historical expense data
  const [investmentData, setInvestmentData] = useState([]); // Store historical investment data

  // Fetch income
  const getIncome = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/income", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTotalIncome(
        response.data.income.reduce((total, income) => total + income.amount, 0)
      );
      setIncomeData(response.data.income); // Store historical income data
    } catch (error) {
      console.error('Error fetching income data:', error);
    }
  };

  useEffect(() => {
    getIncome();
  }, []);

  // Fetch expenses
  const getExpense = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/expense", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const total = response.data.expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
      setTotalExpense(total);
      setExpenseData(response.data.expenses); // Store historical expense data
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    getExpense();
  }, []);

  // Fetch goals
  const getGoals = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/goal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGoals(response.data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  useEffect(() => {
    getGoals();
  }, []);

  // Fetch investments
  const getInvestments = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/saving", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvestments(response.data.investments);
      setInvestmentData(response.data.investments); // Store historical investment data
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  useEffect(() => {
    getInvestments();
  }, []);

  // Prepare data for PieChart (Income, Expense, Investments)
  const pieData = [
    { id: 0, value: totalIncome, label: 'Income' },
    { id: 1, value: totalExpense, label: 'Expense' },
    {
      id: 2,
      value: investments.reduce((total, investment) => total + investment.currentValue, 0),
      label: 'Investments'
    }
  ];

  // Prepare data for PieChart (Goals)
  const goalData = goals.map((goal, index) => [
    { id: index * 2, value: goal.currentAmount, label: `Goal ${index + 1} - Current` },
    { id: index * 2 + 1, value: goal.targetAmount - goal.currentAmount, label: `Goal ${index + 1} - Remaining` }
  ]).flat();

 




  return (
    <div className="dashboard">
      <h1 id="dashboardTitle">Personal Finance Dashboard</h1>

      <div className="cardContainer">
        <div className="card" id="totalIncomeCard">
          <h2>Total Income</h2>
          <p>₹{totalIncome}/-</p>
        </div>

        <div className="card" id="totalExpenseCard">
          <h2>Total Expense</h2>
          <p>₹{totalExpense}/-</p>
        </div>

        <div className="card" id="goalCard">
          <h2>My Goals</h2>
          {goals.map((goal, index) => (
            <div key={index}>
              <p>Goal {index + 1} - Current Amount: ₹{goal.currentAmount}/-</p>
              <p>Goal {index + 1} - Target Amount: ₹{goal.targetAmount}/-</p>
            </div>
          ))}
        </div>

        <div className="card" id="investmentCard">
          <h2>My Investments</h2>
          {investments.map((investment, index) => (
            <div key={index}>
              <p>Investment {index + 1} - Current Value: ₹{investment.currentValue}/-</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pieChartContainer" id="distributionChart">
        <h2>Income, Expense, and Investment Distribution</h2>
        <PieChart
          series={[{
            data: pieData,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            arcLabel: (item) => `${item.label} (₹${item.value})`,
            arcLabelMinAngle: 45,
          }]}
          width={400}
          height={300}
        />
      </div>

      <div className="pieChartContainer" id="goalProgressChart">
        <h2>Goal Progress</h2>
        <PieChart
          series={[{
            data: goalData,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            arcLabel: (item) => `${item.label} (₹${item.value})`,
            arcLabelMinAngle: 45,
          }]}
          width={400}
          height={300}
        />
      </div>

      {/* Line Graphs for Income, Expenses, and Investments 
      <div className="lineChartContainer">
        <h2>Income Over Time</h2>
        <LineChart
          series={[{
            data: incomeChartData.length ? incomeChartData : dummyData,
            color: 'green',
            label: 'Income',
          }]}
          width={400}
          height={300}
          xField="date"
          yField="value"
          xLabel="Date"
          yLabel="Income (₹)"
        />
      </div>

      <div className="lineChartContainer">
        <h2>Expenses Over Time</h2>
        <LineChart
          series={[{
            data: expenseChartData.length ? expenseChartData : dummyData,
            color: 'red',
            label: 'Expenses',
          }]}
          width={400}
          height={300}
          xField="date"
          yField="value"
          xLabel="Date"
          yLabel="Expenses (₹)"
        />
      </div>

      <div className="lineChartContainer">
        <h2>Investments Over Time</h2>
        <LineChart
          series={[{
            data: investmentChartData.length ? investmentChartData : dummyData,
            color: 'blue',
            label: 'Investments',
          }]}
          width={400}
          height={300}
          xField="date"
          yField="value"
          xLabel="Date"
          yLabel="Investments (₹)"
        />
      </div>*/}
    </div>
  );
};

export default Dashboard;
