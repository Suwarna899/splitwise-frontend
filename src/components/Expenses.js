import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

// Live Vercel Backend URL
const API_URL = "https://splitwise-backend-ten.vercel.app";

export default function Expenses({ token, username, selectedGroup, groupMembers }) {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState(username);

  const getExpenses = async () => {
    try {
      // Updated: Replaced localhost with API_URL
      const res = await axios.get(`${API_URL}/expenses/list/${selectedGroup}`, {
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

  // --- YOUR PERFECT MATH LOGIC (Preserved) ---
  const { summary, totalSpent } = useMemo(() => {
    const stats = {};
    let total = 0;
    groupMembers.forEach(m => stats[m] = 0);

    expenses.forEach(exp => {
      const val = Number(exp.amount);
      total += val;
      const numMembers = groupMembers.length;
      if (numMembers === 0) return;

      const share = Math.floor((val / numMembers) * 100) / 100;
      const totalAllocated = share * numMembers;
      const remainder = Number((val - totalAllocated).toFixed(2));

      if (stats.hasOwnProperty(exp.paidBy)) {
        stats[exp.paidBy] += val;
      }

      groupMembers.forEach((m, index) => {
        stats[m] -= share;
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
      // Updated: Replaced localhost with API_URL
      await axios.post(`${API_URL}/expenses/add`, 
        { groupId: selectedGroup, description: desc, amount: Number(amount), paidBy: payer },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setDesc(""); setAmount(""); getExpenses();
    } catch (err) { alert("Error adding expense"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      // Updated: Replaced localhost with API_URL
      await axios.delete(`${API_URL}/expenses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getExpenses();
    } catch (err) { alert("Delete failed"); }
  };

  // ... (Rest of your UI code)
  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ background: "#2c3e50", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <strong>Group Total: ₹{totalSpent.toFixed(2)}</strong>
      </div>

      <h3 style={{fontSize: '16px', color: '#555'}}>Individual Balances</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(summary).map(([name, bal]) => (
          <div key={name} style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#888", fontWeight: "bold" }}>{name === username ? "YOU" : name.toUpperCase()}</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: bal >= 0 ? "#27ae60" : "#e74c3c" }}>
              {bal >= 0 ? `+ ₹${bal.toFixed(2)}` : `- ₹${Math.abs(bal).toFixed(2)}`}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
        <input placeholder="What did you buy?" value={desc} onChange={e => setDesc(e.target.value)} style={{ flex: 2, padding: "10px", borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={payer} onChange={(e) => setPayer(e.target.value)} style={{ padding: "10px", borderRadius: '4px' }}>
          {groupMembers.map(m => <option key={m} value={m}>{m === username ? "You" : m} paid</option>)}
        </select>
        <button onClick={addExpense} style={{ background: "#27ae60", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: 'bold' }}>Add</button>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: "8px", background: '#fff' }}>
        {expenses.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#999'}}>No expenses yet.</p>}
        {expenses.map(exp => (
          <div key={exp._id} style={{ display: "flex", justifyContent: "space-between", padding: "15px", borderBottom: "1px solid #eee" }}>
            <div>
              <div style={{fontWeight: 'bold'}}>{exp.description}</div>
              <div style={{fontSize: '12px', color: '#999'}}>Paid by {exp.paidBy}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontWeight: "bold", fontSize: '18px' }}>₹{Number(exp.amount).toFixed(2)}</span>
              <button onClick={() => handleDelete(exp._id)} style={{ border: 'none', background: 'none', cursor: "pointer", fontSize: '18px' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}