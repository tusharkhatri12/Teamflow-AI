// src/api.js

export const fetchSummaries = async () => {
    const res = await fetch("http://localhost:3000/summaries");
    if (!res.ok) throw new Error("Failed to fetch summaries");
    return await res.json();
  };

  export const fetchMessages = async () => {
    const res = await fetch("http://localhost:3000/messages");
    if (!res.ok) throw new Error("Failed to fetch messages");
    return await res.json();
  };

  export const fetchMemory = async () => {
    const res = await fetch("http://localhost:3000/memory");
    if (!res.ok) throw new Error("Failed to fetch memory");
    return await res.json()
  };