import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEstimate, createBooking } from '../api/bookingApi';
import useToast from '../hooks/useToast';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const BookingForm = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');

  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    serviceId: '',
    service_name: '',
    scheduledTime: null,
    address: { street: '', area: '', city: '', pincode: '' },
    couponCode: '',
  });
  const [price, setPrice] = useState({
    base: 0,
    discount: 0,
    surcharges: 0,
    tax: 0,
    commission: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load estimate (price rules & services)
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const data = await getEstimate();
        setServices(data.services || []);
        setPrice((p) => ({ ...p, base: data.basePrice || 0 }));
      } catch (err) {
        showError('Failed to load services');
      }
    };
    fetchEstimate();
  }, []);

  // Compute derived price fields using useMemo to avoid state loops
  const derivedPrice = useMemo(() => {
    const { base, discount } = price;
    const surcharges = form.service_name ? 0.1 * base : 0; // placeholder logic
    const tax = 0.05 * (base + surcharges - discount);
    const commission = 0.07 * (base + surcharges - discount);
    const total = base + surcharges + tax + commission - discount;
    return { surcharges, tax, commission, total };
  }, [form.service_name, price.base, price.discount]);

  // Sync derived fields into price state (without causing cascading renders)
  useEffect(() => {
    setPrice((p) => ({ ...p, ...derivedPrice }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((f) => ({
        ...f,
        address: { ...f.address, [field]: value },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceId && !form.service_name) {
      showError('Select a service');
      return;
    }
    if (!form.scheduledTime) {
      showError('Pick a date & time');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        scheduledTime: form.scheduledTime.toISOString(),
        totalAmount: price.total,
        discountAmount: price.discount,
      };
      await createBooking(payload);
      showSuccess('Booking created!');
      navigate('/technician');
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <GlassCard>
        <h2>Book a Service</h2>
        <Form onSubmit={handleSubmit}>
          <Select name="serviceId" value={form.serviceId} onChange={handleChange} required>
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} - ₹{s.basePrice}
              </option>
            ))}
          </Select>
          {/* Address fields */}
          <Input name="address.street" placeholder="Street" value={form.address.street} onChange={handleChange} required />
          <Input name="address.area" placeholder="Area" value={form.address.area} onChange={handleChange} required />
          <Input name="address.city" placeholder="City" value={form.address.city} onChange={handleChange} required />
          <Input name="address.pincode" placeholder="Pincode" value={form.address.pincode} onChange={handleChange} required />
          {/* Date‑time picker */}
          <DatePickerWrapper>
            <DatePicker
              selected={form.scheduledTime}
              onChange={(date) => setForm((f) => ({ ...f, scheduledTime: date }))}
              showTimeSelect
              timeIntervals={30}
              minDate={new Date()}
              dateFormat="Pp"
              placeholderText="Select date & time"
            />
          </DatePickerWrapper>
          {/* Coupon */}
          <Input name="couponCode" placeholder="Coupon (optional)" value={form.couponCode} onChange={handleChange} />
          {/* Price breakdown */}
          <PriceBox>
            <p>Base: ₹{price.base.toFixed(2)}</p>
            <p>Surcharges: ₹{price.surcharges.toFixed(2)}</p>
            <p>Tax: ₹{price.tax.toFixed(2)}</p>
            <p>Commission: ₹{price.commission.toFixed(2)}</p>
            <p>Discount: -₹{price.discount.toFixed(2)}</p>
            <h3>Total: ₹{price.total.toFixed(2)}</h3>
          </PriceBox>
          <GradientButton type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </GradientButton>
        </Form>
      </GlassCard>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid #ccc;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid #ccc;
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
`;

const PriceBox = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
  text-align: right;
`;
