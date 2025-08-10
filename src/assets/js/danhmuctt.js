(() => {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const backToCategoryListBtn = document.getElementById('backToCategoryList');
    const cancelAddCategoryBtn = document.getElementById('cancelAddCategory');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const categoryListSection = document.getElementById('categoryListSection');
    const pageTitle = document.querySelector('.page-title');
    
    // Khi click "Thêm danh mục"
    addCategoryBtn.addEventListener('click', function() {
        addCategoryForm.style.display = 'block';
        categoryListSection.style.display = 'none';
        pageTitle.textContent = 'Thêm Danh mục mới';
    });
    
    // Khi click "Quay lại"
    backToCategoryListBtn.addEventListener('click', function() {
        addCategoryForm.style.display = 'none';
        categoryListSection.style.display = 'block';
        pageTitle.textContent = 'Quản lý Danh mục sản phẩm';
    });
    
    // Khi click "Hủy bỏ"
    cancelAddCategoryBtn.addEventListener('click', function() {
        addCategoryForm.style.display = 'none';
        categoryListSection.style.display = 'block';
        pageTitle.textContent = 'Quản lý Danh mục sản phẩm';
        document.getElementById('categoryForm').reset();
        // Reset trạng thái text về mặc định
        document.getElementById('categoryStatusText').textContent = 'Hiển thị';
    });
    
    // Toggle status switch trong form
    const statusSwitch = document.getElementById('categoryStatus');
    const statusText = document.getElementById('categoryStatusText');
    statusSwitch.addEventListener('change', function() {
        if (this.checked) {
            statusText.textContent = 'Hiển thị';
        } else {
            statusText.textContent = 'Ẩn';
        }
    });
    
    // Xử lý submit form (demo bằng alert)
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Danh mục đã được lưu thành công!');
        this.reset();
        statusText.textContent = 'Hiển thị';
        addCategoryForm.style.display = 'none';
        categoryListSection.style.display = 'block';
        pageTitle.textContent = 'Quản lý Danh mục sản phẩm';
        // Ở đây bạn có thể thêm logic để đẩy dữ liệu lên server hoặc cập nhật lại bảng
    });
})();