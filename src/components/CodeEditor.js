import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const CodeEditor = ({ onChange, language, code, theme, socketRef, roomId }) => {
  const [value, setValue] = useState(code || "");

  const handleEditorChange = (data) => {
    // console.log("data: ", data);
    setValue(data);
    // onChange(data);
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: data,
    });
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code != null) {
          setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
      <Editor
        height="85vh"
        width={`100%`}
        language={language}
        value={value}
        theme={theme}
        // defaultValue="Write your code here."
        onChange={handleEditorChange}
      />
    </div>
  );
};
export default CodeEditor;
