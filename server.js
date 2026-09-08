// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine ----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---- Static files ----
app.use(express.static(path.join(__dirname, "public")));

// ---- Body parsing ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Lead storage (JSON file) ----
// See README.md for the important Vercel persistence caveat.
const LEADS_FILE = path.join(__dirname, "data", "leads.json");

function readLeads() {
  try {
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveLead(lead) {
  const leads = readLeads();
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}
// ---- Email notification ----
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
async function sendLeadEmail(lead) {
  const mailOptions = {
    from: `"Green Parrot Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `New Lead: ${lead.name} (${lead.business})`,
    html: `
      <h2>New Lead from Website</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Business:</strong> ${lead.business}</p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <p><strong>Email:</strong> ${lead.email || "Not provided"}</p>
      <p><strong>Service:</strong> ${lead.service}</p>
      <p><strong>Budget:</strong> ${lead.budget || "Not provided"}</p>
      <p><strong>Message:</strong> ${lead.message || "None"}</p>
      <p><strong>Submitted:</strong> ${lead.createdAt}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// ---- Routes ----
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/privacy-policy", (req, res) => {
  res.render("legal", {
    title: "Privacy Policy",
    heading: "Privacy Policy",
    body: "Add your actual privacy policy content here before launch.",
  });
});

app.get("/terms", (req, res) => {
  res.render("legal", {
    title: "Terms & Conditions",
    heading: "Terms & Conditions",
    body: "Add your actual terms and conditions content here before launch.",
  });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    "User-agent: *\nAllow: /\nSitemap: https://www.greenparrotsolutions.com/sitemap.xml"
  );
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.greenparrotsolutions.com/</loc><priority>1.0</priority></url>
  <url><loc>https://www.greenparrotsolutions.com/about</loc><priority>0.8</priority></url>
  <url><loc>https://www.greenparrotsolutions.com/contact</loc><priority>0.8</priority></url>
</urlset>`);
});

// ---- Contact API (used by both the Contact page form and the service modal) ----
app.post("/api/contact", async (req, res) => {
  const { name, business, phone, email, service, budget, message } = req.body;

  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!business || !business.trim()) errors.push("Business name is required.");
  if (!phone || !phone.trim()) errors.push("Phone / WhatsApp is required.");
  if (!service || !service.trim()) errors.push("Please select what you need.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    business: business.trim(),
    phone: phone.trim(),
    email: (email || "").trim(),
    service: service.trim(),
    budget: (budget || "").trim(),
    message: (message || "").trim(),
    createdAt: new Date().toISOString(),
  };

   try {
    saveLead(lead);
  } catch (err) {
    console.error("Failed to save lead to JSON backup:", err.message);
    // Don't block the response on this — email is now the primary channel
  }

  try {
    await sendLeadEmail(lead);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to send lead email:", err.message);
    return res.status(500).json({
      success: false,
      errors: ["Something went wrong. Please try again."],
    });
  }
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.listen(PORT, () => {
  console.log(`Green Parrot Solutions site running at http://localhost:${PORT}`);
});

module.exports = app;
