import React, { useEffect, useState } from "react";
import "./Goals.css";
import axios from "axios";

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [filter, setFilter] = useState(''); // State to store selected goal name filter
    const [startDateFilter, setStartDateFilter] = useState(''); // State for start date filter
    const [endDateFilter, setEndDateFilter] = useState(''); // State for end date filter
    const [currentAmountMinFilter, setCurrentAmountMinFilter] = useState(''); // State for min current amount filter
    const [currentAmountMaxFilter, setCurrentAmountMaxFilter] = useState(''); // State for max current amount filter
    const [edit, setEdit] = useState({
        goalName: "Goal 1",
        targetAmount: 10000,
        currentAmount: 100,
        startDate: Date.now(),
        targetDate: Date.now(),
        description: "Description of your Goal...",
    });
    const [showEdit, setEditVisibility] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("currentAmount").value);
        const targetAmount = parseFloat(document.getElementById("targetAmount").value);

        const currentSavings = await getCurrentSavings();
        console.log("current savings " + currentSavings);
        if (currentSavings - amount < 0) {
            alert("Insufficient savings. Cannot add this Goal.");
            return;
        }
        else if(amount>targetAmount)
        {
            alert("Current amount cannot be greater than target amount.");
            return;
        }

        const response = await axios.post(
            "http://localhost:3001/api/goal",
            {
                goalName: document.getElementById("goalName").value,
                targetAmount: document.getElementById("targetAmount").value,
                currentAmount: document.getElementById("currentAmount").value,
                startDate: document.getElementById("startDate").value,
                targetDate: document.getElementById("targetDate").value,
                description: document.getElementById("description").value,
            },
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            }
        );
        if (response.status === 201) {
            setGoals([...goals, response.data.goal]);
        }
        console.log(response.data.goal.currentAmount)
        await updateSavings(-response.data.goal.currentAmount);

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

    const getGoal = async () => {
        const response = await axios.get("http://localhost:3001/api/goal", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setGoals(response.data.goals);
    };

    useEffect(() => {
        getGoal();
    }, []);

    const deleteGoal = (id) => {
        const temp=goals.find((goal) => goal._id== id)
        axios.delete(`http://localhost:3001/api/goal/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setGoals(goals.filter((goal) => goal._id !== id));
        console.log(temp.currentAmount)
        addSavings(temp.currentAmount)
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

    const handleEdit = async (event, edit) => {
        event.preventDefault();
        
        const currentAmount = parseFloat(document.getElementById("edit-currentAmount").value) || edit.currentAmount;
        const targetAmount = parseFloat(document.getElementById("edit-targetAmount").value) || edit.targetAmount;
    
        const formData = {
            goalName: document.getElementById("edit-goalName").value || edit.goalName,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            startDate: document.getElementById("edit-startDate").value || edit.startDate,
            targetDate: document.getElementById("edit-targetDate").value || edit.targetDate,
            description: document.getElementById("edit-description").value || edit.description,
        };
    
        const currentSavings = await getCurrentSavings();
        const amountChange = currentAmount - edit.currentAmount;
    
        // Check for valid savings
        if (currentSavings - amountChange < 0) {
            alert("Insufficient savings. Cannot edit this Goal.");
            return;
        }
    
        // Check if current amount is greater than the target amount
        if (currentAmount > targetAmount) {
            alert("Current Amount cannot be greater than Target Amount.");
            return;
        }
    
        // Proceed with the update if all checks pass
        const response = await axios.patch(
            `http://localhost:3001/api/goal/${edit._id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
    
        // Update goals after patching
        let temp = goals.filter((goal) => goal._id !== edit._id);
        temp.push(response.data.updatedGoal);
        setGoals(temp);
    
        // Hide edit form
        setEditVisibility(false);
    
        // Update savings
        const updatedCurrentAmount = response.data.updatedGoal.currentAmount;
        console.log(-(updatedCurrentAmount - edit.currentAmount));
        await updateSavings(-(updatedCurrentAmount - edit.currentAmount));
    };
    
    // Function to get unique goal names
    const getUniqueGoalNames = () => {
        const names = goals.map((goal) => goal.goalName);
        return [...new Set(names)]; // Return unique goal names
    };

    // Function to filter goals based on selected name, date range, and current amount
    const filteredGoals = goals.filter((goal) => {
        const isNameMatch = filter === '' || goal.goalName === filter;

        const isStartDateMatch = startDateFilter ? new Date(goal.startDate) >= new Date(startDateFilter) : true;
        const isEndDateMatch = endDateFilter ? new Date(goal.targetDate) <= new Date(endDateFilter) : true;

        const isCurrentAmountMinMatch = currentAmountMinFilter ? goal.currentAmount >= parseFloat(currentAmountMinFilter) : true;
        const isCurrentAmountMaxMatch = currentAmountMaxFilter ? goal.currentAmount <= parseFloat(currentAmountMaxFilter) : true;

        return isNameMatch && isStartDateMatch && isEndDateMatch && isCurrentAmountMinMatch && isCurrentAmountMaxMatch;
    });

    return (
        <>
            <div className="income-component">
                <div className="income">
                    <h2 className="component-income">Submit Goal</h2>
                    <form className="income-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="goalName"
                            placeholder="(Default: Goal 1...)"
                            required
                        />{" "}
                        <br />
                        <input
                            type="number"
                            id="targetAmount"
                            placeholder="Enter target Amount..."
                            required
                        />{" "}
                        <br />
                        <input
                            type="number"
                            id="currentAmount"
                            placeholder="Enter current Amount..."
                            required
                        />{" "}
                        <br />
                        <input
                            type="date"
                            id="startDate"
                            placeholder="(Default: Today...)"
                            required
                        />{" "}
                        <br />
                        <input
                            type="date"
                            id="targetDate"
                            placeholder="(Default: Today...)"
                            required
                        />{" "}
                        <br />
                        <textarea
                            id="description"
                            placeholder="Enter Description"
                            rows={7}
                            cols={10}
                        />{" "}
                        <br />
                        <input type="submit" id="submit" />
                    </form>
                </div>

                <div className="income-list">
                    <h2 className="component-heading">List of Goals</h2>

                    {/* Goal Name Dropdown Filter */}
                    <div className="filter-container">
                        <label htmlFor="goalFilter">Filter by Goal Name:</label>
                        <select
                            id="goalFilter"
                            onChange={(e) => setFilter(e.target.value)} // Set filter value
                            value={filter}
                        >
                            <option value="">All</option>
                            {getUniqueGoalNames().map((name, index) => (
                                <option key={index} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filters */}
                    <div className="date-filter-container">
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
                    </div>

                    {/* Current Amount Filters */}
                    <div className="current-amount-filter-container">
                        <label>Min Current Amount:</label>
                        <input 
                            type="number" 
                            value={currentAmountMinFilter} 
                            onChange={(e) => setCurrentAmountMinFilter(e.target.value)} 
                        />
                        <label>Max Current Amount:</label>
                        <input 
                            type="number" 
                            value={currentAmountMaxFilter} 
                            onChange={(e) => setCurrentAmountMaxFilter(e.target.value)} 
                        />
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Goal Name</th>
                                <th>Target Amount</th>
                                <th>Current Amount</th>
                                <th>Start Date</th>
                                <th>Target Date</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGoals.map((goal) => (
                                <tr key={goal._id}>
                                    <td>{goal.goalName}</td>
                                    <td>{goal.targetAmount}</td>
                                    <td>{goal.currentAmount}</td>
                                    <td>{new Date(goal.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(goal.targetDate).toLocaleDateString()}</td>
                                    <td>{goal.description}</td>
                                    <td>
                                        <button
                                            className="update"
                                            onClick={() => {
                                                setEditVisibility(true);
                                                setEdit(goal);
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => deleteGoal(goal._id)}
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
                                id="edit-goalName"
                                placeholder={`${edit.goalName}`}
                            />
                            <br />
                            <input type="date" id="edit-startDate" placeholder={`${edit.startDate}`} />
                            <input type="date" id="edit-targetDate" placeholder={`${edit.targetDate}`} />
                            <input
                                type="number"
                                id="edit-targetAmount"
                                placeholder={`${edit.targetAmount}`}
                            />
                            <input
                                type="number"
                                id="edit-currentAmount"
                                placeholder={`${edit.currentAmount}`}
                            />
                            <textarea
                                id="edit-description"
                                placeholder={`${edit.description}`}
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
