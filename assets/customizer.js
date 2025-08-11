// Options/suboptions linking logic

// document.querySelectorAll(".customizer_optionBlock").forEach((optionBlock) => {
//   const blockName = optionBlock.dataset.blockname;
//   const mediaContainer = document.getElementById(blockName);
//   if (!mediaContainer) return;

//   const tabs = optionBlock.querySelectorAll(".customizer-tab");
//   const contents = mediaContainer.querySelectorAll(".customizer-tab-content");

//   tabs.forEach((tab) => {
//     tab.addEventListener("click", () => {
//       const targetId = tab.dataset.tab;

//       // 1) Show only this block’s media panel
//       document
//         .querySelectorAll(".option_media_block")
//         .forEach((b) => b.classList.toggle("active", b.id === blockName));

//       // 2) Highlight the clicked tab
//       tabs.forEach((t) => t.classList.toggle("active", t === tab));

//       // 3) Show only the matching content inside this mediaContainer
//       contents.forEach((c) => c.classList.toggle("active", c.id === targetId));

//       // 4) Reset scroll on the shown content (just its own scroll)
//       const activeContent = mediaContainer.querySelector(`#${targetId}`);
//       if (activeContent) {
//         activeContent.scrollTop = 0;
//       }

//       // 5) Scroll that new content into view in the left panel
//       if (activeContent) {
//         activeContent.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//     });
//   });
// });

document.querySelectorAll(".customizer_optionBlock").forEach((optionBlock) => {
  const blockName = optionBlock.dataset.blockname;
  const mediaContainer = document.getElementById(blockName);
  if (!mediaContainer) return;

  const tabs = optionBlock.querySelectorAll(".customizer-tab");
  const contents = mediaContainer.querySelectorAll(".customizer-tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      const matchingContent = mediaContainer.querySelector(`#${targetId}`);

      if (matchingContent) {
        document
          .querySelectorAll(".option_media_block")
          .forEach((b) => b.classList.toggle("active", b.id === blockName));

        tabs.forEach((t) => t.classList.toggle("active", t === tab));

        contents.forEach((c) =>
          c.classList.toggle("active", c.id === targetId)
        );

        //matchingContent.scrollTop = 0;
        matchingContent.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document
          .querySelectorAll(".option_media_block")
          .forEach((b) => b.classList.remove("active"));

        tabs.forEach((t) => t.classList.toggle("active", t === tab));

        const summary = optionBlock.querySelector(".selected_opt_summay");
        if (summary) {
          const titleEl = summary.querySelector("p");
          if (titleEl) titleEl.textContent = tab.textContent.trim();
          const descEl = summary.querySelector("h5");
          if (descEl) descEl.textContent = "";
        }

        const optElem = optionBlock.querySelector("[data-option-price]");
        if (optElem) {
          optElem.dataset.optionPrice = (0).toFixed(2);
        }

        updateFooterSummary();
      }
    });
  });
});

// End Options/suboptions linking logic

// Handle View button click

document.querySelectorAll(".btn_view").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const parentItem = button.closest(".customizer-tab-item");
    const imageUrl = parentItem?.getAttribute("data-img");
    if (!imageUrl) return;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "image-popup-overlay";

    const wrapper = document.createElement("div");
    wrapper.className = "image-popup-wrapper";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Preview";
    img.className = "image-popup-img";

    const closeBtn = document.createElement("button");
    closeBtn.className = "image-popup-close";
    closeBtn.innerHTML = "&times;";

    const closePopup = () => {
      overlay.classList.remove("active");
      document.body.style.overflow = ""; // unlock scroll
      setTimeout(() => overlay.remove(), 300);
    };

    closeBtn.addEventListener("click", closePopup);

    overlay.appendChild(wrapper);
    wrapper.appendChild(closeBtn);
    wrapper.appendChild(img);
    document.body.appendChild(overlay);

    // Fade-in
    requestAnimationFrame(() => overlay.classList.add("active"));
    document.body.style.overflow = "hidden"; // lock scroll

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });

    document.addEventListener("keydown", function escListener(e) {
      if (e.key === "Escape") {
        closePopup();
        document.removeEventListener("keydown", escListener);
      }
    });
  });
});

// End Handle View button

// Handle Select button click
document.querySelectorAll(".btn_select").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const tabItem = button.closest(".customizer-tab-item");
    if (!tabItem) return;

    const title = tabItem.getAttribute("data-title");
    const price = tabItem.getAttribute("data-price");

    const mediaBlock = tabItem.closest(".option_media_block");
    if (!mediaBlock) return;

    const blockId = mediaBlock.id;
    if (!blockId) return;

    const targetBlock = document.querySelector(`[data-blockname="${blockId}"]`);
    if (!targetBlock) return;

    const summaryBox = targetBlock.querySelector(".selected_opt_summay");
    if (!summaryBox) return;

    const summaryTitle = summaryBox.querySelector("p");
    const summaryPrice = summaryBox.querySelector("h5");

    if (summaryTitle) summaryTitle.textContent = title;
    if (summaryPrice) summaryPrice.textContent = `+€${price}`;

    const optElem = targetBlock.querySelector("[data-option-price]");
    if (optElem) {
      // ensure two-decimal format:
      optElem.dataset.optionPrice = parseFloat(price).toFixed(2);
    }

    mediaBlock.classList.remove("active");

    document
      .querySelector(".customizer-container")
      .scrollIntoView({ behavior: "smooth", block: "start" });

    updateFooterSummary();
  });
});
// End Handle Select button click

// Handle Media Item click

