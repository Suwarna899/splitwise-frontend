import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Expenses({ token, username, selectedGroup, groupMembers }) {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState(username);

  const getExpenses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/expenses/list/${selectedGroup}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (err) { setExpenses([]); }
  };

  useEffect(() => { 
    if (selectedGroup) {
      getExpenses();
      setPayer(username);
    }
  }, [selectedGroup, username]);

  // --- PERFECT MATH LOGIC ---
  const { summary, totalSpent } = useMemo(() => {
    const stats = {};
    let total = 0;
    
    // Initialize everyone at 0
    groupMembers.forEach(m => stats[m] = 0);

    expenses.forEach(exp => {
      const val = Number(exp.amount);
      total += val;
      
      const numMembers = groupMembers.length;
      if (numMembers === 0) return;

      // 1. Calculate base share by rounding DOWN to 2 decimals
      // This prevents "creating" pennies out of thin air
      const share = Math.floor((val / numMembers) * 100) / 100;
      
      // 2. Find the remainder (the cents left over)
      // Example: 2000 - (666.66 * 3) = 0.02
      const totalAllocated = share * numMembers;
      const remainder = Number((val - totalAllocated).toFixed(2));

      // 3. Credit the Payer the full amount
      if (stats.hasOwnProperty(exp.paidBy)) {
        stats[exp.paidBy] += val;
      }

      // 4. Debit everyone the base share
      groupMembers.forEach((m, index) => {
        stats[m] -= share;
        
        // 5. PENNY ADJUSTMENT: Give the remainder to the first member 
        // This ensures: Sum of Debits === Sum of Credits
        if (index === 0) {
          stats[m] -= remainder; 
        }
      });
    });

    return { summary: stats, totalSpent: total };
  }, [expenses, groupMembers]);

  const addExpense = async () => {
    if (!desc || !amount || amount <= 0) return alert("Please enter valid details");
    try {
      await axios.post("http://localhost:5000/expenses/add", 
        { groupId: selectedGroup, description: desc, amount: Number(amount), paidBy: payer },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setDesc(""); setAmount(""); getExpenses();
    } catch (err) { alert("Error adding expense"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:5000/expenses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getExpenses();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Group Spend Bar */}
      <div style={{ background: "#2c3e50", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <strong>Group Total: ${totalSpent.toFixed(2)}</strong>
      </div>

      

      {/* Summary Grid */}
      <h3 style={{fontSize: '16px', color: '#555'}}>Individual Balances</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(summary).map(([name, bal]) => (
          <div key={name} style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "bold" }}>{name === username ? "YOU" : name.toUpperCase()}</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: bal >= 0 ? "#27ae60" : "#e74c3c" }}>
              {bal >= 0 ? `+ $${bal.toFixed(2)}` : `- $${Math.abs(bal).toFixed(2)}`}
            </div>
          </div>
        ))}
      </div>

      {/* Expense Form */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
        <input placeholder="What did you buy?" value={desc} onChange={e => setDesc(e.target.value)} style={{ flex: 2, padding: "10px", borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={payer} onChange={(e) => setPayer(e.target.value)} style={{ padding: "10px", borderRadius: '4px' }}>
          {groupMembers.map(m => <option key={m} value={m}>{m === username ? "You" : m} paid</option>)}
        </select>
        <button onClick={addExpense} style={{ background: "#27ae60", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: 'bold' }}>Add</button>
      </div>

      {/* History */}
      <div style={{ border: "1px solid #eee", borderRadius: "8px", background: '#fff' }}>
        {expenses.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#999'}}>No expenses yet.</p>}
        {expenses.map(exp => (
          <div key={exp._id} style={{ display: "flex", justifyContent: "space-between", padding: "15px", borderBottom: "1px solid #eee" }}>
            <div>
              <div style={{fontWeight: 'bold'}}>{exp.description}</div>
              <div style={{fontSize: '12px', color: '#999'}}>Paid by {exp.paidBy}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontWeight: "bold", fontSize: '18px' }}>${Number(exp.amount).toFixed(2)}</span>
              <button onClick={() => handleDelete(exp._id)} style={{ border: 'none', background: 'none', cursor: "pointer", fontSize: '18px' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}