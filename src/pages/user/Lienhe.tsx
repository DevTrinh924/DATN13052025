
 import '../../assets/styles/user/lienhe.css';
import { useEffect } from 'react';

const Lienhe=()=> {
    useEffect(() => {
        import('../../assets/js/lienhe')
    }, []);
    return (
        <>
            {/* breadcrumlh */}
            <section className="breadcrumlh">
                <div className="container">
                    <div className="breadcrumlh-content">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumlh-separator">/</span>
                        <span className="breadcrumlh-current">Liên hệ</span>
                    </div>
                </div>
            </section>
            {/* Contact Section */}
            <section className="contact-section">
                <div className="container">
                    <div className="contact-container">
                        <div className="contact-info">
                            <h2>Liên hệ với chúng tôi</h2>
                            <p>
                                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ qua
                                thông tin dưới đây hoặc điền vào form liên hệ để được tư vấn tốt
                                nhất.
                            </p>
                            <div className="contact-details">
                                <h3>Thông tin liên hệ</h3>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-map-marker-alt" />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Địa chỉ</h4>
                                        <p>15 Mộc Bài 7, Hòa Minh, Liên Chiểu, TP. Đà Nẵng</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-phone" />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Điện thoại</h4>
                                        <p>
                                            0796 682 551
                                            <br />
                                            0793 848 610 (Hotline)
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-envelope" />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Email</h4>
                                        <p>
                                            info@4dreams.com
                                            <br />
                                            support@4dreams.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <div className="opening-hours">
                                <h3>Giờ mở cửa</h3>
                                <table className="hours-table">
                                    <tbody>
                                        <tr>
                                            <td>Thứ 2 - Thứ 6</td>
                                            <td>8:00 - 21:00</td>
                                        </tr>
                                        <tr>
                                            <td>Thứ 7</td>
                                            <td>9:00 - 20:00</td>
                                        </tr>
                                        <tr>
                                            <td>Chủ nhật</td>
                                            <td>9:00 - 18:00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <div className="map-container">
                        <iframe
                          title='map'
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9244627094486!2d108.15075631528778!3d16.067409143703427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218e6e9e8c7b5%3A0x5a8a05e4a7a4a4a4!2zMTUgTcOjYyBCw6BpIDcsIEjDuWEgTWluaCwgTGnDqm4gQ2hp4buDdSwgxJDDoCBO4bq1bmcgNTUwMDAwLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1627371234567!5m2!1svi!2s"
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>
        </>


    );
}
export default  Lienhe;