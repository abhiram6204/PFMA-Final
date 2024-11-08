import React, { useEffect, useState } from "react";
import "./Budget.css";
import axios from "axios";

export default function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [filteredBudgets, setFilteredBudgets] = useState([]);
    const [edit, setEdit] = useState({
        category: "Budget Category...",
        amount: 10000,
        spentAmount: 100,
        startDate: Date.now(),
        endDate: Date.now(),
    });
    const [showEdit, setEditVisibility] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [minAmountFilter, setMinAmountFilter] = useState("");
    const [maxSpentAmountFilter, setMaxSpentAmountFilter] = useState("");

    useEffect(() => {
        getBudget();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const expenses = await axios.get("http://localhost:3001/api/expense", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        })
        const startDate = new Date(document.getElementById("startDate").value);
        const endDate = new Date(document.getElementById("endDate").value);
        const currentCategory = document.getElementById("category").value;
        console.log(expenses);
        console.log(startDate);
        console.log(endDate);

        const matchingExpense = expenses.data.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.category === currentCategory &&
           expenseDate >= startDate &&
           expenseDate <= endDate;
        });
        console.log("matching expense: ", matchingExpense);
        var sum=0
        for(var i=0;i<matchingExpense.length;i++)
        {
            sum+=matchingExpense[i].amount
        }
        if (matchingExpense) {
            document.getElementById("spentAmount").value = sum;
        }
        const response = await axios.post(
            "http://localhost:3001/api/budget",
            {
                category: document.getElementById("category").value,
                amount: document.getElementById("amount").value,
                spentAmount: document.getElementById("spentAmount").value,
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
            },
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            }
        );
        if (response.status === 201) {
            setBudgets([...budgets, response.data.budget]);
            setFilteredBudgets([...budgets, response.data.budget]);
        }
    };

    const getBudget = async () => {
        const response = await axios.get("http://localhost:3001/api/budget", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setBudgets(response.data.budgets);
        setFilteredBudgets(response.data.budgets); // Initialize filtered list
    };

    const deleteBudget = (id) => {
        const budgetToDelete = budgets.find((budget) => budget._id === id);
        if (budgetToDelete && budgetToDelete.spentAsmount > 0) {
            alert("Budget cannot be deleted because the spent amount is greater than 0. Try deleting from expense");
            return;
        }
        axios.delete(`http://localhost:3001/api/budget/${id}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        });
        const updatedBudgets = budgets.filter((budget) => budget._id !== id);
        setBudgets(updatedBudgets);
        setFilteredBudgets(updatedBudgets);
    };

    const handleEdit = async (event, edit) => {
        event.preventDefault();
        const formData = {
            category: document.getElementById("edit-category").value || edit.category,
            amount: document.getElementById("edit-amount").value || edit.amount,
            spentAmount: edit.spentAmount,
            startDate: document.getElementById("edit-startDate").value || edit.startDate,
            endDate: document.getElementById("edit-endDate").value || edit.endDate,
        };
        const response = await axios.patch(
            `http://localhost:3001/api/budget/${edit._id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        let temp = budgets;
        temp = temp.filter((budget) => budget._id !== edit._id);
        temp.push(response.data.updatedBudget);
        setBudgets(temp);
        setFilteredBudgets(temp);
        setEditVisibility(false);
    };

    const handleFilterChange = (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
        if (category === "All") {
            setFilteredBudgets(budgets);
        } else {
            setFilteredBudgets(budgets.filter(budget => budget.category === category));
        }
    };

    // Get unique categories from budgets
    const getCategories = () => {
        const categories = budgets.map(budget => budget.category);
        return ["All", ...new Set(categories)];
    };

    // Filtered budgets based on date and amount
    const filterBudgets = () => {
        let filtered = budgets;

        // Category filter
        if (selectedCategory && selectedCategory !== "All") {
            filtered = filtered.filter(budget => budget.category === selectedCategory);
        }

        // Date filter
        if (startDateFilter) {
            filtered = filtered.filter(budget => new Date(budget.startDate) >= new Date(startDateFilter));
        }
        if (endDateFilter) {
            filtered = filtered.filter(budget => new Date(budget.endDate) <= new Date(endDateFilter));
        }

        // Amount filter
        if (minAmountFilter) {
            filtered = filtered.filter(budget => budget.amount >= parseFloat(minAmountFilter));
        }
        if (maxSpentAmountFilter) {
            filtered = filtered.filter(budget => budget.spentAmount <= parseFloat(maxSpentAmountFilter));
        }

        setFilteredBudgets(filtered);
    };

    return (
        <>
            <div className="income-component">
                <div className="income">
                    <h2 className="component-income">Submit Budget</h2>
                    <form className="income-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="category"
                            placeholder="Enter Category..."
                            required
                        />
                        <input
                            type="date"
                            id="startDate"
                            placeholder="(Default: Today...)"
                            required
                        />
                        <br />
                        <input
                            type="date"
                            id="endDate"
                            placeholder="(Default: Today...)"
                            required
                        />
                        <br />
                        <input
                            type="number"
                            id="amount"
                            placeholder="Enter Amount..."
                            required
                        />
                        <br />
                        <input
                            type="number"
                            id="spentAmount"
                            placeholder="Enter Spent Amount..."
                            value="0"
                        />
                        <br />
                        <br />
                        <input type="submit" id="submit" />
                    </form>
                </div>

                {/* Filter Dropdown */}
                <div className="filter-section">
                    <h2>Filter by Category</h2>
                    <select value={selectedCategory} onChange={handleFilterChange}>
                        {getCategories().map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <h2>Filter by Date</h2>
                    <label>Start Date:</label>
                    <input 
                        type="date" 
                        value={startDateFilter} 
                        onChange={(e) => setStartDateFilter(e.target.value)} 
                    />
                    <label>End Date:</label>
                    <input 
                        type="date" 
                        value={endDateFilter} 
                        onChange={(e) => setEndDateFilter(e.target.value)} 
                    />

                    <label>Min Spent Amount:</label>
                    <input 
                        type="number" 
                        value={minAmountFilter} 
                        onChange={(e) => setMinAmountFilter(e.target.value)} 
                    />
                    <label>Max Spent Amount:</label>
                    <input 
                        type="number" 
                        value={maxSpentAmountFilter} 
                        onChange={(e) => setMaxSpentAmountFilter(e.target.value)} 
                    />

                    <button onClick={filterBudgets}>Apply Filters</button>
                </div>

                <div className="income-list">
                    <h2 className="component-heading">List of Budgets</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Amount</th>
                                <th>Spent Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBudgets.map((budget) => (
                                <tr key={budget._id}>
                                    <td>{budget.category}</td>
                                    <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(budget.endDate).toLocaleDateString()}</td>
                                    <td>{budget.amount}</td>
                                    <td>{budget.spentAmount}</td>
                                    <td>
                                        <button
                                            className="update"
                                            onClick={() => {
                                                setEditVisibility(true);
                                                setEdit(budget);
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => deleteBudget(budget._id)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showEdit && (
                <div className="income-stats">
                    <div className="edit-income">
                        <h2 className="component-heading">Edit Fields</h2>
                        <form
                            className="update-income-form"
                            onSubmit={(event) => handleEdit(event, edit)}
                        >
                            <input
                                type="text"
                                id="edit-category"
                                placeholder={`${edit.category}`}
                            />
                            <br />
                            <input type="date" id="edit-startDate" placeholder={`${edit.startDate}`} />
                            <input type="date" id="edit-endDate" placeholder={`${edit.endDate}`} />
                            <input
                                type="number"
                                id="edit-amount"
                                placeholder={`${edit.amount}`}
                            />
                            <br />
                            <input type="submit" id="submit" />
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
