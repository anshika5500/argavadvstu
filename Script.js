const defaultProducts = [

    // WEDDING

    ["Wedding", "Sakharpuda Cone"],
    ["Wedding", "Hattivarun Sakhar Vataychi Cards"],
    ["Wedding", "Otii Rumal"],
    ["Wedding", "Ring Platter"],
    ["Wedding", "Invitations"],
    ["Wedding", "Digital Invitation Graphics"],
    ["Wedding", "Digital Invitation Video"],

    // BUSINESS & PROMOTIONAL PRINTING

    ["Business & Promotional Printing", "Visiting Cards"],
    ["Business & Promotional Printing", "Thanku Cards"],
    ["Business & Promotional Printing", "Customized Return Gift"],
    ["Business & Promotional Printing", "Flex / Banner"],
    ["Business & Promotional Printing", "Thanku Tags"],
    ["Business & Promotional Printing", "Price Tags"],
    ["Business & Promotional Printing", "Stickers"],
    ["Business & Promotional Printing", "Waterproof Stickers"],
    ["Business & Promotional Printing", "Sunboard Printing (3mm, 5mm)"],
    ["Business & Promotional Printing", "Bill Book"],
    ["Business & Promotional Printing", "Receipt Book"],

    // PHOTOGRAPHY

    ["Photography", "Wedding Photography"],
    ["Photography", "Baby Shower Photography"],
    ["Photography", "Birthday Photography"],
    ["Photography", "All Types of Events"]
];

let products = JSON.parse(localStorage.getItem("argavProducts"));

if (!products) {
    products = defaultProducts.map((item, index) => ({
        id: Date.now() + index,
        category: item[0],
        name: item[1],
        description: "",
        price: "",
        photos: []
    }));

    saveProducts();
}

let orders = JSON.parse(
    localStorage.getItem("argavOrders") || "[]"
);

let currentCategory = "All";
let selectedPhotos = [];

function saveProducts() {
    localStorage.setItem(
        "argavProducts",
        JSON.stringify(products)
    );
}

function saveOrders() {
    localStorage.setItem(
        "argavOrders",
        JSON.stringify(orders)
    );
}


// SHOW PRODUCTS

function showProducts(category) {

    currentCategory = category;

    const container = document.getElementById("productContainer");

    container.innerHTML = "";

    const filtered = products.filter(product =>
        category === "All" || product.category === category
    );

    filtered.forEach(product => {

        const photos = product.photos || [];

        const imageHTML = photos.length
            ? photos.map(photo =>
                `<img src="${photo}" alt="${escapeHTML(product.name)}">`
              ).join("")
            : `<div class="photo-placeholder">ARGAV<br><small>PRODUCT PHOTO</small></div>`;

        container.innerHTML += `

            <div class="product">

                <div class="gallery">
                    ${imageHTML}
                </div>

                <div class="product-info">

                    <h3>${escapeHTML(product.name)}</h3>

                    <p>${escapeHTML(product.description || "Customised as per your requirements.")}</p>

                    <p>
                        ${product.price
                            ? "Starting ₹" + product.price
                            : "Price on request"}
                    </p>

                    <button onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button onclick="deleteProduct(${product.id})">
                        Delete
                    </button>

                </div>

            </div>

        `;
    });

    updateStats();
}


// SEARCH

function searchProducts() {

    const query = document
        .getElementById("search")
        .value
        .toLowerCase();

    document.querySelectorAll(".product").forEach(card => {

        card.style.display =
            card.innerText.toLowerCase().includes(query)
            ? "block"
            : "none";

    });
}


// PRODUCT FORM

function openProductForm() {
    selectedPhotos = [];
    document.getElementById("productForm").classList.remove("hidden");
    document.getElementById("productName").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("productPhotos").value = "";
    document.getElementById("preview").innerHTML = "";
}

function closeProductForm() {
    document.getElementById("productForm").classList.add("hidden");
}

document.getElementById("productPhotos").addEventListener("change", async function(e) {
    for (const file of e.target.files) {
        if (!file.type.startsWith("image/")) continue;

        const image = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        selectedPhotos.push(image);
    }

    document.getElementById("preview").innerHTML =
        selectedPhotos.map(photo =>
            `<img src="${photo}" alt="Preview">`
        ).join("");
});

function addProduct() {

    const name = document.getElementById("productName").value.trim();

    if (!name) {
        alert("Please enter product name");
        return;
    }

    const product = {

        id: Date.now(),

        category: document.getElementById("category").value,

        name: name,

        description: document.getElementById("description").value,

        price: document.getElementById("price").value,

        photos: selectedPhotos

    };

    products.push(product);

    try {
        saveProducts();
    } catch (error) {
        products.pop();
        alert("Photo storage is full. Please upload fewer or smaller photos.");
        return;
    }

    closeProductForm();

    showProducts(currentCategory);

    alert("Product added successfully!");

}


// EDIT PRODUCT

