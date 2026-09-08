const DEFAULT_MENU = [
    {
        id: 1,
        name: "Chicken Biriyani",
        category: "Biriyani",
        price: 160
    },
    {
        id: 2,
        name: "Beef Biriyani",
        category: "Biriyani",
        price: 180
    },
    {
        id: 3,
        name: "Mutton Biriyani",
        category: "Biriyani",
        price: 220
    },
    {
        id: 4,
        name: "Chicken Fried Rice",
        category: "Rice",
        price: 150
    },
    {
        id: 5,
        name: "Chicken Noodles",
        category: "Noodles",
        price: 150
    },
    {
        id: 6,
        name: "Chicken 65",
        category: "Starters",
        price: 140
    },
    {
        id: 7,
        name: "Beef Fry",
        category: "Starters",
        price: 180
    },
    {
        id: 8,
        name: "Porotta",
        category: "Breads",
        price: 15
    },
    {
        id: 9,
        name: "Chapathi",
        category: "Breads",
        price: 15
    },
    {
        id: 10,
        name: "Chicken Curry",
        category: "Curries",
        price: 150
    },
    {
        id: 11,
        name: "Beef Curry",
        category: "Curries",
        price: 170
    },
    {
        id: 12,
        name: "Tea",
        category: "Drinks",
        price: 15
    }
];

let menu = JSON.parse(
    localStorage.getItem("hotelPankajMenu") || "null"
);

if (!Array.isArray(menu) || menu.length === 0) {
    menu = [...DEFAULT_MENU];
    saveMenu();
}

let cart = [];

let partyItems = [];

let selectedCategory = "All";

let currentBill = null;

let orderNumber = Number(
    localStorage.getItem("hotelPankajOrderNumber") || 1
);

let history = JSON.parse(
    localStorage.getItem("hotelPankajHistory") || "[]"
);

let partyOrders = JSON.parse(
    localStorage.getItem("hotelPankajPartyOrders") || "[]"
);


document.addEventListener("DOMContentLoaded", function () {

    renderCategories();

    renderMenu();

    renderCart();

    renderHistory();

    renderPartyOrders();

    updateOrderNumber();

    document.addEventListener("click", function (event) {

        if (
            event.target.classList.contains("modal") &&
            event.target.id !== "adminModal"
        ) {
            event.target.classList.remove("active");
        }

    });

});


function saveMenu() {

    localStorage.setItem(
        "hotelPankajMenu",
        JSON.stringify(menu)
    );

}


function saveHistory() {

    localStorage.setItem(
        "hotelPankajHistory",
        JSON.stringify(history)
    );

}


function savePartyOrders() {

    localStorage.setItem(
        "hotelPankajPartyOrders",
        JSON.stringify(partyOrders)
    );

}


function updateOrderNumber() {

    const element =
        document.getElementById("orderNumber");

    if (element) {

        element.textContent =
            String(orderNumber).padStart(3, "0");

    }

}


function showPage(pageId, button) {

    document
        .querySelectorAll(".page")
        .forEach(function (page) {

            page.classList.remove("active");

        });

    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    }

    document
        .querySelectorAll(".nav-btn")
        .forEach(function (btn) {

            btn.classList.remove("active");

        });

    if (button) {

        button.classList.add("active");

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function renderCategories() {

    const container =
        document.getElementById("categories");

    if (!container) {
        return;
    }

    const categories = [
        "All",
        ...new Set(
            menu.map(function (item) {
                return item.category;
            })
        )
    ];

    container.innerHTML =
        categories
            .map(function (category) {

                return `
                    <button
                        class="category-btn ${
                            category === selectedCategory
                                ? "active"
                                : ""
                        }"
                        onclick="selectCategory('${escapeAttribute(category)}')"
                    >
                        ${escapeHTML(category)}
                    </button>
                `;

            })
            .join("");

}


function selectCategory(category) {

    selectedCategory = category;

    renderCategories();

    renderMenu();

}


function renderMenu() {

    const grid =
        document.getElementById("menuGrid");

    const count =
        document.getElementById("menuCount");

    if (!grid) {
        return;
    }

    const filteredMenu =
        selectedCategory === "All"
            ? menu
            : menu.filter(function (item) {

                return item.category === selectedCategory;

            });

    if (count) {

        count.textContent =
            filteredMenu.length +
            (
                filteredMenu.length === 1
                    ? " item"
                    : " items"
            );

    }

    if (filteredMenu.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🍽️
                </div>

                <h3>
                    No items found
                </h3>

                <p>
                    Add items from the Admin Panel.
                </p>

            </div>
        `;

        return;
    }

    grid.innerHTML =
        filteredMenu
            .map(function (item) {

                return `
                    <div class="menu-card">

                        <div class="menu-card-info">

                            <h3>
                                ${escapeHTML(item.name)}
                            </h3>

                            <span>
                                ${escapeHTML(item.category)}
                            </span>

                        </div>

                        <div class="menu-card-bottom">

                            <strong>
                                ₹${formatMoney(item.price)}
                            </strong>

                            <button
                                class="add-btn"
                                onclick="addToCart(${item.id})"
                            >
                                +
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function addToCart(id) {

    const item =
        menu.find(function (menuItem) {

            return menuItem.id === id;

        });

    if (!item) {
        return;
    }

    const existing =
        cart.find(function (cartItem) {

            return cartItem.id === id;

        });

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: 1
        });

    }

    renderCart();

}


