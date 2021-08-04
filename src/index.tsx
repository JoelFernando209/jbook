import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import { unpkgPathPlugin, fetchPlugin } from "./plugins";

const App = () => {
  const serviceRef = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    serviceRef.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.21/esbuild.wasm",
    });
  };

  useEffect(() => {
    startService();
  }, []);

  const handleSubmit = async () => {
    if (serviceRef.current) {
      const result = await serviceRef.current.build({
        entryPoints: ["index.js"],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        define: {
          "process.env.NODE_ENV": '"production"',
          global: "window",
        },
      });
      const resultCode = result.outputFiles[0].text;

      setCode(resultCode);

      try {
        eval(resultCode);
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={({ target: { value } }) => setInput(value)}
      ></textarea>
      <div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <pre>{code}</pre>
      <iframe sandbox="" src="/test.html"></iframe>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
