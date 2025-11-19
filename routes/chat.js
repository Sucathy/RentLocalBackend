const express = require("express");
const router = express.Router();

// simple replies
const replies = {
  hello: "Hi there 👋! How can I help you?",
  Hello: "Hi there 👋! How can I help you?",
  Hi: "Hello! 😊",
  hi: "Hello! 😊",
  hiii: "Hello! 😊",
  help: "Sure, I can help you. What do you need?",
  Help: "Sure, I can help you. What do you need?",
  bye: "Goodbye! Have a great day 🎉",
  Bye: "Goodbye! Have a great day 🎉",
  price: "Most PGs start from ₹5000. Can you tell me your preferred location (like Bengaluru. ?",
  Price: "Most PGs start from ₹5000. Can you tell me your preferred location (like Bengaluru. ?",
  cost: "Most PGs start from ₹5000. Can you tell me your preferred location (like Bengaluru, ?",
  Cost: "Most PGs start from ₹5000. Can you tell me your preferred location (like Bengaluru, ?",

  // Locations
  bengaluru: "Great! Which area in Bengaluru are you looking for? Options: 1) BTM Layout 2) Whitefield 3) Jayanagar 4) Electronic City 5) JP Nagar",
  bangalore: "Great! Which area in Bangalore are you looking for? Options: 1) BTM Layout 2) Whitefield 3) Jayanagar 4) Electronic City 5) JP Nagar",
  beng: "Great! Which area in Bangalore are you looking for? Options: 1) BTM Layout 2) Whitefield 3) Jayanagar 4) Electronic City 5) JP Nagar",

  // Areas → Price ranges
  "BTM Layout": "Select price range: 1) ₹5k–6k  2) ₹6k–7k  3) ₹7k–8k  4) ₹8k–9k  5) ₹9k–10k",
  "Whitefield": "Select price range: 1) ₹5k–6k  2) ₹6k–7k  3) ₹7k–8k  4) ₹8k–9k  5) ₹9k–10k",
  "Jayanagar": "Select price range: 1) ₹5k–6k  2) ₹6k–7k  3) ₹7k–8k  4) ₹8k–9k  5) ₹9k–10k",
  "Electronic City": "Select price range: 1) ₹5k–6k  2) ₹6k–7k  3) ₹7k–8k  4) ₹8k–9k  5) ₹9k–10k",
  "JP Nagar": "Select price range: 1) ₹5k–6k  2) ₹6k–7k  3) ₹7k–8k  4) ₹8k–9k  5) ₹9k–10k",

  // Price selection → contact
  "1": "Thank you! For details, please contact our customer care at susuresh158@gmail.com ",
  "2": "Thank you! For details, please contact our customer care at susuresh158@gmail.com ",
  "3": "Thank you! For details, please contact our customer care at susuresh158@gmail.com ",
  "4": "Thank you! For details, please contact our customer care at susuresh158@gmail.com ",
  "5": "Thank you! For details, please contact our customer care at susuresh158@gmail.com ",

  // General contact
  location: "If you have any queries, please contact us at susuresh158@gmail.com. We will get back to you shortly.",
  customer: "For any queries, contact customer care at susuresh158@gmail.com.",

  cost: "Most PGs start from ₹5000. Can you tell me the location (like Bangalore, Hyderabad, or Delhi)?",
  Cost: "Most PGs start from ₹5000. Can you tell me the location (like Bangalore, Hyderabad, or Delhi)?",
  costed: "If you have any queries, please contact us at susuresh158@gmail.com. We will definitely get back to you.",
};

// POST /api/chat
router.post("/", (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();

  let reply =
    replies[lower] ||
    "If you have any queries, please contact us at susuresh158@gmail.com. We will definitely get back to you.";

  res.json({ reply });
});

module.exports = router;
