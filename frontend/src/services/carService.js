/**
 * Custom error class wrapping RFC 7807 ProblemDetail responses
 */
export class ApiError extends Error {
  constructor(status, title, detail, invalidParams = [], rawResponse = null) {
    super(detail || title || `API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.invalidParams = invalidParams;
    this.rawResponse = rawResponse;
  }

  /**
   * Helper to get a field-specific error message from invalidParams
   */
  getFieldError(fieldName) {
    if (!Array.isArray(this.invalidParams)) return null;
    const match = this.invalidParams.find(
      (param) => param.name?.toLowerCase() === fieldName?.toLowerCase()
    );
    return match ? match.reason : null;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Parses response error, attempting to extract RFC 7807 ProblemDetail
 */
async function parseErrorResponse(response) {
  let body = null;
  try {
    const text = await response.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    // Body is not JSON
  }

  if (body) {
    return new ApiError(
      response.status,
      body.title || 'Error',
      body.detail || `Request failed with status ${response.status}`,
      body.invalidParams || [],
      body
    );
  }

  return new ApiError(
    response.status,
    response.statusText || 'Error',
    `HTTP Error ${response.status}: ${response.statusText}`
  );
}

/**
 * Fetch cars matching query filters
 * @param {Object} filters
 * @param {string} [filters.make]
 * @param {number|string} [filters.maxPrice]
 * @param {number|string} [filters.minYear]
 * @returns {Promise<Array>} List of cars
 */
export async function fetchCars(filters = {}) {
  const params = new URLSearchParams();

  if (filters.make && filters.make.trim()) {
    params.set('make', filters.make.trim());
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '' && filters.maxPrice !== null) {
    const priceNum = Number(filters.maxPrice);
    if (!isNaN(priceNum) && priceNum >= 0) {
      params.set('maxPrice', priceNum.toString());
    }
  }
  if (filters.minYear !== undefined && filters.minYear !== '' && filters.minYear !== null) {
    const yearNum = Number(filters.minYear);
    if (!isNaN(yearNum) && yearNum >= 1900) {
      params.set('minYear', yearNum.toString());
    }
  }

  const query = params.toString();
  const url = `${API_BASE}/api/v1/cars${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

/**
 * Fetch a single car by its UUID
 * @param {string} id
 * @returns {Promise<Object>} Car details
 */
export async function fetchCarById(id) {
  if (!id) {
    throw new ApiError(400, 'Bad Request', 'Car ID is required');
  }

  const url = `${API_BASE}/api/v1/cars/${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

/**
 * Create a new car listing
 * @param {Object} carData
 * @param {string} carData.make
 * @param {string} carData.model
 * @param {number|string} carData.year
 * @param {number|string} carData.mileage
 * @param {number|string} carData.price
 * @param {string} carData.fuelType
 * @param {string} carData.imageUrl
 * @returns {Promise<Object>} Created car
 */
export async function createCar(carData) {
  const payload = {
    make: carData.make?.trim() || '',
    model: carData.model?.trim() || '',
    year: Number(carData.year),
    mileage: Number(carData.mileage),
    price: Number(carData.price),
    fuelType: carData.fuelType,
    imageUrl: carData.imageUrl?.trim() || '',
  };

  const url = `${API_BASE}/api/v1/cars`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

export default {
  fetchCars,
  fetchCarById,
  createCar,
};
