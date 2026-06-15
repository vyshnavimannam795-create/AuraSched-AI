import { BrowserRouter, Routes, Route } from "react-router-dom";
import OwnerDashboard from "./pages/OwnerDashboard";
import VisitorBooking from "./pages/VisitorBooking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin route defaults to the main root URL */}
        <Route path="/" element={<OwnerDashboard />} />
        
        {/* Public booking form endpoint updated to /booking */}
        <Route path="/booking" element={<VisitorBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;