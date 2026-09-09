/* =========================================
   PANKAJ RESTAURANT
   MENU + CART + ORDER HISTORY SYSTEM
========================================= */


/* =========================================
   MENU ELEMENTS
========================================= */

const searchInput =
    document.getElementById("searchInput");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const menuCards =
    document.querySelectorAll(".menu-card");

const itemCount =
    document.getElementById("itemCount");

const emptyState =
    document.getElementById("emptyState");


/* =========================================
   PAGE NAVIGATION
========================================= */

const menuTab =
    document.getElementById("menuTab");

const historyTab =
    document.getElementById("historyTab");

const menuSection =
    document.getElementById("menuSection");

const historySection =
    document.getElementById("historySection");

const backMenuButton =
    document.getElementById("backMenuButton");


/* =========================================
   CART ELEMENTS
========================================= */

const cartButton =
    document.getElementById("cartButton");

const cartCount =
    document.getElementById("cartCount");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartClose =
    document.getElementById("cartClose");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartTotal =
    document.getElementById("cartTotal");

const placeOrder =
    document.getElementById("placeOrder");


/* =========================================
   ORDER MODAL
========================================= */

const orderModal =
    document.getElementById("orderModal");

const confirmedOrder =
    document.getElementById("confirmedOrder");

const confirmedTotal =
    document.getElementById("confirmedTotal");

const newOrder =
    document.getElementById("newOrder");


/* =========================================
   HISTORY ELEMENTS
========================================= */

const historyList =
    document.getElementById("historyList");

const historyEmpty =
    document.getElementById("historyEmpty");


/* =========================================
   STATE
========================================= */

let activeCategory = "all";

let cart = [];

let orders =
    JSON.parse(
        localStorage.getItem(
            "pankaj_orders"
        )
    ) || [];

let editingOrderId = null;


/* =========================================
   MENU FILTER
========================================= */

function filterMenu() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    let visibleItems = 0;

    menuCards.forEach(card => {

        const category =
            card.dataset.category || "";

        const name =
            card.dataset.name || "";

        const categoryMatches =
            activeCategory === "all" ||
            category === activeCategory;

        const searchMatches =
            name.includes(searchTerm);

        if (
            categoryMatches &&
            searchMatches
        ) {

            card.style.display =
                "flex";

            visibleItems++;

        } else {

            card.style.display =
                "none";

        }

    });

    itemCount.textContent =
        `${visibleItems} ${
            visibleItems === 1
                ? "item"
                : "items"
        }`;

    emptyState.style.display =
        visibleItems === 0
            ? "block"
            : "none";

}


/* =========================================
   CATEGORY BUTTONS
========================================= */

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            categoryButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });

            button.classList.add(
                "active"
            );

            activeCategory =
                button.dataset.category;

            filterMenu();

        }
    );

});


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    filterMenu
);


/* =========================================
   ADD TO CART
========================================= */

const addButtons =
    document.querySelectorAll(
        ".add-cart-btn"
    );


addButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const name =
                button.dataset.name;

            const price =
                Number(
                    button.dataset.price
                );

            addToCart(
                name,
                price
            );

            button.classList.add(
                "added"
            );

            button.textContent =
                "✓ Added";

            setTimeout(() => {

                button.classList.remove(
                    "added"
                );

                button.textContent =
                    "+ Add";

            }, 700);


            cartButton.classList.remove(
                "pulse"
            );

            void cartButton.offsetWidth;

            cartButton.classList.add(
                "pulse"
            );

        }
    );

});


/* =========================================
   ADD ITEM
========================================= */

function addToCart(
    name,
    price
) {

    const existingItem =
        cart.find(
            item =>
                item.name === name
        );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            name: name,

            price: price,

            quantity: 1

        });

    }

    updateCart();

}


/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    renderCart();

    updateCartCount();

    updateCartTotal();

}


/* =========================================
   RENDER CART
========================================= */

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.style.display =
            "none";

        cartEmpty.style.display =
            "flex";

        placeOrder.disabled =
            true;

        return;

    }

    cartItems.style.display =
        "block";

    cartEmpty.style.display =
        "none";

    placeOrder.disabled =
        false;


    cart.forEach(
        (item, index) => {

            const itemElement =
                document.createElement(
                    "div"
                );

            itemElement.className =
                "cart-item";

            itemElement.innerHTML = `

                <div class="cart-item-info">

                    <div class="cart-item-name">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="cart-item-price">
                        ₹${item.price} × ${item.quantity}
                    </div>

                </div>

                <div class="cart-item-controls">

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="decrease"
                        data-index="${index}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span class="quantity">
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="increase"
                        data-index="${index}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-index="${index}"
                        aria-label="Remove item"
                    >
                        ×
                    </button>

                </div>

            `;

            cartItems.appendChild(
                itemElement
            );

        }
    );

}


