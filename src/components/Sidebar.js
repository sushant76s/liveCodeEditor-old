import React, { useState } from "react";
import Client from "../components/Client";

const Sidebar = ({ clients, copyRoomId, openChat, leaveRoom }) => {
  return (
    <div className="aside">
      <div className="asideInner">
        <div className="logo">
          <img className="logoImage" src="/code-image.png" alt="logo" />
        </div>
        <h3>Connected</h3>
        <div className="clientsList">
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
      </div>
      <button className="btn copyBtn" onClick={copyRoomId}>
        Copy Room ID
      </button>
      <button className="btn chatBtn" onClick={openChat}>
        Open Chat
      </button>
      <button className="btn leaveBtn" onClick={leaveRoom}>
        Leave
      </button>
    </div>
  );
};

export default Sidebar;
