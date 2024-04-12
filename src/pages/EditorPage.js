import React, { useEffect, useRef, useState } from "react";
import ACTIONS, { DISCONNECTED } from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import CodeEditor from "../components/CodeEditor";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const [language, setLanguage] = useState("cpp");

  const reactNavigator = useNavigate();

  const [clients, setClients] = useState([]);
  const [theme, setTheme] = useState("light");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} Joined the Room`);
            // console.log(`${username} joined.`);
          }

          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // listening for DISCONNECTED
      //when DISCONNECTED

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} Left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id has been copied to your clipboard.");
    } catch (err) {
      toast.error("Failed to copy the room id.");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const openChat = () => {
    setIsChatOpen(true);
  };

  const toggleChatPanel = () => {
    setIsChatOpen((prev) => !prev);
  };

  console.log("Clients: ", clients);
  console.log("room id: ", roomId);

  return (
    <div className="mainWrap">
      {/* <div className="aside">
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
      </div> */}
      <Sidebar
        clients={clients}
        copyRoomId={copyRoomId}
        openChat={openChat}
        leaveRoom={leaveRoom}
      />
      <div className={`editorWrap ${isChatOpen ? "collapsed" : ""}`}>
        <div className="row">
          <div className="column">
            <select
              className="selectLanguage"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              {/* Add more options for other languages */}
            </select>
          </div>
          <div className="column">
            <select
              className="selectTheme"
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="vs-dark">Dark</option>
              {/* Add more options for other themes */}
            </select>
          </div>
        </div>
        <CodeEditor
          socketRef={socketRef}
          roomId={roomId}
          theme={theme}
          language={language}
        />
      </div>
      <Chat
        isOpen={isChatOpen}
        onClose={toggleChatPanel}
        socketRef={socketRef}
        roomId={roomId}
        username={location.state?.username}
      />
    </div>
  );
};

export default EditorPage;
