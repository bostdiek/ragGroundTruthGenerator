import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../features/auth/contexts/AuthContext';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #106ebe;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-weight: 500;
`;

/**
 * Navigation bar component for the application.
 * Handles navigation and authentication status.
 */
const NavBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <NavContainer>
      <Logo>AI Ground Truth Generator</Logo>
      
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/collections">Collections</NavLink>
          </>
        )}
      </NavLinks>
      
      {isAuthenticated ? (
        <UserInfo>
          {user && <UserName>{user.username}</UserName>}
          <Button onClick={handleLogout} data-testid="sign-out-button">Sign Out</Button>
        </UserInfo>
      ) : (
        <Button onClick={handleLogin}>Sign In</Button>
      )}
    </NavContainer>
  );
};

export default NavBar;
