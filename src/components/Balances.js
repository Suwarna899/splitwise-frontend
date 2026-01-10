import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Balances({ token, groups = [], selectedGroup, setSelectedGroup }) {
  const [balances, setBalances] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/balances/summary/${selectedGroup}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data || {});
    } catch (err) {
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [selectedGroup]);

  return (
    <div>
      <h3>Group Summary</h3>
      {/* ... select dropdown ... */}

      {loading ? <p>Calculating...</p> : (
        <ul>
          {Object.entries(summary).map(([user, bal]) => {
            // FIX: Force to Number and default to 0 if NaN/undefined
            const numericBal = Number(bal) || 0; 
            return (
              <li key={user}>
                <b>{user}</b>: {numericBal >= 0 ? "Gets back " : "Owes "} 
                ₹{Math.abs(numericBal).toFixed(2)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}