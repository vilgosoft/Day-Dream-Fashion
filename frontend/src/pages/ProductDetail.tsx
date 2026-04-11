import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { toast } from 'react-toastify';
import type { Product, ProductVariation } from '@/types/product';
import type { RootState } from '@/store';
import api from '@/services/api';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getBySlug(slug!);
        const data = res.data?.data;
        setProduct(data);

        if (data?.images?.length) {
          const primaryIdx = data.images.findIndex((img: any) => img.is_primary);
          setSelectedImage(primaryIdx >= 0 ? primaryIdx : 0);
        }

        if (isAuthenticated && data) {
          try {
            const wishRes = await api.get(`/wishlist/check/${data.id}`);
            setWishlisted(wishRes.data?.data?.wishlisted || false);
          } catch { /* ignore */ }
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, isAuthenticated]);

  const uniqueSizes = product
    ? Array.from(
        new Map(
          product.variations
            .filter((v) => v.status === 'active')
            .map((v) => [v.size_id, { id: v.size_id, name: v.size_name }])
        ).values()
      )
    : [];

  const uniqueColors = product
    ? Array.from(
        new Map(
          product.variations
            .filter((v) => v.status === 'active' && (selectedSize === null || v.size_id === selectedSize))
            .map((v) => [v.color_id, { id: v.color_id, name: v.color_name, hex: v.color_hex }])
        ).values()
      )
    : [];

  const selectedVariation: ProductVariation | undefined = product?.variations.find(
    (v) => v.size_id === selectedSize && v.color_id === selectedColor && v.status === 'active'
  );

  const displayPrice = selectedVariation
    ? selectedVariation.price
    : product
      ? product.base_price
      : 0;

  const inStock = selectedVariation ? selectedVariation.stock_quantity > 0 : false;
  const maxQty = selectedVariation ? Math.min(selectedVariation.stock_quantity, 10) : 1;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      return;
    }
    if (!selectedVariation) {
      toast.warning('Please select size and color');
      return;
    }
    if (!inStock) {
      toast.error('This item is out of stock');
      return;
    }
    setAddingToCart(true);
    try {
      await cartService.addItem(selectedVariation.id, quantity);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist');
      return;
    }
    try {
      await api.post(`/wishlist/${product!.id}`);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__loading">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__not-found">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/shop" className="product-detail__back-btn">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* Breadcrumb */}
        <nav className="product-detail__breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight />
          <Link to="/shop">Shop</Link>
          <FiChevronRight />
          {product.category_name && (
            <>
              <Link to={`/shop?category_id=${product.category_id}`}>{product.category_name}</Link>
              <FiChevronRight />
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="product-detail__layout">
          {/* Image Gallery */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              {product.images.length > 0 ? (
                <img
                  src={`${apiUrl}/${product.images[selectedImage]?.image_path}`}
                  alt={product.name}
                />
              ) : (
                <div className="product-detail__no-image">No Image Available</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="product-detail__thumbnails">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    className={`product-detail__thumb ${idx === selectedImage ? 'product-detail__thumb--active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={`${apiUrl}/${img.image_path}`} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail__info">
            {product.category_name && (
              <span className="product-detail__category">{product.category_name}</span>
            )}
            <h1 className="product-detail__name">{product.name}</h1>

            <div className="product-detail__price">
              <span className="product-detail__price-current">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {!selectedVariation && product.variations.length > 0 && (
                <span className="product-detail__price-hint">Select options for exact price</span>
              )}
            </div>

            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="product-detail__option-group">
                <h3 className="product-detail__option-label">
                  Size {selectedSize !== null && <span>— {uniqueSizes.find((s) => s.id === selectedSize)?.name}</span>}
                </h3>
                <div className="product-detail__size-options">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size.id}
                      className={`product-detail__size-btn ${selectedSize === size.id ? 'product-detail__size-btn--active' : ''}`}
                      onClick={() => {
                        setSelectedSize(selectedSize === size.id ? null : size.id);
                        setSelectedColor(null);
                        setQuantity(1);
                      }}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="product-detail__option-group">
                <h3 className="product-detail__option-label">
                  Color {selectedColor !== null && <span>— {uniqueColors.find((c) => c.id === selectedColor)?.name}</span>}
                </h3>
                <div className="product-detail__color-options">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.id}
                      className={`product-detail__color-btn ${selectedColor === color.id ? 'product-detail__color-btn--active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      onClick={() => {
                        setSelectedColor(selectedColor === color.id ? null : color.id);
                        setQuantity(1);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {selectedVariation && (
              <div className={`product-detail__stock ${inStock ? 'product-detail__stock--in' : 'product-detail__stock--out'}`}>
                {inStock ? `In Stock (${selectedVariation.stock_quantity} available)` : 'Out of Stock'}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="product-detail__actions">
              <div className="product-detail__quantity">
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className="product-detail__qty-value">{quantity}</span>
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  disabled={quantity >= maxQty}
                >
                  <FiPlus />
                </button>
              </div>

              <button
                className="product-detail__add-to-cart"
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariation || !inStock}
              >
                <FiShoppingCart />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                className={`product-detail__wishlist-btn ${wishlisted ? 'product-detail__wishlist-btn--active' : ''}`}
                onClick={handleToggleWishlist}
              >
                <FiHeart />
              </button>
            </div>

            {/* SKU */}
            {selectedVariation && (
              <div className="product-detail__sku">SKU: {selectedVariation.sku}</div>
            )}

            {/* Description */}
            {product.description && (
              <div className="product-detail__description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
