import styled from 'styled-components';

export const GlassCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  backdrop-filter: blur(12px);
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 1.5rem;
  box-shadow: ${(props) => props.theme.shadow};
  transition: transform ${ (props) => props.theme.transition };
  &:hover {
    transform: translateY(-4px);
  }
`;
