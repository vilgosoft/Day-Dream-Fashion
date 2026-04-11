import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'react-toastify';
import './Contact.scss';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.warning('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact__container">
        <div className="contact__header">
          <h1 className="contact__title">Get in Touch</h1>
          <p className="contact__subtitle">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="contact__layout">
          {/* Contact Form */}
          <div className="contact__form-wrapper">
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-row">
                <div className="contact__field">
                  <label className="contact__label" htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    className="contact__input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="contact__field">
                  <label className="contact__label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="contact__input"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  className="contact__input"
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                />
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="contact__textarea"
                  placeholder="Write your message here..."
                  rows={6}
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                />
              </div>

              <button type="submit" className="contact__submit" disabled={loading}>
                <FiSend />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact__info">
            <h3 className="contact__info-title">Contact Information</h3>
            <p className="contact__info-text">
              Reach out to us through any of these channels. We typically respond within 24 hours.
            </p>

            <div className="contact__info-items">
              <div className="contact__info-item">
                <div className="contact__info-icon"><FiMail /></div>
                <div>
                  <h4>Email</h4>
                  <p>support@daydreamfashion.com</p>
                </div>
              </div>

              <div className="contact__info-item">
                <div className="contact__info-icon"><FiPhone /></div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="contact__info-item">
                <div className="contact__info-icon"><FiMapPin /></div>
                <div>
                  <h4>Address</h4>
                  <p>123 Fashion Street, Mumbai, Maharashtra 400001</p>
                </div>
              </div>
            </div>

            <div className="contact__hours">
              <h4>Business Hours</h4>
              <p>Monday – Saturday: 10:00 AM – 7:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
