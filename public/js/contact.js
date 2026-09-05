// public/js/contact.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const errorsBox = document.getElementById("formErrors");
  const successBox = document.getElementById("formSuccess");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorsBox.style.display = "none";
    errorsBox.innerHTML = "";
    successBox.style.display = "none";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // ---- Basic client-side validation ----
    const missing = [];
    if (!payload.name || !payload.name.trim()) missing.push("Name");
    if (!payload.business || !payload.business.trim()) missing.push("Business Name");
    if (!payload.phone || !payload.phone.trim()) missing.push("Phone / WhatsApp");
    if (!payload.service || !payload.service.trim()) missing.push("What do you need");

    if (missing.length > 0) {
      errorsBox.textContent = `Please fill in: ${missing.join(", ")}.`;
      errorsBox.style.display = "block";
      return;
    }

    // ---- Loading state ----
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        successBox.textContent =
          "Thank you! We've received your enquiry. Our team will contact you shortly.";
        successBox.style.display = "block";
        form.reset();
      } else {
        errorsBox.textContent =
          (data.errors && data.errors.join(" ")) ||
          "Something went wrong. Please try again.";
        errorsBox.style.display = "block";
      }
    } catch (err) {
      errorsBox.textContent = "Something went wrong. Please try again.";
      errorsBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});
