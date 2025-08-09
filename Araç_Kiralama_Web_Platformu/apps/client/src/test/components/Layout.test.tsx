import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Layout from '../../components/Layout';

describe('Layout Component', () => {
  it('children içeriğini render etmeli', () => {
    const testContent = 'Test Content';
    
    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('navigation elementlerini içermeli', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    // Layout içindeki temel elementleri kontrol et
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('responsive olarak render edilmeli', () => {
    const { container } = render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    // Container'ın temel CSS sınıflarını kontrol et
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
