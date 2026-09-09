// =====================================================
// HOTEL PANKAJ - APP.JS
// GOOGLE SHEETS + LOCAL STORAGE
// =====================================================


// =====================================================
// GOOGLE SHEETS CONFIGURATION
// =====================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzn3PJ1U9gcvvq2T0fApBq5ah0--iu8_4PN7__FY1u_1jy-qKlFssAb0AlVhkeMXsRE/exec";


// =====================================================
// DEFAULT MENU
// =====================================================

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


// =====================================================
// LOCAL DATA
// =====================================================

let menu = JSON.parse(
    localStorage.getItem(
        "hotelPankajMenu"
    ) || "null"
);

if (
    !Array.isArray(menu) ||
    menu.length === 0
) {

    menu = [
        ...DEFAULT_MENU
    ];

    saveMenu();

}


let cart = [];

let partyItems = [];

let selectedCategory = "All";

let currentBill = null;


let orderNumber = Number(
    localStorage.getItem(
        "hotelPankajOrderNumber"
    ) || 1
);


let history = JSON.parse(
    localStorage.getItem(
        "hotelPankajHistory"
    ) || "[]"
);


let partyOrders = JSON.parse(
    localStorage.getItem(
        "hotelPankajPartyOrders"
    ) || "[]"
);


// =====================================================
// INITIALIZE APP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        renderCategories();

        renderMenu();

        renderCart();

        renderHistory();

        renderPartyOrders();

        updateOrderNumber();

        await loadOrdersFromGoogleSheet();

    }
);


// =====================================================
// GOOGLE SHEETS - SAVE ORDER
// =====================================================

async function saveOrderToGoogleSheet(order) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {

                    method: "POST",

                    body: JSON.stringify({

                        action: "save",

                        orderId:
                            order.id,

                        date:
                            order.date,

                        time:
                            order.time,

                        items:
                            order.items,

                        total:
                            order.total,

                        type:
                            "normal"

                    })

                }
            );


        const result =
            await response.json();


        if (
            result &&
            result.success === true
        ) {

            console.log(
                "Order synced to Google Sheets:",
                order.number
            );

            return true;

        }


        console.error(
            "Google Sheets save failed:",
            result
        );

        return false;


    } catch (error) {

        console.error(
            "Google Sheets sync failed:",
            error
        );

        return false;

    }

}


// =====================================================
// GOOGLE SHEETS - DELETE ORDER
// =====================================================

async function deleteOrderFromGoogleSheet(
    orderId
) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {

                    method: "POST",

                    body: JSON.stringify({

                        action: "delete",

                        orderId:
                            orderId

                    })

                }
            );


        const result =
            await response.json();


        if (
            result &&
            result.success === true
        ) {

            console.log(
                "Order deleted from Google Sheets:",
                orderId
            );

            return true;

        }


        console.error(
            "Google Sheets delete failed:",
            result
        );

        return false;


    } catch (error) {

        console.error(
            "Google Sheets delete failed:",
            error
        );

        return false;

    }

}


// =====================================================
// GOOGLE SHEETS - LOAD ORDERS
// =====================================================

