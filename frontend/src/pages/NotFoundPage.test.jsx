import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

function HomeTracker() {
  const location = useLocation();
  return <div data-testid="home-view">{location.pathname}</div>;
}

describe('NotFoundPage', () => {
  it('renders 404 message and navigates back to inventory', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-page']}>
        <Routes>
          <Route path="/" element={<HomeTracker />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/page not found/i)).toBeTruthy();

    const backBtn = screen.getByRole('button', { name: /back to inventory/i });
    fireEvent.click(backBtn);

    expect(screen.getByTestId('home-view').textContent).toBe('/');
  });
});
