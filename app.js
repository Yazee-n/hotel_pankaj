const API_URL = "";

let menu = [];
let cart = [];
let orders = [];
let selectedCategory = "All";

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
    loadLocalData();
    setupEvents();

    document.getElementById("app").style.display = "block";

    await loadData();
}

function setupEvents() {
    document.addEventListener("click", handleClick);

    const confirmButton =
        document.getElementById("confirmOrderButton");

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            confirmOrder
        );
    }

    const mobileCartButton =
        document.getElementById("mobileCartButton");

    if (mobileCartButton) {
        mobileCartButton.addEventListener(
            "click",
            toggleMobileCart
        );
    }
}

async function loadData() {
    if (API_URL) {
        try {
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
        }
    }

    if (!menu.length) {
        menu = getDefaultMenu();
    }

    renderCategories();
    renderMenu();
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
        document.getElementById("categories");

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
                type="button"
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
        document.getElementById("menuGrid");

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
            <div class="empty-cart">
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
                <article
                    class="menu-item ${
                        unavailable
                            ? "item-unavailable"
                            : ""
                    }"
                >

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

                            <span class="item-price">
                                ₹${formatMoney(item.price)}
                            </span>

                            ${
                                unavailable
                                    ? `
                                        <span class="unavailable-label">
                                            Unavailable
                                        </span>
                                    `
                                    : `
                                        <button
                                            type="button"
                                            class="add-btn"
                                            data-add-item="${escapeAttribute(item.id)}"
                                            aria-label="Add ${escapeAttribute(item.name)}"
                                        >
                                            +
                                        </button>
                                    `
                            }

                        </div>

                    </div>

                </article>
            `;
        }).join("");
}

function renderCart() {
    const container =
        document.getElementById("cartItems");

    if (!container) return;

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-cart">
                <strong>No items added</strong>
                <span>Select items from the menu</span>
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
                                type="button"
                                class="qty-btn"
                                data-qty-minus="${escapeAttribute(item.id)}"
                            >
                                −
                            </button>

                            <span class="qty">
                                ${item.qty}
                            </span>

                            <button
                                type="button"
                                class="qty-btn"
                                data-qty-plus="${escapeAttribute(item.id)}"
                            >
                                +
                            </button>

                        </div>

                        <button
                            type="button"
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
    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price * item.qty,
            0
        );

    const itemCount =
        cart.reduce(
            (sum, item) =>
                sum + item.qty,
            0
        );

    const countElement =
        document.getElementById("cartCount");

    const itemsElement =
        document.getElementById("summaryItems");

    const totalElement =
        document.getElementById("summaryTotal");

    const mobileTotalElement =
        document.getElementById("mobileCartTotal");

    const confirmButton =
        document.getElementById(
            "confirmOrderButton"
        );

    if (countElement) {
        countElement.textContent =
            itemCount;
    }

    if (itemsElement) {
        itemsElement.textContent =
            itemCount;
    }

    if (totalElement) {
        totalElement.textContent =
            `₹${formatMoney(total)}`;
    }

    if (mobileTotalElement) {
        mobileTotalElement.textContent =
            `₹${formatMoney(total)}`;
    }

    if (confirmButton) {
        confirmButton.disabled =
            cart.length === 0;
    }
}

function selectCategory(category) {
    selectedCategory =
        category;

    renderCategories();
    renderMenu();
}

async function confirmOrder() {
    if (!cart.length) {
        showToast(
            "Add at least one item."
        );
        return;
    }

    const noteElement =
        document.getElementById("orderNote");

    const note =
        noteElement
            ? noteElement.value.trim()
            : "";

    const order = {
        id: generateOrderId(),

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

            orders.unshift(
                result.order || order
            );
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
    }
}

function renderOrders() {
    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) return;

    if (!orders.length) {
        container.innerHTML = `
            <div class="empty-orders">
                No active orders
            </div>
        `;

        updateOrderCount();
        return;
    }

    container.innerHTML =
        orders
            .filter(
                order =>
                    order.status !==
                    "Completed"
            )
            .slice(0, 20)
            .map(order => `
                <div class="order-card">

                    <div class="order-card-header">

                        <div class="order-number">
                            ${escapeHTML(order.id)}
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
                            Array.isArray(order.items)
                                ? order.items
                                    .map(
                                        item =>
                                            `${escapeHTML(item.name)} × ${Number(item.qty) || 1}`
                                    )
                                    .join("<br>")
                                : ""
                        }
                    </div>

                    ${
                        order.note
                            ? `
                                <div class="order-note-display">
                                    ${escapeHTML(order.note)}
                                </div>
                            `
                            : ""
                    }

                    <div class="order-total">

                        <span>
                            Total
                        </span>

                        <span>
                            ₹${formatMoney(order.total)}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="edit-order-btn"
                        data-edit-order="${escapeAttribute(order.id)}"
                    >
                        Edit Order
                    </button>

                </div>
            `)
            .join("");

    updateOrderCount();
}

function updateOrderCount() {
    const element =
        document.getElementById(
            "activeOrderCount"
        );

    if (!element) return;

    const active =
        orders.filter(
            order =>
                order.status !==
                "Completed"
        ).length;

    element.textContent =
        `${active} Active`;
}

function editOrder(orderId) {
    const order =
        orders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) return;

    cart =
        Array.isArray(order.items)
            ? order.items.map(
                item => ({
                    id: item.id,
                    name: item.name,
                    price:
                        Number(item.price) || 0,
                    qty:
                        Number(item.qty) || 1
                })
            )
            : [];

    const noteElement =
        document.getElementById(
            "orderNote"
        );

    if (noteElement) {
        noteElement.value =
            order.note || "";
    }

    renderCart();

    const orderSection =
        document.querySelector(
            ".order-section"
        );

    if (orderSection) {
        orderSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    showToast(
        `${order.id} loaded for editing`
    );
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
}

function toggleMobileCart() {
    const orderSection =
        document.querySelector(
            ".order-section"
        );

    if (!orderSection) return;

    orderSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function apiRequest(
    action,
    data = {}
) {
    if (!API_URL) {
        return {
            success: false,
            message: "API URL not configured."
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
        const savedOrders =
            localStorage.getItem(
                "pankaj_orders"
            );

        if (savedOrders) {
            orders =
                JSON.parse(
                    savedOrders
                );

            if (!Array.isArray(orders)) {
                orders = [];
            }
        }
    } catch (error) {
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

    toast.classList.add("show");

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
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
