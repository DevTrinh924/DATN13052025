// Simple JavaScript for demonstration
export function initSliders() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ?
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    // Header Scroll Effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Hero Slider Functionality
    const sliderContainer = document.getElementById('sliderContainer');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const indicators = document.querySelectorAll('.slider-indicators span');

    if (sliderContainer && slides.length > 0 && prevBtn && nextBtn && indicators.length > 0) {
        let currentIndex = 0;
        let slideInterval;
        const slideCount = slides.length;

        function initSlider() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });

            startAutoSlide();
        }

        function updateSlider() {
            sliderContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = (index + slideCount) % slideCount;
            updateSlider();
            resetInterval();
        }

        function goToNext() {
            goToSlide(currentIndex + 1);
        }

        function goToPrev() {
            goToSlide(currentIndex - 1);
        }

        function startAutoSlide() {
            slideInterval = setInterval(goToNext, 5000);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        nextBtn.addEventListener('click', goToNext);
        prevBtn.addEventListener('click', goToPrev);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });

        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderContainer.addEventListener('mouseleave', resetInterval);

        document.addEventListener('DOMContentLoaded', initSlider);
    }

    // Categories Slider Functionality - ĐÂY LÀ PHẦN QUAN TRỌNG CẦN SỬA
    const categoriesContainer = document.getElementById('categoriesContainer');
    const prevCategoryBtn = document.getElementById('prevCategory');
    const nextCategoryBtn = document.getElementById('nextCategory');
    const categoryCards = document.querySelectorAll('.category-card');

    if (categoriesContainer && prevCategoryBtn && nextCategoryBtn && categoryCards.length > 0) {
        let currentCardIndex = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        const cardCount = categoryCards.length;

        // Tính toán số lượng card hiển thị dựa trên kích thước màn hình
        function getCardsPerView() {
            if (window.innerWidth >= 1200) return 3;
            if (window.innerWidth >= 992) return 2;
            return 1;
        }

        // Thiết lập vị trí slider
        function setSliderPosition() {
            const cardWidth = categoryCards[0].offsetWidth + 20; // width + margin
            const cardsPerView = getCardsPerView();
            const maxIndex = Math.max(0, cardCount - cardsPerView);

            // Giới hạn currentCardIndex trong khoảng hợp lệ
            currentCardIndex = Math.max(0, Math.min(currentCardIndex, maxIndex));

            // Tính toán giá trị translate mới
            currentTranslate = -currentCardIndex * cardWidth;
            categoriesContainer.style.transform = `translateX(${currentTranslate}px)`;

            // Cập nhật trạng thái nút
            prevCategoryBtn.disabled = currentCardIndex === 0;
            nextCategoryBtn.disabled = currentCardIndex >= maxIndex;
        }

        // Chuyển đến card tiếp theo
        function nextCategory() {
            const cardsPerView = getCardsPerView();
            const maxIndex = Math.max(0, cardCount - cardsPerView);

            if (currentCardIndex < maxIndex) {
                currentCardIndex++;
                setSliderPosition();
            }
        }

        // Chuyển về card trước đó
        function prevCategory() {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                setSliderPosition();
            }
        }

        // Sự kiện kéo thả cho mobile
        function startDrag(e) {
            if (e.type === 'touchstart') {
                startPos = e.touches[0].clientX;
            } else {
                startPos = e.clientX;
                e.preventDefault();
            }

            isDragging = true;
            categoriesContainer.classList.add('grabbing');
            animationID = requestAnimationFrame(animation);
        }

        function drag(e) {
            if (isDragging) {
                const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const diff = currentPosition - startPos;
                currentTranslate = prevTranslate + diff;
                categoriesContainer.style.transform = `translateX(${currentTranslate}px)`;
            }
        }

        function endDrag() {
            if (isDragging) {
                isDragging = false;
                cancelAnimationFrame(animationID);
                categoriesContainer.classList.remove('grabbing');

                const cardWidth = categoryCards[0].offsetWidth + 20;
                const movedBy = Math.round((prevTranslate - currentTranslate) / cardWidth);

                if (movedBy < -0.2 && currentCardIndex > 0) {
                    prevCategory();
                } else if (movedBy > 0.2 && currentCardIndex < cardCount - getCardsPerView()) {
                    nextCategory();
                } else {
                    setSliderPosition();
                }
            }
        }

        function animation() {
            categoriesContainer.style.transform = `translateX(${currentTranslate}px)`;
            if (isDragging) {
                animationID = requestAnimationFrame(animation);
            }
        }

        // Khởi tạo slider
        function initCategorySlider() {
            setSliderPosition();

            // Thêm sự kiện cho nút điều hướng
            prevCategoryBtn.addEventListener('click', prevCategory);
            nextCategoryBtn.addEventListener('click', nextCategory);

            // Sự kiện cảm ứng
            categoriesContainer.addEventListener('touchstart', startDrag, { passive: false });
            categoriesContainer.addEventListener('touchmove', drag, { passive: false });
            categoriesContainer.addEventListener('touchend', endDrag);

            // Sự kiện chuột
            categoriesContainer.addEventListener('mousedown', startDrag);
            categoriesContainer.addEventListener('mousemove', drag);
            categoriesContainer.addEventListener('mouseup', endDrag);
            categoriesContainer.addEventListener('mouseleave', endDrag);

            // Xử lý khi thay đổi kích thước màn hình
            window.addEventListener('resize', setSliderPosition);
        }

        // Khởi tạo khi DOM đã tải xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCategorySlider);
        } else {
            initCategorySlider();
        }
    }
}