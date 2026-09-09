const API_URL = "";

const DEFAULT_WAITER_ID = "waiter01";
const DEFAULT_WAITER_PASSWORD = "1234";

let menu = [];
let cart = [];
let orders = [];
let selectedTable = null;
let selectedCategory = "All";
let currentWaiter = null;

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
    loadLocalData();
    setupEvents();

    if (currentWaiter) {
        showApp();
        await loadData();
    } else {
        showLogin();
    }
}

function setupEvents() {
    document.addEventListener("click", handleClick);

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput
        ? usernameInput.value.trim()
        : "";

    const password = passwordInput
        ? passwordInput.value
        : "";

    if (!username || !password) {
        showLoginError("Enter waiter ID and password.");
        return;
    }

    if (API_URL) {
        try {
            showLoader(true);

            const result = await apiRequest("login", {
                username,
                password
            });

            if (!result.success) {
                showLoginError(
                    result.message || "Invalid credentials."
                );
                return;
            }

            currentWaiter = result.user;

        } catch (error) {
            showLoginError(
                "Unable to connect to server."
            );
            return;

        } finally {
            showLoader(false);
        }

    } else {
        if (
            username !== DEFAULT_WAITER_ID ||
            password !== DEFAULT_WAITER_PASSWORD
        ) {
            showLoginError(
                "Invalid waiter ID or password."
            );
            return;
        }

        currentWaiter = {
            username: DEFAULT_WAITER_ID,
            name: "Waiter 01",
            role: "waiter"
        };
    }

    localStorage.setItem(
        "pankaj_waiter",
        JSON.stringify(currentWaiter)
    );

    showApp();
    await loadData();
}

function showLogin() {
    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (app) {
        app.style.display = "none";
    }
}

function showApp() {
    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "block";
    }

    updateWaiterUI();
}

function updateWaiterUI() {
    if (!currentWaiter) return;

    const name =
        currentWaiter.name ||
        currentWaiter.username ||
        "Waiter";

    const nameElement =
        document.getElementById("waiterName");

    const avatarElement =
        document.getElementById("waiterAvatar");

    if (nameElement) {
        nameElement.textContent = name;
    }

    if (avatarElement) {
        avatarElement.textContent =
            name.charAt(0).toUpperCase();
    }
}

function logout() {
    currentWaiter = null;
    cart = [];
    selectedTable = null;

    localStorage.removeItem("pankaj_waiter");

    showLogin();
}

async function loadData() {
    if (API_URL) {
        try {
            showLoader(true);

            const result =
                await apiRequest("getData");

            if (result.success) {
                menu = Array.isArray(result.menu)
                    ? result.menu
                    : [];

                orders = Array.isArray(result.orders)
                    ? result.orders
                    : [];
            }

        } catch (error) {
            showToast(
                "Failed to load restaurant data."
            );

        } finally {
            showLoader(false);
        }
    }

    if (!menu.length) {
        menu = getDefaultMenu();
    }

    renderCategories();
    renderMenu();
    renderTables();
    renderOrders();
    renderCart();
}

function getDefaultMenu() {
    return [
        {
            id: "M001",
            name: "Chicken Biriyani",
            category: "Biriyani",
            price: 160,
            description: "Traditional chicken biriyani",
            image: "",
            available: true
        },
        {
            id: "M002",
            name: "Beef Biriyani",
            category: "Biriyani",
            price: 180,
            description: "Malabar style beef biriyani",
            image: "",
            available: true
        },
        {
            id: "M003",
            name: "Mutton Biriyani",
            category: "Biriyani",
            price: 220,
            description: "Tender mutton biriyani",
            image: "",
            available: true
        },
        {
            id: "M004",
            name: "Chicken Fried Rice",
            category: "Rice",
            price: 140,
            description: "Chicken fried rice",
            image: "",
            available: true
        },
        {
            id: "M005",
            name: "Chicken Noodles",
            category: "Noodles",
            price: 140,
            description: "Spicy chicken noodles",
            image: "",
            available: true
        },
        {
            id: "M006",
            name: "Chicken 65",
            category: "Starters",
            price: 150,
            description: "Crispy spicy chicken",
            image: "",
            available: true
        },
        {
            id: "M007",
            name: "Porotta",
            category: "Breads",
            price: 15,
            description: "Kerala layered flatbread",
            image: "",
            available: true
        },
        {
            id: "M008",
            name: "Chicken Curry",
            category: "Curries",
            price: 130,
            description: "Kerala style chicken curry",
            image: "",
            available: true
        }
    ];
}

