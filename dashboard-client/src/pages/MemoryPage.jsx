import React, { useEffect, useState } from "react";
import { fetchMemory } from "../api";

const MemoryPage = () => {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    fetchMemory().then(setMemories).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Memory / AI Knowledge</h2>
      {memories.map((item, idx) => (
        <div key={idx} style={{
          backgroundColor: "#212121",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "8px"
        }}>
          <strong>Topic:</strong> {item.topic}
          <br />
          <strong>Memory:</strong> {item.details}
        </div>
      ))}
    </div>
  );
};

export default MemoryPage;
