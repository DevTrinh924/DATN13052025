(() => {
    // Xử lý số lượng sản phẩm
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const minusBtns = document.querySelectorAll('.quantity-btn.minus');
    const plusBtns = document.querySelectorAll('.quantity-btn.plus');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.nextElementSibling;
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateSubtotal(input);
            }
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.value = parseInt(input.value) + 1;
            updateSubtotal(input);
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (parseInt(this.value) < 1) {
                this.value = 1;
            }
            updateSubtotal(this);
        });
    });

    function updateSubtotal(input) {
        const row = input.closest('tr');
        const price = row.querySelector('.product-price').textContent;
        const priceValue = parseInt(price.replace(/\D/g, ''));
        const quantity = parseInt(input.value);
        const subtotal = row.querySelector('.product-subtotal');
        
        subtotal.textContent = (priceValue * quantity).toLocaleString('vi-VN') + 'đ';
        updateCartTotal();
    }

    // Xử lý xóa sản phẩm
    const removeBtns = document.querySelectorAll('.product-remove');

    removeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            row.remove();
            
            // Kiểm tra nếu không còn sản phẩm nào
            if (document.querySelectorAll('.cart-table tbody tr').length === 0) {
                document.getElementById('cart-with-items').style.display = 'none';
                document.getElementById('empty-cart').style.display = 'block';
            } else {
                updateCartTotal();
            }
        });
    });

    // Cập nhật tổng giỏ hàng
    function updateCartTotal() {
        let subtotal = 0;
        document.querySelectorAll('.product-subtotal').forEach(item => {
            subtotal += parseInt(item.textContent.replace(/\D/g, ''));
        });
        
        document.querySelector('.summary-table tr:first-child td:last-child').textContent = 
            subtotal.toLocaleString('vi-VN') + 'đ';
        document.querySelector('.summary-total td:last-child').textContent = 
            subtotal.toLocaleString('vi-VN') + 'đ';
    }

    // Xử lý mã giảm giá (demo)
    const couponForm = document.querySelector('.coupon-form');

    couponForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const couponCode = this.querySelector('.coupon-input').value;
        
        if (couponCode === 'JEWELRY10') {
            alert('Áp dụng thành công mã giảm giá 10%');
            // Thêm logic tính toán giảm giá ở đây
            this.querySelector('.coupon-input').value = '';
        } else {
            alert('Mã giảm giá không hợp lệ');
        }
    });

    // Nút thanh toán
    const checkoutBtn = document.querySelector('.checkout-btn');

    checkoutBtn.addEventListener('click', function() {
        // Chuyển đến trang thanh toán
        window.location.href = 'thanhtoan.html';
    });
})();

