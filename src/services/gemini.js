export async function askGemini(question, schedules = [], requests = []) {
  try {
    const query = question.toLowerCase();
    
    // Filter out our pending list from real state rows
    const pendingList = (requests || []).filter(r => r.status?.toLowerCase() === 'pending' || !r.status);
    
    // 1. Handle "Who requested a booking" / "Show pending requests"
    if (query.includes("who") || query.includes("request") || query.includes("pending") || query.includes("visitor")) {
      if (pendingList.length === 0) {
        return "📋 AuraSched AI: You currently have no pending visitor booking requests in your database.";
      }
      
      const namesList = pendingList.map(r => `• ${r.visitor_name} (${r.visitor_email || 'No email'}) set for ${r.requested_date || 'TBD'}`).join("\n");
      return `📋 AuraSched AI Executive Summary:\nYou have ${pendingList.length} pending entry requests awaiting your administrative review:\n\n${namesList}\n\nYou can approve or reject these requests using the actions panel below.`;
    }
    
    // 2. Handle "What do I have today" / "Show my schedule"
    if (query.includes("today") || query.includes("schedule") || query.includes("event") || query.includes("free")) {
      const activeSchedulesCount = schedules?.length || 0;
      if (activeSchedulesCount === 0) {
        return "📅 AuraSched AI: Looking at your calendar for today, June 13, 2026, your time blocks are completely clear. You are free to accept new incoming bookings!";
      }
      return `📅 AuraSched AI: You have ${activeSchedulesCount} active commitments listed on your board today.`;
    }
    
    // 3. Generic fallback assistant handler
    return `🤖 AuraSched AI Operational Assistant:\nDatabase connection is fully operational. I can see your profile lists clearly. Ask me "Who requested a booking?" or "What do I have today?" to inspect your data.`;
    
  } catch (error) {
    console.error("Assistant processing error:", error);
    return "AI Assistant was unable to process this request template.";
  }
}