import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as carService from './services/carService';

describe('App Routing Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('renders root layout with CarCatalogPage on default route "/"', async () => {
    vi.spyOn(carService, 'fetchCars').mockResolvedValue([]);

    render(<App />);

    expect(screen.getAllByText('AutoMarket').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByText(/vehicle inventory/i)).toBeTruthy();
    });
  });

  it('renders CarDetailPage when deep-linking to "/cars/:id"', async () => {
    const mockCar = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      make: 'Tesla',
      model: 'Model 3 Performance',
      year: 2023,
      mileage: 14200,
      price: 43990.0,
      fuelType: 'ELECTRIC',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
    };
    vi.spyOn(carService, 'fetchCarById').mockResolvedValue(mockCar);

    window.history.pushState({}, '', '/cars/550e8400-e29b-41d4-a716-446655440001');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
    });
  });

  it('renders NotFoundPage on unknown route', async () => {
    window.history.pushState({}, '', '/random-unknown-route');
    render(<App />);

    expect(screen.getByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/page not found/i)).toBeTruthy();
  });
});
