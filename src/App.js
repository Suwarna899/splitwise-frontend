import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Groups from "./components/Groups"; 
import Expenses from "./components/Expenses";

const API_URL = "https://splitwise-backend-ten.vercel.app";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  
  const [newGroupName, setNewGroupName] = useState("");
  const [memberInput, setMemberInput] = useState(""); 

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setUsername("");
    setSelectedGroup("");
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    try {
      // Updated to use API_URL
      const res = await axios.get(`${API_URL}/groups/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [token, handleLogout]);

  useEffect(() => {
    if (token) fetchGroups();
  }, [token, fetchGroups]);

  const handleAuth = async () => {
    const path = isRegister ? "register" : "login";
    try {
      // Updated to use API_URL
      const res = await axios.post(`${API_URL}/auth/${path}`, formData);
      if (!isRegister) {
        setToken(res.data.token);
        setUsername(res.data.username);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
      } else {
        alert("Registration successful! Now please login.");
        setIsRegister(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed.");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName) return alert("Enter group name");
    if (!token) return alert("Please login again.");

    try {
      const friends = memberInput
        .split(",")
        .map(m => m.trim()) 
        .filter(m => m !== "" && m.toLowerCase() !== username.toLowerCase()); 

      const allMembers = [username, ...friends];

      // Updated to use API_URL
      await axios.post(`${API_URL}/groups/create`, 
        { name: newGroupName, members: allMembers },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setNewGroupName("");
      setMemberInput("");
      fetchGroups();
      alert("Group created!");
    } catch (err) {
      alert("Error creating group. Please try again.");
    }
  };

  // ... (rest of your UI code remains the same)
  if (!token) {
    return (
      <div style={{ padding: "50px", textAlign: "center", maxWidth: "400px", margin: "auto" }}>
        <h2>{isRegister ? "Create Account" : "Login"}</h2>
        <input 
          placeholder="Username" 
          autoComplete="off"
          onChange={e => setFormData({...formData, username: e.target.value})} 
          style={{display:'block', width: '100%', margin:'10px 0', padding:'10px'}} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          style={{display:'block', width: '100%', margin:'10px 0', padding:'10px'}} 
        />
        <button onClick={handleAuth} style={{width:'100%', padding:'10px', background:'#28a745', color:'#fff', border:'none', cursor:'pointer'}}>
          {isRegister ? "Sign Up" : "Sign In"}
        </button>
        <p onClick={() => setIsRegister(!isRegister)} style={{cursor:'pointer', color:'blue', marginTop:'15px'}}>
          {isRegister ? "Have an account? Login" : "Need an account? Register"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h1>Splitwise Clone</h1>
        <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
           <span>Welcome, <strong>{username}</strong></span>
           <button onClick={handleLogout} style={{background:'#ff4444', color:'#fff', border:'none', padding:'5px 15px', borderRadius: "5px", cursor: "pointer"}}>Logout</button>
        </div>
      </div>

      <div style={{ background: "#f0f0f0", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
        <h3>Create New Group</h3>
        <input placeholder="Trip/Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} style={{padding:'8px'}} />
        <input 
          placeholder="Friends (e.g. Amit, Rahul)" 
          value={memberInput} 
          onChange={e => setMemberInput(e.target.value)} 
          style={{padding:'8px', marginLeft:'10px', width:'250px'}} 
        />
        <button onClick={handleCreateGroup} style={{marginLeft:'10px', padding:'8px 15px', background:'green', color:'white', border: "none", borderRadius: "4px", cursor: "pointer"}}>Create</button>
      </div>

      <Groups groups={groups} setSelectedGroup={setSelectedGroup} />

      {selectedGroup && (
        <Expenses 
          token={token} 
          username={username} 
          selectedGroup={selectedGroup} 
          groupMembers={groups.find(g => g._id === selectedGroup)?.members || [username]} 
        />
      )}
    </div>
  );
}