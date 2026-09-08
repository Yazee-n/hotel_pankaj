const ADMIN_PASSWORD = "pankaj123";

let adminMenu = JSON.parse(
    localStorage.getItem("hotelPankajMenu") || "[]"
);

let adminHistory = JSON.parse(
    localStorage.getItem("hotelPankajHistory") || "[]"
);

let adminPartyOrders = JSON.parse(
    localStorage.getItem("hotelPankajPartyOrders") || "[]"
);

let editingItemId = null;


document.addEventListener("DOMContentLoaded", function () {

    const loggedIn =
        sessionStorage.getItem("hotelPankajAdmin") === "true";

    if (!loggedIn) {

        showLogin();

        return;

    }

    refreshAdminData();

});


function showLogin() {

    document.body.innerHTML = `

        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f7f7f7;
            padding:20px;
        ">

            <div style="
                width:100%;
                max-width:380px;
                background:white;
                padding:30px;
                border-radius:16px;
                box-shadow:0 10px 40px rgba(0,0,0,.1);
                text-align:center;
            ">

                <div style="
                    width:60px;
                    height:60px;
                    margin:0 auto 15px;
                    background:#b5121b;
                    color:white;
                    border-radius:12px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:900;
                    font-size:20px;
                ">
                    HP
                </div>

                <h2>
                    Hotel Pankaj
                </h2>

                <p style="
                    color:#777;
                    margin:8px 0 25px;
                ">
                    Admin Panel
                </p>

                <input
                    id="adminPassword"
                    type="password"
                    placeholder="Enter admin password"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #ddd;
                        border-radius:8px;
                        outline:none;
                        margin-bottom:12px;
                        font-size:15px;
                    "
                    onkeydown="handlePasswordKey(event)"
                >

                <button
                    onclick="loginAdmin()"
                    style="
                        width:100%;
                        padding:13px;
                        border:none;
                        border-radius:8px;
                        background:#b5121b;
                        color:white;
                        font-weight:700;
                        font-size:15px;
                        cursor:pointer;
                    "
                >
                    Login
                </button>

                <p
                    id="loginError"
                    style="
                        color:#b5121b;
                        font-size:13px;
                        margin-top:12px;
                        display:none;
                    "
                >
                    Incorrect password
                </p>

                <a
                    href="index.html"
                    style="
                        display:block;
                        margin-top:20px;
                        color:#777;
                        text-decoration:none;
                        font-size:13px;
                    "
                >
                    ← Back to Order App
                </a>

            </div>

        </div>

    `;

    setTimeout(function () {

        const input =
            document.getElementById("adminPassword");

        if (input) {
            input.focus();
        }

    }, 100);

}


function handlePasswordKey(event) {

    if (event.key === "Enter") {

        loginAdmin();

    }

}


function loginAdmin() {

    const input =
        document.getElementById("adminPassword");

    const error =
        document.getElementById("loginError");

    if (!input) {
        return;
    }

    if (input.value === ADMIN_PASSWORD) {

        sessionStorage.setItem(
            "hotelPankajAdmin",
            "true"
        );

        location.reload();

    } else {

        if (error) {
            error.style.display = "block";
        }

        input.value = "";

        input.focus();

    }

}


function logoutAdmin() {

    sessionStorage.removeItem(
        "hotelPankajAdmin"
    );

    location.reload();

}


function refreshAdminData() {

    adminMenu = JSON.parse(
        localStorage.getItem("hotelPankajMenu") || "[]"
    );

    adminHistory = JSON.parse(
        localStorage.getItem("hotelPankajHistory") || "[]"
    );

    adminPartyOrders = JSON.parse(
        localStorage.getItem("hotelPankajPartyOrders") || "[]"
    );

    updateStats();

    populateCategoryDropdowns();

    renderAdminMenu();

}


function updateStats() {

    const totalItems =
        document.getElementById("totalItems");

    const totalCategories =
        document.getElementById("totalCategories");

    const totalOrders =
        document.getElementById("totalOrders");

    const totalPartyOrders =
        document.getElementById("totalPartyOrders");

    if (!totalItems) {
        return;
    }

    const categories =
        getCategories();

    totalItems.textContent =
        adminMenu.length;

    totalCategories.textContent =
        categories.length;

    totalOrders.textContent =
        adminHistory.length;

    totalPartyOrders.textContent =
        adminPartyOrders.length;

}


function getCategories() {

    const categoryMap =
        new Map();

    adminMenu.forEach(function (item) {

        const category =
            String(item.category || "").trim();

        if (!category) {
            return;
        }

        const key =
            category.toLowerCase();

        if (!categoryMap.has(key)) {

            categoryMap.set(
                key,
                category
            );

        }

    });

    return Array.from(
        categoryMap.values()
    ).sort(function (a, b) {

        return a.localeCompare(b);

    });

}


