import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import CarDetailPage from './CarDetailPage';
import * as carService from '../services/carService';

// Helper component to track current location for navigation tests
function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="search">{location.search}</span>
    </div>
  );
}

const mockCar = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  make: 'Tesla',
  model: 'Model 3 Performance',
  year: 2023,
  mileage: 14200,
  price: 43990.0,
  fuelType: 'ELECTRIC',
  imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
};

describe('CarDetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mounts at /cars/:id, fetches and displays vehicle specifications (deep-linking)', async () => {
    vi.spyOn(carService, 'fetchCarById').mockResolvedValueOnce(mockCar);

    render(
      <MemoryRouter initialEntries={['/cars/550e8400-e29b-41d4-a716-446655440001']}>
        <Routes>
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading vehicle details|fetching/i)).toBeTruthy();

    await waitFor(() => {
      expect(carService.fetchCarById).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
    });

    await waitFor(() => {
      expect(screen.getByText('Tesla')).toBeTruthy();
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
      expect(screen.getAllByText('2023').length).toBeGreaterThan(0);
      expect(screen.getByText(/14,200/)).toBeTruthy();
      expect(screen.getByText(/\$43,990/)).toBeTruthy();
      expect(screen.getByText(/550e8400-e29b-41d4-a716-446655440001/)).toBeTruthy();
      expect(screen.getAllByText(/electric/i).length).toBeGreaterThan(0);
    });
  });

  it('displays a friendly 404 Not Found error view when vehicle does not exist', async () => {
    const error404 = new carService.ApiError(404, 'Not Found', 'Vehicle not found with ID 550e8400-e29b-41d4-a716-446655449999');
    vi.spyOn(carService, 'fetchCarById').mockRejectedValueOnce(error404);

    render(
      <MemoryRouter initialEntries={['/cars/550e8400-e29b-41d4-a716-446655449999']}>
        <Routes>
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /vehicle not found|not found/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /back to inventory/i })).toBeTruthy();
    });
  });

  it('displays a 400 Bad Request error view when UUID format is invalid', async () => {
    const fetchSpy = vi.spyOn(carService, 'fetchCarById');

    render(
      <MemoryRouter initialEntries={['/cars/invalid-uuid-format-123']}>
        <Routes>
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /invalid vehicle id|bad request|invalid uuid/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /back to inventory/i })).toBeTruthy();
    });

    // Should not call fetchCarById if client-side validation catches invalid UUID
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('navigates "Back to Inventory" preserving active filter state from location.state', async () => {
    vi.spyOn(carService, 'fetchCarById').mockResolvedValueOnce(mockCar);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/cars/550e8400-e29b-41d4-a716-446655440001',
            state: { fromSearch: '?make=Tesla&minYear=2023' },
          },
        ]}
      >
        <Routes>
          <Route path="/" element={<LocationDisplay />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
    });

    const backButton = screen.getByRole('button', { name: /back to inventory/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('pathname').textContent).toBe('/');
      expect(screen.getByTestId('search').textContent).toBe('?make=Tesla&minYear=2023');
    });
  });

  it('copies UUID to clipboard on click with feedback', async () => {
    vi.spyOn(carService, 'fetchCarById').mockResolvedValueOnce(mockCar);
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <MemoryRouter initialEntries={['/cars/550e8400-e29b-41d4-a716-446655440001']}>
        <Routes>
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
    });

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeTruthy();
    });
  });

  it('falls back to SEED_CARS in Demo Mode if backend is unreachable', async () => {
    const networkError = new TypeError('Failed to fetch');
    vi.spyOn(carService, 'fetchCarById').mockRejectedValueOnce(networkError);

    render(
      <MemoryRouter initialEntries={['/cars/550e8400-e29b-41d4-a716-446655440001']}>
        <Routes>
          <Route path="/cars/:id" element={<CarDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tesla')).toBeTruthy();
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
    });
  });
});
