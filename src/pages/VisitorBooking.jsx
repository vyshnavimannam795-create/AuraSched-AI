import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import emailjs from '@emailjs/browser';

// --- NESTED VISITOR CHATBOT COMPONENT ---
function VisitorChatBot({ bookedSlots = [] }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const standardSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleAskVisitorAI = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    const query = input.toLowerCase();
    
    // Dynamic Date Calculation Logic
    const today = new Date();
    let targetDate = "";

    if (query.includes("tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDate = tomorrow.toISOString().split('T')[0];
    } else if (query.includes("next week")) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      targetDate = nextWeek.toISOString().split('T')[0];
    } else if (query.includes("today")) {
      targetDate = today.toISOString().split('T')[0];
    } else {
      // Regex check to see if they typed an absolute date string like 2026-06-15
      const dateMatch = query.match(/\d{4}-\d{2}-\d{2}/);
      targetDate = dateMatch ? dateMatch[0] : today.toISOString().split('T')[0]; 
    }

    // Filter slots already taken in database for that target date
    const takenHours = bookedSlots
      .filter(slot => slot.date === targetDate)
      .map(slot => slot.start_time?.slice(0, 5));

    // Calculate slots that are still free
    const availableHours = standardSlots.filter(hour => !takenHours.includes(hour));

    setTimeout(() => {
      if (query.includes("slot") || query.includes("time") || query.includes("available") || query.includes("free") || query.includes("book")) {
        if (availableHours.length === 0) {
          setResponse(`📅 AuraSched Visitor AI:\nAll hourly blocks for ${targetDate} are currently completely booked out. Please review alternative dates on our main calendar form above!`);
        } else {
          const hoursList = availableHours.map(h => `• ${h}`).join("\n");
          setResponse(`📅 AuraSched Visitor AI:\nHere are the open availability blocks remaining for your selected date (${targetDate}):\n\n${hoursList}\n\nFeel free to pick one of these windows in the submission form above to book your spot instantly!`);
        }
      } else if (query.includes("how") || query.includes("meet")) {
        setResponse(`🤖 AuraSched Visitor AI:\nBooking a session is simple! Just type your name and email in the form fields above, select a date and an available hour block from the dropdown list, provide a brief purpose statement, and press "Submit Request". An instant email alert will fly straight to the administrator for fast confirmation!`);
      } else {
        setResponse(`🤖 AuraSched Visitor AI:\nHello! I am your automated calendar assistant. Ask me "What times are available tomorrow?" or "Show available times on 2026-06-25" and I'll check our live schedule database for you!`);
      }
      setLoading(false);
    }, 400); 
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl mx-auto my-6 clear-both" style={{ marginTop: "40px", backgroundColor: "#f9fafb" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "5px" }}>🤖 AuraSched Visitor Assistant</h3>
      <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "15px" }}>Need assistance? Ask me about open booking slots or learn how to submit a scheduling request.</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "6px", padding: "10px", fontSize: "14px", backgroundColor: "white", color: "black" }}
          placeholder="Ask about available times (e.g., what slots are available tomorrow?)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskVisitorAI()}
        />
        <button
          onClick={handleAskVisitorAI}
          disabled={loading}
          style={{ backgroundColor: "#16a34a", color: "white", fontWeight: "600", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}
        >
          {loading ? "Checking..." : "Ask Bot"}
        </button>
      </div>

      {response && (
        <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
          <p style={{ fontSize: "11px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", marginBottom: "5px" }}>Bot Response:</p>
          <div style={{ fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap" }}>{response}</div>
        </div>
      )}
    </div>
  );
}


// --- MAIN VISITOR BOOKING CONTAINER ---
export default function VisitorBooking() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [bookedSlots, setBookedSlots] = useState([]);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("status", "upcoming");

    if (!error) {
      setBookedSlots(data || []);
    }
  };

  const isBooked = (slot) => {
    return bookedSlots.some(
      (item) => item.date === date && item.start_time?.slice(0, 5) === slot
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const slotAlreadyBooked = bookedSlots.some(
      (item) => item.date === date && item.start_time?.slice(0, 5) === time
    );

    if (slotAlreadyBooked) {
      alert("⚠️ Slot already booked! Please select another time block.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("booking_requests")
      .insert([
        {
          visitor_name: name,
          visitor_email: email,
          requested_date: date,
          start_time: time,
          end_time: time, 
          description: purpose,
          status: "pending",
        },
      ]);

    if (error) {
      alert("Error saving booking request: " + error.message);
      setLoading(false);
      return;
    }

    // EmailJS notification logic
    try {
      await emailjs.send(
        'service_yoopnyg', 
        'template_anwow39', 
        {
          visitor_name: name,    
          visitor_email: email,  
          requested_date: `${date} at ${time}`,  
        },
        '7PtWUw7mxp1fRlLb6'
      );
      console.log("🚀 Owner notified via EmailJS!");
    } catch (err) {
      console.error("EmailJS failed:", err);
    }

    setLoading(false);
    alert("🚀 Booking Request Submitted Successfully & Notification Sent!");
    
    setName("");
    setEmail("");
    setDate("");
    setTime("");
    setPurpose("");
    
    fetchSchedules();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", padding: "30px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "10px" }}>📅 Book a Meeting</h1>
      <p style={{ color: "#4b5563", marginBottom: "24px" }}>Select a date and choose an open hourly time window to submit your request.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Your Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Test User" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "black", backgroundColor: "white" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Your Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@gmail.com" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "black", backgroundColor: "white" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "black", backgroundColor: "white" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Time Slot</label>
              <select required value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", backgroundColor: "white", color: "black" }}>
                <option value="">-- Select Time --</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot} disabled={isBooked(slot)}>
                    {slot} {isBooked(slot) ? " (Booked)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Meeting Purpose</label>
            <textarea required value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Internship Project Demo" rows="4" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "black", backgroundColor: "white" }}></textarea>
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: "#2563eb", color: "white", padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "10px", fontSize: "16px" }}>
            {loading ? "Processing..." : "Submit Request"}
          </button>
        </div>
      </form>

      {/* --- Step 21: Visitor AI Assistant --- */}
      <VisitorChatBot bookedSlots={bookedSlots} />
    </div>
  );
}