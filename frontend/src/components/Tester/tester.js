import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockItem from '../StockItem/stockItem'; // Ensure the correct path for StockItem

function App() {
  const [name, setName] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0); // Track highlighted suggestion

  const handleChange = async (event) => {
    const inputName = event.target.value;
    setName(inputName);
    setError('');

    if (inputName.length > 0) {
      try {
        const searchResponse = await axios.get(`https://finnhub.io/api/v1/search?q=${inputName}&token=cs93nipr01qu0vk4lm20cs93nipr01qu0vk4lm2g`);
        setSuggestions(searchResponse.data.result);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmitStock = async (event) => {
    event.preventDefault();
    const apiKey = "cs93nipr01qu0vk4lm20cs93nipr01qu0vk4lm2g";

    try {
      const searchResponse = await axios.get(`https://finnhub.io/api/v1/search?q=${name}&token=${apiKey}`);
      if (searchResponse.data.count === 0) {
        throw new Error('No stock found with that name.');
      }
      const symbol = searchResponse.data.result[0].symbol;

      const priceResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const profileResponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`);

      const combinedData = {
        name: profileResponse.data.name,
        symbol: symbol,
        price: priceResponse.data.c,
        high: priceResponse.data.h,
        low: priceResponse.data.l,
        open: priceResponse.data.o,
        prevClose: priceResponse.data.pc,
      };

      setStockData(combinedData);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Error fetching stock data. Please check the name.");
      setStockData(null);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion.description); // Use description for display
    setSuggestions([]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === 'Enter') {
      // Select highlighted suggestion
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmitStock}>
        <label>
          Stock Name:
          <input 
            type="text" 
            value={name} 
            onChange={handleChange} 
            onKeyDown={handleKeyDown} // Handle keyboard navigation
          />
        </label>
        <input type="submit" value="Get Price" />
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {suggestions.length > 0 && (
          <ul>
            {suggestions.map((suggestion, index) => (
              <li 
                key={suggestion.symbol} 
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ 
                  backgroundColor: highlightedIndex === index ? '#d3d3d3' : 'white' // Highlight selected suggestion
                }}
              >
                {suggestion.description} ({suggestion.symbol})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        {stockData && <StockItem {...stockData} />}
      </div>
      <Investment stockData={stockData} />
    </div>
  );
}

function Investment({ stockData }) {
  const [investments, setInvestments] = useState([]);
  const [edit, setEdit] = useState({
    investmentName: "Investment 1",
    amountInvested: 10, // Change amountInvested to quantity
    currentValue: 200, // This will be calculated
    startDate: Date.now(),
    description: "Description of your Investment...",
  });
  const [showEdit, setEditVisibility] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const quantity = document.getElementById("quantity").value;
    const currentValue = stockData ? stockData.price * quantity : 0; // Calculate currentValue based on quantity

    const response = await axios.post(
      "http://localhost:3001/api/saving",
      {
        investmentName: stockData ? stockData.name : '',
        amountInvested: quantity, // Send quantity instead of amountInvested
        currentValue: currentValue,
        startDate: document.getElementById("startDate").value,
        description: document.getElementById("description").value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    if (response.status === 201) {
      setInvestments([...investments, response.data.investment]);
    }
  };

  const getInvestment = async () => {
    const response = await axios.get("http://localhost:3001/api/saving", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setInvestments(response.data.investments);
  };

  useEffect(() => {
    getInvestment();
  }, []);

  const deleteInvestment = (id) => {
    axios.delete(`http://localhost:3001/api/investment/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setInvestments(investments.filter((investment) => investment._id !== id));
  };

  const handleEdit = async (event, edit) => {
    event.preventDefault();
    const formData = {
      investmentName: document.getElementById("edit-investmentName").value || edit.investmentName,
      amountInvested: document.getElementById("edit-quantity").valueAsNumber || edit.quantity, // Change to quantity
      currentValue: document.getElementById("edit-currentValue").valueAsNumber || edit.currentValue,
      startDate: document.getElementById("edit-startDate").value || edit.startDate,
      description: document.getElementById("edit-description").value || edit.description,
    };
    const response = await axios.patch(
      `http://localhost:3001/api/saving/${edit._id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    let temp = investments;
    temp = temp.filter((investment) => investment._id !== edit._id);
    temp.push(response.data.investment);
    setInvestments(temp);
    setEditVisibility(false);
  };

  return (
    <>
      <div className="income-component">
        <div className="income">
          <h2 className="component-income">Submit Investment</h2>
          <form className="income-form" onSubmit={handleSubmit}>
            <input
              type="text"
              id="investmentName"
              placeholder="Enter investmentName..."
              required
              defaultValue={stockData ? stockData.name : ''}
            />{" "}
            <br />
            <input
              type="number"
              id="quantity"
              placeholder="Enter quantity..."
              required
            />{" "}
            <br />
            <input
              type="number"
              id="currentValue"
              placeholder="Enter current Value..."
              value={stockData ? stockData.price : 0}
              readOnly
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
          <h2 className="component-heading">Investments</h2>
          <table>
            <thead>
              <tr>
                <th>Investment Name</th>
                <th>Quantity</th>
                <th>Current Value</th>
                <th>Start Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => (
                <tr key={investment._id}>
                  <td>{investment.investmentName}</td>
                  <td>{investment.amountInvested}</td>
                  <td>{investment.currentValue}</td>
                  <td>{investment.startDate}</td>
                  <td>{investment.description}</td>
                  <td>
                    <button
                      className="update"
                      onClick={() => {
                        setEditVisibility(true);
                        setEdit(investment);
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteInvestment(investment._id)}
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
                id="edit-investmentName"
                placeholder={`${edit.investmentName}`}
              />
              <input
                type="number"
                id="edit-quantity"
                placeholder={`${edit.quantity}`} // Update placeholder to quantity
              />
              <input
                type="number"
                id="edit-currentValue"
                placeholder={`${edit.currentValue}`}
              />
              <input type="date" id="edit-startDate" placeholder={`${edit.startDate}`} />
              <br />
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

export default App;
