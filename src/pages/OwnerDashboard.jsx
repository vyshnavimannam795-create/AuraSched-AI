import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; 
import ChatBot from '../components/ChatBot'; 

function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]); // 👈 Added state to hold confirmed schedule events

  // Fetch all booking requests from Supabase
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
  };

  // Fetch all approved schedules from Supabase
  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('status', 'upcoming');
    
    if (error) {
      console.error("Error fetching schedules:", error);
    } else {
      setSchedules(data || []);
    }
  };

  // Run both data fetches when the component mounts
  useEffect(() => {
    fetchBookings();
    fetchSchedules();
  }, []); 

  // --- 🚀 HANDLER: APPROVE REQUEST ---
  const handleApprove = async (req) => {
    try {
      // 1. Insert confirmed slot including both start_time and end_time
      const { error: scheduleError } = await supabase
        .from('schedules')
        .insert([
          {
            title: `Meeting with ${req.visitor_name}`,
            date: req.requested_date,
            start_time: req.start_time,
            end_time: req.start_time, 
            status: 'upcoming'
          }
        ]);

      if (scheduleError) throw scheduleError;

      // 2. Update the request status to 'approved' in 'booking_requests'
      const { error: requestError } = await supabase
        .from('booking_requests')
        .update({ status: 'approved' })
        .eq('id', req.id);

      if (requestError) throw requestError;

      alert(`✅ Meeting with ${req.visitor_name} has been successfully approved!`);
      
      // Refresh both datasets to update analytics and layout
      fetchBookings();
      fetchSchedules();

    } catch (error) {
      console.error("Error during approval process:", error.message);
      alert("⚠️ Error processing approval: " + error.message);
    }
  };

  // --- ❌ HANDLER: REJECT REQUEST ---
  const handleReject = async (req) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: 'rejected' })
        .eq('id', req.id);

      if (error) throw error;

      alert(`❌ Booking request from ${req.visitor_name} marked as rejected.`);
      fetchBookings();
      fetchSchedules();

    } catch (error) {
      console.error("Error during rejection process:", error.message);
      alert("⚠️ Error processing rejection: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ color: "black" }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Owner Dashboard</h1>
      
      {/* Passing both arrays correctly to feed the analytics summary dashboard panels */}
      <div className="max-w-4xl mx-auto">
        <ChatBot schedules={schedules} requests={bookings} />
      </div>

      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Visitor Bookings</h2>
        
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-lg">{req.visitor_name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{req.visitor_email}</p>
                  <p className="text-sm mt-1">🗓️ {req.requested_date} at <b>{req.start_time}</b></p>
                </div>
                
                {(!req.status || req.status === 'pending') && (
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleApprove(req)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(req)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 italic">📭 No booking requests available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;