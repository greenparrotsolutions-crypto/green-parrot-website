// public/js/modal.js

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("serviceModalOverlay");
  if (!overlay) return; // modal only exists on pages that include it (e.g. homepage)

  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("serviceModalForm");
  const serviceInput = document.getElementById("modalService");
  const serviceLabel = document.getElementById("modalServiceLabel");
  const errorsBox = document.getElementById("modalErrors");
  const successBox = document.getElementById("modalSuccess");
  const submitBtn = document.getElementById("modalSubmitBtn");

  function openModal(serviceName) {
    serviceInput.value = serviceName;
    serviceLabel.textContent = serviceName;
    errorsBox.style.display = "none";
    successBox.style.display = "none";
    form.reset();
    serviceInput.value = serviceName; // reset() clears hidden field too, reset again
    overlay.classList.add("open");
    document.getElementById("modalName").focus();
  }

  function closeModal() {
    overlay.classList.remove("open");
  }

  // Open modal from any "Learn More" link on a service card
  document.querySelectorAll(".service-card .learn-more").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const card = link.closest(".service-card");
      const serviceName = card ? card.querySelector("h3").textContent.trim() : "our services";
      openModal(serviceName);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorsBox.style.display = "none";
    successBox.style.display = "none";

    const payload = {
      name: document.getElementById("modalName").value.trim(),
      phone: document.getElementById("modalPhone").value.trim(),
      business: document.getElementById("modalBusiness").value.trim(),
      service: serviceInput.value,
      email: "",
      budget: "",
      message: `Requested a call back about: ${serviceInput.value}`,
    };

    const missing = [];
    if (!payload.name) missing.push("Name");
    if (!payload.phone) missing.push("Phone");
    if (!payload.business) missing.push("Business Name");

    if (missing.length > 0) {
      errorsBox.textContent = `Please fill in: ${missing.join(", ")}.`;
      errorsBox.style.display = "block";
      return;
    }

    const originalText = submitBtn.textContent;
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
          "Thank you! We've received your request. Our executive will call you shortly.";
        successBox.style.display = "block";
        form.reset();
        setTimeout(closeModal, 2200);
      } else {
        errorsBox.textContent =
          (data.errors && data.errors.join(" ")) || "Something went wrong. Please try again.";
        errorsBox.style.display = "block";
      }
    } catch (err) {
      errorsBox.textContent = "Something went wrong. Please try again.";
      errorsBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
