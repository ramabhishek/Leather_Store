const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const addButtons = document.querySelectorAll(".add-btn");
const menuBtn = document.getElementById("menuBtn");
const topNav = document.getElementById("topNav");
const cartTotal = document.getElementById("cartTotal");
const startCheckoutBtn = document.getElementById("startCheckout");
const toast = document.getElementById("toast");

const checkoutOverlay = document.getElementById("checkoutOverlay");
const closeCheckoutBtn = document.getElementById("closeCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const payButton = document.getElementById("payButton");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");
const paymentTabs = document.querySelectorAll(".payment-tab");
const paymentPanels = document.querySelectorAll(".payment-panel");

const productCards = document.querySelectorAll(".product-card");
const filterChips = document.querySelectorAll(".filter-chip");
const viewButtons = document.querySelectorAll(".view-btn");
const spotlightImage = document.getElementById("spotlightImage");
const spotlightName = document.getElementById("spotlightName");
const spotlightDesc = document.getElementById("spotlightDesc");
const spotlightMaterial = document.getElementById("spotlightMaterial");
const spotlightPrice = document.getElementById("spotlightPrice");
const spotlightAddBtn = document.getElementById("spotlightAddBtn");
const metricValues = document.querySelectorAll(".metric-value");
const revealItems = document.querySelectorAll(".reveal");
const cursorGlow = document.getElementById("cursorGlow");
const heroImage = document.querySelector(".hero-image");

const items = [];
let activePaymentMethod = "upi";
let toastTimer = null;
let countersAnimated = false;

function formatINR(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function parseINR(priceText) {
  const numeric = Number(String(priceText || "").replace(/[^0-9]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");
  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function getCartTotal() {
  return items.reduce((sum, entry) => sum + entry.amount, 0);
}

function addToCart(productName, priceText, shouldOpenCart = true) {
  const amount = parseINR(priceText);
  const name = productName || "Leather Item";

  items.push({ name, amount });
  renderCart();
  renderCheckoutSummary();
  if (shouldOpenCart) {
    openCart();
  }
  showToast(`${name} added to cart`);
}

function renderCart() {
  const totalAmount = getCartTotal();
  cartCount.textContent = String(items.length);
  cartTotal.textContent = formatINR(totalAmount);
  cartItems.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "Your cart is empty.";
    cartItems.appendChild(empty);
    return;
  }

  items.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.name} - ${formatINR(entry.amount)}`;
    cartItems.appendChild(item);
  });
}

function renderCheckoutSummary() {
  const totalAmount = getCartTotal();
  checkoutItems.innerHTML = "";
  checkoutSubtotal.textContent = formatINR(totalAmount);
  checkoutTotal.textContent = formatINR(totalAmount);
  payButton.textContent = `Pay ${formatINR(totalAmount)}`;

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "No items added yet.";
    checkoutItems.appendChild(empty);
    return;
  }

  items.forEach((entry) => {
    const row = document.createElement("li");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = entry.name;
    value.textContent = formatINR(entry.amount);
    row.append(label, value);
    checkoutItems.appendChild(row);
  });
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  checkoutOverlay.classList.add("open");
  checkoutOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCheckout() {
  checkoutOverlay.classList.remove("open");
  checkoutOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function setPaymentMethod(method) {
  activePaymentMethod = method;

  paymentTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.method === method);
  });

  paymentPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === method;
    panel.classList.toggle("active", isActive);
    panel.querySelectorAll("input, select").forEach((field) => {
      field.disabled = !isActive;
    });
  });
}

function updateSpotlightFromCard(card, shouldScroll = false) {
  if (!card) {
    return;
  }

  const name = card.dataset.name || "Leather Item";
  const material = card.dataset.material || "Authentic Leather";
  const description = card.dataset.story || "Crafted with durable leather and premium finishing.";
  const image = card.dataset.image || "";
  const priceLabel =
    card.dataset.priceLabel || formatINR(Number(card.dataset.price || 0));

  spotlightName.textContent = name;
  spotlightMaterial.textContent = material;
  spotlightDesc.textContent = description;
  spotlightPrice.textContent = priceLabel;
  spotlightImage.src = image;
  spotlightImage.alt = name;

  spotlightAddBtn.dataset.product = name;
  spotlightAddBtn.dataset.price = priceLabel;

  productCards.forEach((productCard) => {
    productCard.classList.toggle("is-highlight", productCard === card);
  });

  if (shouldScroll && window.innerWidth < 980) {
    document.getElementById("spotlightCard")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}

function setActiveFilter(filter) {
  filterChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  });

  productCards.forEach((card) => {
    const cardFilter = card.dataset.category || "";
    const isVisible = filter === "all" || filter === cardFilter;
    card.classList.toggle("is-hidden", !isVisible);
  });

  const firstVisible = Array.from(productCards).find(
    (card) => !card.classList.contains("is-hidden")
  );

  if (firstVisible) {
    updateSpotlightFromCard(firstVisible);
  }
}

function initializeRevealAnimation() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function animateCounter(element, target, suffix = "") {
  const duration = 1200;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = Math.floor(progress * target);
    element.textContent = `${current.toLocaleString("en-IN")}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function initializeMetricCounters() {
  if (!metricValues.length) {
    return;
  }

  const heroMetrics = document.querySelector(".hero-metrics");
  if (!heroMetrics) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    metricValues.forEach((valueNode) => {
      const target = Number(valueNode.dataset.target || 0);
      const suffix = valueNode.dataset.suffix || "";
      valueNode.textContent = `${target.toLocaleString("en-IN")}${suffix}`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (!isVisible || countersAnimated) {
        return;
      }

      countersAnimated = true;
      metricValues.forEach((valueNode) => {
        const target = Number(valueNode.dataset.target || 0);
        const suffix = valueNode.dataset.suffix || "";
        animateCounter(valueNode, target, suffix);
      });
      observer.disconnect();
    },
    { threshold: 0.45 }
  );

  observer.observe(heroMetrics);
}

function initializeCursorGlow() {
  if (!cursorGlow) {
    return;
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer) {
    return;
  }

  document.body.classList.add("glow-active");
  window.addEventListener(
    "pointermove",
    (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}

function initializeCardTilt() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer) {
    return;
  }

  productCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const percentX = (event.clientX - rect.left) / rect.width;
      const percentY = (event.clientY - rect.top) / rect.height;
      const rotateY = (percentX - 0.5) * 7;
      const rotateX = (0.5 - percentY) * 6;
      card.style.transform = `perspective(760px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  if (heroImage) {
    heroImage.addEventListener("mousemove", (event) => {
      const rect = heroImage.getBoundingClientRect();
      const percentX = (event.clientX - rect.left) / rect.width;
      const percentY = (event.clientY - rect.top) / rect.height;
      const rotateY = (percentX - 0.5) * 4;
      const rotateX = (0.5 - percentY) * 3;
      heroImage.style.transform = `perspective(720px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroImage.addEventListener("mouseleave", () => {
      heroImage.style.transform = "";
    });
  }
}

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);

startCheckoutBtn.addEventListener("click", () => {
  if (!items.length) {
    checkoutMessage.classList.add("error");
    checkoutMessage.textContent = "Add at least one product to continue checkout.";
    showToast("Your cart is empty");
    openCart();
    return;
  }

  checkoutMessage.classList.remove("error");
  checkoutMessage.textContent = "";
  renderCheckoutSummary();
  closeCart();
  openCheckout();
});

closeCheckoutBtn.addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", (event) => {
  if (event.target === checkoutOverlay) {
    closeCheckout();
  }
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.product, button.dataset.price);
  });
});

