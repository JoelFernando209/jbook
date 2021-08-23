import React from "react";

import MDEditor from "@uiw/react-md-editor";

interface TextEditorProps {}

const TextEditor: React.FC<TextEditorProps> = () => {
  return (
    <div>
      <MDEditor.Markdown source={"# i dont actually know dude"} />
    </div>
  );
};

export default TextEditor;
