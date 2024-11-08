import React, { useEffect, useState } from "react";
import "./Income.css";
import axios from "axios";

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [edit, setEdit] = useState();
  const [showEdit, setEditVisibility] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [filteredSource, setFilteredSource] = useState("");
  const [startDate, setStartDate] = useState(""); // For date filtering
  const [endDate, setEndDate] = useState("");       // For date filtering
  const [minAmount, setMinAmount] = useState("");   // For amount filtering
  const [maxAmount, setMaxAmount] = useState("");   // For amount filtering
  const [applyFilter, setApplyFilter] = useState(false); // To trigger filtering


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/income",
        {
          date: document.getElementById("date").value,
          amount: parseFloat(document.getElementById("amount").value),
          source: document.getElementById("source").value,
          description: document.getElementById("description").value,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (response.status === 201) {
        setIncomes([...incomes, response.data.income]);
        setTotalIncome(totalIncome + response.data.income.amount);
        await addSavings(response.data.income.amount);
      }
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const addSavings = async (amount1) => {
    console.log("Adding to savings:", amount1);
    if (!amount1) {
      console.error("Amount is invalid");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3001/api/savings",
        { amount: document.getElementById("amount") },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    } catch (error) {
      console.error("Error adding to savings:", error.response || error);
    }
  };

  const updateSavings = async (amount1) => {
    console.log("Updating savings:", amount1);
    if (!amount1) {
      console.error("Amount is invalid");
      return;
    }
    try {
      await axios.patch(
        "http://localhost:3001/api/savings",
        { amount: amount1 },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    } catch (error) {
      console.error("Error updating savings:", error.response || error);
    }
  };

  const getIncome = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/income", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIncomes(response.data.income);
      setTotalIncome(
        response.data.income.reduce((total, income) => total + income.amount, 0)
      );
    } catch (error) {
      console.error("Error fetching income:", error);
    }
  };

  useEffect(() => {
    getIncome();
  }, []);

  const deleteIncome = async (id) => {
    try {
      const deletedIncome = incomes.find((income) => income._id === id);

      await axios.delete(`http://localhost:3001/api/income/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setIncomes(incomes.filter((income) => income._id !== id));
      setTotalIncome(totalIncome - deletedIncome.amount);
      await updateSavings(-deletedIncome.amount);
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  const handleEdit = async (event, edit) => {
    event.preventDefault();
    const formData = {
      date: document.getElementById("edit-date").value || edit.date,
      amount:
        parseFloat(document.getElementById("edit-amount").value) || edit.amount,
      source: document.getElementById("edit-source").value || edit.source,
      description:
        document.getElementById("edit-description").value || edit.description,
    };

    try {
      const response = await axios.patch(
        `http://localhost:3001/api/income/${edit._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let temp = incomes.filter((income) => income._id !== edit._id);
      temp.push(response.data.updatedIncome);

      setIncomes(temp);
      setTotalIncome(
        totalIncome - edit.amount + response.data.updatedIncome.amount
      );
      await updateSavings(
        response.data.updatedIncome.amount - edit.amount
      );

      setEditVisibility(false);
    } catch (error) {
      console.error("Error editing income:", error);
    }
  };

  const uniqueSources = [...new Set(incomes.map((income) => income.source))];
  const handleFilter = () => {
    setApplyFilter(true); // Trigger filtering
  };
  return (
    <>
      <div className="income-component" id="incomeComponentContainer">
        <div className="income-form-container" id="incomeFormContainer">
          <h2 className="component-income-heading" id="incomeFormHeading">Submit Income</h2>
          <form className="income-form" id="incomeForm" onSubmit={handleSubmit}>
            <input
              type="date"
              id="date"
              className="input-date"
              placeholder="(Default: Today...)"
              required
            />
            <br />
            <input
              type="number"
              id="amount"
              className="input-amount"
              placeholder="Enter Amount..."
              required
            />
            <br />
            <input
              type="text"
              id="source"
              className="input-source"
              placeholder="Enter Source..."
              required
            />
            <br />
            <textarea
              id="description"
              className="textarea-description"
              placeholder="Enter Description"
              rows={7}
              cols={10}
            />
            <br />
            <input type="submit" id="submitBtn" className="submit-btn" />
          </form>
        </div>

        <div className="income-list-container" id="incomeListContainer">
          <h2 className="component-income-heading" id="incomeListHeading">List Of Incomes</h2>

          <div className="filter-container" id="filterContainer">
            <label htmlFor="source-filter" className="filter-label">Filter by Source: </label>
            <select
              id="source-filter"
              className="filter-select"
              onChange={(e) => setFilteredSource(e.target.value)}
              value={filteredSource}
            >
              <option value="">All Sources</option>
              {uniqueSources.map((source, index) => (
                <option key={index} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <div className="date-filter" id="dateFilter">
              <label htmlFor="start-date" className="filter-label">Start Date: </label>
              <input
                type="date"
                id="start-date"
                className="filter-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label htmlFor="end-date" className="filter-label">End Date: </label>
              <input
                type="date"
                id="end-date"
                className="filter-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="amount-filter" id="amountFilter">
              <label htmlFor="min-amount" className="filter-label">Min Amount: </label>
              <input
                type="number"
                id="min-amount"
                className="filter-amount"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <label htmlFor="max-amount" className="filter-label">Max Amount: </label>
              <input
                type="number"
                id="max-amount"
                className="filter-amount"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            <button className="filter-btn" id="applyFilterBtn" onClick={handleFilter}>
              Apply Filter
            </button>
          </div>

          <table id="incomeTable" className="income-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes
                .filter((income) => {
                  if (!applyFilter) return true;

                  const incomeDate = new Date(income.date);
                  const isDateInRange =
                    (!startDate || incomeDate >= new Date(startDate)) &&
                    (!endDate || incomeDate <= new Date(endDate));
                  const isAmountInRange =
                    (!minAmount || income.amount >= parseFloat(minAmount)) &&
                    (!maxAmount || income.amount <= parseFloat(maxAmount));

                  return (
                    (!filteredSource || income.source === filteredSource) &&
                    isDateInRange &&
                    isAmountInRange
                  );
                })
                .map((income) => (
                  <tr key={income._id}>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>₹{income.amount.toFixed(2)}</td>
                    <td>{income.source}</td>
                    <td>{income.description}</td>
                    <td>
                      <button
                        className="btn-update"
                        onClick={() => {
                          setEditVisibility(true);
                          setEdit(income);
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button className="btn-delete" onClick={() => deleteIncome(income._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <h3 className="total-income" id="totalIncome">
            Total Income: ₹{totalIncome.toFixed(2)}
          </h3>
        </div>
      </div>

      {showEdit && (
        <div className="edit-income-container" id="editIncomeContainer">
          <h2 className="component-income-heading" id="editIncomeHeading">Edit Fields</h2>
          <form className="update-income-form" id="editIncomeForm" onSubmit={(event) => handleEdit(event, edit)}>
            <input type="date" id="edit-date" className="edit-input-date" defaultValue={edit.date} />
            <input type="number" id="edit-amount" className="edit-input-amount" defaultValue={edit.amount} />
            <input type="text" id="edit-source" className="edit-input-source" defaultValue={edit.source} />
            <textarea id="edit-description" className="edit-textarea-description" defaultValue={edit.description} />
            <input type="submit" id="editSubmitBtn" className="edit-submit-btn" />
          </form>
        </div>
      )}
    </>
  );

}
