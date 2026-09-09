let menu = [];
let cart = [];
let orders = [];

let selectedCategory = "All";


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    loadMenu();

    loadOrders();

    renderCategories();

    renderMenu();

    renderCart();

    renderOrders();

    setupEvents();

}


/* =========================
   DEFAULT MENU
========================= */

function loadMenu() {

    const savedMenu =
        localStorage.getItem("pankaj_menu");

    if (savedMenu) {

        try {

            menu = JSON.parse(savedMenu);

        } catch {

            menu = getDefaultMenu();

        }

    } else {

        menu = getDefaultMenu();

    }

}


function getDefaultMenu() {

    return [

        {
            id: "M001",
            name: "Chicken Biriyani",
            category: "Biriyani",
            price: 160,
            description: "Traditional chicken biriyani",
            image: "🍛",
            available: true
        },

        {
            id: "M002",
            name: "Beef Biriyani",
            category: "Biriyani",
            price: 180,
            description: "Malabar style beef biriyani",
            image: "🍛",
            available: true
        },

        {
            id: "M003",
            name: "Mutton Biriyani",
            category: "Biriyani",
            price: 220,
            description: "Tender mutton biriyani",
            image: "🍛",
            available: true
        },

        {
            id: "M004",
            name: "Chicken Fried Rice",
            category: "Rice",
            price: 140,
            description: "Fresh chicken fried rice",
            image: "🍚",
            available: true
        },

        {
            id: "M005",
            name: "Chicken Noodles",
            category: "Noodles",
            price: 140,
            description: "Spicy chicken noodles",
            image: "🍜",
            available: true
        },

        {
            id: "M006",
            name: "Chicken 65",
            category: "Starters",
            price: 150,
            description: "Crispy spicy chicken",
            image: "🍗",
            available: true
        },

        {
            id: "M007",
            name: "Porotta",
            category: "Breads",
            price: 15,
            description: "Kerala layered flatbread",
            image: "🫓",
            available: true
        },

        {
            id: "M008",
            name: "Chicken Curry",
            category: "Curries",
            price: 130,
            description: "Kerala style chicken curry",
            image: "🍛",
            available: true
        },

        {
            id: "M009",
            name: "Fresh Lime",
            category: "Drinks",
            price: 40,
            description: "Fresh lime juice",
            image: "🍋",
            available: true
        }

    ];

}


/* =========================
   ORDERS
========================= */

function loadOrders() {

    const savedOrders =
        localStorage.getItem("pankaj_orders");

    if (!savedOrders) {

        orders = [];

        return;
    }

    try {

        orders =
            JSON.parse(savedOrders);

    } catch {

        orders = [];

    }

}


function saveOrders() {

    localStorage.setItem(
        "pankaj_orders",
        JSON.stringify(orders)
    );

}


/* =========================
   EVENTS
========================= */

function setupEvents() {

    document.addEventListener(
        "click",
        handleClick
    );

}


