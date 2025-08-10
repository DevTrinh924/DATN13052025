(() => {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let count = parseInt(cartCount.textContent);
            cartCount.textContent = count + 1;
            
            // Animation effect
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i>';
            }, 1000);
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if(email) {
            alert('Cảm ơn bạn đã đăng ký nhận bản tin!');
            this.querySelector('input').value = '';
        }
    });
})();