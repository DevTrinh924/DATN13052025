import logo from "../../assets/images/logo.png";
const Footer = () => {

    return (
        <>
            <footer>
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-col">
                            <div className="footer-logo">
                                <a href="#" className="logo">
                                    <img src={logo} alt="Logo" />
                                </a>
                            </div>
                            <p className="footer-about">
                                4 Dreams là thương hiệu trang sức cao cấp với hơn 15 năm kinh nghiệm
                                trong ngành, mang đến những thiết kế tinh xảo và đẳng cấp.
                            </p>
                            <div className="social-links">

                                <a href="#" title="Trang chủ">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={20}
                                        height={20}
                                        fill="currentColor"
                                        className="bi bi-facebook"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                                    </svg>

                                </a>
                                <a href="" title="Trang chủ">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={20}
                                        height={20}
                                        fill="currentColor"
                                        className="bi bi-instagram"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                                    </svg>

                                </a>
                                <a href="#" title="Trang chủ">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={20}
                                        height={20}
                                        fill="currentColor"
                                        className="bi bi-messenger"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.64.64 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.64.64 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76m5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
                                    </svg>

                                </a>
                                <a href="#" title="Trang chủ">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={20}
                                        height={20}
                                        fill="currentColor"
                                        className="bi bi-threads-fill"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M6.81 9.204c0-.41.197-1.062 1.727-1.062.469 0 .758.034 1.146.121-.124 1.606-.91 1.818-1.674 1.818-.418 0-1.2-.218-1.2-.877Z" />
                                        <path d="M2.59 16h10.82A2.59 2.59 0 0 0 16 13.41V2.59A2.59 2.59 0 0 0 13.41 0H2.59A2.59 2.59 0 0 0 0 2.59v10.82A2.59 2.59 0 0 0 2.59 16M5.866 5.91c.567-.81 1.315-1.126 2.35-1.126.73 0 1.351.246 1.795.711.443.466.696 1.132.754 1.983q.368.154.678.363c.832.559 1.29 1.395 1.29 2.353 0 2.037-1.67 3.806-4.692 3.806-2.595 0-5.291-1.51-5.291-6.004C2.75 3.526 5.361 2 8.033 2c1.234 0 4.129.182 5.217 3.777l-1.02.264c-.842-2.56-2.607-2.968-4.224-2.968-2.675 0-4.187 1.628-4.187 5.093 0 3.107 1.69 4.757 4.222 4.757 2.083 0 3.636-1.082 3.636-2.667 0-1.079-.906-1.595-.953-1.595-.177.925-.651 2.482-2.733 2.482-1.213 0-2.26-.838-2.26-1.936 0-1.568 1.488-2.136 2.663-2.136.44 0 .97.03 1.247.086 0-.478-.404-1.296-1.426-1.296-.911 0-1.16.288-1.45.624l-.024.027c-.202-.135-.875-.601-.875-.601Z" />
                                    </svg>

                                </a>
                            </div>
                        </div>
                        <div className="footer-col">
                            <h3 className="footer-title">Thông tin</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#">Về chúng tôi</a>
                                </li>
                                <li>
                                    <a href="#">Chính sách bảo mật</a>
                                </li>
                                <li>
                                    <a href="#">Điều khoản sữa dụng</a>
                                </li>
                                <li>
                                    <a href="#">Chính sách đối trả</a>
                                </li>
                                <li>
                                    <a href="#">Hướng dẫn mua hàng</a>
                                </li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h3 className="footer-title">Dịch vụ khác hàng</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#">Liên hệ</a>
                                </li>
                                <li>
                                    <a href="#">Hỏi đáp</a>
                                </li>
                                <li>
                                    <a href="#">Hướng dẫn chọn size</a>
                                </li>
                                <li>
                                    <a href="#">Chăm sóc trang sức</a>
                                </li>
                                <li>
                                    <a href="#">Kiểm tra đơn hàng</a>
                                </li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h3 className="footer-title">Liên hệ</h3>
                            <ul className="footer-contact">
                                <li>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={28}
                                        height={28}
                                        fill="currentColor"
                                        className="bi bi-geo-alt-fill"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                                    </svg>
                                    <span>15 Mộc Bài 7, Quận Tân Bình, TP.HCM</span>
                                </li>
                                <li>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={26}
                                        height={26}
                                        fill="currentColor"
                                        className="bi bi-telephone-fill"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
                                        />
                                    </svg>

                                    <span>+84 796-682-551</span>
                                </li>
                                <li>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={26}
                                        height={26}
                                        fill="currentColor"
                                        className="bi bi-envelope"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                                    </svg>
                                    <span>info@4dreams.com</span>
                                </li>
                                <li>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={26}
                                        height={26}
                                        fill="currentColor"
                                        className="bi bi-clock-fill"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                    </svg>
                                    <span>Thứ 2 - thứ 7: 8AM - 5PM</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="copyright">
                            © 2025 <strong>4 Dreams</strong>. All Rights Reserved. | Thiết kế bởi{" "}
                            <a href="#" className="designer-link">
                                DreamTeam
                            </a>
                        </p>
                    </div>
                </div>
            </footer>

        </>

    );
}
export default Footer;