/* =========================
   CATEGORIES
========================= */

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
                class="category ${
                    category === selectedCategory
                        ? "active"
                        : ""
                }"
                data-category="${escapeHTML(category)}"
            >
                ${escapeHTML(category)}
            </button>

        `).join("");

}


function selectCategory(category) {

    selectedCategory =
        category;

    renderCategories();

    renderMenu();

}


/* =========================
   MENU
========================= */

function renderMenu() {

    const container =
        document.getElementById("menuGrid");

    if (!container) return;


    const filteredMenu =
        selectedCategory === "All"
            ? menu
            : menu.filter(
                item =>
                    item.category ===
                    selectedCategory
            );


    const availableItems =
        filteredMenu.filter(
            item =>
                item.available !== false
        );


    const count =
        document.getElementById(
            "menuCount"
        );

    if (count) {

        count.textContent =
            `${availableItems.length} Items`;

    }


    if (!filteredMenu.length) {

        container.innerHTML = `
            <div class="empty-order">
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

                <article class="menu-card">

                    <div class="food-image">
                        ${item.image || "🍽️"}
                    </div>

                    <div class="food-content">

                        <div class="food-top">

                            <div>

                                <div class="food-name">
                                    ${escapeHTML(item.name)}
                                </div>

                                <div class="food-description">
                                    ${escapeHTML(
                                        item.description || ""
                                    )}
                                </div>

                            </div>

                            <strong class="food-price">
                                ₹${formatMoney(item.price)}
                            </strong>

                        </div>


                        ${
                            unavailable
                                ? `
                                    <button
                                        class="add-button"
                                        disabled
                                        style="
                                            background:#ddd;
                                            color:#888;
                                            cursor:not-allowed;
                                        "
                                    >
                                        Unavailable
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="add-button"
                                        data-add="${escapeHTML(item.id)}"
                                    >
                                        + Add to Order
                                    </button>
                                `
                        }

                    </div>

                </article>

            `;

        }).join("");

}


/* =========================
   CART
========================= */

function addToCart(itemId) {

    const item =
        menu.find(
            menuItem =>
                String(menuItem.id) ===
                String(itemId)
        );


    if (!item) return;

    if (item.available === false) return;


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

            price:
                Number(item.price) || 0,

            qty: 1

        });

    }


    renderCart();

    showToast(
        `${item.name} added`
    );

}


function changeQuantity(
    itemId,
    amount
) {

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


function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );

    if (!container) return;


    if (!cart.length) {

        container.innerHTML = `

            <div class="empty-order">

                <div class="empty-icon">
                    +
                </div>

                <strong>
                    No items added
                </strong>

                <span>
                    Select items from the menu above
                </span>

            </div>

        `;

    } else {

        container.innerHTML =
            cart.map(item => `

                <div class="cart-item">

                    <div class="cart-item-info">

                        <div class="cart-item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="cart-item-price">
                            ₹${formatMoney(
                                item.price * item.qty
                            )}
                        </div>

                    </div>


                    <div class="quantity">

                        <button
                            type="button"
                            data-minus="${escapeHTML(item.id)}"
                        >
                            −
                        </button>

                        <span>
                            ${item.qty}
                        </span>

                        <button
                            type="button"
                            data-plus="${escapeHTML(item.id)}"
                        >
                            +
                        </button>

                    </div>

                </div>

            `).join("");

    }


    updateCartSummary();

}


/* =========================
   SUMMARY
========================= */

function updateCartSummary() {

    const itemCount =
        cart.reduce(
            (sum, item) =>
                sum + item.qty,
            0
        );


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.qty,
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );

    const summaryItems =
        document.getElementById(
            "summaryItems"
        );

    const summaryTotal =
        document.getElementById(
            "summaryTotal"
        );

    const mobileTotal =
        document.getElementById(
            "mobileCartTotal"
        );

    const confirmButton =
        document.getElementById(
            "confirmOrderButton"
        );


    if (cartCount) {

        cartCount.textContent =
            itemCount;

    }


    if (summaryItems) {

        summaryItems.textContent =
            itemCount;

    }


    if (summaryTotal) {

        summaryTotal.textContent =
            `₹${formatMoney(total)}`;

    }


    if (mobileTotal) {

        mobileTotal.textContent =
            `₹${formatMoney(total)}`;

    }


    if (confirmButton) {

        confirmButton.disabled =
            cart.length === 0;

    }

}


/* =========================
   CONFIRM ORDER
========================= */

function confirmOrder() {

    if (!cart.length) {

        showToast(
            "Add items first"
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


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.qty,
            0
        );


    const order = {

        id:
            generateOrderId(),

        items:
            cart.map(item => ({

                id: item.id,

                name: item.name,

                price: item.price,

                qty: item.qty

            })),

        note,

        total,

        status: "Pending",

        createdAt:
            new Date().toISOString()

    };


    orders.unshift(order);

    saveOrders();


    cart = [];


    if (noteElement) {

        noteElement.value = "";

    }


    renderCart();

    renderOrders();


    showToast(
        `Order ${order.id} confirmed`
    );


    document
        .getElementById("orderSection")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================
   ORDERS
========================= */

function renderOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) return;


    const activeOrders =
        orders.filter(
            order =>
                order.status !==
                "Completed"
        );


    const count =
        document.getElementById(
            "activeOrderCount"
        );


    if (count) {

        count.textContent =
            `${activeOrders.length} Active`;

    }


    if (!activeOrders.length) {

        container.innerHTML = `

            <div class="empty-order">

                <strong>
                    No active orders
                </strong>

                <span>
                    Confirmed orders will appear here
                </span>

            </div>

        `;

        return;
    }


    container.innerHTML =
        activeOrders
            .slice(0, 20)
            .map(order => `

                <article class="order-card">

                    <div class="order-card-top">

                        <span class="order-id">
                            ${escapeHTML(order.id)}
                        </span>

                        <span class="order-status">
                            ${escapeHTML(
                                order.status ||
                                "Pending"
                            )}
                        </span>

                    </div>


                    <div class="order-items">

                        ${
                            Array.isArray(order.items)
                                ? order.items
                                    .map(item =>
                                        `${escapeHTML(item.name)}
                                        × ${item.qty}`
                                    )
                                    .join("<br>")
                                : ""
                        }

                        ${
                            order.note
                                ? `
                                    <br>
                                    <small>
                                        Note:
                                        ${escapeHTML(order.note)}
                                    </small>
                                `
                                : ""
                        }

                    </div>


                    <div class="order-bottom">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹${formatMoney(order.total)}
                        </strong>

                    </div>

                </article>

            `)
            .join("");

}


/* =========================
   MOBILE CART
========================= */

function openOrder() {

    const section =
        document.getElementById(
            "orderSection"
        );

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================
   CLICK HANDLER
========================= */

function handleClick(event) {

    const button =
        event.target.closest(
            "button"
        );

    if (!button) return;


    if (button.dataset.category) {

        selectCategory(
            button.dataset.category
        );

        return;
    }


    if (button.dataset.add) {

        addToCart(
            button.dataset.add
        );

        return;
    }


    if (button.dataset.plus) {

        changeQuantity(
            button.dataset.plus,
            1
        );

        return;
    }


    if (button.dataset.minus) {

        changeQuantity(
            button.dataset.minus,
            -1
        );

        return;
    }


    if (
        button.id ===
        "confirmOrderButton"
    ) {

        confirmOrder();

        return;
    }


    if (
        button.id ===
        "mobileCartButton"
    ) {

        openOrder();

        return;
    }

}


/* =========================
   HELPERS
========================= */

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
        showToast.timer
    );


    showToast.timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

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