/* =========================================
   CART ITEM CONTROLS
========================================= */

cartItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        const index =
            Number(
                button.dataset.index
            );

        if (
            Number.isNaN(index) ||
            !cart[index]
        ) {

            return;

        }


        if (
            action === "increase"
        ) {

            cart[index].quantity++;

        }


        if (
            action === "decrease"
        ) {

            cart[index].quantity--;

            if (
                cart[index].quantity <= 0
            ) {

                cart.splice(
                    index,
                    1
                );

            }

        }


        if (
            action === "remove"
        ) {

            cart.splice(
                index,
                1
            );

        }


        updateCart();

    }
);


/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) => {

                return (
                    total +
                    item.quantity
                );

            },
            0
        );

    cartCount.textContent =
        count;

}


/* =========================================
   TOTAL
========================================= */

function calculateTotal(
    items = cart
) {

    return items.reduce(
        (total, item) => {

            return (
                total +
                (
                    item.price *
                    item.quantity
                )
            );

        },
        0
    );

}


function updateCartTotal() {

    cartTotal.textContent =
        `₹${calculateTotal()}`;

}


/* =========================================
   OPEN CART
========================================= */

cartButton.addEventListener(
    "click",
    openCart
);


function openCart() {

    cartDrawer.classList.add(
        "active"
    );

    cartOverlay.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );

}


/* =========================================
   CLOSE CART
========================================= */

cartClose.addEventListener(
    "click",
    closeCart
);

cartOverlay.addEventListener(
    "click",
    closeCart
);


function closeCart() {

    cartDrawer.classList.remove(
        "active"
    );

    cartOverlay.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================
   PLACE ORDER
========================================= */

placeOrder.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {
            return;
        }

        if (editingOrderId) {

            saveEditedOrder();

            return;

        }

        const order =
            createNewOrder();

        orders.unshift(
            order
        );

        saveOrders();

        createOrderSummary(
            order
        );

        renderHistory();

        closeCart();

        orderModal.classList.add(
            "active"
        );

        document.body.classList.add(
            "no-scroll"
        );

    }
);


/* =========================================
   CREATE NEW ORDER
========================================= */

function createNewOrder() {

    return {

        id:
            generateOrderId(),

        items:
            JSON.parse(
                JSON.stringify(
                    cart
                )
            ),

        total:
            calculateTotal(),

        status:
            "confirmed",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================
   ORDER ID
========================================= */

function generateOrderId() {

    const number =
        orders.length > 0
            ? Math.max(
                ...orders.map(
                    order => {

                        return (
                            Number(
                                String(
                                    order.id
                                ).replace(
                                    "PNK-",
                                    ""
                                )
                            ) || 0
                        );

                    }
                )
            ) + 1
            : 1001;

    return `PNK-${number}`;

}


/* =========================================
   SAVE ORDERS
========================================= */

function saveOrders() {

    localStorage.setItem(
        "pankaj_orders",
        JSON.stringify(
            orders
        )
    );

}


/* =========================================
   ORDER SUMMARY
========================================= */

function createOrderSummary(
    order
) {

    confirmedOrder.innerHTML =
        "";

    order.items.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "confirmed-item";

            const itemTotal =
                item.price *
                item.quantity;

            row.innerHTML = `

                <span>
                    ${escapeHTML(item.name)}
                    × ${item.quantity}
                </span>

                <span>
                    ₹${itemTotal}
                </span>

            `;

            confirmedOrder.appendChild(
                row
            );

        }
    );

    confirmedTotal.textContent =
        `₹${order.total}`;

}


/* =========================================
   NEW ORDER
========================================= */

newOrder.addEventListener(
    "click",
    () => {

        cart = [];

        editingOrderId =
            null;

        placeOrder.textContent =
            "Place Order";

        updateCart();

        closeOrderModal();

        showMenu();

    }
);


/* =========================================
   CLOSE ORDER MODAL
========================================= */

