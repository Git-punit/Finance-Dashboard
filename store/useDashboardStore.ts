import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'summary' | 'chart' | 'list';

export interface Widget {
    id: string;
    type: WidgetType;
    title: string;
    symbol: string; // e.g. "BTC", "AAPL" or API query
    interval?: string; // "1D", "1W", "1M"
    apiEndpoint?: string; // Optional custom endpoint url
    apiKey?: string; // Optional API key for the endpoint
    dataKey?: string; // Field to display (e.g. "data.rate")
    refreshInterval: number; // in seconds
    format?: 'number' | 'currency-usd' | 'currency-inr' | 'percentage';
}

interface DashboardState {
    widgets: Widget[];
    addWidget: (widget: Widget) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<Widget>) => void;
    setWidgets: (widgets: Widget[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            widgets: [
                {
                    id: '1',
                    type: 'summary',
                    title: 'Bitcoin Price',
                    symbol: 'BTC',
                    refreshInterval: 30,
                    apiEndpoint: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
                    dataKey: 'data.rates.USD'
                },
                {
                    id: '3',
                    type: 'summary',
                    title: 'USD to INR',
                    symbol: '₹',
                    refreshInterval: 60,
                    apiEndpoint: 'https://open.er-api.com/v6/latest/USD',
                    dataKey: 'rates.INR'
                },
                {
                    id: '2',
                    type: 'chart',
                    title: 'Market Trend',
                    symbol: 'SPY',
                    interval: '1M',
                    refreshInterval: 60
                },
                {
                    id: '4',
                    type: 'chart',
                    title: 'Ethereum Growth',
                    symbol: 'ETH',
                    interval: '1W',
                    refreshInterval: 45
                },
                {
                    id: '5',
                    type: 'list',
                    title: 'Top Gainers',
                    symbol: 'MKT',
                    refreshInterval: 120
                },
                {
                    id: '6',
                    type: 'list',
                    title: 'My Watchlist',
                    symbol: 'WATCH',
                    refreshInterval: 300
                },
            ],
            addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
            removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) })),
            updateWidget: (id, updates) =>
                set((state) => ({
                    widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
                })),
            setWidgets: (widgets) => set({ widgets }),
        }),
        {
            name: 'dashboard-storage',
        }
    )
);
