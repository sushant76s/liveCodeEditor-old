import React, { useEffect, useState } from "react";
import ACTIONS from "../Actions";

const Chat = ({ isOpen, onClose, socketRef, roomId, username }) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    const newMessage = { username, message };
    setAllMessages([...allMessages, newMessage]);
    socketRef.current.emit(ACTIONS.MESSAGE, {
      roomId,
      message,
      username,
    });
    setMessage("");
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.MESSAGE, ({ messages }) => {
        const filteredMessage = messages.filter(
          (msg) => msg.username !== username
        );

        setAllMessages((prevMessages) => [...prevMessages, ...filteredMessage]);
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.MESSAGE);
    };
  }, [socketRef.current]);

  return (
    <div className={`chatPanel ${isOpen ? "open" : ""}`}>
      <div className="chatHeader">
        <div className="chatHeaderName">
          <h3 className="chatHeaderText">Chat Room</h3>
        </div>
        <div className="chatHeaderBtn">
          <button className="btn closeBtn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="messageContainer">
        <ul className="messageList">
          {allMessages.map((msg, index) => (
            <li
              key={index}
              className={msg.username === username ? "right" : "left"}
            >
              <div className="messageContent">
                {msg.username}: {msg.message}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="inputContainer">
        <input
          type="text"
          placeholder="Type your message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button className="btn sendBtn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
