import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getTechnicianBookings, respondBooking } from '../api/bookingApi';
import { useToast } from '../components/Toast';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';

export const TechnicianDashboard = () => {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inline fetch inside useEffect to avoid stale dependency warnings
  // No separate fetchBookings function needed

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTechnicianBookings();
        setBookings(data);
      } catch (e) {
        showError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleResponse = async (id, action) => {
    try {
      await respondBooking(id, action);
      showSuccess(`Booking ${action}ed`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (e) {
      // e is intentionally unused; keep for future error handling
      showError('Action failed');
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <Container>
      <GlassCard>
        <h2>Pending Bookings</h2>
        {bookings.length === 0 ? (
          <p>No pending bookings.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Customer</th>
                <th>Scheduled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.service_name}</td>
                  <td>{b.customer_name || 'N/A'}</td>
                  <td>{new Date(b.scheduledTime).toLocaleString()}</td>
                  <td>
                    <GradientButton onClick={() => handleResponse(b._id, 'accept')}>Accept</GradientButton>
                    <GradientButton onClick={() => handleResponse(b._id, 'reject')}>Reject</GradientButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </GlassCard>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${(props) => props.theme.colors.surface};
  }
  th {
    background: ${(props) => props.theme.colors.surface};
  }
`;
