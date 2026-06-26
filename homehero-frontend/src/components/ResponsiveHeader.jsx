import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useDarkMode } from '../hooks/useDarkMode';

export const ResponsiveHeader = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <Header>
      <Nav>
        <Logo>HomeHero</Logo>
        <NavLinks>
          <StyledLink to="/booking">Book Service</StyledLink>
          <StyledLink to="/technician">Technician Dashboard</StyledLink>
          <StyledLink to="/admin/analytics">Analytics</StyledLink>
        </NavLinks>
        <ToggleBtn onClick={toggleDarkMode}>
          {isDark ? '☀️' : '🌙'}
        </ToggleBtn>
      </Nav>
    </Header>
  );
};

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${(props) => props.theme.colors.surface};
  backdrop-filter: blur(8px);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  width: 100%;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.accent};
`;

const NavLinks = styled.div`
  margin-left: 2rem;
  display: flex;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    color: ${(props) => props.theme.colors.accent};
  }
`;

const ToggleBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};
`;
