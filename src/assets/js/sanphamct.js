export function initProductDetail() {
   // Size options for different product categories
const sizeOptions = {
    'ring': ['5', '6', '7', '8', '9', '10'],
    'bracelet': ['16cm', '17cm', '18cm', '19cm', '20cm'],
    'necklace': ['45cm', '50cm', '55cm', '60cm'],
    'earring': ['Free size'],
    'anklet': ['18cm', '19cm', '20cm', '21cm']
};

// Generate size options based on product type
function generateSizeOptions() {
    const container = document.getElementById('sizeOptions');
    const productType = 'ring'; // This would normally come from the backend

    const sizes = sizeOptions[productType] || [];

    container.innerHTML = '';

    sizes.forEach((size, index) => {
        const option = document.createElement('div');
        option.className = 'size-option';
        if (index === 2) option.classList.add('active'); // Default selected
        option.textContent = size;
        option.addEventListener('click', function () {
            document.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
        container.appendChild(option);
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ?
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Product Gallery
const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.getElementById('mainImage');

thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        const newImage = thumbnail.getAttribute('data-image');
        mainImage.src = newImage;
    });
});

// Quantity Selector
const minusBtn = document.querySelector('.quantity-btn.minus');
const plusBtn = document.querySelector('.quantity-btn.plus');
const quantityInput = document.querySelector('.quantity-input');

minusBtn.addEventListener('click', () => {
    let value = parseInt(quantityInput.value);
    if (value > 1) {
        quantityInput.value = value - 1;
    }
});

plusBtn.addEventListener('click', () => {
    let value = parseInt(quantityInput.value);
    quantityInput.value = value + 1;
});

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Wishlist Button
const wishlistBtn = document.querySelector('.btn-wishlist');
wishlistBtn.addEventListener('click', () => {
    const icon = wishlistBtn.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        wishlistBtn.style.color = '#e74c3c';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlistBtn.style.color = '#777';
    }
});

// Add to Cart
const addToCartBtn = document.querySelector('.btn-add-to-cart');
addToCartBtn.addEventListener('click', () => {
    const selectedSize = document.querySelector('.size-option.active').textContent;
    const quantity = document.querySelector('.quantity-input').value;

    alert(`Đã thêm vào giỏ hàng: ${quantity} sản phẩm, size ${selectedSize}`);

    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = parseInt(cartCount.textContent) + parseInt(quantity);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateSizeOptions();
});
}
    