function renderCategories() {
    const container =
        document.querySelector(".categories");

    if (!container) return;

    const categories = [
        "All",
        ...new Set(
            menu
                .map(item => item.category)
                .filter(Boolean)
        )
    ];

    container.innerHTML =
        categories.map(category => `
            <button
                class="category-btn ${
                    category === selectedCategory
                        ? "active"
                        : ""
                }"
                data-category="${escapeAttribute(category)}"
            >
                ${escapeHTML(category)}
            </button>
        `).join("");
}

function renderMenu() {
    const container =
        document.querySelector(".menu-grid");

    if (!container) return;

    const filteredMenu =
        selectedCategory === "All"
            ? menu
            : menu.filter(
                item =>
                    item.category === selectedCategory
            );

    if (!filteredMenu.length) {
        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                padding:40px;
                text-align:center;
                color:#999;
            ">
                No items available
            </div>
        `;

        return;
    }

    container.innerHTML =
        filteredMenu.map(item => {
            const unavailable =
                item.available === false;

            return `
                <div class="menu-item ${
                    unavailable
                        ? "item-unavailable"
                        : ""
                }">

                    <div class="item-image">
                        ${
                            item.image
                                ? `
                                    <img
                                        src="${escapeAttribute(item.image)}"
                                        alt="${escapeAttribute(item.name)}"
                                    >
                                `
                                : "🍽️"
                        }
                    </div>

                    <div class="item-info">

                        <div class="item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="item-description">
                            ${escapeHTML(
                                item.description || ""
                            )}
                        </div>

                        <div class="item-bottom">

                            <div>
                                ${
                                    unavailable
                                        ? `
                                            <span class="unavailable-label">
                                                Unavailable
                                            </span>
                                        `
                                        : `
                                            <span class="item-price">
                                                ₹${formatMoney(item.price)}
                                            </span>
                                        `
                                }
                            </div>

                            ${
                                unavailable
                                    ? ""
                                    : `
                                        <button
                                            class="add-btn"
                                            data-add-item="${escapeAttribute(item.id)}"
                                        >
                                            +
                                        </button>
                                    `
                            }

                        </div>

                    </div>

                </div>
            `;
        }).join("");
}

function renderTables() {
    const container =
        document.querySelector(".table-grid");

    if (!container) return;

    const tables = Array.from(
        { length: 20 },
        (_, index) => index + 1
    );

    container.innerHTML =
        tables.map(table => `
            <button
                class="table-btn ${
                    selectedTable === table
                        ? "active"
                        : ""
                }"
                data-table="${table}"
            >
                T${table}
            </button>
        `).join("");

    updateCartTable();
}

function renderCart() {
    const container =
        document.querySelector(".cart-items");

    if (!container) return;

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-cart">
                Select items from the menu
            </div>
        `;

    } else {
        container.innerHTML =
            cart.map(item => `
                <div class="cart-item">

                    <div class="cart-item-top">

                        <div class="cart-item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="cart-item-price">
                            ₹${formatMoney(
                                item.price * item.qty
                            )}
                        </div>

                    </div>

                    <div class="cart-controls">

                        <div class="qty-controls">

                            <button
                                class="qty-btn"
                                data-qty-minus="${escapeAttribute(item.id)}"
                            >
                                −
                            </button>

                            <span class="qty">
                                ${item.qty}
                            </span>

                            <button
                                class="qty-btn"
                                data-qty-plus="${escapeAttribute(item.id)}"
                            >
                                +
                            </button>

                        </div>

                        <button
                            class="remove-btn"
                            data-remove-item="${escapeAttribute(item.id)}"
                        >
                            Remove
                        </button>

                    </div>

                </div>
            `).join("");
    }

    updateCartSummary();
    updateMobileCart();
}

function addToCart(itemId) {
    const item =
        menu.find(
            menuItem =>
                String(menuItem.id) ===
                String(itemId)
        );

    if (!item || item.available === false) {
        return;
    }

    const existing =
        cart.find(
            cartItem =>
                String(cartItem.id) ===
                String(itemId)
        );

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            qty: 1
        });
    }

    renderCart();

    showToast(
        `${item.name} added`
    );
}

function changeQuantity(itemId, amount) {
    const item =
        cart.find(
            cartItem =>
                String(cartItem.id) ===
                String(itemId)
        );

    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
        cart =
            cart.filter(
                cartItem =>
                    String(cartItem.id) !==
                    String(itemId)
            );
    }

    renderCart();
}

