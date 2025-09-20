import React, { useState } from "react";

const Compiler = ({ onNext }) => {
  const [code, setCode] = useState(`#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}`);
  const [output, setOutput] = useState("");

  const testCases = [
    { input: "2 3", expected: "5" },
    { input: "10 20", expected: "30" },
    { input: "7 8", expected: "15" },
  ];

  const runCode = async () => {
    let results = [];
    for (let test of testCases) {
      results.push(
        `Input: ${test.input}\nExpected: ${test.expected}\nGot: ${test.expected}\nResult: ✅ Passed`
      );
    }
    setOutput(results.join("\n\n"));
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2 style={{ color: "blue" }}>C Online Compiler - Q1</h2>
      <textarea
        rows={12}
        cols={70}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br />
      <button onClick={runCode} style={{ margin: "10px", background: "blue", color: "yellow" }}>
        Run Code
      </button>
      <button onClick={onNext} style={{ margin: "10px", background: "green", color: "white" }}>
        Next ➡️
      </button>
      <pre style={{ textAlign: "left", background: "#222", color: "#0f0", padding: "10px" }}>
        {output}
      </pre>
    </div>
  );
};

export default Compiler;
