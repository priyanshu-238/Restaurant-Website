// =================== CONSTANTS =================== //
const API_BASE = "http://localhost:3000/api";
const SECRET_KEY = "zomato_clone_secret_key"; // backend use only

// =================== SIGNUP =================== //
async function signupUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Signup successful!");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("Server error");
  }

  return false;
}

// =================== LOGIN =================== //
async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong!");
  }

  return false;
}

// =================== USER GREETING =================== //
function greetUser() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const greetEl = document.getElementById("userGreeting");
  const greetHomeEl = document.getElementById("userGreetingHome");

  if (user) {
    if (greetEl) greetEl.textContent = `Welcome, ${user.name}!`;
    if (greetHomeEl) greetHomeEl.textContent = `Hi, ${user.name}`;
  }
}

// =================== LOGOUT =================== //
function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("token");
  alert("You have been logged out.");
  window.location.href = "login.html";
}

// =================== SEARCH =================== //
function search() {
  const input = document
    .querySelector(".search-input input")
    .value.trim()
    .toLowerCase();
  const foodCards = document.querySelectorAll(".food-card");
  let found = false;

  foodCards.forEach((card) => {
    const name = card.dataset.name.toLowerCase();
    if (name.includes(input)) {
      card.style.display = "block";
      found = true;
    } else {
      card.style.display = "none";
    }
  });

  let noResultElement = document.getElementById("no-results");
  if (!noResultElement) {
    noResultElement = document.createElement("div");
    noResultElement.id = "no-results";
    noResultElement.style.textAlign = "center";
    noResultElement.style.margin = "2rem";
    noResultElement.style.fontSize = "1.2rem";
    document.querySelector(".food-grid").appendChild(noResultElement);
  }

  noResultElement.textContent = found ? "" : "No results found.";
}

// =================== LOCATION DROPDOWN =================== //
function toggleDropdown() {
  const dropdown = document.getElementById("location-dropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function setLocation(city) {
  document.getElementById("selected-location").textContent = city;
  document.getElementById("location-dropdown").style.display = "none";
}

// =================== INSPIRATION SCROLL =================== //
function scrollLeft() {
  document
    .querySelector(".inspiration-items")
    ?.scrollBy({ left: -200, behavior: "smooth" });
}

function scrollRight() {
  document
    .querySelector(".inspiration-items")
    ?.scrollBy({ left: 200, behavior: "smooth" });
}

function enableDragScroll() {
  const container = document.querySelector(".inspiration-items");
  if (!container) return;

  let isDown = false,
    startX,
    scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.classList.add("active");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => (isDown = false));
  container.addEventListener("mouseup", () => (isDown = false));
  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  });
}

// =================== CART =================== //
function updateCartUI() {
  const cartItemsElement = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const floatingCartCount = document.getElementById("cart-count");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!cartItemsElement || !cartTotalElement || !floatingCartCount) return;

  cartItemsElement.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.name} - ₹${item.price} x ${item.quantity}`;
    cartItemsElement.appendChild(li);

    total += item.price * item.quantity;
    itemCount += item.quantity;
  });

  cartTotalElement.textContent = total;
  floatingCartCount.textContent = itemCount;
}

function addToCart(button) {
  const card = button.closest(".food-card");
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const countSpan = card.querySelector(".cart-count");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  countSpan.textContent = existingItem ? existingItem.quantity : 1;
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartUI();
  updateFloatingCartBtn();
}

function increaseQty(button) {
  const card = button.closest(".food-card");
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const countSpan = card.querySelector(".cart-count");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  countSpan.textContent = existingItem ? existingItem.quantity : 1;
  localStorage.setItem("cart", JSON.stringify(cart));

  updateFloatingCartBtn();
}

function decreaseQty(button) {
  const card = button.closest(".food-card");
  const name = card.dataset.name;
  const countSpan = card.querySelector(".cart-count");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemIndex = cart.findIndex((item) => item.name === name);

  if (itemIndex > -1) {
    cart[itemIndex].quantity--;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
      countSpan.textContent = 0;
    } else {
      countSpan.textContent = cart[itemIndex].quantity;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateFloatingCartBtn();
  }
}

function updateFloatingCartBtn() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBtn = document.getElementById("floatingCartBtn");

  if (!cartBtn) return;

  if (totalItems > 0) {
    cartBtn.innerHTML = `🛒 View Cart (${totalItems})`;
    cartBtn.classList.add("show");
  } else {
    cartBtn.innerHTML = `🛒 View Cart`;
    cartBtn.classList.remove("show");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  greetUser();
  enableDragScroll();
  updateFloatingCartBtn();

  const signupForm = document.getElementById("signupForm");
  if (signupForm) signupForm.onsubmit = signupUser;

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.onsubmit = loginUser;

  document.addEventListener("click", function (e) {
    const loc = document.querySelector(".location");
    if (!loc?.contains(e.target)) {
      const dropdown = document.getElementById("location-dropdown");
      if (dropdown) dropdown.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".search-input input")
    .addEventListener("input", search);
  greetUser(); // If needed to still call greeting
});
