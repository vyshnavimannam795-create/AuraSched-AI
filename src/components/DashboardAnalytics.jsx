import React from "react";

export default function DashboardAnalytics({ schedules = [], requests = [] }) {
  // Compute analytics dynamically from existing state props
  const totalSchedules = schedules.length;
  const totalRequests = requests.length;
  
  const pendingRequests = requests.filter(
    (r) => r.status?.toLowerCase() === "pending"
  ).length;
  
  const approvedRequests = requests.filter(
    (r) => r.status?.toLowerCase() === "approved"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 max-w-6xl mx-auto px-4">
      {/* Card 1: Total Schedules */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          📅 Total Schedules
        </span>
        <span className="text-3xl font-bold text-gray-800 mt-2">
          {totalSchedules}
        </span>
      </div>

      {/* Card 2: Pending Requests */}
      <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-100 flex flex-col justify-between">
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
          ⏳ Pending Requests
        </span>
        <span className="text-3xl font-bold text-amber-700 mt-2">
          {pendingRequests}
        </span>
      </div>

      {/* Card 3: Approved Requests */}
      <div className="bg-emerald-50 p-5 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-between">
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          ✅ Approved Bookings
        </span>
        <span className="text-3xl font-bold text-emerald-700 mt-2">
          {approvedRequests}
        </span>
      </div>

      {/* Card 4: Total Interaction Volume */}
      <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          📊 Total Requests
        </span>
        <span className="text-3xl font-bold text-blue-700 mt-2">
          {totalRequests}
        </span>
      </div>
    </div>
  );
}