spotlightAddBtn.addEventListener("click", () => {
  addToCart(spotlightAddBtn.dataset.product, spotlightAddBtn.dataset.price);
});

productCards.forEach((card) => {
  card.addEventListener("mouseenter", () => updateSpotlightFromCard(card));
  card.addEventListener("focusin", () => updateSpotlightFromCard(card));
});

viewButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const card = event.currentTarget.closest(".product-card");
    updateSpotlightFromCard(card, true);
    showToast("Spotlight updated");
  });
});

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter || "all";
    setActiveFilter(filter);
  });
});

menuBtn.addEventListener("click", () => {
  topNav.classList.toggle("open");
});

paymentTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setPaymentMethod(tab.dataset.method || "upi");
  });
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const totalAmount = getCartTotal();

  if (!totalAmount) {
    checkoutMessage.classList.add("error");
    checkoutMessage.textContent = "Your cart is empty.";
    return;
  }

  const labelMap = {
    upi: "UPI",
    credit: "Credit Card",
    debit: "Debit Card",
  };

  checkoutMessage.classList.remove("error");
  checkoutMessage.textContent = `Demo payment successful via ${
    labelMap[activePaymentMethod]
  } for ${formatINR(totalAmount)}.`;
  showToast("Payment successful");

  checkoutForm.reset();
  setPaymentMethod(activePaymentMethod);
  items.length = 0;
  renderCart();
  renderCheckoutSummary();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (checkoutOverlay.classList.contains("open")) {
      closeCheckout();
      return;
    }
    closeCart();
  }
});

document.body.classList.add("ui-animated");

setPaymentMethod("upi");
setActiveFilter("all");
renderCart();
renderCheckoutSummary();
initializeRevealAnimation();
initializeMetricCounters();
initializeCursorGlow();
initializeCardTilt();