async function loadOrdersFromGoogleSheet() {

    try {

        console.log(
            "Loading orders from Google Sheets..."
        );


        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Google Sheets response:",
            result
        );


        if (
            !result ||
            result.success !== true ||
            !Array.isArray(result.orders)
        ) {

            console.error(
                "Invalid Google Sheets response:",
                result
            );

            return;

        }


        const cloudOrders =
            result.orders.map(
                function(row) {

                    let parsedItems = [];


                    try {

                        const rawItems =
                            row["Items"];


                        if (
                            Array.isArray(
                                rawItems
                            )
                        ) {

                            parsedItems =
                                rawItems;

                        } else if (
                            rawItems
                        ) {

                            parsedItems =
                                JSON.parse(
                                    String(
                                        rawItems
                                    )
                                );

                        }

                    } catch (error) {

                        console.error(
                            "Could not parse order items:",
                            error
                        );

                        parsedItems = [];

                    }


                    const rawId =
                        row["Order ID"];


                    const id =
                        Number(
                            rawId
                        );


                    return {

                        id: id,

                        number:
                            String(
                                rawId
                            ).padStart(
                                3,
                                "0"
                            ),

                        date:
                            String(
                                row["Date"] || ""
                            ),

                        time:
                            String(
                                row["Time"] || ""
                            ),

                        items:
                            parsedItems,

                        total:
                            Number(
                                row["Total"] || 0
                            )

                    };

                }
            );


        const validOrders =
            cloudOrders.filter(
                function(order) {

                    return (
                        Number.isFinite(
                            order.id
                        )
                    );

                }
            );


        history =
            validOrders;


        saveHistory();

        renderHistory();


        // =============================================
        // UPDATE NEXT ORDER NUMBER
        // =============================================

        if (
            history.length > 0
        ) {

            const highestId =
                Math.max(
                    ...history.map(
                        function(order) {

                            return (
                                Number(
                                    order.id
                                ) || 0
                            );

                        }
                    )
                );


            if (
                highestId >=
                orderNumber
            ) {

                orderNumber =
                    highestId + 1;


                localStorage.setItem(
                    "hotelPankajOrderNumber",
                    orderNumber
                );


                updateOrderNumber();

            }

        }


        console.log(
            "Orders loaded from Google Sheets:",
            history.length
        );


    } catch (error) {

        console.error(
            "Could not load Google Sheets data:",
            error
        );

    }

}


// =====================================================
// LOCAL STORAGE - MENU
// =====================================================

function saveMenu() {

    localStorage.setItem(
        "hotelPankajMenu",
        JSON.stringify(menu)
    );

}


// =====================================================
// LOCAL STORAGE - HISTORY
// =====================================================

function saveHistory() {

    localStorage.setItem(
        "hotelPankajHistory",
        JSON.stringify(history)
    );

}


// =====================================================
// LOCAL STORAGE - PARTY ORDERS
// =====================================================

function savePartyOrders() {

    localStorage.setItem(
        "hotelPankajPartyOrders",
        JSON.stringify(
            partyOrders
        )
    );

}


// =====================================================
// ORDER NUMBER
// =====================================================

function updateOrderNumber() {

    const element =
        document.getElementById(
            "orderNumber"
        );


    if (element) {

        element.textContent =
            String(
                orderNumber
            ).padStart(
                3,
                "0"
            );

    }

}


// =====================================================
// PAGE NAVIGATION
// =====================================================

