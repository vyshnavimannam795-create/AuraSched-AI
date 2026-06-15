import React, { useState } from "react";
import { askGemini } from "../services/gemini"; // ✅ Point directly to your service file

export default function ChatBot({ schedules = [], requests = [] }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    // Calculate backup engine statistics 
    const activeSchedulesCount = schedules?.length || 0;
    const pendingRequestsCount = requests?.filter(r => r.status?.toLowerCase() === 'pending').length || 0;

    try {
      // ✅ Call your centralized service file instead of creating duplicate model instances here
      const aiResponse = await askGemini(input, schedules, requests);
      setResponse(aiResponse);
    } catch (error) {
      console.warn("Switching to Smart Local Assistant Simulation Engine:", error.message);
      
      const query = input.toLowerCase();
      if (query.includes("task") || query.includes("schedule") || query.includes("event") || query.includes("today")) {
        setResponse(`🤖 [AuraSched AI Backup]: Looking at your live calendar, you have ${activeSchedulesCount} upcoming commitments listed on your board today.`);
      } else if (query.includes("request") || query.includes("pending") || query.includes("visitor")) {
        setResponse(`🤖 [AuraSched AI Backup]: You currently have ${pendingRequestsCount} pending visitor entry requests awaiting review in your administrator panel.`);
      } else {
        setResponse(`🤖 [AuraSched AI Backup]: Internal database communication channels are active! I can see your ${activeSchedulesCount} active calendar blocks smoothly.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl mx-auto my-6 clear-both">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
        🤖 AuraSched AI Executive Assistant
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Ask questions about your real-time calendar events, analytics data, or pending visitor lineups.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          placeholder="Ask questions about your real-time calendar events..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
        />
        <button
          onClick={handleAskAI}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:bg-blue-400"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      {response && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Response:</p>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}