function changeQuantity(id, amount) {

    const item =
        cart.find(function (cartItem) {

            return cartItem.id === id;

        });

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart =
            cart.filter(function (cartItem) {

                return cartItem.id !== id;

            });

    }

    renderCart();

}


function clearCart() {

    if (cart.length === 0) {
        return;
    }

    cart = [];

    renderCart();

}


function getCartTotal() {

    return cart.reduce(function (total, item) {

        return total +
            item.price * item.quantity;

    }, 0);

}


function getCartItemCount() {

    return cart.reduce(function (total, item) {

        return total + item.quantity;

    }, 0);

}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    const itemCount =
        document.getElementById("cartCount");

    const subtotal =
        document.getElementById("subtotal");

    const grandTotal =
        document.getElementById("total");

    const mobileCount =
        document.getElementById("mobileCount");

    const mobileTotal =
        document.getElementById("mobileTotal");

    const totalItems =
        getCartItemCount();

    const total =
        getCartTotal();

    if (itemCount) {

        itemCount.textContent =
            totalItems +
            (
                totalItems === 1
                    ? " item"
                    : " items"
            );

    }

    if (subtotal) {

        subtotal.textContent =
            "₹" + formatMoney(total);

    }

    if (grandTotal) {

        grandTotal.textContent =
            "₹" + formatMoney(total);

    }

    if (mobileCount) {

        mobileCount.textContent =
            totalItems +
            (
                totalItems === 1
                    ? " item"
                    : " items"
            );

    }

    if (mobileTotal) {

        mobileTotal.textContent =
            "₹" + formatMoney(total);

    }

    if (!container) {
        return;
    }

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Tap a menu item to add it to the order.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        cart
            .map(function (item) {

                const itemTotal =
                    item.price * item.quantity;

                return `
                    <div class="cart-item">

                        <div class="cart-item-info">

                            <h4>
                                ${escapeHTML(item.name)}
                            </h4>

                            <small>
                                ₹${formatMoney(item.price)} each
                            </small>

                            <div class="quantity-control">

                                <button
                                    onclick="changeQuantity(${item.id}, -1)"
                                >
                                    −
                                </button>

                                <span>
                                    ${item.quantity}
                                </span>

                                <button
                                    onclick="changeQuantity(${item.id}, 1)"
                                >
                                    +
                                </button>

                            </div>

                        </div>

                        <strong>
                            ₹${formatMoney(itemTotal)}
                        </strong>

                    </div>
                `;

            })
            .join("");

}


function toggleMobileCart() {

    const cartPanel =
        document.getElementById("cartPanel");

    if (!cartPanel) {
        return;
    }

    cartPanel.classList.toggle("mobile-open");

}


