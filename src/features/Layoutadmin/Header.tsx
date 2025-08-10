import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/api/ClientApi';

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface Client {
  HoTen: string;
  avatar?: string;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<Client | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    };

    fetchCurrentUser();
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <button
        className="button-bar"
        onClick={onToggleSidebar}
        aria-label="Mở menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          fill="currentColor"
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
        </svg>
      </button>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="button-search"
          aria-label="Tìm kiếm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            fill="currentColor"
            className="bi bi-search"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
        </button>
      </form>

      <div className="user-info">
        {user ? (
          <>
            <img
              src={user.avatar ? `http://localhost:3000${user.avatar}` : '/default-avatar.jpg'}
              alt={user.HoTen}
              className="avatar-img"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                target.onerror = null;
              }}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: '10px' }}
            />
            <span>{user.HoTen}</span>
          </>
        ) : (
          <span>Khách</span>
        )}
      </div>
    </header>
  );
};

export default Header;