function showPage(
    pageId,
    button
) {

    document
        .querySelectorAll(".page")
        .forEach(
            function(page) {

                page.classList.remove(
                    "active"
                );

            }
        );


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(
            function(btn) {

                btn.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================================
// CATEGORIES
// =====================================================

function renderCategories() {

    const container =
        document.getElementById(
            "categories"
        );


    if (!container) {

        return;

    }


    const categories = [

        "All",

        ...new Set(
            menu.map(
                function(item) {

                    return item.category;

                }
            )
        )

    ];


    container.innerHTML =
        categories
            .map(
                function(category) {

                    return `

                        <button
                            class="category-btn ${
                                category ===
                                selectedCategory
                                    ? "active"
                                    : ""
                            }"
                            onclick="selectCategory('${escapeAttribute(category)}')"
                        >

                            ${escapeHTML(
                                category
                            )}

                        </button>

                    `;

                }
            )
            .join("");

}


// =====================================================
// SELECT CATEGORY
// =====================================================

function selectCategory(
    category
) {

    selectedCategory =
        category;

    renderCategories();

    renderMenu();

}


// =====================================================
// MENU
// =====================================================

function renderMenu() {

    const grid =
        document.getElementById(
            "menuGrid"
        );


    const count =
        document.getElementById(
            "menuCount"
        );


    if (!grid) {

        return;

    }


    const filteredMenu =
        selectedCategory === "All"

            ? menu

            : menu.filter(
                function(item) {

                    return (
                        item.category ===
                        selectedCategory
                    );

                }
            );


    if (count) {

        count.textContent =
            filteredMenu.length +
            (
                filteredMenu.length === 1
                    ? " item"
                    : " items"
            );

    }


    if (
        filteredMenu.length === 0
    ) {

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
            .map(
                function(item) {

                    return `

                        <div class="menu-card">

                            <div class="menu-card-info">

                                <h3>
                                    ${escapeHTML(
                                        item.name
                                    )}
                                </h3>

                                <span>
                                    ${escapeHTML(
                                        item.category
                                    )}
                                </span>

                            </div>


                            <div class="menu-card-bottom">

                                <strong>
                                    ₹${formatMoney(
                                        item.price
                                    )}
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

                }
            )
            .join("");

}


// =====================================================
// ADD TO CART
// =====================================================

function addToCart(id) {

    const item =
        menu.find(
            function(menuItem) {

                return (
                    Number(menuItem.id) ===
                    Number(id)
                );

            }
        );


    if (!item) {

        return;

    }


    const existing =
        cart.find(
            function(cartItem) {

                return (
                    Number(cartItem.id) ===
                    Number(id)
                );

            }
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id:
                Number(item.id),

            name:
                item.name,

            price:
                Number(item.price),

            quantity:
                1

        });

    }


    renderCart();

}


// =====================================================
// CHANGE QUANTITY
// =====================================================

function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            function(cartItem) {

                return (
                    Number(cartItem.id) ===
                    Number(id)
                );

            }
        );


    if (!item) {

        return;

    }


    item.quantity +=
        Number(amount);


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                function(cartItem) {

                    return (
                        Number(
                            cartItem.id
                        ) !==
                        Number(id)
                    );

                }
            );

    }


    renderCart();

}


// =====================================================
// CLEAR CART
// =====================================================

function clearCart() {

    if (
        cart.length === 0
    ) {

        return;

    }


    cart = [];

    renderCart();

}


// =====================================================
// CART TOTAL
// =====================================================

function getCartTotal() {

    return cart.reduce(

        function(
            total,
            item
        ) {

            return (
                total +
                Number(item.price) *
                Number(item.quantity)
            );

        },

        0

    );

}


// =====================================================
// CART ITEM COUNT
// =====================================================

function getCartItemCount() {

    return cart.reduce(

        function(
            total,
            item
        ) {

            return (
                total +
                Number(
                    item.quantity
                )
            );

        },

        0

    );

}


// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    const itemCount =
        document.getElementById(
            "cartCount"
        );


    const subtotal =
        document.getElementById(
            "subtotal"
        );


    const grandTotal =
        document.getElementById(
            "total"
        );


    const mobileCount =
        document.getElementById(
            "mobileCount"
        );


    const mobileTotal =
        document.getElementById(
            "mobileTotal"
        );


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
            "₹" +
            formatMoney(total);

    }


    if (grandTotal) {

        grandTotal.textContent =
            "₹" +
            formatMoney(total);

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
            "₹" +
            formatMoney(total);

    }


    if (!container) {

        return;

    }


    if (
        cart.length === 0
    ) {

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
            .map(
                function(item) {

                    const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);


                    return `

                        <div class="cart-item">

                            <div class="cart-item-info">

                                <h4>
                                    ${escapeHTML(
                                        item.name
                                    )}
                                </h4>

                                <small>
                                    ₹${formatMoney(
                                        item.price
                                    )}
                                    each
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
                                ₹${formatMoney(
                                    itemTotal
                                )}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// MOBILE CART
// =====================================================

function toggleMobileCart() {

    const cartPanel =
        document.getElementById(
            "cartPanel"
        );


    if (!cartPanel) {

        return;

    }


    cartPanel.classList.toggle(
        "mobile-open"
    );

}


// =====================================================
// CONFIRM ORDER
// =====================================================

function confirmOrder() {

    if (
        cart.length === 0
    ) {

        alert(
            "Please add at least one item to the order."
        );

        return;

    }


    const now =
        new Date();


    const order = {

        id:
            orderNumber,

        number:
            String(
                orderNumber
            ).padStart(
                3,
                "0"
            ),

        date:
            now.toLocaleDateString(
                "en-IN"
            ),

        time:
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ),

        items:
            cart.map(
                function(item) {

                    return {

                        id:
                            item.id,

                        name:
                            item.name,

                        price:
                            Number(
                                item.price
                            ),

                        quantity:
                            Number(
                                item.quantity
                            )

                    };

                }
            ),

        total:
            getCartTotal()

    };


    // =============================================
    // SAVE LOCALLY
    // =============================================

    history.unshift(
        order
    );

    saveHistory();


    // =============================================
    // SAVE TO GOOGLE SHEETS
    // =============================================

    saveOrderToGoogleSheet(
        order
    );


    currentBill =
        order;


    orderNumber += 1;


    localStorage.setItem(
        "hotelPankajOrderNumber",
        orderNumber
    );


    cart = [];


    renderCart();

    renderHistory();

    updateOrderNumber();


    showBill(
        order
    );

}


// =====================================================
// SHOW BILL
// =====================================================

function showBill(
    order
) {

    const modal =
        document.getElementById(
            "billModal"
        );


    const content =
        document.getElementById(
            "billContent"
        );


    if (
        !modal ||
        !content
    ) {

        return;

    }


    const itemRows =
        order.items
            .map(
                function(item) {

                    return `

                        <div class="bill-row">

                            <span>

                                ${escapeHTML(
                                    item.name
                                )}

                                ×
                                ${item.quantity}

                            </span>


                            <strong>

                                ₹${formatMoney(
                                    Number(
                                        item.price
                                    ) *
                                    Number(
                                        item.quantity
                                    )
                                )}

                            </strong>

                        </div>

                    `;

                }
            )
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
                #${escapeHTML(
                    order.number
                )}
            </strong>

        </div>


        <div class="bill-row">

            <span>
                Date
            </span>

            <strong>
                ${escapeHTML(
                    order.date
                )}
            </strong>

        </div>


        <div class="bill-row">

            <span>
                Time
            </span>

            <strong>
                ${escapeHTML(
                    order.time
                )}
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
                ₹${formatMoney(
                    order.total
                )}
            </strong>

        </div>

    `;


    modal.classList.add(
        "active"
    );

}


// =====================================================
// CLOSE BILL
// =====================================================

function closeBill() {

    const modal =
        document.getElementById(
            "billModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// =====================================================
// PRINT BILL
// =====================================================

function printBill() {

    if (!currentBill) {

        return;

    }


    window.print();

}


// =====================================================
// HISTORY
// =====================================================

function renderHistory() {

    const container =
        document.getElementById(
            "history"
        );


    if (!container) {

        return;

    }


    if (
        history.length === 0
    ) {

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
            .map(
                function(order) {

                    return `

                        <div class="history-card">

                            <div
                                class="history-info"
                                onclick="viewHistoryOrder(${order.id})"
                            >

                                <h3>
                                    Order #${escapeHTML(
                                        order.number
                                    )}
                                </h3>


                                <p>

                                    ${escapeHTML(
                                        order.date
                                    )}

                                    •

                                    ${escapeHTML(
                                        order.time
                                    )}

                                    •

                                    ${order.items.length}

                                    item${
                                        order.items.length === 1
                                            ? ""
                                            : "s"
                                    }

                                </p>

                            </div>


                            <div class="history-right">

                                <strong>
                                    ₹${formatMoney(
                                        order.total
                                    )}
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

                }
            )
            .join("");

}


