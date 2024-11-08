import React, { useEffect, useState } from "react";
import "./Expense.css";
import axios from "axios";

export default function Expense() {
    const [expenses, setExpenses] = useState([]);
    const [edit, setEdit] = useState({
        date: Date.now(),
        amount: 10000,
        category: "Expense Category...",
        description: "Description of your Expense Category...",
    });
    const [showEdit, setEditVisibility] = useState(false);
    const [totalExpense, setTotalExpense] = useState(0);
    const [categories, setCategories] = useState([]);
    const [filteredCategory, setFilteredCategory] = useState("");

    // New state variables for filters
    const [startDate, setStartDate] = useState(""); // For date filtering
    const [endDate, setEndDate] = useState("");       // For date filtering
    const [minAmount, setMinAmount] = useState("");   // For amount filtering
    const [maxAmount, setMaxAmount] = useState("");   // For amount filtering
    const [applyFilters, setApplyFilters] = useState(false); // To apply filters

    useEffect(() => {
        getExpense();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const currentSavings = await getCurrentSavings();
        console.log("current savings " + currentSavings);
        if (currentSavings - amount < 0) {
            alert("Insufficient savings. Cannot add this expense.");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:3001/api/expense",
                {
                    date: document.getElementById("date").value,
                    amount: amount,
                    category: document.getElementById("category").value,
                    description: document.getElementById("description").value,
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );
            const budgetDetails = await axios.get("http://localhost:3001/api/budget", {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            });
        const categories = budgetDetails.data.budgets.map(budget => budget.category);
        console.log(categories);
        const currentCategory = document.getElementById("category").value;
        const currentDate = new Date(document.getElementById("date").value);
        if (categories.includes(currentCategory)) {
            const budgetId = budgetDetails.data.budgets.find(budget => budget.category === currentCategory && currentDate>=new Date(budget.startDate) && currentDate<=new Date(budget.endDate))?._id;
            if (budgetId) {
                console.log("Found budget ID:", budgetId);
                await updateBudget(amount,budgetId);
            }
            
        }

                if (response.status === 201) {
                const newExpense = response.data.newExpense;
                setExpenses([...expenses, newExpense]);
                setTotalExpense(totalExpense + amount);
                if (!categories.includes(newExpense.category)) {
                    setCategories([...categories, newExpense.category]);
                }
            }
            await updateSavings(-response.data.newExpense.amount);
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };
    const updateBudget = async (spentAmount, id) => {
        try {
            const budgetDetails=await axios.get(
                "http://localhost:3001/api/budget",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        }          
            );
            const budget = budgetDetails.data.budgets.find(budget => budget._id === id);
            const newSpentAmount=budget.spentAmount+spentAmount
            const response = await axios.patch(
                `http://localhost:3001/api/budget/${id}`,
                {
                    spentAmount: newSpentAmount, // Decrease the budget by the expense amount
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );
    
            if (response.status === 200) {
                console.log(`Budget updated successfully for category:`);
            }
        } catch (error) {
            console.error("Error updating budget:", error);
        }
    };
    
    const addSavings = async (amount1) => {
        console.log("Adding to savings:", amount1);  // Log before sending request
        if (!amount1) {
            console.error("Amount is invalid");
            return;
        }
        try {
            await axios.post(
                "http://localhost:3001/api/savings",
                { amount: amount1 },
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
        console.log("Updating savings:", amount1);  // Log before sending request
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

    const handleEdit = async (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("edit-amount").value);
        const currentSavings = await getCurrentSavings();
    
        // Calculate the change in amount for savings
        const amountChange = amount - edit.amount;
    
        if (currentSavings - amountChange < 0) {
            alert("Insufficient savings. Cannot edit this expense.");
            return;
        }
    
        try {
            const formData = {
                date: document.getElementById("edit-date").value || edit.date,
                amount: amount,
                category: document.getElementById("edit-category").value || edit.category,
                description: document.getElementById("edit-description").value || edit.description,
            };
    
            const response = await axios.patch(
                `http://localhost:3001/api/expense/${edit._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            const budgetDetails = await axios.get("http://localhost:3001/api/budget", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            const categories = budgetDetails.data.budgets.map(budget => budget.category);
            const oldCategory = edit.category;
            const newCategory = formData.category;
            const oldDate = new Date(edit.date);
            const newDate = new Date(formData.date);
    
            // Update budget if category or date has changed
            if (oldCategory !== newCategory || oldDate.toDateString() !== newDate.toDateString()) {
                // If the category has changed, update the old category's budget
                if (categories.includes(oldCategory)) {
                    const oldBudgetId = budgetDetails.data.budgets.find(budget => budget.category === oldCategory && oldDate>=new Date(budget.startDate) && oldDate<=new Date(budget.endDate))?._id;
                    console.log("old Budget Id "+oldBudgetId)
                    if (oldBudgetId) {
                        await updateBudget(-edit.amount, oldBudgetId); // Decrease old budget
                    }
                }
    
                // Now check for the new category and update its budget
                if (categories.includes(newCategory)) {
                    const newBudgetId = budgetDetails.data.budgets.find(budget => budget.category === newCategory && newDate>=new Date(budget.startDate) && newDate<=new Date(budget.endDate))?._id;
                    console.log("new Budget Id "+newBudgetId)
                    if (newBudgetId) {
                        await updateBudget(amount, newBudgetId); // Increase new budget
                    }
                }
            } else {
                // If only the amount changed but not the category or date
                const currentBudgetId = categories.includes(oldCategory) ? 
                    budgetDetails.data.budgets.find(budget => budget.category === oldCategory)?._id : null;
    
                if (currentBudgetId) {
                    await updateBudget(amount - edit.amount, currentBudgetId); // Adjust existing budget
                }
            }
    
            setExpenses(expenses.map((expense) => (expense._id === edit._id ? response.data.updatedExpense : expense)));
            setTotalExpense(totalExpense - parseFloat(edit.amount) + parseFloat(response.data.updatedExpense.amount));
            setEditVisibility(false);
            await updateSavings(-(response.data.updatedExpense.amount - edit.amount));
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    const getCurrentSavings = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/savings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("API Response:", response.data); // Log the entire response

            // Check if savings data exists in the response
            if (response.data.savings && response.data.savings.length > 0) {
                const savingsData = response.data.savings[0];
                console.log("Savings data found:", savingsData); // Log the savings data
                return savingsData.amount; // Make sure to return the correct property (e.g., amount)
            } else {
                throw new Error("No savings data found in response");
            }
        } catch (err) {
            console.error("Error fetching savings:", err); // Log error details
            return 0; // Return a default value or handle error appropriately
        }
    };

    const getExpense = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/expense", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setExpenses(response.data.expenses);
            calculateTotalExpense(response.data.expenses);
            const uniqueCategories = [
                ...new Set(response.data.expenses.map((expense) => expense.category)),
            ];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/expense/${id}`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const deletedExpense = expenses.find((expense) => expense._id === id);
            if (deletedExpense) {
                setTotalExpense(totalExpense - parseFloat(deletedExpense.amount));
            }
            setExpenses(expenses.filter((expense) => expense._id !== id));
            await addSavings(deletedExpense.amount);
            const budgetDetails = await axios.get("http://localhost:3001/api/budget", {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                });
                const categori = budgetDetails.data.budgets.map(budget => budget.category);
                console.log(categori);
                const currentCategory = deletedExpense.category
                const currentDate = new Date(deletedExpense.date)
                if (categories.includes(currentCategory)) {
                    const budgetId = budgetDetails.data.budgets.find(budget => budget.category === currentCategory && currentDate>=new Date(budget.startDate) && currentDate<=new Date(budget.endDate))?._id;
                    if (budgetId) {
                        console.log("Found budget ID:", budgetId);
                    }
                    await updateBudget(-deletedExpense.amount,budgetId);
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const calculateTotalExpense = (expensesList) => {
        const total = expensesList.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        setTotalExpense(total);
    };

    const handleCategoryChange = (event) => {
        setFilteredCategory(event.target.value);
    };

    // Filtered expenses based on category, date, and amount
    const filteredExpenses = expenses.filter((expense) => {
        // Category filter
        if (filteredCategory && expense.category !== filteredCategory) {
            return false;
        }

        // Date filter
        const expenseDate = new Date(expense.date);
        const isDateInRange = 
            (!startDate || expenseDate >= new Date(startDate)) &&
            (!endDate || expenseDate <= new Date(endDate));

        if (!isDateInRange) {
            return false;
        }

        // Amount filter
        const expenseAmount = parseFloat(expense.amount);
        const isAmountInRange = 
            (!minAmount || expenseAmount >= parseFloat(minAmount)) &&
            (!maxAmount || expenseAmount <= parseFloat(maxAmount));

        return isAmountInRange;
    });

    return (
        <>
            <div className="expense-component">
                <div className="expense">
                    <h2 className="component-expense">Submit Expense</h2>
                    <form className="expense-form" onSubmit={handleSubmit}>
                        <input
                            type="date"
                            id="date"
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
                            type="text"
                            id="category"
                            placeholder="Enter Category..."
                            required
                        />
                        <br />
                        <textarea
                            id="description"
                            placeholder="Enter Description"
                            rows={7}
                            cols={10}
                        />
                        <br />
                        <input type="submit" id="submit" />
                    </form>
                </div>

                <div className="expense-list">
                    <h2 className="component-heading">List of Expenses</h2>

                    {/* Filter UI for category, date, and amount */}
                    <div className="filter-category">
                        <label htmlFor="filter-category">Filter by Category: </label>
                        <select id="filter-category" onChange={handleCategoryChange}>
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-date">
                        <label htmlFor="start-date">Start Date:</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <label htmlFor="end-date">End Date:</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-amount">
                        <label htmlFor="min-amount">Min Amount:</label>
                        <input
                            type="number"
                            id="min-amount"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                        />
                        <label htmlFor="max-amount">Max Amount:</label>
                        <input
                            type="number"
                            id="max-amount"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                        />
                    </div>

                    <button onClick={() => setApplyFilters(true)}>Apply Filters</button>

                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>{expense.amount}</td>
                                    <td>{expense.category}</td>
                                    <td>{expense.description}</td>
                                    <td>
                                        <button
                                            className="update"
                                            onClick={() => {
                                                setEditVisibility(true);
                                                setEdit(expense);
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => deleteExpense(expense._id)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Total Expense: ₹{totalExpense.toFixed(2)}</h3>
                </div>
            </div>

            {showEdit && (
                <div className="edit-expense">
                    <h2 className="component-heading">Edit Expense</h2>
                    <form className="update-expense-form" onSubmit={handleEdit}>
                        <input type="date" id="edit-date" defaultValue={edit.date} />
                        <input type="number" id="edit-amount" defaultValue={edit.amount} />
                        <input type="text" id="edit-category" defaultValue={edit.category} />
                        <textarea id="edit-description" defaultValue={edit.description} />
                        <input type="submit" id="submit" />
                    </form>
                </div>
            )}
        </>
    );
}