function closeOrderModal() {

    orderModal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================
   MENU / HISTORY NAVIGATION
========================================= */

if (menuTab) {

    menuTab.addEventListener(
        "click",
        showMenu
    );

}


if (historyTab) {

    historyTab.addEventListener(
        "click",
        showHistory
    );

}


if (backMenuButton) {

    backMenuButton.addEventListener(
        "click",
        showMenu
    );

}


function showMenu() {

    menuSection.classList.add(
        "active"
    );

    historySection.classList.remove(
        "active"
    );

    menuTab.classList.add(
        "active"
    );

    historyTab.classList.remove(
        "active"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showHistory() {

    menuSection.classList.remove(
        "active"
    );

    historySection.classList.add(
        "active"
    );

    menuTab.classList.remove(
        "active"
    );

    historyTab.classList.add(
        "active"
    );

    renderHistory();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   HISTORY RENDER
========================================= */

function renderHistory() {

    if (!historyList) {
        return;
    }

    historyList.innerHTML =
        "";

    if (orders.length === 0) {

        historyList.style.display =
            "none";

        historyEmpty.style.display =
            "flex";

        return;

    }


    historyList.style.display =
        "block";

    historyEmpty.style.display =
        "none";


    orders.forEach(
        order => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "history-card";


            const date =
                new Date(
                    order.createdAt
                );


            const dateText =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            const timeText =
                date.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            const itemsHTML =
                order.items
                    .map(
                        item => `

                            <div class="history-item">

                                <span>
                                    ${escapeHTML(item.name)}
                                    × ${item.quantity}
                                </span>

                                <strong>
                                    ₹${item.price * item.quantity}
                                </strong>

                            </div>

                        `
                    )
                    .join("");


            card.innerHTML = `

                <div class="history-card-header">

                    <div>

                        <span class="history-order-label">
                            ORDER
                        </span>

                        <h4>
                            ${escapeHTML(order.id)}
                        </h4>

                    </div>

                    <span class="history-status">
                        CONFIRMED
                    </span>

                </div>


                <div class="history-meta">

                    <span>
                        ${dateText}
                    </span>

                    <span>
                        ${timeText}
                    </span>

                </div>


                <div class="history-items">

                    ${itemsHTML}

                </div>


                <div class="history-card-footer">

                    <div>

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹${order.total}
                        </strong>

                    </div>


                    <div class="history-actions">

                        <button
                            type="button"
                            class="history-edit-btn"
                            data-order-id="${escapeHTML(order.id)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="history-delete-btn"
                            data-order-id="${escapeHTML(order.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;


            historyList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   HISTORY ACTIONS
========================================= */

if (historyList) {

    historyList.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    ".history-edit-btn"
                );

            const deleteButton =
                event.target.closest(
                    ".history-delete-btn"
                );


            if (editButton) {

                editOrder(
                    editButton.dataset.orderId
                );

                return;

            }


            if (deleteButton) {

                deleteOrder(
                    deleteButton.dataset.orderId
                );

            }

        }
    );

}


/* =========================================
   EDIT ORDER
========================================= */

function editOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        return;
    }


    cart =
        JSON.parse(
            JSON.stringify(
                order.items
            )
        );


    editingOrderId =
        orderId;


    placeOrder.textContent =
        "Save Changes";


    updateCart();

    showMenu();

    openCart();

}


/* =========================================
   SAVE EDITED ORDER
========================================= */

function saveEditedOrder() {

    if (!editingOrderId) {
        return;
    }

    if (cart.length === 0) {
        return;
    }


    const orderIndex =
        orders.findIndex(
            order =>
                order.id ===
                editingOrderId
        );


    if (orderIndex === -1) {
        return;
    }


    orders[orderIndex].items =
        JSON.parse(
            JSON.stringify(
                cart
            )
        );


    orders[orderIndex].total =
        calculateTotal();


    orders[orderIndex].updatedAt =
        new Date().toISOString();


    saveOrders();

    renderHistory();


    createOrderSummary(
        orders[orderIndex]
    );


    editingOrderId =
        null;


    placeOrder.textContent =
        "Place Order";


    closeCart();


    orderModal.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );

}


/* =========================================
   DELETE ORDER
========================================= */

function deleteOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete ${order.id} from order history?`
        );


    if (!confirmed) {
        return;
    }


    orders =
        orders.filter(
            item =>
                item.id !== orderId
        );


    saveOrders();

    renderHistory();

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeCart();

            closeOrderModal();

        }

    }
);


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   INITIALIZE
========================================= */

filterMenu();

updateCart();

renderHistory();