// =====================================================
// VIEW HISTORY ORDER
// =====================================================

function viewHistoryOrder(
    id
) {

    const order =
        history.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!order) {

        return;

    }


    currentBill =
        order;


    showBill(
        order
    );

}


// =====================================================
// DELETE HISTORY ORDER
// =====================================================

async function deleteHistoryOrder(
    id,
    event
) {

    if (event) {

        event.stopPropagation();

    }


    const order =
        history.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


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


    // =============================================
    // DELETE LOCALLY
    // =============================================

    history =
        history.filter(
            function(item) {

                return (
                    Number(item.id) !==
                    Number(id)
                );

            }
        );


    saveHistory();

    renderHistory();


    // =============================================
    // DELETE FROM GOOGLE SHEETS
    // =============================================

    await deleteOrderFromGoogleSheet(
        id
    );


    if (
        currentBill &&
        Number(currentBill.id) ===
        Number(id)
    ) {

        currentBill = null;

        closeBill();

    }

}


// =====================================================
// PARTY ORDER MODAL
// =====================================================

function openPartyModal() {

    const modal =
        document.getElementById(
            "partyModal"
        );


    if (!modal) {

        return;

    }


    const fields = [

        "partyName",
        "partyPhone",
        "partyDate",
        "partyPeople",
        "partyNotes",
        "partyAdvance"

    ];


    fields.forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value = "";

            }

        }
    );


    partyItems = [];


    renderPartyItems();

    updatePartyTotal();


    modal.classList.add(
        "active"
    );

}


