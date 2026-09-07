// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");

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
app.post("/api/contact", (req, res) => {
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
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to save lead:", err.message);
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
