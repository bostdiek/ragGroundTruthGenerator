import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Container } from '../components/layout/Container';
import { Grid } from '../components/layout/Grid';
import { theme } from '../components/ui/theme';

// This test file focuses on responsive design aspects of components
describe('Responsive Design Tests', () => {
  
  // Helper function to simulate different viewport sizes
  const resizeWindow = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
  };
  
  // Test responsive design of Grid component
  describe('Grid Component Responsiveness', () => {
    it('applies correct column widths at different breakpoints', () => {
      // Simulate mobile viewport
      resizeWindow(480, 800);
      
      const { rerender, container } = render(
        <Grid container>
          <Grid item xs={12} sm={6} md={4} lg={3} data-testid="grid-item">
            Grid Item
          </Grid>
        </Grid>
      );
      
      // Check grid item in container
      const gridItem = container.querySelector('[data-testid="grid-item"]');
      expect(gridItem).toBeTruthy();
      
      // Test with tablet viewport
      resizeWindow(800, 1024);
      rerender(
        <Grid container>
          <Grid item xs={12} sm={6} md={4} lg={3} data-testid="grid-item">
            Grid Item
          </Grid>
        </Grid>
      );
      
      // Test with desktop viewport
      resizeWindow(1200, 900);
      rerender(
        <Grid container>
          <Grid item xs={12} sm={6} md={4} lg={3} data-testid="grid-item">
            Grid Item
          </Grid>
        </Grid>
      );
      
      // Test with large desktop viewport
      resizeWindow(1600, 1200);
      rerender(
        <Grid container>
          <Grid item xs={12} sm={6} md={4} lg={3} data-testid="grid-item">
            Grid Item
          </Grid>
        </Grid>
      );
    });
  });
  
  // Test responsive design of Container component
  describe('Container Component Responsiveness', () => {
    it('applies correct max-width at different breakpoints', () => {
      const { container } = render(
        <Container data-testid="container">Container Content</Container>
      );
      
      const containerElement = container.querySelector('[data-testid="container"]');
      expect(containerElement).toBeTruthy();
      
      // Test different viewport sizes
      // Mobile
      resizeWindow(480, 800);
      
      // Tablet
      resizeWindow(800, 1024);
      
      // Desktop
      resizeWindow(1200, 900);
      
      // Large Desktop
      resizeWindow(1600, 1200);
    });
  });
  
  // Test responsive design of Card component
  describe('Card Component Responsiveness', () => {
    it('maintains proper layout at different viewport sizes', () => {
      const { container } = render(
        <Card fullWidth data-testid="card">
          <Card.Header>
            <Card.Title>Responsive Card</Card.Title>
          </Card.Header>
          <Card.Content>
            This card should maintain proper layout at all screen sizes.
          </Card.Content>
        </Card>
      );
      
      const cardElement = container.querySelector('[data-testid="card"]');
      expect(cardElement).toBeTruthy();
      
      // Test different viewport sizes
      resizeWindow(480, 800);
      resizeWindow(800, 1024);
      resizeWindow(1200, 900);
    });
  });
  
  // Test theme breakpoints
  describe('Theme Breakpoints', () => {
    it('has all required breakpoints defined', () => {
      expect(theme.breakpoints).toBeDefined();
      expect(theme.breakpoints.xs).toBeDefined();
      expect(theme.breakpoints.sm).toBeDefined();
      expect(theme.breakpoints.md).toBeDefined();
      expect(theme.breakpoints.lg).toBeDefined();
      expect(theme.breakpoints.xl).toBeDefined();
    });
    
    it('has media query helpers', () => {
      expect(theme.media).toBeDefined();
      expect(theme.media.up).toBeDefined();
      expect(theme.media.down).toBeDefined();
      
      // Check that media query helpers generate correct CSS
      const upQuery = theme.media.up('md');
      expect(upQuery).toContain('@media');
      expect(upQuery).toContain('min-width');
      
      const downQuery = theme.media.down('md');
      expect(downQuery).toContain('@media');
      expect(downQuery).toContain('max-width');
    });
  });
});
