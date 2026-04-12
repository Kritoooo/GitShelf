import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';

vi.mock('../../src/components/EpubReader', () => ({
  EpubReader: ({ bookId, slug }) => (
    <div data-testid="epub-reader">
      EPUB:{bookId}:{slug}
    </div>
  ),
}));

import { App } from '../../src/components/App';

function mockFetch(responses = {}) {
  return vi.fn((url) => {
    const key = Object.keys(responses).find((candidate) => String(url).includes(candidate));
    if (!key) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('Not found'),
      });
    }

    const body = responses[key];
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
    });
  });
}

beforeEach(() => {
  global.fetch = undefined;
  localStorage.clear();
  window.location.hash = '#/books/demo-book/chapter-1';
});

describe('App EPUB routing', () => {
  it('uses the EPUB reader for raw epub books instead of markdown chapters', async () => {
    const fetchMock = mockFetch({
      'manifest.json': {
        items: [
          {
            id: 'demo-book',
            type: 'book',
            title: 'Demo EPUB',
            source_format: 'epub',
            chapters_count: 2,
          },
        ],
      },
    });
    global.fetch = fetchMock;

    render(<App />);

    expect(await screen.findByTestId('epub-reader')).toHaveTextContent('EPUB:demo-book:chapter-1');
    expect(screen.queryByLabelText(/Search book/i)).not.toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/chapters/'))).toBe(false);
  });
});
