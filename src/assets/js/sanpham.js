(() => {
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const productGrid = document.querySelector('.product-grid');
    const productList = document.querySelector('.product-list');
    const mainContent = document.querySelector('main');
    
    gridViewBtn.addEventListener('click', function() {
        this.classList.add('active');
        listViewBtn.classList.remove('active');
        mainContent.classList.remove('product-list-view');
    });
    
    listViewBtn.addEventListener('click', function() {
        this.classList.add('active');
        gridViewBtn.classList.remove('active');
        mainContent.classList.add('product-list-view');
    });
    
    // Filter by price
    const priceRange = document.querySelector('.price-range');
    const priceInputs = document.querySelectorAll('.price-input');
    
    priceRange.addEventListener('input', function() {
        priceInputs[1].value = this.value;
    });
    
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            priceRange.value = this.value;
        });
    });
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Thêm logic thêm vào giỏ hàng ở đây
            alert('Sản phẩm đã được thêm vào giỏ hàng!');
        });
    });
})();
    
