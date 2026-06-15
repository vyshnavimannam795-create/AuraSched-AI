// 1. MAKE SURE THIS IMPORT IS AT THE VERY TOP OF VisitorBooking.jsx (Line 1)
import emailjs from '@emailjs/browser';

// 2. INSIDE YOUR SUBMIT FUNCTION:
const handleBookingSubmit = async (e) => {
  e.preventDefault();

  // Your existing code that saves to Supabase...
  const { data, error } = await supabase
    .from('booking_requests')
    .insert([{ 
       visitor_name: name,   // Check if your state is called 'name' or something else
       visitor_email: email, // Check if your state is called 'email' or something else
       requested_date: date  // Check if your state is called 'date' or something else
    }]);

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  // --- PASTE THE EMAILJS TRIGGER RIGHT HERE ---
  emailjs.send(
    'service_yoopnyg', 
    'template_anwow39', 
    {
      visitor_name: name,    
      visitor_email: email,  
      requested_date: date,  
    },
    '7PtWUw7mxp1fRlLb6'
  )
  .then((response) => {
    console.log("Email sent successfully!", response.status, response.text);
    alert("Booking submitted and email notification sent!");
  })
  .catch((err) => {
    console.error("EmailJS failed to send:", err);
  });
};