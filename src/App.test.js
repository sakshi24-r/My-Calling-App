// src/App.test.js

import { render, screen } from '@testing-library/react';
import App from './components/App';

test('renders My Calling App header', () => {
  render(<App />);
  const headerElement = screen.getByText(/My Calling App/i);
  expect(headerElement).toBeInTheDocument();
});