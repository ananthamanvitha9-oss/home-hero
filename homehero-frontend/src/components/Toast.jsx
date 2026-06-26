import { createContext, useContext, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    // auto‑remove after 3 seconds
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const showSuccess = (msg) => addToast('success', msg);
  const showError = (msg) => addToast('error', msg);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <ToastContainer>
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type}>
            {t.message}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// Styled components for toast UI
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
`;

const Toast = styled.div`
  background: ${(props) =>
    props.type === 'success'
      ? props.theme.colors.success
      : props.theme.colors.error};
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: ${(props) => props.theme.shadow};
  animation: ${slideIn} 0.3s ease forwards;
`;
