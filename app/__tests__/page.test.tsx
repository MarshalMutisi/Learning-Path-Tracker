import { render, screen } from '@testing-library/react';
import Page from '@/app/page'; // adjust the path if needed

describe('Home Page', () => {
  it('renders the heading and homepage text', () => {
    render(<Page />);

    // Check heading
    const heading = screen.getByRole('heading', { name: /learning path tracker/i });
    expect(heading).toBeInTheDocument();

    // Check div content
    const homepageText = screen.getByText(/homepage/i);
    expect(homepageText).toBeInTheDocument();

    // Optional: check className
    expect(homepageText).toHaveClass('text-red-600');
  });
});