function removeFromCart(itemId) {
    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(itemId)
        );

    renderCart();
}

function updateCartSummary() {
    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                item.price * item.qty,
            0
        );

    const itemCount =
        cart.reduce(
            (total, item) =>
                total + item.qty,
            0
        );

    const subtotalElement =
        document.getElementById("subtotal");

    const totalElement =
        document.getElementById("total");

    const countElement =
        document.getElementById("cartCount");

    const confirmButton =
        document.getElementById(
            "confirmOrderBtn"
        );

    if (subtotalElement) {
        subtotalElement.textContent =
            `₹${formatMoney(subtotal)}`;
    }

    if (totalElement) {
        totalElement.textContent =
            `₹${formatMoney(subtotal)}`;
    }

    if (countElement) {
        countElement.textContent =
            itemCount;
    }

    if (confirmButton) {
        confirmButton.disabled =
            !selectedTable ||
            cart.length === 0;
    }
}

function updateCartTable() {
    const element =
        document.querySelector(".cart-table");

    if (!element) return;

    element.textContent =
        selectedTable
            ? `Table ${selectedTable}`
            : "No table";
}

function updateMobileCart() {
    const bar =
        document.querySelector(
            ".mobile-cart-bar"
        );

    if (!bar) return;

    const itemCount =
        cart.reduce(
            (total, item) =>
                total + item.qty,
            0
        );

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price * item.qty,
            0
        );

    const info =
        bar.querySelector(
            ".mobile-cart-info"
        );

    if (info) {
        info.innerHTML = `
            <span>
                ${itemCount}
                item${itemCount === 1 ? "" : "s"}
            </span>

            <strong>
                ₹${formatMoney(total)}
            </strong>
        `;
    }
}

function selectTable(table) {
    selectedTable =
        Number(table);

    renderTables();
    updateCartSummary();

    showToast(
        `Table ${selectedTable} selected`
    );
}

function selectCategory(category) {
    selectedCategory =
        category;

    renderCategories();
    renderMenu();
}

async function confirmOrder() {
    if (!selectedTable) {
        showToast(
            "Select a table first."
        );
        return;
    }

    if (!cart.length) {
        showToast(
            "Add at least one item."
        );
        return;
    }

    const noteElement =
        document.getElementById(
            "orderNote"
        );

    const note =
        noteElement
            ? noteElement.value.trim()
            : "";

    const order = {
        id: generateOrderId(),
        table: selectedTable,
        waiter:
            currentWaiter?.name ||
            currentWaiter?.username ||
            "Waiter",
        items:
            cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty
            })),
        note,
        total:
            cart.reduce(
                (sum, item) =>
                    sum +
                    item.price *
                    item.qty,
                0
            ),
        status: "Pending",
        createdAt:
            new Date().toISOString()
    };

    try {
        showLoader(true);

        if (API_URL) {
            const result =
                await apiRequest(
                    "createOrder",
                    order
                );

            if (!result.success) {
                showToast(
                    result.message ||
                    "Order failed."
                );
                return;
            }

            if (result.order) {
                orders.unshift(
                    result.order
                );
            } else {
                orders.unshift(order);
            }

        } else {
            orders.unshift(order);
            saveLocalOrders();
        }

        cart = [];

        if (noteElement) {
            noteElement.value = "";
        }

        renderCart();
        renderOrders();

        showToast(
            `Order ${order.id} confirmed`
        );

    } catch (error) {
        showToast(
            "Unable to place order."
        );

    } finally {
        showLoader(false);
    }
}

