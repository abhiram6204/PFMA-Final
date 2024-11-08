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
      const currentSavings = await getCurrentSavings();
      console.log("current savings "+currentSavings)
      if (currentSavings - currentValue < 0) {
          alert("Insufficient savings. Cannot add this Investment please change your investment amount or delete some.");
          return;
      }
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
      await updateSavings(-currentValue);
      if (response.status === 201) {
        setInvestments([...investments, response.data.investment]);
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
          { amount:amount1 }, 
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
      axios.delete(`http://localhost:3001/api/saving/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const deletedInvestment=investments.filter((investment) => investment._id == id)
      setInvestments(investments.filter((investment) => investment._id !== id));
      console.log("Deleted investment worth: ", deletedInvestment[0].currentValue);
      addSavings(deletedInvestment[0].currentValue)
    };
  
    const handleEdit = async (event, edit) => {
      event.preventDefault();
    
      // Get the new quantity from the input
      const newQuantity = document.getElementById("edit-quantity").valueAsNumber || edit.amountInvested;
    
      // Calculate the new current value based on the stock price and the new quantity
      const currentValue = stockData ? stockData.price * newQuantity : 0; // Calculate currentValue based on new quantity
      const currentSavings = await getCurrentSavings();
    
      // Calculate the change in amount for savings
      const amountChange = currentSavings - (edit.currentValue - currentValue); // Adjusted logic for checking savings
      if (amountChange < 0) {
          alert("Insufficient savings. Cannot edit this expense.");
          return;
      }
    
      const formData = {
        investmentName: document.getElementById("edit-investmentName").value || edit.investmentName,
        amountInvested: newQuantity, // Update to use the new quantity
        currentValue: currentValue, // Use the calculated current value
        startDate: document.getElementById("edit-startDate").value || edit.startDate,
        description: document.getElementById("edit-description").value || edit.description,
      };
      
      // Make the API call to update the investment
      const response = await axios.patch(
        `http://localhost:3001/api/saving/${edit._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    
      console.log("Response from server:", response.data); // Log the response to inspect
    
      // Update the investments list
      let temp = investments.filter((investment) => investment._id !== edit._id);
      temp.push(response.data.investment);
    
      // Calculate the updated current value for the edited investment
      const updatedInvestment = response.data.investment;
      const savingsChange = updatedInvestment.currentValue - edit.currentValue; // Calculate the change in current value
    
      // Update savings
      await updateSavings(-savingsChange);
    
      setInvestments(temp);
      setEditVisibility(false);
    };
    const getCurrentSavings = async () => {
    try {
        const response = await axios.get("http://localhost:3001/api/savings", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
  
        console.log("API Response:", response.data); 
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