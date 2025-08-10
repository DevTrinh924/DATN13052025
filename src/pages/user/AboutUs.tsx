
import '../../assets/styles/user/aboutus.css'; // Import your CSS file for styling
import { useEffect } from "react";
import { Link } from "react-router-dom";

 const AboutUs =() => {
    useEffect(() => {
        import('../../assets/js/aboutus')
    }, []);

    return (
        <>
         <section className="product-page" id="sanphana">
     <div className="container">
        <div className="breadcrumb">
          <Link to="/" style={{ textDecoration: "none" }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/tintuc" style={{ textDecoration: "none" }}>Giới thiệu</Link>
        </div>
      </div>
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1>Về 4 Dreams</h1>
                    <p>Khởi nguồn từ đam mê và sáng tạo của 4 sinh viên năm cuối</p>
                </div>
            </section>
            {/* Our Story */}
            <section className="about-content">
                <div className="container">
                    <div className="story-section">
                        <div className="story-image">
                            <img
                                src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a"
                                alt="Nhóm 4 Dreams"
                            />
                        </div>
                        <div className="story-text">
                            <h2>Câu chuyện của chúng tôi</h2>
                            <p>
                                4 Dreams được thành lập năm 2025 bởi nhóm 4 sinh viên năm cuối với
                                niềm đam mê mãnh liệt về thiết kế trang sức. Xuất phát từ một dự án
                                học tập, chúng tôi đã phát triển thành một thương hiệu trang sức cao
                                cấp được nhiều khách hàng yêu thích.
                            </p>
                            <p>
                                Với phương châm "Biến giấc mơ thành hiện thực", mỗi sản phẩm của
                                chúng tôi đều được chế tác tỉ mỉ, mang đậm dấu ấn cá nhân và kể một
                                câu chuyện riêng.
                            </p>
                            <p>
                                Chúng tôi tin rằng mỗi món trang sức không chỉ là phụ kiện mà còn là
                                biểu tượng của tình cảm, kỷ niệm và cá tính riêng của mỗi người.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Our Values */}
            <section className="values-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Giá trị cốt lõi</h2>
                        <p>Những nguyên tắc định hướng cho mọi hoạt động của chúng tôi</p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-gem" />
                            </div>
                            <h3>Chất lượng vượt trội</h3>
                            <p>
                                Sử dụng nguyên liệu cao cấp, quy trình kiểm định nghiêm ngặt để mang
                                đến sản phẩm hoàn hảo nhất
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-lightbulb" />
                            </div>
                            <h3>Sáng tạo không ngừng</h3>
                            <p>
                                Luôn đổi mới thiết kế, cập nhật xu hướng để làm hài lòng những khách
                                hàng khó tính nhất
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-heart" />
                            </div>
                            <h3>Tận tâm phục vụ</h3>
                            <p>
                                Mỗi khách hàng là một người bạn, chúng tôi lắng nghe và thấu hiểu
                                nhu cầu của bạn
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Why Choose Us */}
            <section className="why-choose-us">
                <div className="container">
                    <div className="section-title">
                        <h2>Tại sao chọn 4 Dreams?</h2>
                        <p>Những lý do khiến khách hàng tin tưởng và yêu thích chúng tôi</p>
                    </div>
                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-paint-brush" />
                            </div>
                            <div className="feature-text">
                                <h3>Thiết kế độc bản</h3>
                                <p>
                                    Mỗi sản phẩm là một tác phẩm nghệ thuật mang dấu ấn riêng, được
                                    thiết kế tỉ mỉ từng chi tiết.
                                </p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-award" />
                            </div>
                            <div className="feature-text">
                                <h3>Cam kết chất lượng</h3>
                                <p>
                                    100% sản phẩm được kiểm định nghiêm ngặt trước khi giao đến tay
                                    khách hàng, đảm bảo độ tinh xảo và bền đẹp.
                                </p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-shield-alt" />
                            </div>
                            <div className="feature-text">
                                <h3>Bảo hành trọn đời</h3>
                                <p>
                                    Chính sách bảo hành, bảo trì sản phẩm lâu dài, luôn sẵn sàng hỗ
                                    trợ khách hàng mọi lúc.
                                </p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-headset" />
                            </div>
                            <div className="feature-text">
                                <h3>Tư vấn chuyên nghiệp</h3>
                                <p>
                                    Đội ngũ tư vấn am hiểu về trang sức, giúp bạn chọn được sản phẩm
                                    phù hợp với phong cách và ngân sách.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Our Team */}
            <section className="team-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Đội ngũ của chúng tôi</h2>
                        <p>4 sinh viên năm cuối với niềm đam mê trang sức</p>
                    </div>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-image">
                                <img
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
                                    alt="Nguyễn Thị Hương"
                                />
                            </div>
                            <div className="member-info">
                                <h3>Nguyễn Thị Hương</h3>
                                <p>CEO &amp; Nhà thiết kế chính</p>
                                <p>
                                    Chuyên ngành Thiết kế Đồ họa, đam mê nghệ thuật và có con mắt thẩm
                                    mỹ tinh tế.
                                </p>
                                <div className="social-links">
                                    <a href="#">
                                        <i className="fab fa-facebook-f" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-instagram" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-linkedin-in" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img
                                    src="https://images.unsplash.com/photo-1562788869-4ed32648eb72"
                                    alt="Trần Văn Minh"
                                />
                            </div>
                            <div className="member-info">
                                <h3>Trần Văn Minh</h3>
                                <p>Giám đốc Kinh doanh</p>
                                <p>
                                    Chuyên ngành Quản trị Kinh doanh, có khả năng phân tích thị trường
                                    và chiến lược phát triển.
                                </p>
                                <div className="social-links">
                                    <a href="#">
                                        <i className="fab fa-facebook-f" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-instagram" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-linkedin-in" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img
                                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
                                    alt="Lê Thị Ngọc Anh"
                                />
                            </div>
                            <div className="member-info">
                                <h3>Lê Thị Ngọc Anh</h3>
                                <p>Giám đốc Sản xuất</p>
                                <p>
                                    Chuyên ngành Kỹ thuật Vật liệu, am hiểu về các loại đá quý và kim
                                    loại quý.
                                </p>
                                <div className="social-links">
                                    <a href="#">
                                        <i className="fab fa-facebook-f" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-instagram" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-linkedin-in" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img
                                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
                                    alt="Phạm Quốc Bảo"
                                />
                            </div>
                            <div className="member-info">
                                <h3>Phạm Quốc Bảo</h3>
                                <p>Giám đốc Công nghệ</p>
                                <p>
                                    Chuyên ngành Công nghệ Thông tin, phụ trách phát triển website và
                                    hệ thống quản lý.
                                </p>
                                <div className="social-links">
                                    <a href="#">
                                        <i className="fab fa-facebook-f" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-instagram" />
                                    </a>
                                    <a href="#">
                                        <i className="fab fa-linkedin-in" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </section>
        </>


    );
}
export default AboutUs; 