import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusTag from '../components/StatusTag';

describe('StatusTag', () => {
  test('renders the human-readable label for a known status', () => {
    render(<StatusTag status="IN_PROGRESS" />);
    expect(screen.getByTestId('status-tag')).toHaveTextContent('In progress');
  });

  test('applies the status-specific class', () => {
    render(<StatusTag status="COMPLETED" />);
    expect(screen.getByTestId('status-tag')).toHaveClass('tag-COMPLETED');
  });

  test('falls back to raw status when unknown', () => {
    render(<StatusTag status="UNKNOWN" />);
    expect(screen.getByTestId('status-tag')).toHaveTextContent('UNKNOWN');
  });
});
