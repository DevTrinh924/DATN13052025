(() => {
    // Hiệu ứng khi scroll
    const articles = document.querySelectorAll('article');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    articles.forEach(article => {
        article.style.opacity = 0;
        article.style.transform = 'translateY(20px)';
        article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(article);
    });
    
    // Xử lý đăng ký nhận tin
    const newsletterForm = document.querySelector('.newsletter-form');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if(email) {
            alert('Cảm ơn bạn đã đăng ký nhận tin!');
            this.querySelector('input').value = '';
        }
    });
})();
