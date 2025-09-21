import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

// --- Default Code Templates ---
const defaultTemplates = {
  c: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
};

// --- Exam Questions (Sample) ---
const allQuestions = [
  { id: 1, title: "Sum of two numbers", open: { input: "2 3", expected: "5" }, hidden: [{ input: "10 20", expected: "30" }, { input: "-5 15", expected: "10" }] },
  { id: 2, title: "Fibonacci sequence nth term", open: { input: "5", expected: "5" }, hidden: [{ input: "10", expected: "55" }, { input: "1", expected: "1" }] },
  { id: 3, title: "Factorial of n", open: { input: "4", expected: "24" }, hidden: [{ input: "5", expected: "120" }, { input: "0", expected: "1" }] },
];

const ExamCompiler = ({ studentName, registerNumber }) => {
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(defaultTemplates.java);
  const [output, setOutput] = useState("Output will be displayed here...");
  const [isLoading, setIsLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [hiddenTestResults, setHiddenTestResults] = useState([]);

  useEffect(() => {
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 2); // Using 2 questions for this example
    setExamQuestions(selectedQuestions);
    setHiddenTestResults(new Array(selectedQuestions.length).fill("Not Run"));
  }, []);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submitted) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const executeCode = async (stdin) => {
    const languageMap = { c: { lang: "c", versionIndex: "4" }, python: { lang: "python3", versionIndex: "4" }, java: { lang: "java", versionIndex: "4" } };
    try {
      const { data } = await axios.post("http://localhost:5000/execute", {
        script: code,
        language: languageMap[language].lang,
        versionIndex: languageMap[language].versionIndex,
        stdin: stdin,
      });
      return data.output ? data.output.trim() : "Execution failed or produced no output.";
    } catch (error) {
      console.error("Execution API error:", error);
      return "Error: Could not connect to the execution server.";
    }
  };

  const handleRunOpenTest = async () => {
    setIsLoading(true);
    const q = examQuestions[currentIdx];
    const actualOutput = await executeCode(q.open.input);
    setIsLoading(false);
    const resultText = actualOutput === q.open.expected ? "✅ Passed" : "❌ Failed";
    const finalOutput = `--- Open Test Case ---\nInput:\n${q.open.input}\n\nExpected Output:\n${q.open.expected}\n\nYour Output:\n${actualOutput}\n\nResult: ${resultText}`;
    setOutput(finalOutput);
  };

  const handleRunHiddenTests = async () => {
    setIsLoading(true);
    const q = examQuestions[currentIdx];
    let passedCount = 0;
    let resultsOutput = "--- Hidden Test Cases ---\n";
    const newHiddenResults = [...hiddenTestResults];
    
    for (let i = 0; i < q.hidden.length; i++) {
      setOutput(`Running hidden test ${i + 1} of ${q.hidden.length}...`);
      const test = q.hidden[i];
      const actualOutput = await executeCode(test.input);
      if (actualOutput === test.expected) {
        passedCount++;
        resultsOutput += `Test ${i + 1}: ✅ Passed\n`;
      } else {
        resultsOutput += `Test ${i + 1}: ❌ Failed\n`;
      }
    }
    
    newHiddenResults[currentIdx] = `${passedCount} / ${q.hidden.length} Passed`;
    setHiddenTestResults(newHiddenResults);

    // ## SCORE CALCULATION UPDATED ##
    const marksPerQuestion = 20 / examQuestions.length; // Total score is 20
    const marks = (passedCount / q.hidden.length) * marksPerQuestion;

    setTotalScore(prev => prev + marks);
    setOutput(resultsOutput + `\nScore for this question: ${marks.toFixed(1)} / ${marksPerQuestion.toFixed(1)}`);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    alert("Submitting your exam. You cannot make any more changes.");

    const timeTaken = 30 * 60 - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    try {
      await addDoc(collection(db, "examSubmissions"), {
        studentName: studentName,
        studentRegNo: registerNumber,
        // ## SUBMITTED MARK UPDATED ##
        studentMark: `${totalScore.toFixed(1)} out of 20`,
        studentTimeTaken: `${minutes}m ${seconds}s`,
        studentCode: code,
        submittedAt: new Date(),
      });
      setOutput(`Exam Submitted!\nFinal Score: ${totalScore.toFixed(1)} / 20`);
    } catch (error) {
      console.error("Firebase Submission Error:", error);
      alert("There was an error submitting your results. Please contact the administrator.");
    }
  };

  if (examQuestions.length === 0) {
    return <div>Loading Exam...</div>;
  }

  const currentQuestion = examQuestions[currentIdx];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Exam System - Compiler</h1>
        <div style={styles.headerInfo}>
          <span>Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
          <span style={{ marginLeft: '2rem' }}>Score: {totalScore.toFixed(1)}</span>
        </div>
      </header>
      <div style={styles.body}>
        <aside style={styles.leftPanel}>
            <h2 style={styles.questionTitle}>{`Q${currentIdx + 1}: ${currentQuestion.title}`}</h2>
            <div style={styles.testCaseGroup}>
                <h3 style={styles.testCaseHeader}>Open Test Case (0 Marks)</h3>
                <div style={styles.testCaseBox}>
                <div style={styles.ioLabel}>Input:</div>
                <pre style={styles.ioValue}>{currentQuestion.open.input}</pre>
                <div style={{...styles.ioLabel, marginTop: '10px'}}>Expected:</div>
                <pre style={styles.ioValue}>{currentQuestion.open.expected}</pre>
                </div>
            </div>
            <div style={styles.testCaseGroup}>
                <h3 style={styles.testCaseHeader}>Hidden Test Cases</h3>
                <div style={styles.hiddenTestCaseBox}>
                    Result: {hiddenTestResults[currentIdx]}
                </div>
            </div>
            <div style={styles.navigation}>
                <button style={currentIdx === 0 ? styles.navButtonDisabled : styles.navButton} onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>← Back</button>
                <button style={currentIdx === examQuestions.length - 1 ? styles.navButtonDisabled : styles.primaryButton} onClick={() => setCurrentIdx(i => Math.min(examQuestions.length - 1, i + 1))} disabled={currentIdx === examQuestions.length - 1}>Next →</button>
            </div>
        </aside>
        <main style={styles.rightPanel}>
          <select value={language} onChange={e => { setLanguage(e.target.value); setCode(defaultTemplates[e.target.value]); }} style={styles.languageSelector}>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="c">C</option>
          </select>
          <textarea value={code} onChange={e => setCode(e.target.value)} disabled={submitted || isLoading} style={styles.editor} />
          <div style={styles.buttonGroup}>
            <button onClick={handleRunOpenTest} disabled={isLoading || submitted} style={{ ...styles.actionButton, ...styles.runButton }}>Run Open Test</button>
            {currentIdx === examQuestions.length - 1 ? (
              <button onClick={handleSubmit} disabled={isLoading || submitted} style={{ ...styles.actionButton, ...styles.submitButton }}>Submit Exam</button>
            ) : (
              <button onClick={handleRunHiddenTests} disabled={isLoading || submitted} style={{ ...styles.actionButton, ...styles.hiddenButton }}>Submit Question</button>
            )}
          </div>
          <pre style={styles.outputArea}>{isLoading ? "Executing..." : output}</pre>
        </main>
      </div>
    </div>
  );
};

