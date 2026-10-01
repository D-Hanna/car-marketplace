import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../context/ThemeContext';

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders all three theme options (light, dark, system)', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /light/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /dark/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /system/i })).toBeDefined();
  });

  it('marks system as pressed by default when no theme is saved', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const systemBtn = screen.getByRole('button', { name: /system/i });
    expect(systemBtn.getAttribute('aria-pressed')).toBe('true');

    const darkBtn = screen.getByRole('button', { name: /dark/i });
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');

    const lightBtn = screen.getByRole('button', { name: /light/i });
    expect(lightBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to dark mode when dark button is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const darkBtn = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkBtn);

    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('automarket_theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('switches to light mode when light button is clicked', () => {
    localStorage.setItem('automarket_theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const lightBtn = screen.getByRole('button', { name: /light/i });
    fireEvent.click(lightBtn);

    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('automarket_theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('switches back to system mode when system button is clicked', () => {
    localStorage.setItem('automarket_theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const systemBtn = screen.getByRole('button', { name: /system/i });
    fireEvent.click(systemBtn);

    expect(systemBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('automarket_theme')).toBe('system');
  });
});
