import axios from "axios";

async function checkJudge0() {
  try {
    const res = await axios.get("https://judge0-ce.p.rapidapi.com/about", {
      headers: {
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "x-rapidapi-key": "6423eb39e8msh406374930378357p158e28jsn056b6860ca43",
      },
    });

    console.log(res.data);
    alert("Judge0 is working! Check console for details.");
  } catch (err) {
    console.error(err);
    alert("Error connecting to Judge0");
  }
}

export default checkJudge0;
