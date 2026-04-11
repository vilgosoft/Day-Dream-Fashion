import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import type { Product } from '@/types/product';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product & { primary_image?: string; min_price?: number; max_price?: number; category_name?: string };
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isWishlisted?: boolean;
}

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) => {
  const imageUrl = product.primary_image
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${product.primary_image}`
    : '/placeholder-product.png';

  const displayPrice = product.min_price ?? product.base_price;
  const hasRange = product.max_price && product.min_price && product.max_price !== product.min_price;

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card__image-link">
        <div className="product-card__image-wrapper">
          <img src={imageUrl} alt={product.name} className="product-card__image" loading="lazy" />
          {product.is_trending && <span className="product-card__badge product-card__badge--trending">Trending</span>}
          {product.is_featured && <span className="product-card__badge product-card__badge--featured">Featured</span>}
        </div>
      </Link>

      <div className="product-card__actions-overlay">
        {onToggleWishlist && (
          <button
            className={`product-card__action-btn ${isWishlisted ? 'product-card__action-btn--active' : ''}`}
            onClick={() => onToggleWishlist(product.id)}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart />
          </button>
        )}
        {onAddToCart && (
          <button
            className="product-card__action-btn"
            onClick={() => onAddToCart(product.id)}
            title="Add to cart"
          >
            <FiShoppingCart />
          </button>
        )}
      </div>

      <div className="product-card__info">
        {product.category_name && (
          <span className="product-card__category">{product.category_name}</span>
        )}
        <Link to={`/product/${product.slug}`} className="product-card__name">
          {product.name}
        </Link>
        <div className="product-card__price">
          <span className="product-card__price-current">
            ₹{displayPrice.toLocaleString('en-IN')}
          </span>
          {hasRange && (
            <span className="product-card__price-range">
              – ₹{product.max_price!.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
