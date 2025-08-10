import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getNewsById, getNewsByCategory } from '../../services/api/ListNewApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/styles/user/new.css';

import type { News } from '../../types/models';

const Tintucct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        if (!id) {
          navigate('/not-found');
          return;
        }

        setLoading(true);
        
        // Fetch news detail
        const newsData = await getNewsById(parseInt(id));
        if (!newsData || (Array.isArray(newsData) && newsData.length === 0)) {
          navigate('/not-found');
          return;
        }
        
        // Handle case where API returns array or single object
        const newsItem = Array.isArray(newsData) ? newsData[0] : newsData;
        setNews(newsItem);

        // Fetch related news (same category)
        if (newsItem.MaDanMucTT) {
          const related = await getNewsByCategory(newsItem.MaDanMucTT);
          // Filter out current news and limit to 3 items
          const filteredRelated = related
            .filter(item => item.MaTinTuc !== newsItem.MaTinTuc)
            .slice(0, 3);
          setRelatedNews(filteredRelated);
        }
      } catch (err) {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container alert alert-danger" style={{ marginTop: '20px' }}>
        {error}
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container alert alert-warning" style={{ marginTop: '20px' }}>
        Không tìm thấy bài viết.
      </div>
    );
  }

  // Format date in Vietnamese locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không có ngày';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
      return format(date, 'dd MMMM yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Function to handle image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${imagePath}`;
  };

  return (
    <>
    <section className="product-page" id="sanphana">
     <div className="container">
        <div className="breadcrumb">
          <Link to="/" style={{ textDecoration: "none" }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/tintuc" style={{ textDecoration: "none" }}>Tin tức</Link>
        </div>
      </div>
      {/* News Detail Content */}
      <section className="news-detail">
        <div className="container">
          <div className="news-header">
            <span className="news-category-ct">{news.TenDanMucTT || 'Tin tức'}</span>
            <h1 className="news-title">{news.TieuDe}</h1>
            <div className="news-meta">
              <span>
                <i className="far fa-calendar-alt" /> {formatDate(news.NgayDang)}
              </span>
              <span>
                <i className="far fa-eye" /> {news.LuotXem || 0} lượt xem
              </span>
              <span>
                <i className="far fa-user" /> Luxury Jewelry
              </span>
            </div>
          </div>
          
          <div className="news-image1">
            <img
              src={getImageUrl(news.Hinh)}
              alt={news.TieuDe}
              className="img2-fluid"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e';
              }}
            />
          </div>
          
          <div 
            className="news-content-ct" 
            dangerouslySetInnerHTML={{ __html: news.NoiDungChiTiet || 'Nội dung đang được cập nhật...' }}
          />
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="related-news py-5">
          <div className="container">
            <div className="section-title text-center mb-5">
              <h2>Tin tức liên quan</h2>
              <p className="text-muted">Các bài viết cùng chủ đề bạn có thể quan tâm</p>
            </div>
            
            <div className="row">
              {relatedNews.map((item) => (
                <div className="" key={item.MaTinTuc}>
                  <div className="card1 related-item1">
                    <div className="related-image">
                      <img
                        src={getImageUrl(item.Hinh)}
                        alt={item.TieuDe}
                        className="card-img-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a';
                        }}
                      />
                    </div>
                    <div className="card-body related-content">
                      <span className="badge bg-secondary related-category mb-2">
                        {item.TenDanMucTT || 'Tin tức'}
                      </span>
                      
                      <h3 className="card-title related-title">
                        <Link 
                          to={`/tin-tuc/${item.MaTinTuc}`} 
                          className="text-decoration-none text-dark"
                        >
                          {item.TieuDe}
                        </Link>
                      </h3>
                      <div className="card-text related-meta text-muted small">
                        <span className="me-3">
                          {item.MoTaNgan}
                        </span>
                      </div>
                        <div className="card-text related-meta text-muted small">
                        <span className="me-3">
                          <Link to={`/tin-tuc/${item.MaTinTuc}`} style={{ textDecoration: "none" }} className="read-more">
                      Đọc tiếp
                    </Link>
                        </span>
                        <span>
                          <i className="far fa-eye me-1" /> {item.LuotXem || 0}
                        </span>
                      </div>
                  
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
       </section>
    </>
  );
};

export default Tintucct;