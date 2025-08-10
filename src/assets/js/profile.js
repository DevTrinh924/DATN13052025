export function initProfilePage() {
  // Tab Switching
  const menuLinks = document.querySelectorAll('.profile-menu a');
  const tabs = document.querySelectorAll('.profile-tab');

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      menuLinks.forEach(item => item.classList.remove('active'));
      link.classList.add('active');

      tabs.forEach(tab => tab.style.display = 'none');

      const tabId = link.getAttribute('href').substring(1);
      const tabElement = document.getElementById(tabId);
      if (tabElement) tabElement.style.display = 'block';
    });
  });

  // Edit Profile Toggle
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profileInputs = document.querySelectorAll('#personal-info input, #personal-info textarea');

  if (editProfileBtn && saveProfileBtn) {
    editProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();

      profileInputs.forEach(input => {
        input.readOnly = !input.readOnly;
      });

      editProfileBtn.style.display = 'none';
      saveProfileBtn.style.display = 'block';
    });
  }

  // Form submission
  const forms = document.querySelectorAll('.profile-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thông tin đã được cập nhật thành công!');

      if (form.id === 'profileForm' && editProfileBtn && saveProfileBtn) {
        profileInputs.forEach(input => {
          input.readOnly = true;
        });

        editProfileBtn.style.display = 'block';
        saveProfileBtn.style.display = 'none';
      }
    });
  });

  // Order details toggle
  const orderDetailLinks = document.querySelectorAll('.view-order-detail');
  const orderDetails = document.querySelectorAll('.order-details');

  orderDetailLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      orderDetails.forEach(detail => detail.style.display = 'none');

      const orderId = link.getAttribute('href');
      const detail = document.querySelector(orderId);
      if (detail) {
        detail.style.display = 'block';
        detail.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Remove wishlist item
  const removeButtons = document.querySelectorAll('.remove-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const wishlistItem = button.closest('.wishlist-item');
      if (wishlistItem && confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
        wishlistItem.remove();
      }
    });
  });

  // Show personal info tab by default
  const personalInfoTab = document.getElementById('personal-info');
  if (personalInfoTab) {
    personalInfoTab.style.display = 'block';
  }
}
