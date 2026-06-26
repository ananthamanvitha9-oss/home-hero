import styled from 'styled-components';

export const GradientButton = styled.button`
  background: linear-gradient(45deg, ${(props) => props.theme.colors.accent}, ${(props) => props.theme.colors.accent}aa);
  color: #fff;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform ${ (props) => props.theme.transition }, background ${ (props) => props.theme.transition };
  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(45deg, ${(props) => props.theme.colors.accent}cc, ${(props) => props.theme.colors.accent}dd);
  }
`;