// --- (Styles object remains the same) ---
const styles = { container: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }, header: { background: '#1e293b', color: 'white', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', flexShrink: 0 }, headerTitle: { fontSize: '1.2rem', fontWeight: '600' }, headerInfo: { fontSize: '1rem' }, body: { display: 'flex', flexGrow: 1, overflow: 'hidden' }, leftPanel: { width: '40%', padding: '1.5rem', background: 'white', borderRight: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }, questionTitle: { margin: 0, color: '#1e293b' }, testCaseGroup: { marginTop: '1.5rem' }, testCaseHeader: { fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#475569' }, testCaseBox: { background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }, ioLabel: { color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }, ioValue: { margin: '0.25rem 0 0 0', background: 'white', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', color: '#1e293b' }, hiddenTestCaseBox: { background: '#e2e8f0', color: '#475569', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.9rem' }, navigation: { marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }, navButton: { background: '#e2e8f0', color: '#334155', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }, navButtonDisabled: { background: '#f1f5f9', color: '#94a3b8', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'not-allowed', fontWeight: '600' }, primaryButton: { background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }, rightPanel: { width: '60%', padding: '1.5rem', display: 'flex', flexDirection: 'column', background: '#f8fafc' }, languageSelector: { marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', alignSelf: 'flex-start' }, editor: { flexGrow: 1, fontFamily: 'monospace', fontSize: '16px', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'none' }, buttonGroup: { marginTop: '1rem', display: 'flex', gap: '1rem' }, actionButton: { color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }, runButton: { background: '#3b82f6' }, hiddenButton: { background: '#22c55e' }, submitButton: { background: '#ef4444' }, outputArea: { flexBasis: '250px', flexShrink: 0, background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }, };

export default ExamCompiler;