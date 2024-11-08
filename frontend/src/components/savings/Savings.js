import React, { useEffect, useState } from "react";
import "./Savings.css";
import axios from "axios";

export default function Savings() {
    const [savings, setSavings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch savings data
    const fetchSavings = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/savings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("API Response:", response.data); // Log the entire response
            
            // Check if savings data exists in the response
            if (response.data.savings && response.data.savings.length > 0) {
                console.log("Savings data found:", response.data.savings);
                setSavings(response.data.savings[0]); // Access the first element of the array
            } else {
                throw new Error("No savings data found in response");
            }
        } catch (err) {
            console.error("Error fetching savings:", err); // Log error details
            setError(err.response ? err.response.data.message : "No savings Found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavings();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="savings-container">
            <h1>Your Savings</h1>
            {savings ? (
                <div className="savings-details">
                    <p><strong>Total Savings:</strong> ₹{savings.amount}</p> {/* Formatting to 2 decimal places */}
                </div>
            ) : (
                <p>No savings found.</p>
            )}
        </div>
    );
}