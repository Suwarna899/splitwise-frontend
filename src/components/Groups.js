import React from "react";

export default function Groups({ groups, setSelectedGroup, selectedGroup }) {
  // Safety check
  if (!Array.isArray(groups)) return <p>Loading groups...</p>;

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
        Select Group:
      </label>
      <select 
        value={selectedGroup || ""} 
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        <option value="" disabled>-- Choose a Group --</option>
        {groups.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  );
}