function confirmOrder() {

    if (cart.length === 0) {

        alert(
            "Please add at least one item to the order."
        );

        return;
    }

    const now =
        new Date();

    const order = {

        id: orderNumber,

        number:
            String(orderNumber).padStart(3, "0"),

        date:
            now.toLocaleDateString("en-IN"),

        time:
            now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            }),

        items:
            cart.map(function (item) {

                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                };

            }),

        total:
            getCartTotal()

    };

    history.unshift(order);

    saveHistory();

    currentBill = order;

    orderNumber += 1;

    localStorage.setItem(
        "hotelPankajOrderNumber",
        orderNumber
    );

    cart = [];

    renderCart();

    renderHistory();

    updateOrderNumber();

    showBill(order);

}


function showBill(order) {

    const modal =
        document.getElementById("billModal");

    const content =
        document.getElementById("billContent");

    if (!modal || !content) {
        return;
    }

    const itemRows =
        order.items
            .map(function (item) {

                return `
                    <div class="bill-row">

                        <span>
                            ${escapeHTML(item.name)}
                            × ${item.quantity}
                        </span>

                        <strong>
                            ₹${formatMoney(
                                item.price * item.quantity
                            )}
                        </strong>

                    </div>
                `;

            })
            .join("");

    content.innerHTML = `

        <div class="bill-heading">

            <h2>
                Hotel Pankaj
            </h2>

            <p>
                Restaurant Order
            </p>

        </div>

        <div class="bill-row">

            <span>
                Order No.
            </span>

            <strong>
                #${escapeHTML(order.number)}
            </strong>

        </div>

        <div class="bill-row">

            <span>
                Date
            </span>

            <strong>
                ${escapeHTML(order.date)}
            </strong>

        </div>

        <div class="bill-row">

            <span>
                Time
            </span>

            <strong>
                ${escapeHTML(order.time)}
            </strong>

        </div>

        <div class="bill-divider"></div>

        ${itemRows}

        <div class="bill-divider"></div>

        <div class="bill-total">

            <span>
                TOTAL
            </span>

            <strong>
                ₹${formatMoney(order.total)}
            </strong>

        </div>

    `;

    modal.classList.add("active");

}


function closeBill() {

    const modal =
        document.getElementById("billModal");

    if (modal) {

        modal.classList.remove("active");

    }

}


function printBill() {

    if (!currentBill) {
        return;
    }

    window.print();

}


