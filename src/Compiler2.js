import React, { useState } from "react";
import Compiler from "./Compiler"; // To go back

const Compiler2 = () => {
  const [code, setCode] = useState(`#include <stdio.h>

// Function to multiply two numbers using repeated addition
int multiply(int a, int b) {
    int result = 0;
    int positive = 1;

    if (a < 0) { a = -a; positive = -positive; }
    if (b < 0) { b = -b; positive = -positive; }

    for (int i = 0; i < b; i++) {
        result += a;
    }
    return positive * result;
}

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    printf("%d", multiply(x, y));
    return 0;
}`);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [goBack, setGoBack] = useState(false);

  const API_KEY = process.env.REACT_APP_QUIZ_EVENT_API_KEY;

  // 3 test cases
  const testCases = [
    { input: "3 4", expected: "12" },
    { input: "-5 6", expected: "-30" },
    { input: "7 0", expected: "0" },
  ];

  // Run raw code
  const handleRun = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          language: "c",
          version: "10.2.0",
          files: [{ name: "main.c", content: code }],
          stdin: "", // No input for raw run
        }),
      });

      const data = await response.json();
      setOutput(data.run.stdout.trim());
    } catch (err) {
      setOutput("Error running code.");
    }
    setLoading(false);
  };

  // Submit → run test cases
  const handleSubmit = async () => {
    setLoading(true);
    let results = [];

    for (let test of testCases) {
      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            language: "c",
            version: "10.2.0",
            files: [{ name: "main.c", content: code }],
            stdin: test.input,
          }),
        });

        const data = await response.json();
        let actualOutput = data.run.stdout.trim();
        let isCorrect = actualOutput === test.expected;

        results.push(
          `Input: ${test.input}\nExpected: ${test.expected}\nGot: ${actualOutput}\nResult: ${
            isCorrect ? "✅ Passed" : "❌ Failed"
          }`
        );
      } catch (err) {
        results.push(`Error running test case with input: ${test.input}`);
      }
    }

    setOutput(results.join("\n\n"));
    setLoading(false);
  };

  if (goBack) return <Compiler />;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>C Online Compiler - Question 2</h2>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={15}
        cols={80}
        style={styles.textarea}
      />
      <br />
      <button onClick={handleRun} style={styles.runButton} disabled={loading}>
        {loading ? "Running..." : "Run"}
      </button>
      <button onClick={handleSubmit} style={styles.submitButton} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      <button onClick={() => setGoBack(true)} style={styles.backButton}>
        ⬅ Back
      </button>
      <pre style={styles.output}>{output}</pre>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px", background: "#f5f5f5" },
  heading: { color: "#1a237e", marginBottom: "20px" },
  textarea: {
    fontFamily: "monospace",
    fontSize: "14px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  runButton: {
    marginTop: "20px",
    marginRight: "10px",
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  submitButton: {
    marginTop: "20px",
    marginRight: "10px",
    backgroundColor: "blue",
    color: "yellow",
    padding: "10px 20px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  backButton: {
    marginTop: "20px",
    backgroundColor: "gray",
    color: "white",
    padding: "10px 20px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  output: {
    marginTop: "20px",
    textAlign: "left",
    whiteSpace: "pre-wrap",
    background: "#222",
    color: "#0f0",
    padding: "10px",
    borderRadius: "4px",
  },
};

export default Compiler2;
