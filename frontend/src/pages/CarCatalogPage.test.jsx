import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import CarCatalogPage from './CarCatalogPage';
import * as carService from '../services/carService';

function LocationTracker() {
  const location = useLocation();
  return (
    <div data-testid="detail-location">
      <span data-testid="detail-path">{location.pathname}</span>
      <span data-testid="detail-from-search">{location.state?.fromSearch || ''}</span>
    </div>
  );
}

const mockCars = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    make: 'Tesla',
    model: 'Model 3 Performance',
    year: 2023,
    mileage: 14200,
    price: 43990.0,
    fuelType: 'ELECTRIC',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    make: 'Porsche',
    model: 'Taycan 4S Cross Turismo',
    year: 2024,
    mileage: 6500,
    price: 98500.0,
    fuelType: 'ELECTRIC',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e',
  },
];

describe('CarCatalogPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders catalog inventory and fetches cars', async () => {
    vi.spyOn(carService, 'fetchCars').mockResolvedValueOnce(mockCars);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CarCatalogPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/vehicle inventory/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
      expect(screen.getByText('Taycan 4S Cross Turismo')).toBeTruthy();
    });
  });

  it('synchronizes filters with URL search parameters on initial mount', async () => {
    const fetchSpy = vi.spyOn(carService, 'fetchCars').mockResolvedValueOnce([mockCars[0]]);

    render(
      <MemoryRouter initialEntries={['/?make=Tesla&minYear=2023']}>
        <Routes>
          <Route path="/" element={<CarCatalogPage />} />
        </Routes>
      </MemoryRouter>
    );

    const makeInput = screen.getByLabelText(/search make/i);
    expect(makeInput.value).toBe('Tesla');

    const yearSelect = screen.getByLabelText(/min year/i);
    expect(yearSelect.value).toBe('2023');

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          make: 'Tesla',
          minYear: '2023',
        })
      );
    });
  });

  it('clicking a car card navigates to /cars/:id with search state', async () => {
    vi.spyOn(carService, 'fetchCars').mockResolvedValueOnce(mockCars);

    render(
      <MemoryRouter initialEntries={['/?make=Tesla']}>
        <Routes>
          <Route path="/" element={<CarCatalogPage />} />
          <Route path="/cars/:id" element={<LocationTracker />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Model 3 Performance')).toBeTruthy();
    });

    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('detail-path').textContent).toBe(
        '/cars/550e8400-e29b-41d4-a716-446655440001'
      );
      expect(screen.getByTestId('detail-from-search').textContent).toBe('?make=Tesla');
    });
  });
});