function populateCategoryDropdowns(
    selectedAddCategory = "",
    selectedEditCategory = ""
) {

    const categories =
        getCategories();

    const addSelect =
        document.getElementById(
            "itemCategory"
        );

    const editSelect =
        document.getElementById(
            "editCategory"
        );

    if (addSelect) {

        addSelect.innerHTML = `
            <option value="">
                Select Category
            </option>

            ${categories.map(function (category) {

                return `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            }).join("")}

            <option value="__new__">
                + Enter New Category
            </option>
        `;

        if (selectedAddCategory) {

            addSelect.value =
                selectedAddCategory;

        }

    }


    if (editSelect) {

        editSelect.innerHTML = `
            <option value="">
                Select Category
            </option>

            ${categories.map(function (category) {

                return `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            }).join("")}

            <option value="__new__">
                + Enter New Category
            </option>
        `;

        if (selectedEditCategory) {

            editSelect.value =
                selectedEditCategory;

        }

    }

}


function handleCategoryChange(type) {

    if (type === "add") {

        const select =
            document.getElementById(
                "itemCategory"
            );

        const input =
            document.getElementById(
                "newCategory"
            );

        if (!select || !input) {
            return;
        }

        if (select.value === "__new__") {

            input.style.display =
                "block";

            input.required =
                true;

            input.focus();

        } else {

            input.style.display =
                "none";

            input.required =
                false;

            input.value =
                "";

        }

    }


    if (type === "edit") {

        const select =
            document.getElementById(
                "editCategory"
            );

        const input =
            document.getElementById(
                "editNewCategory"
            );

        if (!select || !input) {
            return;
        }

        if (select.value === "__new__") {

            input.style.display =
                "block";

            input.required =
                true;

            input.focus();

        } else {

            input.style.display =
                "none";

            input.required =
                false;

            input.value =
                "";

        }

    }

}


function getSelectedCategory(type) {

    if (type === "add") {

        const select =
            document.getElementById(
                "itemCategory"
            );

        const input =
            document.getElementById(
                "newCategory"
            );

        if (
            select &&
            select.value === "__new__"
        ) {

            return input
                ? input.value.trim()
                : "";

        }

        return select
            ? select.value.trim()
            : "";

    }


    if (type === "edit") {

        const select =
            document.getElementById(
                "editCategory"
            );

        const input =
            document.getElementById(
                "editNewCategory"
            );

        if (
            select &&
            select.value === "__new__"
        ) {

            return input
                ? input.value.trim()
                : "";

        }

        return select
            ? select.value.trim()
            : "";

    }

    return "";

}


function categoryExists(
    category,
    ignoreId = null
) {

    const normalized =
        category
            .trim()
            .toLowerCase();

    return adminMenu.some(function (item) {

        if (
            ignoreId !== null &&
            item.id === ignoreId
        ) {
            return false;
        }

        return String(item.category || "")
            .trim()
            .toLowerCase() === normalized;

    });

}


function renderAdminMenu() {

    const container =
        document.getElementById(
            "menuList"
        );

    if (!container) {
        return;
    }

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const filtered =
        adminMenu.filter(function (item) {

            return (
                String(item.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.category || "")
                    .toLowerCase()
                    .includes(search)
            );

        });


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No menu items found
                </h3>

                <p>
                    Add a new item or change your search.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(function (item) {

            return `

                <div class="menu-row">

                    <div class="menu-info">

                        <h4>
                            ${escapeHTML(item.name)}
                        </h4>

                        <span>
                            ${escapeHTML(item.category)}
                        </span>

                    </div>

                    <div class="menu-price">
                        ₹${formatMoney(item.price)}
                    </div>

                    <button
                        class="edit-btn"
                        onclick="openEditModal(${item.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteItem(${item.id})"
                    >
                        Delete
                    </button>

                </div>

            `;

        }).join("");

}


function showAddForm() {

    const section =
        document.getElementById(
            "addItemSection"
        );

    if (!section) {
        return;
    }

    populateCategoryDropdowns();

    const newCategory =
        document.getElementById(
            "newCategory"
        );

    if (newCategory) {

        newCategory.style.display =
            "none";

        newCategory.required =
            false;

        newCategory.value =
            "";

    }

    section.classList.remove(
        "hidden"
    );

    const itemName =
        document.getElementById(
            "itemName"
        );

    if (itemName) {
        itemName.focus();
    }

    section.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });

}


