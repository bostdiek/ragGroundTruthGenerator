import React from 'react';
import styled from 'styled-components';
import { colors, spacing, shadows, zIndex } from '../ui/theme';
import Container from './Container';

export interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  fixed?: boolean;
  elevated?: boolean;
}

const HeaderContainer = styled.header<{ fixed: boolean; elevated: boolean }>`
  background-color: ${colors.background.default};
  padding: ${spacing.md} 0;
  border-bottom: 1px solid ${colors.divider};
  box-shadow: ${({ elevated }) => (elevated ? shadows.sm : 'none')};
  position: ${({ fixed }) => (fixed ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  width: 100%;
  z-index: ${zIndex.appBar};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${spacing.lg};
`;

const NavigationContainer = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

export const Header: React.FC<HeaderProps> = ({
  logo,
  navigation,
  actions,
  fixed = false,
  elevated = true,
}) => {
  return (
    <HeaderContainer fixed={fixed} elevated={elevated}>
      <Container>
        <HeaderContent>
          {logo && <LogoContainer>{logo}</LogoContainer>}
          
          {navigation && <NavigationContainer>{navigation}</NavigationContainer>}
          
          {actions && <ActionsContainer>{actions}</ActionsContainer>}
        </HeaderContent>
      </Container>
    </HeaderContainer>
  );
};

export default Header;