function renderOrders() {
    const container =
        document.querySelector(
            ".orders-list"
        );

    if (!container) return;

    if (!orders.length) {
        container.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:#999;
                background:#fff;
                border:1px solid #eee;
                border-radius:14px;
            ">
                No orders yet
            </div>
        `;

        updateOrderCount();
        return;
    }

    container.innerHTML =
        orders
            .slice(0, 20)
            .map(order => `
                <div class="order-card">

                    <div class="order-card-header">

                        <div class="order-number">
                            ${escapeHTML(
                                order.id
                            )}
                            · T${escapeHTML(
                                String(order.table)
                            )}
                        </div>

                        <div class="status">
                            ${escapeHTML(
                                order.status ||
                                "Pending"
                            )}
                        </div>

                    </div>

                    <div class="order-items">
                        ${
                            Array.isArray(
                                order.items
                            )
                                ? order.items
                                    .map(
                                        item =>
                                            `${escapeHTML(
                                                item.name
                                            )} × ${item.qty}`
                                    )
                                    .join("<br>")
                                : ""
                        }
                    </div>

                    <div class="order-total">

                        <span>
                            Total
                        </span>

                        <span>
                            ₹${formatMoney(
                                order.total
                            )}
                        </span>

                    </div>

                    ${
                        order.status !==
                        "Completed"
                            ? `
                                <button
                                    class="edit-order-btn"
                                    data-edit-order="${escapeAttribute(order.id)}"
                                >
                                    Edit Order
                                </button>
                            `
                            : ""
                    }

                </div>
            `)
            .join("");

    updateOrderCount();
}

function updateOrderCount() {
    const element =
        document.querySelector(
            ".order-count"
        );

    if (!element) return;

    const activeOrders =
        orders.filter(
            order =>
                order.status !==
                "Completed"
        ).length;

    element.textContent =
        `${activeOrders} Active`;
}

function editOrder(orderId) {
    const order =
        orders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) return;

    selectedTable =
        Number(order.table);

    cart =
        Array.isArray(order.items)
            ? order.items.map(
                item => ({
                    id: item.id,
                    name: item.name,
                    price:
                        Number(item.price) ||
                        0,
                    qty:
                        Number(item.qty) ||
                        1
                })
            )
            : [];

    renderTables();
    renderCart();

    const noteElement =
        document.getElementById(
            "orderNote"
        );

    if (noteElement) {
        noteElement.value =
            order.note || "";
    }

    showToast(
        `${order.id} loaded for editing`
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function handleClick(event) {
    const target =
        event.target.closest("button");

    if (!target) return;

    if (target.dataset.category) {
        selectCategory(
            target.dataset.category
        );
        return;
    }

    if (target.dataset.table) {
        selectTable(
            target.dataset.table
        );
        return;
    }

    if (target.dataset.addItem) {
        addToCart(
            target.dataset.addItem
        );
        return;
    }

    if (target.dataset.qtyPlus) {
        changeQuantity(
            target.dataset.qtyPlus,
            1
        );
        return;
    }

    if (target.dataset.qtyMinus) {
        changeQuantity(
            target.dataset.qtyMinus,
            -1
        );
        return;
    }

    if (target.dataset.removeItem) {
        removeFromCart(
            target.dataset.removeItem
        );
        return;
    }

    if (target.dataset.editOrder) {
        editOrder(
            target.dataset.editOrder
        );
        return;
    }

    if (
        target.id ===
        "confirmOrderBtn"
    ) {
        confirmOrder();
        return;
    }

    if (
        target.id ===
        "mobileCartBtn"
    ) {
        toggleMobileCart();
        return;
    }
}

function toggleMobileCart() {
    const cartElement =
        document.querySelector(".cart");

    if (!cartElement) return;

    cartElement.classList.toggle(
        "mobile-open"
    );
}

async function apiRequest(
    action,
    data = {}
) {
    if (!API_URL) {
        return {
            success: false,
            message:
                "API URL not configured."
        };
    }

    const response =
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action,
                ...data
            })
        });

    return await response.json();
}

function loadLocalData() {
    try {
        const waiter =
            localStorage.getItem(
                "pankaj_waiter"
            );

        if (waiter) {
            currentWaiter =
                JSON.parse(waiter);
        }

        const savedOrders =
            localStorage.getItem(
                "pankaj_orders"
            );

        if (savedOrders) {
            orders =
                JSON.parse(
                    savedOrders
                );
        }

    } catch (error) {
        currentWaiter = null;
        orders = [];
    }
}

function saveLocalOrders() {
    localStorage.setItem(
        "pankaj_orders",
        JSON.stringify(orders)
    );
}

function generateOrderId() {
    const date =
        new Date();

    const datePart =
        date
            .toISOString()
            .slice(0, 10)
            .replaceAll("-", "");

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `PK-${datePart}-${random}`;
}

function formatMoney(value) {
    return Number(value || 0)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}

function showToast(message) {
    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {
            toast.classList.remove(
                "show"
            );
        }, 2200);
}

function showLoader(show) {
    const loader =
        document.getElementById(
            "loader"
        );

    if (!loader) return;

    loader.style.display =
        show
            ? "flex"
            : "none";
}

function showLoginError(message) {
    const errorBox =
        document.getElementById(
            "loginError"
        );

    if (!errorBox) return;

    errorBox.textContent =
        message;

    errorBox.style.display =
        "block";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}