function hideAddForm() {

    const section =
        document.getElementById(
            "addItemSection"
        );

    if (section) {

        section.classList.add(
            "hidden"
        );

    }

    const itemName =
        document.getElementById(
            "itemName"
        );

    const itemCategory =
        document.getElementById(
            "itemCategory"
        );

    const newCategory =
        document.getElementById(
            "newCategory"
        );

    const itemPrice =
        document.getElementById(
            "itemPrice"
        );


    if (itemName) {
        itemName.value = "";
    }

    if (itemCategory) {
        itemCategory.value = "";
    }

    if (newCategory) {

        newCategory.value =
            "";

        newCategory.style.display =
            "none";

        newCategory.required =
            false;

    }

    if (itemPrice) {
        itemPrice.value = "";
    }

}


function addNewItem(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("itemName")
            .value
            .trim();

    const category =
        getSelectedCategory("add");

    const price =
        Number(
            document
                .getElementById("itemPrice")
                .value
        );


    if (!name) {

        alert(
            "Enter item name."
        );

        return;

    }


    if (!category) {

        alert(
            "Select or enter a category."
        );

        return;

    }


    if (category.length > 50) {

        alert(
            "Category name is too long."
        );

        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Enter a valid price."
        );

        return;

    }


    const id =
        adminMenu.length > 0
            ? Math.max(
                ...adminMenu.map(
                    function (item) {
                        return Number(item.id) || 0;
                    }
                )
            ) + 1
            : 1;


    adminMenu.push({

        id:id,

        name:name,

        category:category,

        price:price

    });


    saveMenu();

    refreshAdminData();

    hideAddForm();

    alert(
        "Item added successfully."
    );

}


function openEditModal(id) {

    const item =
        adminMenu.find(
            function (menuItem) {
                return menuItem.id === id;
            }
        );


    if (!item) {
        return;
    }


    editingItemId =
        id;


    populateCategoryDropdowns(
        "",
        item.category
    );


    const editNewCategory =
        document.getElementById(
            "editNewCategory"
        );

    if (editNewCategory) {

        editNewCategory.value =
            "";

        editNewCategory.style.display =
            "none";

        editNewCategory.required =
            false;

    }


    document
        .getElementById("editName")
        .value =
        item.name;


    document
        .getElementById("editCategory")
        .value =
        item.category;


    document
        .getElementById("editPrice")
        .value =
        item.price;


    document
        .getElementById("editModal")
        .classList.add(
            "active"
        );

}


function closeEditModal() {

    editingItemId =
        null;

    const modal =
        document.getElementById(
            "editModal"
        );

    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


function saveEditedItem() {

    if (editingItemId === null) {
        return;
    }


    const item =
        adminMenu.find(
            function (menuItem) {

                return (
                    menuItem.id ===
                    editingItemId
                );

            }
        );


    if (!item) {
        return;
    }


    const name =
        document
            .getElementById("editName")
            .value
            .trim();


    const category =
        getSelectedCategory("edit");


    const price =
        Number(
            document
                .getElementById("editPrice")
                .value
        );


    if (!name) {

        alert(
            "Enter item name."
        );

        return;

    }


    if (!category) {

        alert(
            "Select or enter a category."
        );

        return;

    }


    if (category.length > 50) {

        alert(
            "Category name is too long."
        );

        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Enter a valid price."
        );

        return;

    }


    item.name =
        name;

    item.category =
        category;

    item.price =
        price;


    saveMenu();

    closeEditModal();

    refreshAdminData();

    alert(
        "Item updated successfully."
    );

}


function deleteItem(id) {

    const item =
        adminMenu.find(
            function (menuItem) {
                return menuItem.id === id;
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


    adminMenu =
        adminMenu.filter(
            function (menuItem) {
                return menuItem.id !== id;
            }
        );


    saveMenu();

    refreshAdminData();

}


function saveMenu() {

    localStorage.setItem(
        "hotelPankajMenu",
        JSON.stringify(adminMenu)
    );

}


function exportData() {

    const data = {

        menu:
            adminMenu,

        orders:
            adminHistory,

        partyOrders:
            adminPartyOrders,

        exportedAt:
            new Date().toISOString()

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        "hotel-pankaj-backup.json";


    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


function resetData() {

    const confirmed =
        confirm(
            "WARNING: This will delete all menu items, orders and party orders. Continue?"
        );


    if (!confirmed) {
        return;
    }


    const secondConfirm =
        confirm(
            "Are you absolutely sure? This cannot be undone."
        );


    if (!secondConfirm) {
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


    location.reload();

}


function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:2
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


document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "editModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeEditModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeEditModal();

        }

    }
);