function renderHistory() {

    const container =
        document.getElementById("history");

    if (!container) {
        return;
    }

    if (history.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No orders yet
                </h3>

                <p>
                    Confirmed orders will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        history
            .map(function (order) {

                return `
                    <div class="history-card">

                        <div
                            class="history-info"
                            onclick="viewHistoryOrder(${order.id})"
                        >

                            <h3>
                                Order #${escapeHTML(order.number)}
                            </h3>

                            <p>
                                ${escapeHTML(order.date)}
                                •
                                ${escapeHTML(order.time)}
                                •
                                ${order.items.length}
                                item${order.items.length === 1 ? "" : "s"}
                            </p>

                        </div>

                        <div class="history-right">

                            <strong>
                                ₹${formatMoney(order.total)}
                            </strong>

                            <button
                                class="delete-history-btn"
                                onclick="deleteHistoryOrder(${order.id}, event)"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function viewHistoryOrder(id) {

    const order =
        history.find(function (item) {

            return item.id === id;

        });

    if (!order) {
        return;
    }

    currentBill = order;

    showBill(order);

}


function deleteHistoryOrder(id, event) {

    if (event) {

        event.stopPropagation();

    }

    const order =
        history.find(function (item) {

            return item.id === id;

        });

    if (!order) {
        return;
    }

    const confirmed =
        confirm(
            "Delete Order #" +
            order.number +
            " from history?"
        );

    if (!confirmed) {
        return;
    }

    history =
        history.filter(function (item) {

            return item.id !== id;

        });

    saveHistory();

    if (
        currentBill &&
        currentBill.id === id
    ) {

        currentBill = null;

        closeBill();

    }

    renderHistory();

}


function openPartyModal() {

    const modal =
        document.getElementById("partyModal");

    if (!modal) {
        return;
    }

    document.getElementById("partyName").value = "";

    document.getElementById("partyPhone").value = "";

    document.getElementById("partyDate").value = "";

    document.getElementById("partyPeople").value = "";

    document.getElementById("partyNotes").value = "";

    document.getElementById("partyAdvance").value = "";

    partyItems = [];

    renderPartyItems();

    updatePartyTotal();

    modal.classList.add("active");

}


function closePartyModal() {

    const modal =
        document.getElementById("partyModal");

    if (modal) {

        modal.classList.remove("active");

    }

}


function addPartyItem() {

    if (menu.length === 0) {

        alert(
            "No menu items available."
        );

        return;
    }

    partyItems.push({

        id: menu[0].id,

        quantity: 1

    });

    renderPartyItems();

    updatePartyTotal();

}


function removePartyItem(index) {

    partyItems.splice(index, 1);

    renderPartyItems();

    updatePartyTotal();

}


function updatePartyItem(index, value) {

    const id =
        Number(value);

    if (!partyItems[index]) {
        return;
    }

    partyItems[index].id = id;

    updatePartyTotal();

}


function updatePartyQuantity(index, value) {

    const quantity =
        Math.max(
            1,
            Number(value) || 1
        );

    if (!partyItems[index]) {
        return;
    }

    partyItems[index].quantity =
        quantity;

    updatePartyTotal();

}


function renderPartyItems() {

    const container =
        document.getElementById("partyItems");

    if (!container) {
        return;
    }

    if (partyItems.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <p>
                    No items added.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        partyItems
            .map(function (item, index) {

                return `
                    <div class="party-item-row">

                        <select
                            class="party-item-select"
                            onchange="updatePartyItem(
                                ${index},
                                this.value
                            )"
                        >

                            ${menu
                                .map(function (menuItem) {

                                    return `
                                        <option
                                            value="${menuItem.id}"
                                            ${
                                                menuItem.id === item.id
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${escapeHTML(
                                                menuItem.name
                                            )}
                                            -
                                            ₹${formatMoney(
                                                menuItem.price
                                            )}
                                        </option>
                                    `;

                                })
                                .join("")}

                        </select>

                        <input
                            class="party-item-qty"
                            type="number"
                            min="1"
                            value="${item.quantity}"
                            onchange="updatePartyQuantity(
                                ${index},
                                this.value
                            )"
                        >

                        <button
                            class="remove-party-btn"
                            onclick="removePartyItem(${index})"
                        >
                            ×
                        </button>

                    </div>
                `;

            })
            .join("");

}


function getPartyTotal() {

    return partyItems.reduce(
        function (total, partyItem) {

            const item =
                menu.find(function (menuItem) {

                    return menuItem.id === partyItem.id;

                });

            if (!item) {
                return total;
            }

            return total +
                Number(item.price) *
                Number(partyItem.quantity);

        },
        0
    );

}


function updatePartyTotal() {

    const totalElement =
        document.getElementById("partyTotal");

    if (totalElement) {

        totalElement.textContent =
            "₹" +
            formatMoney(
                getPartyTotal()
            );

    }

}


function savePartyOrder() {

    const name =
        document
            .getElementById("partyName")
            .value
            .trim();

    const phone =
        document
            .getElementById("partyPhone")
            .value
            .trim();

    const date =
        document
            .getElementById("partyDate")
            .value;

    const people =
        Number(
            document
                .getElementById("partyPeople")
                .value
        ) || 0;

    const notes =
        document
            .getElementById("partyNotes")
            .value
            .trim();

    const advance =
        Number(
            document
                .getElementById("partyAdvance")
                .value
        ) || 0;

    if (!name) {

        alert(
            "Please enter customer / party name."
        );

        return;
    }

    if (!date) {

        alert(
            "Please select event date."
        );

        return;
    }

    if (people <= 0) {

        alert(
            "Please enter number of people."
        );

        return;
    }

    if (partyItems.length === 0) {

        alert(
            "Please add at least one item."
        );

        return;
    }

    const total =
        getPartyTotal();

    if (advance > total) {

        alert(
            "Advance cannot be greater than total amount."
        );

        return;
    }

    const partyOrder = {

        id: Date.now(),

        name: name,

        phone: phone,

        date: date,

        people: people,

        notes: notes,

        advance: advance,

        balance:
            total - advance,

        total: total,

        items:
            partyItems.map(function (partyItem) {

                const menuItem =
                    menu.find(function (item) {

                        return item.id === partyItem.id;

                    });

                return {

                    id: partyItem.id,

                    name:
                        menuItem
                            ? menuItem.name
                            : "Unknown Item",

                    price:
                        menuItem
                            ? menuItem.price
                            : 0,

                    quantity:
                        partyItem.quantity

                };

            })

    };

    partyOrders.unshift(partyOrder);

    savePartyOrders();

    renderPartyOrders();

    closePartyModal();

    alert(
        "Party order saved successfully."
    );

}


function renderPartyOrders() {

    const container =
        document.getElementById("partyOrders");

    if (!container) {
        return;
    }

    if (partyOrders.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🎉
                </div>

                <h3>
                    No party orders
                </h3>

                <p>
                    Create a new party or catering order.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        partyOrders
            .map(function (order) {

                return `
                    <div class="party-card">

                        <div class="party-card-main">

                            <h3>
                                ${escapeHTML(order.name)}
                            </h3>

                            <p>
                                📅
                                ${escapeHTML(
                                    formatDate(order.date)
                                )}
                            </p>

                            <p>
                                👥
                                ${order.people}
                                people
                            </p>

                            ${
                                order.phone
                                    ? `
                                        <p>
                                            📞
                                            ${escapeHTML(
                                                order.phone
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            ${
                                order.notes
                                    ? `
                                        <p>
                                            📝
                                            ${escapeHTML(
                                                order.notes
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="party-card-money">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹${formatMoney(order.total)}
                            </strong>

                            <small>
                                Advance:
                                ₹${formatMoney(order.advance)}
                            </small>

                            <small>
                                Balance:
                                ₹${formatMoney(order.balance)}
                            </small>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function openAdmin() {

    window.location.href =
        "admin.html";

}


function closeAdmin() {

    const modal =
        document.getElementById("adminModal");

    if (modal) {

        modal.classList.remove("active");

    }

}


function showAdminSection(section, button) {

    document
        .querySelectorAll(".admin-tab")
        .forEach(function (tab) {

            tab.classList.remove("active");

        });

    if (button) {

        button.classList.add("active");

    }

    renderAdminSection(section);

}


function renderAdminSection(section) {

    const container =
        document.getElementById("adminContent");

    if (!container) {
        return;
    }

    if (section === "items") {

        renderAdminItems(container);

        return;

    }

    if (section === "add") {

        renderAdminAdd(container);

        return;

    }

    if (section === "settings") {

        renderAdminSettings(container);

    }

}


function renderAdminItems(container) {

    if (menu.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    No menu items
                </h3>

                <p>
                    Add your first menu item.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = `

        <div class="admin-items-list">

            ${
                menu
                    .map(function (item) {

                        return `
                            <div class="admin-item">

                                <div>

                                    <h3>
                                        ${escapeHTML(item.name)}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            item.category
                                        )}
                                    </p>

                                </div>

                                <strong>
                                    ₹${formatMoney(
                                        item.price
                                    )}
                                </strong>

                                <button
                                    class="secondary-btn"
                                    onclick="editMenuItem(${item.id})"
                                >
                                    Edit
                                </button>

                                <button
                                    class="clear-btn"
                                    onclick="deleteMenuItem(${item.id})"
                                >
                                    Delete
                                </button>

                            </div>
                        `;

                    })
                    .join("")
            }

        </div>

    `;

}


function renderAdminAdd(container) {

    container.innerHTML = `

        <div class="admin-form">

            <div class="form-group">

                <label>
                    Item Name
                </label>

                <input
                    id="adminItemName"
                    type="text"
                    placeholder="Chicken Biriyani"
                >

            </div>

            <div class="form-group">

                <label>
                    Category
                </label>

                <input
                    id="adminItemCategory"
                    type="text"
                    placeholder="Biriyani"
                >

            </div>

            <div class="form-group">

                <label>
                    Price
                </label>

                <input
                    id="adminItemPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="160"
                >

            </div>

            <button
                class="primary-btn"
                onclick="addMenuItem()"
            >
                Add Menu Item
            </button>

        </div>

    `;

}


function renderAdminSettings(container) {

    container.innerHTML = `

        <div class="admin-form">

            <h3>
                Restaurant Settings
            </h3>

            <div class="form-group">

                <label>
                    Restaurant Name
                </label>

                <input
                    id="restaurantNameSetting"
                    type="text"
                    value="Hotel Pankaj"
                >

            </div>

            <button
                class="primary-btn"
                onclick="saveRestaurantSettings()"
            >
                Save Settings
            </button>

            <button
                class="secondary-btn"
                onclick="resetAllData()"
                style="margin-top:10px;"
            >
                Reset All Data
            </button>

        </div>

    `;

}


function addMenuItem() {

    const nameElement =
        document.getElementById(
            "adminItemName"
        );

    const categoryElement =
        document.getElementById(
            "adminItemCategory"
        );

    const priceElement =
        document.getElementById(
            "adminItemPrice"
        );

    if (
        !nameElement ||
        !categoryElement ||
        !priceElement
    ) {

        return;

    }

    const name =
        nameElement.value.trim();

    const category =
        categoryElement.value.trim();

    const price =
        Number(priceElement.value);

    if (!name) {

        alert(
            "Please enter item name."
        );

        return;
    }

    if (!category) {

        alert(
            "Please enter category."
        );

        return;
    }

    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }

    const newId =
        menu.length > 0
            ? Math.max(
                ...menu.map(function (item) {
                    return Number(item.id);
                })
            ) + 1
            : 1;

    menu.push({

        id: newId,

        name: name,

        category: category,

        price: price

    });

    saveMenu();

    renderCategories();

    renderMenu();

    alert(
        "Menu item added."
    );

    nameElement.value = "";

    categoryElement.value = "";

    priceElement.value = "";

}


function editMenuItem(id) {

    const item =
        menu.find(function (menuItem) {

            return menuItem.id === id;

        });

    if (!item) {
        return;
    }

    const newName =
        prompt(
            "Item name:",
            item.name
        );

    if (newName === null) {
        return;
    }

    const newCategory =
        prompt(
            "Category:",
            item.category
        );

    if (newCategory === null) {
        return;
    }

    const newPrice =
        prompt(
            "Price:",
            item.price
        );

    if (newPrice === null) {
        return;
    }

    const price =
        Number(newPrice);

    if (
        !newName.trim() ||
        !newCategory.trim() ||
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Invalid item details."
        );

        return;
    }

    item.name =
        newName.trim();

    item.category =
        newCategory.trim();

    item.price =
        price;

    saveMenu();

    renderCategories();

    renderMenu();

    renderAdminSection("items");

}


function deleteMenuItem(id) {

    const item =
        menu.find(function (menuItem) {

            return menuItem.id === id;

        });

    if (!item) {
        return;
    }

    const confirmed =
        confirm(
            "Delete " +
            item.name +
            "?"
        );

    if (!confirmed) {
        return;
    }

    menu =
        menu.filter(function (menuItem) {

            return menuItem.id !== id;

        });

    saveMenu();

    renderCategories();

    renderMenu();

    renderAdminSection("items");

}


function saveRestaurantSettings() {

    const input =
        document.getElementById(
            "restaurantNameSetting"
        );

    if (!input) {
        return;
    }

    const name =
        input.value.trim();

    if (!name) {

        alert(
            "Please enter restaurant name."
        );

        return;
    }

    localStorage.setItem(
        "hotelPankajRestaurantName",
        name
    );

    alert(
        "Settings saved."
    );

}


function resetAllData() {

    const confirmed =
        confirm(
            "This will delete menu, orders and party orders. Continue?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        "hotelPankajMenu"
    );

    localStorage.removeItem(
        "hotelPankajHistory"
    );

    localStorage.removeItem(
        "hotelPankajPartyOrders"
    );

    localStorage.removeItem(
        "hotelPankajOrderNumber"
    );

    menu = [...DEFAULT_MENU];

    history = [];

    partyOrders = [];

    cart = [];

    partyItems = [];

    orderNumber = 1;

    saveMenu();

    saveHistory();

    savePartyOrders();

    renderCategories();

    renderMenu();

    renderCart();

    renderHistory();

    renderPartyOrders();

    updateOrderNumber();

    alert(
        "All data has been reset."
    );

}


function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


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


function escapeAttribute(value) {

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}