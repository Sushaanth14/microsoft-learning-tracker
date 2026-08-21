// Paste your actual API Key inside quotes below
const GEMINI_API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; 

const courses = [
  { id: "az-900", domain: "Cloud", title: "Azure Fundamentals (AZ-900)", prereqs: [] },
  { id: "az-104", domain: "Cloud", title: "Azure Administrator (AZ-104)", prereqs: ["az-900"] },
  { id: "ai-900", domain: "AI", title: "Azure AI Fundamentals (AI-900)", prereqs: [] },
  { id: "ai-102", domain: "AI", title: "Azure AI Engineer (AI-102)", prereqs: ["ai-900"] }
];

let completedCourseIds = [];

function renderRoadmap() {
  const selectedDomain = document.getElementById("domainSelect").value;
  const container = document.getElementById("roadmap");
  container.innerHTML = "";

  const domainCourses = courses.filter(c => c.domain === selectedDomain);

  domainCourses.forEach(course => {
    const isCompleted = completedCourseIds.includes(course.id);
    const prereqsMet = course.prereqs.every(id => completedCourseIds.includes(id));
    
    let status = "Locked";
    if (isCompleted) status = "Completed";
    else if (prereqsMet) status = "Available";

    const card = document.createElement("div");
    card.className = `card ${status.toLowerCase()}`;
    
    card.innerHTML = `
      <h3>${course.title}</h3>
      <p>Status: <span class="status-badge">${status}</span></p>
      ${status === "Available" ? `<button onclick="markComplete('${course.id}')">Mark as Completed</button>` : ""}
      ${status === "Available" ? `<div id="ai-${course.id}" class="ai-box">Loading AI guidance...</div>` : ""}
    `;

    container.appendChild(card);

    if (status === "Available") {
      fetchAIExplanation(course.title, course.id);
    }
  });
}

function markComplete(courseId) {
  completedCourseIds.push(courseId);
  renderRoadmap();
}

async function fetchAIExplanation(title, courseId) {
  const box = document.getElementById(`ai-${courseId}`);
  if (!box) return;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `In 1 brief sentence, explain why completing ${title} is beneficial for a student.` }] }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      box.innerText = "🤖 AI Note: " + data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    box.innerText = "🤖 AI Note: This course establishes essential technical foundational skills required for advanced Microsoft tracks.";
  }
}

document.getElementById("domainSelect").addEventListener("change", renderRoadmap);
renderRoadmap();