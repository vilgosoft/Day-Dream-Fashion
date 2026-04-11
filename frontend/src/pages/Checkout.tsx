import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { setCartItems } from '@/store/slices/cartSlice';
import { toast } from 'react-toastify';
import type { RootState } from '@/store';
import type { CartItem } from '@/types/cart';
import api from '@/services/api';
import './Checkout.scss';

interface AddressForm {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const emptyAddress: AddressForm = {
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);

  const [cartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<AddressForm>({ ...emptyAddress });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const shipping = totalPrice >= 999 ? 0 : 99;
  const orderTotal = totalPrice + shipping;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchCart = async () => {
      try {
        const res = await cartService.getCart();
        const cartData = res.data?.data?.items || [];
        dispatch(setCartItems(cartData));
        setLocalCartItems(cartData);
        if (cartData.length === 0) {
          navigate('/cart');
        }
      } catch {
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [isAuthenticated, navigate, dispatch]);

  const updateAddress = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    const required: (keyof AddressForm)[] = ['full_name', 'phone', 'address_line_1', 'city', 'state', 'postal_code'];
    for (const field of required) {
      if (!address[field].trim()) {
        toast.warning(`Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setPlacing(true);
    try {
      // Create order
      const orderRes = await orderService.create({
        shipping_address: address as unknown as Record<string, string>,
        notes: notes || undefined,
      });

      const order = orderRes.data?.data;

      // Try Razorpay payment
      try {
        const paymentRes = await api.post('/payment/create', {
          order_id: order.id,
          amount: order.total,
        });

        const razorpayOrder = paymentRes.data?.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'Day Dream Fashion',
          description: `Order ${order.order_number}`,
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              await orderService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment successful! Order placed.');
              dispatch(setCartItems([]));
              navigate(`/orders`);
            } catch {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          prefill: {
            name: address.full_name,
            contact: address.phone,
          },
          theme: { color: '#e94560' },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch {
        // If Razorpay not configured, order is still created as COD
        toast.success(`Order ${order.order_number} placed successfully!`);
        dispatch(setCartItems([]));
        navigate(`/orders`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout">
        <div className="checkout__container">
          <div className="checkout__loading">Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__container">
        <Link to="/cart" className="checkout__back">
          <FiArrowLeft /> Back to Cart
        </Link>

        <h1 className="checkout__title">Checkout</h1>

        <div className="checkout__layout">
          {/* Shipping Form */}
          <div className="checkout__form-section">
            <h2 className="checkout__section-title">Shipping Address</h2>
            <div className="checkout__form">
              <div className="checkout__form-row">
                <div className="checkout__field">
                  <label className="checkout__label">Full Name *</label>
                  <input
                    type="text"
                    className="checkout__input"
                    placeholder="John Doe"
                    value={address.full_name}
                    onChange={(e) => updateAddress('full_name', e.target.value)}
                  />
                </div>
                <div className="checkout__field">
                  <label className="checkout__label">Phone *</label>
                  <input
                    type="tel"
                    className="checkout__input"
                    placeholder="+91 98765 43210"
                    value={address.phone}
                    onChange={(e) => updateAddress('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Address Line 1 *</label>
                <input
                  type="text"
                  className="checkout__input"
                  placeholder="Street address"
                  value={address.address_line_1}
                  onChange={(e) => updateAddress('address_line_1', e.target.value)}
                />
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Address Line 2</label>
                <input
                  type="text"
                  className="checkout__input"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address.address_line_2}
                  onChange={(e) => updateAddress('address_line_2', e.target.value)}
                />
              </div>

              <div className="checkout__form-row">
                <div className="checkout__field">
                  <label className="checkout__label">City *</label>
                  <input
                    type="text"
                    className="checkout__input"
                    placeholder="Mumbai"
                    value={address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                  />
                </div>
                <div className="checkout__field">
                  <label className="checkout__label">State *</label>
                  <input
                    type="text"
                    className="checkout__input"
                    placeholder="Maharashtra"
                    value={address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout__form-row">
                <div className="checkout__field">
                  <label className="checkout__label">Postal Code *</label>
                  <input
                    type="text"
                    className="checkout__input"
                    placeholder="400001"
                    value={address.postal_code}
                    onChange={(e) => updateAddress('postal_code', e.target.value)}
                  />
                </div>
                <div className="checkout__field">
                  <label className="checkout__label">Country</label>
                  <input
                    type="text"
                    className="checkout__input"
                    value={address.country}
                    onChange={(e) => updateAddress('country', e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Order Notes</label>
                <textarea
                  className="checkout__textarea"
                  placeholder="Special instructions for delivery (optional)"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout__summary">
            <h2 className="checkout__section-title">Order Summary</h2>

            <div className="checkout__summary-items">
              {(cartItems.length > 0 ? cartItems : items).map((item) => (
                <div key={item.id} className="checkout__summary-item">
                  <div className="checkout__summary-item-image">
                    {item.product_image && (
                      <img src={`${apiUrl}/${item.product_image}`} alt={item.product_name} />
                    )}
                    <span className="checkout__summary-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout__summary-item-info">
                    <p className="checkout__summary-item-name">{item.product_name}</p>
                    <p className="checkout__summary-item-meta">
                      {item.size_name} / {item.color_name}
                    </p>
                  </div>
                  <span className="checkout__summary-item-price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout__summary-totals">
              <div className="checkout__summary-row">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="checkout__summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="checkout__summary-divider" />
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              className="checkout__place-order"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              <FiLock />
              {placing ? 'Processing...' : `Pay ₹${orderTotal.toLocaleString('en-IN')}`}
            </button>

            <p className="checkout__secure-note">
              <FiLock /> Your payment is secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