document.querySelectorAll(".customizer-tab-item").forEach((item) => {
  item.addEventListener("click", () => {
    // Find the block this item belongs to
    const block = item.closest(".option_media_block");
    if (!block) return;

    // Remove selected only from items in this same block
    block
      .querySelectorAll(".customizer-tab-item.selected")
      .forEach((i) => i.classList.remove("selected"));

    // Mark this one as selected
    item.classList.add("selected");
  });
});

function updateFooterSummary() {
  // parse "375,00" or "375.00" -> 375
  const parsePrice = (v) => {
    if (v == null) return 0;
    const n = parseFloat(
      String(v)
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    );
    return isNaN(n) ? 0 : n;
  };

  let total = 0;

  // cache footer rows by their <h4> text (we only READ these, never change)
  const footerRows = Array.from(
    document.querySelectorAll(".customizer_summary_item .sum_optionTitle")
  );

  document
    .querySelectorAll(".customizer_optionBlock")
    .forEach((optionBlock) => {
      const h2 = optionBlock.querySelector(".customizer_optTitle h2");
      if (!h2) return;
      const heading = h2.textContent.trim();

      // selected label/value for this block
      let selectedText = "";
      const checked = optionBlock.querySelector('input[type="radio"]:checked');

      if (checked) {
        const lbl = optionBlock.querySelector(`label[for="${checked.id}"]`);
        selectedText =
          lbl?.querySelector(".option-title")?.textContent?.trim() ||
          lbl?.dataset.label?.trim() ||
          checked.value?.trim() ||
          "";
      } else {
        selectedText =
          optionBlock
            .querySelector(".selected_opt_summay p")
            ?.textContent?.trim() || "";
      }

      if (!selectedText) selectedText = "Select Option";

      // write ONLY the <p> in the matching footer row
      const footerRow = footerRows.find(
        (r) => r.querySelector("h4")?.textContent.trim() === heading
      );
      if (footerRow) {
        const p = footerRow.querySelector("p");
        if (p) p.textContent = selectedText;
      }

      // accumulate price from this block
      const pricedEl = optionBlock.querySelector("[data-option-price]");
      if (pricedEl) total += parsePrice(pricedEl.dataset.optionPrice);
    });

  const totalP = document.querySelector(".customizer_total p");
  if (totalP) totalP.textContent = total.toFixed(2);

  updateAtcButtonState();
}

function updateAtcButtonState() {
  const btn = document.querySelector(".atc_btn");
  if (!btn) return;

  const label = btn.querySelector("span");

  // Every option block must have either a checked radio
  // OR a non-default summary value
  const allDone = Array.from(
    document.querySelectorAll(".customizer_optionBlock")
  ).every((block) => {
    const hasRadio = !!block.querySelector('input[type="radio"]:checked');
    const text = (
      block.querySelector(".selected_opt_summay p")?.textContent || ""
    )
      .trim()
      .toLowerCase();
    const hasSummary = text && text !== "select option";
    return hasRadio || hasSummary;
  });

  btn.disabled = !allDone;
  btn.classList.toggle("disabled", !allDone);
}

// Run on load
document.addEventListener("DOMContentLoaded", updateFooterSummary);

// Expose for your handlers
window.updateFooterSummary = updateFooterSummary;

const swiper = new Swiper(".swiper", {
  direction: "vertical",
  slidesPerView: 1,
  spaceBetween: 0,
  mousewheel: true,
  grabCursor: true,
  effect: "slide",
  speed: 500,
  preventInteractionOnTransition: true,
  allowTouchMove: true,
  resistance: true,
  resistanceRatio: 0.7,
  followFinger: true,
  touchReleaseOnEdges: true,
  freeMode: false,
  freeModeSticky: false,
});

document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".summary_accordion");
  if (!trigger) return;

  const footer = trigger.closest(".customizer_footer");
  if (footer) footer.classList.toggle("active");
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".atc_btn");
  if (!btn) return;
  e.preventDefault();
  if (btn.disabled) return;

  const label = btn.querySelector("span");
  const originalText = label ? label.textContent : "";
  btn.disabled = true;
  if (label)
    label.textContent = window.general.addingToCart || "ADDING TO THE CART";

  let success = false;
  try {
    window.updateFooterSummary?.();

    const props = {};
    const missing = [];
    document
      .querySelectorAll(
        ".customizer_summary_item .sum_optionTitle:not(.customizer_total)"
      )
      .forEach((row) => {
        const title = row.querySelector("h4")?.textContent.trim() || "";
        const value = row.querySelector("p")?.textContent.trim() || "";
        if (!value || /select option/i.test(value)) missing.push(title);
        else props[title] = value;
      });

    if (missing.length) {
      alert("Please select: " + missing.join(", "));
      return;
    }

    const total = document
      .querySelector(".customizer_total p")
      ?.textContent.trim();
    if (total) props["Price"] = total;

    const id = document.querySelector('input[name="id"]')?.value;
    if (!id) {
      alert("Variant ID missing.");
      return;
    }

    const res = await fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        items: [{ id: Number(id), quantity: 1, properties: props }],
      }),
    });

    if (!res.ok) {
      let msg = "Add to cart failed.";
      try {
        const err = await res.json();
        msg = err?.description || err?.message || msg;
      } catch (_) {}
      alert(msg);
      return;
    }

    success = true;
    window.location.href = "/cart";
  } catch (_) {
    alert("Network error. Please try again.");
  } finally {
    if (!success) {
      btn.disabled = false;
      if (label) label.textContent = originalText;
    }
  }
});