function editProduct(id) {

    const product = products.find(p => p.id === id);

    if (!product) return;

    selectedPhotos = product.photos || [];

    document.getElementById("productForm").classList.remove("hidden");

    document.getElementById("category").value = product.category;

    document.getElementById("productName").value = product.name;

    document.getElementById("description").value = product.description;

    document.getElementById("price").value = product.price;

    document.getElementById("preview").innerHTML =
        selectedPhotos.map(photo =>
            `<img src="${photo}" alt="Preview">`
        ).join("");

    const button = document.querySelector("#productForm button");

    button.textContent = "Update Product";

    button.onclick = function() {

        product.category = document.getElementById("category").value;

        product.name = document.getElementById("productName").value;

        product.description = document.getElementById("description").value;

        product.price = document.getElementById("price").value;

        product.photos = selectedPhotos;

        try {
            saveProducts();
        } catch (error) {
            alert("Photo storage is full. Please upload fewer or smaller photos.");
            return;
        }

        button.textContent = "Save Product";
        button.onclick = addProduct;

        closeProductForm();

        showProducts(currentCategory);

    };

}


// DELETE PRODUCT

function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) return;

    products = products.filter(product => product.id !== id);

    saveProducts();

    showProducts(currentCategory);

}


// ORDER MANAGEMENT

function openOrderForm() {

    document.getElementById("orderForm").classList.remove("hidden");

}

function closeOrderForm() {

    document.getElementById("orderForm").classList.add("hidden");

}

function saveOrder() {

    const order = {

        id: Date.now(),

        customer: document.getElementById("customerName").value,

        phone: document.getElementById("customerPhone").value,

        product: document.getElementById("orderProduct").value,

        quotation: Number(document.getElementById("quotation").value || 0),

        paid: Number(document.getElementById("paid").value || 0),

        details: document.getElementById("orderDetails").value,

        status: document.getElementById("orderStatus").value

    };

    if (!order.customer || !order.phone || !order.product) {
        alert("Please fill customer name, phone and product.");
        return;
    }

    orders.push(order);

    saveOrders();

    closeOrderForm();

    renderOrders();

    alert("Order saved successfully!");

}


// DISPLAY ORDERS

function renderOrders() {

    const container = document.getElementById("orderContainer");

    container.innerHTML = "";

    orders.forEach(order => {

        const balance = Math.max(0, order.quotation - order.paid);

        container.innerHTML += `

            <div class="order-card">

                <h3>${escapeHTML(order.customer)}</h3>

                <p>Phone: ${escapeHTML(order.phone)}</p>

                <p>Product: ${escapeHTML(order.product)}</p>

                <p>Quotation: ₹${order.quotation}</p>

                <p>Paid: ₹${order.paid}</p>

                <p>Balance: ₹${balance}</p>

                <p>Status: ${escapeHTML(order.status)}</p>

                <button onclick="sendWhatsApp(${order.id}, 'confirm')">
                    Order Confirmation
                </button>

                <button onclick="sendWhatsApp(${order.id}, 'quote')">
                    Quotation
                </button>

                <button onclick="sendWhatsApp(${order.id}, 'payment')">
                    Payment Received
                </button>

                <button onclick="sendWhatsApp(${order.id}, 'ready')">
                    Ready for Delivery
                </button>

                <button onclick="sendWhatsApp(${order.id}, 'balance')">
                    Balance Reminder
                </button>

                <button onclick="sendWhatsApp(${order.id}, 'feedback')">
                    Feedback
                </button>

            </div>

        `;

    });

    updateStats();

}


// WHATSAPP MESSAGES

function sendWhatsApp(id, type) {

    const order = orders.find(o => o.id === id);

    if (!order) return;

    const balance = Math.max(0, order.quotation - order.paid);

    let message = "";

    switch(type) {

        case "confirm":

            message = `Hello ${order.customer},

Your order for ${order.product} is confirmed.

Thank you for choosing Argav Advertising Studio!`;

            break;


        case "quote":

            message = `Hello ${order.customer},

Your quotation from Argav Advertising Studio:

Product: ${order.product}
Amount: ₹${order.quotation}

Please confirm to proceed.

Thank you!`;

            break;


        case "payment":

            message = `Hello ${order.customer},

We have received ₹${order.paid} towards your order ${order.product}.

Thank you!`;

            break;


        case "ready":

            message = `Hello ${order.customer},

Your order ${order.product} is ready for delivery.

Thank you for choosing Argav Advertising Studio!`;

            break;


        case "balance":

            message = `Hello ${order.customer},

Your remaining balance for ${order.product} is ₹${balance}.

Kindly complete the payment.

Thank you!`;

            break;


        case "feedback":

            message = `Hello ${order.customer},

Thank you for choosing Argav Advertising Studio.

We would love to hear your feedback about our service!`;

            break;

    }

    const phone = order.phone.replace(/\D/g, "");

    const url =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

}


// DASHBOARD COUNTS

function updateStats() {

    document.getElementById("productCount").textContent = products.length;

    document.getElementById("orderCount").textContent = orders.length;

    document.getElementById("pendingCount").textContent =
        orders.filter(order => order.status !== "Delivered").length;

}


// HTML SAFETY

function escapeHTML(text) {

    return String(text || "").replace(/[&<>"']/g, function(char) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];

    });

}


// INITIAL LOAD

showProducts("All");

renderOrders();


// PWA INSTALLATION

let installPrompt;

window.addEventListener("beforeinstallprompt", event => {

    event.preventDefault();

    installPrompt = event;

    document.getElementById("installBtn").classList.remove("hidden");

});

document.getElementById("installBtn").addEventListener("click", async () => {

    if (!installPrompt) return;

    installPrompt.prompt();

    await installPrompt.userChoice;

    installPrompt = null;

    document.getElementById("installBtn").classList.add("hidden");

});

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("sw.js");

    });

}

function escapeHTML(text) {
    return String(text || "").replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[char]));
}