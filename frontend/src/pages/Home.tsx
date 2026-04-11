import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/services/productService';
import api from '@/services/api';
import type { Category } from '@/types/product';
import './Home.scss';

interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  category_id: number;
  category_name: string;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  is_trending: boolean;
  primary_image: string;
  min_price: number;
  max_price: number;
  images: [];
  variations: [];
  created_at: string;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes, catRes] = await Promise.all([
          productService.getFeatured(),
          productService.getTrending(),
          api.get('/categories'),
        ]);
        setFeaturedProducts(featRes.data?.data || []);
        setTrendingProducts(trendRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      } catch {
        // Silently handle — empty state will show
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="home__hero">
        <div className="home__hero-content">
          <span className="home__hero-tag">New Collection 2026</span>
          <h1 className="home__hero-title">
            Discover Your <br />
            <span>Dream Style</span>
          </h1>
          <p className="home__hero-text">
            Elevate your wardrobe with our premium collection of modern, elegant clothing
            designed for every occasion.
          </p>
          <div className="home__hero-actions">
            <Link to="/shop" className="home__hero-btn home__hero-btn--primary">
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/shop?featured=true" className="home__hero-btn home__hero-btn--secondary">
              View Collection
            </Link>
          </div>
        </div>
        <div className="home__hero-visual">
          <div className="home__hero-shape" />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="home__section">
          <div className="home__section-container">
            <div className="home__section-header">
              <h2 className="home__section-title">Shop by Category</h2>
              <Link to="/shop" className="home__section-link">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="home__categories">
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/shop?category_id=${cat.id}`} className="home__category-card">
                  <div className="home__category-image">
                    {cat.image && <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${cat.image}`} alt={cat.name} />}
                  </div>
                  <h3 className="home__category-name">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="home__section home__section--gray">
          <div className="home__section-container">
            <div className="home__section-header">
              <h2 className="home__section-title">Featured Products</h2>
              <Link to="/shop?featured=true" className="home__section-link">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="home__product-grid">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="home__promo">
        <div className="home__promo-content">
          <span className="home__promo-tag">Limited Offer</span>
          <h2 className="home__promo-title">Get 20% Off Your First Order</h2>
          <p className="home__promo-text">Sign up today and receive an exclusive discount on your first purchase.</p>
          <Link to="/signup" className="home__promo-btn">Sign Up Now</Link>
        </div>
      </section>

      {/* Trending Products */}
      {!loading && trendingProducts.length > 0 && (
        <section className="home__section">
          <div className="home__section-container">
            <div className="home__section-header">
              <h2 className="home__section-title">Trending Now</h2>
              <Link to="/shop?trending=true" className="home__section-link">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="home__product-grid">
              {trendingProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="home__features">
        <div className="home__section-container">
          <div className="home__features-grid">
            <div className="home__feature">
              <div className="home__feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders above ₹999</p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>7-day return policy</p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>Razorpay protected</p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Dedicated assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
