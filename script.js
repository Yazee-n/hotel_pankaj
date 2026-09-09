/* =========================================
   PANKAJ RESTAURANT
   MENU + CART + ORDER SYSTEM
========================================= */


/* =========================================
   MENU ELEMENTS
========================================= */

const searchInput =
    document.getElementById("searchInput");

const categoryButtons =
    document.querySelectorAll(
        ".category-btn"
    );

const menuCards =
    document.querySelectorAll(
        ".menu-card"
    );

const itemCount =
    document.getElementById(
        "itemCount"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );


/* =========================================
   CART ELEMENTS
========================================= */

const cartButton =
    document.getElementById(
        "cartButton"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const cartDrawer =
    document.getElementById(
        "cartDrawer"
    );

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartClose =
    document.getElementById(
        "cartClose"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartEmpty =
    document.getElementById(
        "cartEmpty"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const placeOrder =
    document.getElementById(
        "placeOrder"
    );


/* =========================================
   ORDER MODAL
========================================= */

const orderModal =
    document.getElementById(
        "orderModal"
    );

const confirmedOrder =
    document.getElementById(
        "confirmedOrder"
    );

const confirmedTotal =
    document.getElementById(
        "confirmedTotal"
    );

const newOrder =
    document.getElementById(
        "newOrder"
    );


/* =========================================
   STATE
========================================= */

let activeCategory = "all";

let cart = [];


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

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                activeCategory =
                    button.dataset.category;


                filterMenu();

            }
        );

    }
);


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


addButtons.forEach(
    button => {

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


                /*
                 * Visual feedback
                 */

                button.classList.add(
                    "added"
                );

                button.textContent =
                    "✓ Added";


                setTimeout(
                    () => {

                        button.classList.remove(
                            "added"
                        );

                        button.textContent =
                            "+ Add";

                    },
                    700
                );


                /*
                 * Cart animation
                 */

                cartButton.classList.remove(
                    "pulse"
                );


                void cartButton.offsetWidth;


                cartButton.classList.add(
                    "pulse"
                );

            }
        );

    }
);


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
            action ===
            "increase"
        ) {

            cart[index].quantity++;

        }


        if (
            action ===
            "decrease"
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
            action ===
            "remove"
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
            (
                total,
                item
            ) => {

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

function calculateTotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

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


        createOrderSummary();


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
   ORDER SUMMARY
========================================= */

function createOrderSummary() {

    confirmedOrder.innerHTML =
        "";


    cart.forEach(
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
        `₹${calculateTotal()}`;

}


/* =========================================
   NEW ORDER
========================================= */

newOrder.addEventListener(
    "click",
    () => {

        cart = [];

        updateCart();

        closeOrderModal();

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
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
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
