// public/js/animations.js
//
// GSAP-based animation system. Kept intentionally restrained per the
// brief: smooth, professional reveals rather than bouncing/spinning
// effects on every element.

document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap) return;

  gsap.registerPlugin(ScrollTrigger);

  // ---------- 1. Hero text reveal ----------
  gsap.to(".hero .reveal", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.12,
  });

  // ---------- 2. Hero visual reveal ----------
  gsap.fromTo(
    ".hero-visual",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.9, delay: 0.3, ease: "power2.out" }
  );

  // ---------- 3. Floating dashboard cards (independent gentle float) ----------
  document.querySelectorAll("[data-float]").forEach((card, i) => {
    gsap.to(card, {
      y: "+=10",
      duration: 2.4 + i * 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.2,
    });
  });

  // ---------- 4/10. Generic scroll-triggered reveal for all .reveal elements outside hero ----------
  document.querySelectorAll("section:not(.hero) .reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    });
  });

  // ---------- 5. Service card stagger ----------
  gsap.to(".service-card", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: ".services-grid",
      start: "top 80%",
    },
  });

  // ---------- 6. Timeline draw + step reveal ----------
  const timelineLine = document.getElementById("timelineLine");
  if (timelineLine) {
    gsap.fromTo(
      timelineLine,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: { trigger: "#timeline", start: "top 75%" },
      }
    );
  }
  gsap.to(".timeline-step", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: { trigger: "#timeline", start: "top 75%" },
  });

  // ---------- 7. Counter animations (CRM metrics) ----------
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10);
    const counterObj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: target,
          duration: 1.4,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = Math.floor(counterObj.val).toLocaleString();
          },
        });
      },
    });
  });

  // ---------- 8/9. Button + card hover handled via CSS transitions (kept fast/lightweight) ----------

  // ---------- Why-cards reveal (reuses the generic .reveal class) ----------
  gsap.to(".why-card.reveal", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: { trigger: ".why-grid", start: "top 80%" },
  });
});

// Fallback: if GSAP fails to load (e.g. CDN blocked), make sure content
// is still visible rather than permanently hidden at opacity: 0.
window.addEventListener("load", () => {
  if (!window.gsap) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
});
