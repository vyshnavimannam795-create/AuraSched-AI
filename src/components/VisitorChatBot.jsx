import React, { useState } from "react";

export default function VisitorChatBot({ bookedSlots = [] }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // All standard required hourly slots
  const standardSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleAskVisitorAI = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    const query = input.toLowerCase();
    
    // Attempt to extract a date from user query (e.g., 2026-06-15)
    // Matches standard YYYY-MM-DD format
    const dateMatch = query.match(/\d{4}-\d{2}-\d{2}/);
    const targetDate = dateMatch ? dateMatch[0] : "2026-06-13"; // Default mock timeline date

    // Filter slots already taken in database for that specific day
    const takenHours = bookedSlots
      .filter(slot => slot.date === targetDate)
      .map(slot => slot.start_time?.slice(0, 5));

    // Calculate slots that are still completely empty
    const availableHours = standardSlots.filter(hour => !takenHours.includes(hour));

    setTimeout(() => {
      if (query.includes("slot") || query.includes("time") || query.includes("available") || query.includes("free")) {
        if (availableHours.length === 0) {
          setResponse(`📅 AuraSched Visitor AI:\nAll hourly blocks for ${targetDate} are currently completely booked out. Please review alternative dates on our main calendar form above!`);
        } else {
          const hoursList = availableHours.map(h => `• ${h}`).join("\n");
          setResponse(`📅 AuraSched Visitor AI:\nHere are the open availability blocks remaining for your selected date (${targetDate}):\n\n${hoursList}\n\nFeel free to pick one of these windows in the submission form above to book your spot instantly!`);
        }
      } else if (query.includes("how") || query.includes("book") || query.includes("meet")) {
        setResponse(`🤖 AuraSched Visitor AI:\nBooking a session is simple! Just type your name and email in the form fields above, select a date and an available hour block from the dropdown list, provide a brief purpose statement, and press "Submit Request". An instant email alert will fly straight to the administrator for fast confirmation!`);
      } else {
        setResponse(`🤖 AuraSched Visitor AI:\nHello! I am your automated calendar assistant. Ask me "What times are available?" or "How do I book a meeting?" and I'll check our live schedule database for you!`);
      }
      setLoading(false);
    }, 400); // Quick artificial delay to look like an active engine processing
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl mx-auto my-6 clear-both" style={{ marginTop: "40px", backgroundColor: "#f9fafb" }}>
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
        🤖 AuraSched Visitor Assistant
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Need assistance? Ask me about open booking slots or learn how to submit a scheduling request.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          placeholder="Ask about available times or how to book..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskVisitorAI()}
        />
        <button
          onClick={handleAskVisitorAI}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:bg-green-400"
        >
          {loading ? "Checking..." : "Ask Bot"}
        </button>
      </div>

      {response && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bot Response:</p>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}