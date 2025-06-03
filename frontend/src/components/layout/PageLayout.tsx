import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../ui/theme';
import Container from './Container';

export interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
  breadcrumbs?: React.ReactNode;
}

const PageContainer = styled.div`
  padding: ${spacing.lg} 0;
  min-height: calc(100vh - 64px); // Adjust based on header height
  background-color: ${colors.background.default};
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xl};
`;

const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm};
`;

const TitleArea = styled.div`
  flex: 1;
`;

const ActionsArea = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  color: ${colors.text.primary};
  font-weight: 600;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  margin: ${spacing.xs} 0 0 0;
  color: ${colors.text.secondary};
`;

const BreadcrumbsContainer = styled.div`
  margin-bottom: ${spacing.md};
`;

const PageContent = styled.div`
  // Additional styling for page content if needed
`;

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  maxWidth = 'md',
  actions,
  showBreadcrumbs = false,
  breadcrumbs,
}) => {
  return (
    <PageContainer>
      <Container maxWidth={maxWidth}>
        {(title || subtitle || actions) && (
          <PageHeader>
            {showBreadcrumbs && breadcrumbs && (
              <BreadcrumbsContainer>{breadcrumbs}</BreadcrumbsContainer>
            )}
            
            <PageTitleRow>
              {(title || subtitle) && (
                <TitleArea>
                  {title && <PageTitle>{title}</PageTitle>}
                  {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
                </TitleArea>
              )}
              
              {actions && <ActionsArea>{actions}</ActionsArea>}
            </PageTitleRow>
          </PageHeader>
        )}
        
        <PageContent>{children}</PageContent>
      </Container>
    </PageContainer>
  );
};

export default PageLayout;
