/* =========================================
   PANKAJ RESTAURANT MENU
   script.js
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const searchInput = document.getElementById("searchInput");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const menuCards =
    document.querySelectorAll(".menu-card");

const itemCount =
    document.getElementById("itemCount");

const emptyState =
    document.getElementById("emptyState");


/* =========================================
   STATE
========================================= */

let activeCategory = "all";


/* =========================================
   FILTER MENU
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


        /*
         * Category check
         */

        const categoryMatches =
            activeCategory === "all" ||
            category === activeCategory;


        /*
         * Search check
         */

        const searchMatches =
            name.includes(searchTerm);


        /*
         * Final result
         */

        if (
            categoryMatches &&
            searchMatches
        ) {

            card.style.display = "flex";

            visibleItems++;

        } else {

            card.style.display = "none";

        }

    });


    /* =====================================
       UPDATE ITEM COUNT
    ===================================== */

    itemCount.textContent =
        `${visibleItems} ${
            visibleItems === 1
                ? "item"
                : "items"
        }`;


    /* =====================================
       EMPTY STATE
    ===================================== */

    if (visibleItems === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }

}


/* =========================================
   CATEGORY BUTTONS
========================================= */

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            /*
             * Remove active class
             * from every button
             */

            categoryButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            /*
             * Activate clicked button
             */

            this.classList.add("active");


            /*
             * Get category
             */

            activeCategory =
                this.dataset.category;


            /*
             * Apply filters
             */

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
   CLEAR SEARCH WITH ESC
========================================= */

searchInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            this.value = "";

            filterMenu();

            this.blur();

        }

    }
);


/* =========================================
   INITIAL LOAD
========================================= */

filterMenu();
