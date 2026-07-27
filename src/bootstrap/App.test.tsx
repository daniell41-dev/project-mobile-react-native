import { render } from '@testing-library/react-native';

import App from '@/bootstrap/App';

describe('App', () => {
  it('renders the placeholder branded screen', async () => {
    const { getByText } = await render(<App />);

    expect(getByText('Índigo')).toBeTruthy();
  });
});
