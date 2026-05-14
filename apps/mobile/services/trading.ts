import apiClient from './api';

export const tradingApi = {
  getAccount: () => apiClient.get('/trading/account/'),

  getPositions: () => apiClient.get('/trading/positions/'),

  getOrders: (status?: string) =>
    apiClient.get('/trading/orders/', { params: { status } }),

  submitOrder: (data: { symbol: string; side: 'buy' | 'sell'; notional?: number; qty?: number }) =>
    apiClient.post('/trading/orders/', data),

  getAssets: (params?: { search?: string; type?: string }) =>
    apiClient.get('/market/assets/', { params }),

  getQuotes: (symbols: string[]) =>
    apiClient.get('/market/quotes/', { params: { symbols: symbols.join(',') } }),
};
