import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await axios.get("http://localhost:5000/layout", {
          params: { username: user.username },
        });
        setLayout(
          response.data.length
            ? response.data
            : [
                { id: "box-1", color: "red", order: 0 },
                { id: "box-2", color: "blue", order: 1 },
                { id: "box-3", color: "green", order: 2 },
                { id: "box-4", color: "yellow", order: 3 },
              ]
        );
      } catch (error) {
        console.error("Error fetching layout:", error);
      }
    };
    fetchLayout();
  }, [user.username]);

  const handleDragStart = (event, draggedIndex) => {
    event.dataTransfer.setData("text/plain", draggedIndex);
  };

  const handleDrop = async (event, droppedIndex) => {
    event.preventDefault();
    const draggedIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);

    if (draggedIndex === droppedIndex) return;

    const updatedLayout = Array.from(layout);
    const [draggedItem] = updatedLayout.splice(draggedIndex, 1);
    updatedLayout.splice(droppedIndex, 0, draggedItem);

    const reorderedLayout = updatedLayout.map((box, index) => ({
      ...box,
      order: index,
    }));

    setLayout(reorderedLayout);

    try {
      await axios.post("http://localhost:5000/layout", {
        username: user.username,
        layout: reorderedLayout,
      });
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="header">
      <h1 className="text-2xl mb-4">Welcome, {user.username}</h1>
      <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        </div>
      {layout.length > 0 ? (
        <div className="grid-container">
          {layout.map((box, index) => (
            <div
              key={box.id}
              className={`box bg-${box.color}`}
              draggable
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, index)}
            >
              <p>{box.id}</p>
              <p>Color: {box.color}</p>
              <p>Order: {box.order}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;

