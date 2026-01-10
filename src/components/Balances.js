import React, { useState, useEffect } from "react";
import axios from "axios";

// Live Vercel Backend URL
const API_URL = "https://splitwise-backend-ten.vercel.app";

export default function Balances({ token, groups = [], selectedGroup, setSelectedGroup }) {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      // Updated: Replaced localhost with API_URL
      const res = await axios.get(`${API_URL}/balances/summary/${selectedGroup}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data || {});
    } catch (err) {
      console.error("Balance fetch error:", err);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [selectedGroup]);

  return (
    <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginTop: "20px" }}>
      <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Group Summary</h3>

      {loading ? (
        <p>Calculating balances...</p>
      ) : Object.keys(summary).length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(summary).map(([user, bal]) => {
            const numericBal = Number(bal) || 0; 
            const isPositive = numericBal >= 0;
            
            return (
              <li key={user} style={{ padding: "8px 0", borderBottom: "1px solid #fafafa" }}>
                <b>{user}</b>: 
                <span style={{ color: isPositive ? "#28a745" : "#dc3545", marginLeft: "5px" }}>
                  {isPositive ? "Gets back " : "Owes "} 
                  ₹{Math.abs(numericBal).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p style={{ color: "#888" }}>No transactions found for this group.</p>
      )}
    </div>
  );
}