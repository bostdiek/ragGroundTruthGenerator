import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  
  &:hover {
    background-color: #106ebe;
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FeatureTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.3rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

/**
 * Home page component.
 * Landing page after authentication.
 */
const Home: React.FC = () => {
  return (
    <HomeContainer>
      <Hero>
        <Title>AI Ground Truth Generator</Title>
        <Subtitle>
          Create high-quality question-answer pairs for training and evaluating AI models.
          Designed for subject matter experts to efficiently generate ground truth data.
        </Subtitle>
        <Button to="/collections">Get Started</Button>
      </Hero>
      
      <FeaturesSection>
        <FeatureCard>
          <FeatureTitle>Organized Collections</FeatureTitle>
          <FeatureDescription>
            Create and manage collections of Q&A pairs organized by theme or domain.
            Keep your ground truth data structured and accessible.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Smart Document Retrieval</FeatureTitle>
          <FeatureDescription>
            Search across multiple data sources to find relevant documents.
            Filter and select the most important materials for your answers.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>AI-Powered Generation</FeatureTitle>
          <FeatureDescription>
            Generate draft answers using state-of-the-art AI models.
            Apply custom rules to shape the responses according to your needs.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Collaborative Review</FeatureTitle>
          <FeatureDescription>
            Work together with team members to review and improve Q&A pairs.
            Ensure high-quality ground truth data through collaborative validation.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default Home;
