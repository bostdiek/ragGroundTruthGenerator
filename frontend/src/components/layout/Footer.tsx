import React from 'react';
import styled from 'styled-components';

import { colors, spacing, typography } from '../ui/theme';
import Container from './Container';

export interface FooterProps {
  logo?: React.ReactNode;
  links?: React.ReactNode;
  copyright?: string;
  fixed?: boolean;
}

const FooterContainer = styled.footer<{ fixed: boolean }>`
  background-color: ${colors.background.alt};
  padding: ${spacing.lg} 0;
  border-top: 1px solid ${colors.divider};
  position: ${({ fixed }) => (fixed ? 'fixed' : 'relative')};
  bottom: 0;
  left: 0;
  width: 100%;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const TopSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${spacing.lg};
`;

const LogoContainer = styled.div`
  margin-bottom: ${spacing.md};
`;

const LinksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xl};
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${spacing.md};
  border-top: 1px solid ${colors.divider};
`;

const Copyright = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

export const Footer: React.FC<FooterProps> = ({
  logo,
  links,
  copyright = `© ${new Date().getFullYear()} AI Ground Truth Generator. All rights reserved.`,
  fixed = false,
}) => {
  return (
    <FooterContainer fixed={fixed}>
      <Container>
        <FooterContent>
          <TopSection>
            {logo && <LogoContainer>{logo}</LogoContainer>}

            {links && <LinksContainer>{links}</LinksContainer>}
          </TopSection>

          <BottomSection>
            <Copyright>{copyright}</Copyright>
          </BottomSection>
        </FooterContent>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
