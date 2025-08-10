import { useEffect, useState, type SetStateAction } from 'react';
import { getNews, getNewsCategories } from '../../services/api/ListNewApi';
import '../../assets/styles/user/tintuc.css';
import { Link } from 'react-router-dom';
import type { News } from '../../types/models.ts';

export interface Category {
  MaDanMucTT: number;
  TenDanMucTT: string;
}
export default function Tintuc() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News | null>(null);
  const [popularNews, setPopularNews] = useState<News[]>([]);


  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsData, categoriesData] = await Promise.all([
          getNews(),
          getNewsCategories()
        ]);

        // Xử lý dữ liệu tin tức
        if (newsData.length > 0) {
          setNews(newsData);
          setFeaturedNews(newsData[0]); // Lấy bài đầu tiên làm featured

          // Lấy 3 bài tiếp theo làm popular news
          if (newsData.length > 3) {
            setPopularNews(newsData.slice(1, 4));
          } else {
            setPopularNews(newsData.slice(1));
          }
        }

        // Xử lý dữ liệu danh mục
        if (categoriesData) {
          setCategories(categoriesData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Phân trang
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(news.length / newsPerPage);

  const paginate = (pageNumber: SetStateAction<number>) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="container">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb">
          <Link to="/" style={{ textDecoration: "none" }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/tintuc" style={{ textDecoration: "none" }}>Tin tức</Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Tin tức trang sức</h1>
          <p className="page-description">
            Cập nhật những xu hướng mới nhất, bí quyết chọn trang sức và những câu
            chuyện thú vị về thế giới kim hoàn
          </p>
        </div>
      </div>

      {/* News Layout */}
      <div className="container">
        <div className="news-layout">
          {/* Main Content */}
          <main>
            {/* Featured Article */}
            {featuredNews && (
              <article className="featured-article">
                <div className="featured-image">
                  <img
                    src={featuredNews.Hinh || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e'}
                    alt={featuredNews.TieuDe}
                  />
                  <span className="featured-category">{featuredNews.TenDanMucTT || 'Tin tức'}</span>
                </div>
                <div className="featured-content">
                  <h2>{featuredNews.TieuDe}</h2>
                  <div className="article-meta">
                    <span>
                      <i className="far fa-calendar-alt" /> {new Date(featuredNews.NgayDang ?? '').toLocaleDateString()}
                    </span>
                    <span>
                      <i className="far fa-user" /> Admin
                    </span>
                    <span>
                      <i className="far fa-eye" /> 1.2K lượt xem
                    </span>
                  </div>
                  <p className="featured-excerpt">
                    {featuredNews.MoTaNgan}
                  </p>
                  <Link to={`/tin-tuc/${featuredNews.MaTinTuc}`} className="read-more">
                    Đọc tiếp
                  </Link>
                </div>
              </article>
            )}

            {/* News Grid */}
            <div className="news-grid">
              {currentNews.map((item) => (
                <article key={item.MaTinTuc} className="news-card">
                  <Link to={`/tintuc/${item.MaTinTuc}`}>
                    <div className="news-image">
                      <img
                        src={item.Hinh || 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a'}
                        alt={item.TieuDe}
                      />
                      <span className="news-category">{item.TenDanMucTT || 'Tin tức'}</span>
                    </div>
                  </Link>
                  <div className="news-content">
                    <Link style={{ textDecoration: 'none' }} to={`/tintuc/${item.MaTinTuc}`}>
                      <h3>{item.TieuDe}</h3>
                      <div className="news-meta">
                        <span>
                          <i className="far fa-calendar-alt" /> {new Date(item.NgayDang ?? '').toLocaleDateString()}
                        </span>
                        <span>
                          <i className="far fa-comments" /> 24
                        </span>
                      </div>
                      <p className="news-excerpt">
                        {item.MoTaNgan}
                      </p>
                    </Link>
                    <Link to={`/tin-tuc/${item.MaTinTuc}`} style={{ textDecoration: "none" }} className="read-more">
                      Đọc tiếp
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="page-item">
                  <button
                    title='ttt'
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="page-link"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={26}
                      height={26}
                      fill="currentColor"
                      className="bi bi-arrow-bar-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                      />
                    </svg>
                  </button>
                </div>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <div
                    key={number}
                    className={`page-item ${currentPage === number ? 'active' : ''}`}
                  >
                    <button onClick={() => paginate(number)} className="page-link">
                      {number}
                    </button>
                  </div>
                ))}

                <div className="page-item">
                  <button
                    title='tt'
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="page-link"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={26}
                      height={26}
                      fill="currentColor"
                      className="bi bi-arrow-bar-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </main>
          {/* Sidebar */}
          <aside className="news-sidebar">
            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Danh mục</h3>
              <ul className="category-list">
                <li className="category-item">
                  <Link to="/tintuc" style={{ textDecoration: "none" }}>
                    Tất cả tin tức <span className="count">{news.length}</span>
                  </Link>
                </li>
                {categories.map(category => (
                  <li key={category.MaDanMucTT} className="category-item">
                    <Link to={`/tin-tuc/${category.MaDanMucTT}`} style={{ textDecoration: "none" }}>
                      {category.TenDanMucTT} <span className="count">
                        {news.filter(n => n.MaDanMucTT === category.MaDanMucTT).length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Popular Posts Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Bài viết nổi bật</h3>
              {popularNews.map(item => (
                <div key={item.MaTinTuc} className="popular-post">
                  <div className="popular-image">
                    <img
                      src={item.Hinh || 'https://images.unsplash.com/photo-1603974371966-2a2c6b7a3b1a'}
                      alt={item.TieuDe}
                    />
                  </div>
                  <div className="popular-content">
                    <h4>
                      <Link to={`/tin-tuc/${item.MaTinTuc}`} style={{ textDecoration: "none" }}>{item.TieuDe}</Link>
                    </h4>
                    <div className="popular-date">
                      <i className="far fa-calendar-alt" /> {new Date(item.NgayDang ?? '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Thẻ tags</h3>
              <div className="tag-cloud">
                <Link to="#" className="tag-item">Kim cương</Link>
                <Link to="#" className="tag-item">Vàng 18K</Link>
                <Link to="#" className="tag-item">Đá quý</Link>
                <Link to="#" className="tag-item">Nhẫn cưới</Link>
                <Link to="#" className="tag-item">Bảo quản</Link>
                <Link to="#" className="tag-item">Xu hướng</Link>
                <Link to="#" className="tag-item">Phong thủy</Link>
                <Link to="#" className="tag-item">Trang sức nam</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
