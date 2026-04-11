import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { cartService } from '@/services/cartService';
import { setCartItems, clearCart as clearCartState } from '@/store/slices/cartSlice';
import { toast } from 'react-toastify';
import type { RootState } from '@/store';
import type { CartItem } from '@/types/cart';
import './Cart.scss';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchCart = async () => {
      try {
        const res = await cartService.getCart();
        dispatch(setCartItems(res.data?.data?.items || []));
      } catch { /* empty cart */ }
      finally { setLoading(false); }
    };
    fetchCart();
  }, [isAuthenticated, dispatch]);

  const handleUpdateQuantity = async (item: CartItem, newQty: number) => {
    if (newQty < 1 || newQty > item.stock_quantity) return;
    setUpdatingId(item.id);
    try {
      await cartService.updateItem(item.id, newQty);
      const res = await cartService.getCart();
      dispatch(setCartItems(res.data?.data?.items || []));
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingId(itemId);
    try {
      await cartService.removeItem(itemId);
      const res = await cartService.getCart();
      dispatch(setCartItems(res.data?.data?.items || []));
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch(clearCartState());
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart">
        <div className="cart__container">
          <div className="cart__empty">
            <FiShoppingBag className="cart__empty-icon" />
            <h2>Please login to view your cart</h2>
            <p>You need to be logged in to add items and view your cart.</p>
            <Link to="/login" className="cart__continue-btn">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart">
        <div className="cart__container">
          <div className="cart__loading">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart">
        <div className="cart__container">
          <div className="cart__empty">
            <FiShoppingBag className="cart__empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/shop" className="cart__continue-btn">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart__container">
        <div className="cart__header">
          <h1 className="cart__title">Shopping Cart</h1>
          <button className="cart__clear-btn" onClick={handleClearCart}>Clear Cart</button>
        </div>

        <div className="cart__layout">
          {/* Cart Items */}
          <div className="cart__items">
            {items.map((item) => (
              <div key={item.id} className={`cart__item ${updatingId === item.id ? 'cart__item--updating' : ''}`}>
                <Link to={`/product/${item.product_slug}`} className="cart__item-image">
                  {item.product_image && (
                    <img src={`${apiUrl}/${item.product_image}`} alt={item.product_name} />
                  )}
                </Link>

                <div className="cart__item-details">
                  <Link to={`/product/${item.product_slug}`} className="cart__item-name">
                    {item.product_name}
                  </Link>
                  <div className="cart__item-meta">
                    <span>Size: {item.size_name}</span>
                    <span>Color: {item.color_name}</span>
                  </div>
                  <div className="cart__item-price">₹{item.price.toLocaleString('en-IN')}</div>
                </div>

                <div className="cart__item-actions">
                  <div className="cart__item-quantity">
                    <button
                      className="cart__qty-btn"
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingId === item.id}
                    >
                      <FiMinus />
                    </button>
                    <span className="cart__qty-value">{item.quantity}</span>
                    <button
                      className="cart__qty-btn"
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity || updatingId === item.id}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="cart__item-subtotal">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>

                  <button
                    className="cart__remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updatingId === item.id}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart__summary">
            <h3 className="cart__summary-title">Order Summary</h3>

            <div className="cart__summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart__summary-row">
              <span>Shipping</span>
              <span>{totalPrice >= 999 ? 'Free' : '₹99'}</span>
            </div>
            <div className="cart__summary-divider" />
            <div className="cart__summary-row cart__summary-row--total">
              <span>Total</span>
              <span>₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
            </div>

            {totalPrice < 999 && (
              <p className="cart__summary-hint">
                Add ₹{(999 - totalPrice).toLocaleString('en-IN')} more for free shipping!
              </p>
            )}

            <button
              className="cart__checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>

            <Link to="/shop" className="cart__continue-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
