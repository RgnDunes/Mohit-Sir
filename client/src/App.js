import "./App.css";
import Button from "./components/Button";
import { useEffect, useState, useRef } from "react";
import {
  buttonhandler,
  getAddition,
  getSubtraction,
} from "./service/fetchData.js";
// Import socket.io-client
import io from "socket.io-client";
import axios from "axios";

export default function App() {
  const [added, setAdded] = useState(0);
  const [subtracted, setSubtracted] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Click me");
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // Socket reference to maintain connection
  const socketRef = useRef(null);

  async function buttonClick() {
    const buttonLabel = await buttonhandler();
    setButtonLabel(buttonLabel);
  }

  async function addNumbers() {
    const input1 = document.querySelector('input[placeholder="input 1"]').value;
    const input2 = document.querySelector('input[placeholder="input 2"]').value;
    const response = await getAddition(input1, input2);
    setAdded(response.sum);
  }

  async function subtractNumbers() {
    const input1 = document.querySelector('input[placeholder="input 3"]').value;
    const input2 = document.querySelector('input[placeholder="input 4"]').value;
    const response = await getSubtraction(input1, input2);
    setSubtracted(response.diff);
  }

  // Send a notification through the WebSocket
  const sendNotification = () => {
    if (socketRef.current && newMessage.trim()) {
      socketRef.current.emit("send-notification", { message: newMessage });
      // Add your own message to the list
      setNotifications((prev) => [
        ...prev,
        {
          message: newMessage,
          timestamp: new Date().toISOString(),
          isOwnMessage: true,
        },
      ]);
      setNewMessage("");
    }
  };

  // Send notification through REST API
  const sendSystemNotification = async () => {
    if (newMessage.trim()) {
      try {
        await axios.post("http://localhost:3000/api/notify", {
          message: newMessage,
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error sending system notification:", error);
      }
    }
  };

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    // Listen for notifications
    socket.on("notification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="App">
        <h1>Notification Service</h1>
        <Button label={buttonLabel} onClick={buttonClick} />
      </div>
      <div className="content">
        <input type="text" placeholder="input 1" />
        <input type="text" placeholder="input 2" />
        <button label="Add" onClick={addNumbers}>
          Add
        </button>
        <input type="text" value={added} readOnly />
      </div>
      <div className="content">
        <input type="text" placeholder="input 3" />
        <input type="text" placeholder="input 4" />
        <button label="Subtract" onClick={subtractNumbers}>
          Subtract
        </button>
        <input type="text" value={subtracted} readOnly />
      </div>

      {/* Notification Section */}
      <div
        className="notification-section"
        style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}
      >
        <h2>Notifications</h2>

        <div className="notification-form" style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your notification here..."
            style={{ width: "300px", marginRight: "10px" }}
          />
          <button onClick={sendNotification}>Send Notification</button>
          <button
            onClick={sendSystemNotification}
            style={{ marginLeft: "10px" }}
          >
            Send System Notification
          </button>
        </div>

        <div
          className="notification-list"
          style={{ maxHeight: "300px", overflow: "auto" }}
        >
          {notifications.length === 0 ? (
            <p>No notifications yet</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    backgroundColor: notification.isSystem
                      ? "#f0f8ff"
                      : notification.isOwnMessage
                      ? "#e6ffe6"
                      : "#f9f9f9",
                    borderRadius: "5px",
                  }}
                >
                  <div>
                    <strong>{notification.message}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {notification.sender
                      ? `From: ${notification.sender} • `
                      : ""}
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