// =====================================================
// CLOSE PARTY MODAL
// =====================================================

function closePartyModal() {

    const modal =
        document.getElementById(
            "partyModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// =====================================================
// ADD PARTY ITEM
// =====================================================

function addPartyItem() {

    if (
        menu.length === 0
    ) {

        alert(
            "No menu items available."
        );

        return;

    }


    partyItems.push({

        id:
            menu[0].id,

        quantity:
            1

    });


    renderPartyItems();

    updatePartyTotal();

}


// =====================================================
// REMOVE PARTY ITEM
// =====================================================

function removePartyItem(
    index
) {

    partyItems.splice(
        index,
        1
    );


    renderPartyItems();

    updatePartyTotal();

}


// =====================================================
// UPDATE PARTY ITEM
// =====================================================

function updatePartyItem(
    index,
    value
) {

    const id =
        Number(value);


    if (!partyItems[index]) {

        return;

    }


    partyItems[index].id =
        id;


    updatePartyTotal();

}


// =====================================================
// UPDATE PARTY QUANTITY
// =====================================================

function updatePartyQuantity(
    index,
    value
) {

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


// =====================================================
// RENDER PARTY ITEMS
// =====================================================

function renderPartyItems() {

    const container =
        document.getElementById(
            "partyItems"
        );


    if (!container) {

        return;

    }


    if (
        partyItems.length === 0
    ) {

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
            .map(
                function(
                    item,
                    index
                ) {

                    return `

                        <div class="party-item-row">

                            <select
                                class="party-item-select"
                                onchange="updatePartyItem(${index}, this.value)"
                            >

                                ${
                                    menu
                                        .map(
                                            function(
                                                menuItem
                                            ) {

                                                return `

                                                    <option
                                                        value="${menuItem.id}"
                                                        ${
                                                            Number(
                                                                menuItem.id
                                                            ) ===
                                                            Number(
                                                                item.id
                                                            )
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

                                            }
                                        )
                                        .join("")
                                }

                            </select>


                            <input
                                class="party-item-qty"
                                type="number"
                                min="1"
                                value="${item.quantity}"
                                onchange="updatePartyQuantity(${index}, this.value)"
                            >


                            <button
                                class="remove-party-btn"
                                onclick="removePartyItem(${index})"
                            >
                                ×
                            </button>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// PARTY TOTAL
// =====================================================

function getPartyTotal() {

    return partyItems.reduce(

        function(
            total,
            partyItem
        ) {

            const item =
                menu.find(
                    function(menuItem) {

                        return (
                            Number(
                                menuItem.id
                            ) ===
                            Number(
                                partyItem.id
                            )
                        );

                    }
                );


            if (!item) {

                return total;

            }


            return (
                total +
                Number(item.price) *
                Number(partyItem.quantity)
            );

        },

        0

    );

}


// =====================================================
// UPDATE PARTY TOTAL
// =====================================================

function updatePartyTotal() {

    const totalElement =
        document.getElementById(
            "partyTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            "₹" +
            formatMoney(
                getPartyTotal()
            );

    }

}


// =====================================================
// SAVE PARTY ORDER
// =====================================================

function savePartyOrder() {

    const nameElement =
        document.getElementById(
            "partyName"
        );


    const phoneElement =
        document.getElementById(
            "partyPhone"
        );


    const dateElement =
        document.getElementById(
            "partyDate"
        );


    const peopleElement =
        document.getElementById(
            "partyPeople"
        );


    const notesElement =
        document.getElementById(
            "partyNotes"
        );


    const advanceElement =
        document.getElementById(
            "partyAdvance"
        );


    if (
        !nameElement ||
        !phoneElement ||
        !dateElement ||
        !peopleElement ||
        !notesElement ||
        !advanceElement
    ) {

        return;

    }


    const name =
        nameElement.value.trim();


    const phone =
        phoneElement.value.trim();


    const date =
        dateElement.value;


    const people =
        Number(
            peopleElement.value
        ) || 0;


    const notes =
        notesElement.value.trim();


    const advance =
        Number(
            advanceElement.value
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


    if (
        people <= 0
    ) {

        alert(
            "Please enter number of people."
        );

        return;

    }


    if (
        partyItems.length === 0
    ) {

        alert(
            "Please add at least one item."
        );

        return;

    }


    const total =
        getPartyTotal();


    if (
        advance > total
    ) {

        alert(
            "Advance cannot be greater than total amount."
        );

        return;

    }


    const partyOrder = {

        id:
            Date.now(),

        name:
            name,

        phone:
            phone,

        date:
            date,

        people:
            people,

        notes:
            notes,

        advance:
            advance,

        balance:
            total - advance,

        total:
            total,


        items:
            partyItems.map(
                function(partyItem) {

                    const menuItem =
                        menu.find(
                            function(item) {

                                return (
                                    Number(
                                        item.id
                                    ) ===
                                    Number(
                                        partyItem.id
                                    )
                                );

                            }
                        );


                    return {

                        id:
                            partyItem.id,

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

                }
            )

    };


    partyOrders.unshift(
        partyOrder
    );


    savePartyOrders();

    renderPartyOrders();

    closePartyModal();


    alert(
        "Party order saved successfully."
    );

}


// =====================================================
// PARTY ORDERS
// =====================================================

function renderPartyOrders() {

    const container =
        document.getElementById(
            "partyOrders"
        );


    if (!container) {

        return;

    }


    if (
        partyOrders.length === 0
    ) {

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
            .map(
                function(order) {

                    return `

                        <div class="party-card">

                            <div class="party-card-main">

                                <h3>
                                    ${escapeHTML(
                                        order.name
                                    )}
                                </h3>


                                <p>

                                    📅

                                    ${escapeHTML(
                                        formatDate(
                                            order.date
                                        )
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
                                    ₹${formatMoney(
                                        order.total
                                    )}
                                </strong>


                                <small>

                                    Advance:

                                    ₹${formatMoney(
                                        order.advance
                                    )}

                                </small>


                                <small>

                                    Balance:

                                    ₹${formatMoney(
                                        order.balance
                                    )}

                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// ADMIN
// =====================================================

function openAdmin() {

    window.location.href =
        "admin.html";

}


// =====================================================
// CLOSE ADMIN
// =====================================================

function closeAdmin() {

    const modal =
        document.getElementById(
            "adminModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// =====================================================
// ADMIN SECTION
// =====================================================

function showAdminSection(
    section,
    button
) {

    document
        .querySelectorAll(
            ".admin-tab"
        )
        .forEach(
            function(tab) {

                tab.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    renderAdminSection(
        section
    );

}


// =====================================================
// RENDER ADMIN SECTION
// =====================================================

function renderAdminSection(
    section
) {

    const container =
        document.getElementById(
            "adminContent"
        );


    if (!container) {

        return;

    }


    if (
        section === "items"
    ) {

        renderAdminItems(
            container
        );

        return;

    }


    if (
        section === "add"
    ) {

        renderAdminAdd(
            container
        );

        return;

    }


    if (
        section === "settings"
    ) {

        renderAdminSettings(
            container
        );

    }

}


// =====================================================
// ADMIN ITEMS
// =====================================================

function renderAdminItems(
    container
) {

    if (
        menu.length === 0
    ) {

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
                    .map(
                        function(item) {

                            return `

                                <div class="admin-item">

                                    <div>

                                        <h3>
                                            ${escapeHTML(
                                                item.name
                                            )}
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

                        }
                    )
                    .join("")
            }

        </div>

    `;

}


// =====================================================
// ADMIN ADD ITEM
// =====================================================

function renderAdminAdd(
    container
) {

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


// =====================================================
// ADMIN SETTINGS
// =====================================================

function renderAdminSettings(
    container
) {

    const savedName =
        localStorage.getItem(
            "hotelPankajRestaurantName"
        ) ||
        "Hotel Pankaj";


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
                    value="${escapeAttribute(
                        savedName
                    )}"
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


// =====================================================
// ADD MENU ITEM
// =====================================================

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
        Number(
            priceElement.value
        );


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
                ...menu.map(
                    function(item) {

                        return Number(
                            item.id
                        );

                    }
                )
            ) + 1

            : 1;


    menu.push({

        id:
            newId,

        name:
            name,

        category:
            category,

        price:
            price

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


// =====================================================
// EDIT MENU ITEM
// =====================================================

function editMenuItem(
    id
) {

    const item =
        menu.find(
            function(menuItem) {

                return (
                    Number(
                        menuItem.id
                    ) ===
                    Number(id)
                );

            }
        );


    if (!item) {

        return;

    }


    const newName =
        prompt(
            "Item name:",
            item.name
        );


    if (
        newName === null
    ) {

        return;

    }


    const newCategory =
        prompt(
            "Category:",
            item.category
        );


    if (
        newCategory === null
    ) {

        return;

    }


    const newPrice =
        prompt(
            "Price:",
            item.price
        );


    if (
        newPrice === null
    ) {

        return;

    }


    const price =
        Number(
            newPrice
        );


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

    renderAdminSection(
        "items"
    );

}


// =====================================================
// DELETE MENU ITEM
// =====================================================

function deleteMenuItem(
    id
) {

    const item =
        menu.find(
            function(menuItem) {

                return (
                    Number(
                        menuItem.id
                    ) ===
                    Number(id)
                );

            }
        );


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
        menu.filter(
            function(menuItem) {

                return (
                    Number(
                        menuItem.id
                    ) !==
                    Number(id)
                );

            }
        );


    saveMenu();

    renderCategories();

    renderMenu();

    renderAdminSection(
        "items"
    );

}


// =====================================================
// RESTAURANT SETTINGS
// =====================================================

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


// =====================================================
// RESET ALL DATA
// =====================================================

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


    menu =
        [
            ...DEFAULT_MENU
        ];


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


// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(
    value
) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
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


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value
    )
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


// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(
    value
) {

    return String(
        value
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}