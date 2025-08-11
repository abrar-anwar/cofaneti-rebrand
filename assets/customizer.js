// ===============================
// Options/suboptions linking logic
// ===============================
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
        if (optElem) optElem.dataset.optionPrice = (0).toFixed(2);

        updateFooterSummary();
      }
    });
  });
});

// ======================
// Handle View button
// ======================
document.querySelectorAll(".btn_view").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const parentItem = button.closest(".customizer-tab-item");
    const imageUrl = parentItem?.getAttribute("data-img");
    if (!imageUrl) return;

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
      document.body.style.overflow = "";
      setTimeout(() => overlay.remove(), 300);
    };

    closeBtn.addEventListener("click", closePopup);

    overlay.appendChild(wrapper);
    wrapper.appendChild(closeBtn);
    wrapper.appendChild(img);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("active"));
    document.body.style.overflow = "hidden";

    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) closePopup();
    });

    document.addEventListener("keydown", function escListener(evt) {
      if (evt.key === "Escape") {
        closePopup();
        document.removeEventListener("keydown", escListener);
      }
    });
  });
});

// ========================
// Handle Select button
// ========================
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
      optElem.dataset.optionPrice = parseFloat(price).toFixed(2);
    }

    mediaBlock.classList.remove("active");

    document
      .querySelector(".customizer-container")
      .scrollIntoView({ behavior: "smooth", block: "start" });

    updateFooterSummary();
  });
});

// =========================
// Handle Media Item click
// =========================
document.querySelectorAll(".customizer-tab-item").forEach((item) => {
  item.addEventListener("click", () => {
    const block = item.closest(".option_media_block");
    if (!block) return;

    block
      .querySelectorAll(".customizer-tab-item.selected")
      .forEach((i) => i.classList.remove("selected"));

    item.classList.add("selected");
  });
});

// =========================
// Footer summary + totals
// =========================
function updateFooterSummary() {
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

  const footerRows = Array.from(
    document.querySelectorAll(".customizer_summary_item .sum_optionTitle")
  );

  document
    .querySelectorAll(".customizer_optionBlock")
    .forEach((optionBlock) => {
      const h2 = optionBlock.querySelector(".customizer_optTitle h2");
      if (!h2) return;
      const heading = h2.textContent.trim();

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

      const footerRow = footerRows.find(
        (r) => r.querySelector("h4")?.textContent.trim() === heading
      );
      if (footerRow) {
        const p = footerRow.querySelector("p");
        if (p) p.textContent = selectedText;
      }

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

document.addEventListener("DOMContentLoaded", updateFooterSummary);

// Expose for your handlers
window.updateFooterSummary = updateFooterSummary;

// =========================
// Swiper + summary toggle
// =========================
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

// =========================
// Helpers (server + cart)
// =========================
function getSelectedSizeTitle() {
  const block = document.querySelector('[data-blockname="size__block"]');
  if (!block) return "";
  const checked = block.querySelector('input[name="sizes"]:checked');
  if (!checked) return "";
  const label = checked.closest("label");
  const titleEl = label ? label.querySelector(".option-title") : null;
  const title =
    titleEl && titleEl.textContent ? titleEl.textContent.trim() : "";
  return title || (checked.value ? String(checked.value).trim() : "");
}

function getTotalFromFooterNumber() {
  const el = document.querySelector(".customizer_total p");
  if (!el) return 0;
  let s = (el.textContent || "").trim();
  s = s.replace(",", ".").replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// If server returns a GID, extract the trailing numeric id
function toVariantNumericId(id) {
  if (id == null) return null;
  if (typeof id === "number") return id;
  const m = String(id).match(/(\d+)(?:\D*)$/);
  return m ? Number(m[1]) : null;
}

async function createVariantOnServer(payload) {
  const url =
    (window.general && window.general.createVariantEndpoint) ||
    "/apps/customizer/create-variant";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.description)) || "HTTP " + res.status;
    throw new Error(msg);
  }
  return data;
}

async function addVariantToCart(variantId, quantity, properties) {
  const payload = {
    items: [{ id: Number(variantId), quantity: Number(quantity) || 1 }],
  };
  if (properties && typeof properties === "object") {
    payload.items[0].properties = properties;
  }

  const res = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch (_) {
    data = { raw: await res.text() };
  }

  if (!res.ok) {
    const msg =
      (data && (data.description || data.message)) || "Failed to add to cart";
    throw new Error(msg);
  }
  return data;
}

const DELAY_BEFORE_CART_MS = 4000;
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function showCartErrorPopup() {
  const overlay = document.createElement("div");
  overlay.className = "image-popup-overlay active";

  const wrap = document.createElement("div");
  wrap.className = "image-popup-wrapper";

  const closeBtn = document.createElement("button");
  closeBtn.className = "image-popup-close";
  closeBtn.innerHTML = "&times;";

  const card = document.createElement("div");
  card.setAttribute(
    "style",
    "max-width:520px;background:#fff;padding:20px 24px;border-radius:8px;" +
      "box-shadow:0 2px 20px rgba(0,0,0,.25);font-size:16px;line-height:1.5;text-align:center;"
  );
  card.innerHTML = `
    <h3 style="margin:0 0 8px;font-size:18px;">Lo sentimos</h3>
    <p style="margin:0;">We are unable to add item to the cart at the moment,<br>
    please contact us on <strong>56573738</strong>.</p>
  `;

  const close = () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => overlay.remove(), 250);
  };

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) close();
  });

  wrap.appendChild(closeBtn);
  wrap.appendChild(card);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
}

// ==========================================
// ATC click handler (no spinner, 4s delay)
// ==========================================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".atc_btn");
  if (!btn) return;
  e.preventDefault();
  if (btn.disabled) return;

  const label = btn.querySelector("span");
  const originalText = label ? label.textContent : "";
  const baseAddingText =
    (window.general && window.general.addingToCart) || "ADDING TO THE CART";

  btn.disabled = true;
  if (label) label.textContent = baseAddingText;

  let success = false;
  try {
    // keep summary fresh
    window.updateFooterSummary?.();

    // Build line-item properties from the footer
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

    // Variant title = selected size
    const sizeTitle = getSelectedSizeTitle();
    if (!sizeTitle) {
      alert("Please select a size.");
      return;
    }

    // Price to send (what shopper sees)
    const totalNumber = getTotalFromFooterNumber();
    if (!totalNumber || totalNumber <= 0) {
      alert("Calculated price is missing.");
      return;
    }

    // Also store visible price on the line item
    props["Price"] = totalNumber.toFixed(2);

    // Create-variant payload for your server
    const payload = {
      productId: (window.general && window.general.productId) || undefined,
      title: sizeTitle,
      price: Number(totalNumber),
      profileId: (window.general && window.general.profileId) || undefined,
    };

    // 1) Create variant on your server
    const created = await createVariantOnServer(payload);
    const rawId =
      created?.variant?.id || created?.id || created?.variant_id || null;
    const newVariantId = toVariantNumericId(rawId);

    if (!newVariantId) {
      showCartErrorPopup();
      return;
    }

    // 2) Wait 4 seconds before adding to cart
    await delay(DELAY_BEFORE_CART_MS);

    // 3) Add newly-created variant to cart
    try {
      await addVariantToCart(newVariantId, 1, props);
    } catch (_) {
      showCartErrorPopup();
      return;
    }

    success = true;
    window.location.href = "/cart";
  } catch (_) {
    showCartErrorPopup();
  } finally {
    if (!success) {
      btn.disabled = false;
      if (label) label.textContent = originalText;
    }
  }
});
