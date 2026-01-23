'use client';

import { generateId } from '@/lib/utils';
import { useState } from 'react';
import { useDashboardStore, WidgetType, Widget } from '@/store/useDashboardStore';
import { X, Plus } from 'lucide-react';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddWidgetModal({ isOpen, onClose }: AddWidgetModalProps) {
    const { addWidget } = useDashboardStore();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<WidgetType>('summary');
    const [symbol, setSymbol] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [dataKey, setDataKey] = useState('');
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [format, setFormat] = useState<any>('number');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newWidget: Widget = {
            id: generateId(),
            title,
            type,
            symbol,
            apiEndpoint: apiEndpoint || undefined,
            apiKey: apiKey || undefined,
            dataKey: dataKey || undefined,
            refreshInterval,
            format
        };
        addWidget(newWidget);
        onClose();
        // Reset form
        setTitle('');
        setType('summary');
        setSymbol('');
        setApiEndpoint('');
        setApiKey('');
        setDataKey('');
        setFormat('number');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Add New Widget</h2>
                        <p className="text-slate-400 text-sm">Configure your data source and display.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="add-widget-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Widget Title</label>
                            <input
                                required
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Bitcoin Price Tracker"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Display Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['summary', 'chart', 'list'] as const).map((t) => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`p-3 rounded-xl text-sm font-medium capitalize transition-all border ${type === t
                                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Symbol / Label</label>
                            <input
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder="e.g. BTC"
                            />
                        </div>

                        <div className="p-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-slate-800 flex-1"></div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">API Configuration (Optional)</div>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">API Endpoint URL</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:ring-1 focus:ring-accent outline-none font-mono text-slate-300"
                                    value={apiEndpoint}
                                    onChange={(e) => setApiEndpoint(e.target.value)}
                                    placeholder="https://api.coindesk.com/v1/bpi/currentprice/BTC.json"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">API Key (Optional)</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:ring-1 focus:ring-accent outline-none font-mono text-slate-300"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">JSON Data Key (Dot Notation)</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:ring-1 focus:ring-accent outline-none font-mono text-slate-300"
                                    value={dataKey}
                                    onChange={(e) => setDataKey(e.target.value)}
                                    placeholder="e.g. bpi.USD.rate_float"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Refresh Interval (seconds)</label>
                            <input
                                type="number"
                                min="5"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-accent outline-none transition-all"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Data Format</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-accent outline-none transition-all"
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                            >
                                <option value="number">Number (1,234.56)</option>
                                <option value="currency-usd">Currency USD ($)</option>
                                <option value="currency-inr">Currency INR (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-800">
                    <button
                        type="submit"
                        form="add-widget-form"
                        className="w-full bg-gradient-to-r from-accent to-indigo-600 hover:from-indigo-500 hover:to-accent text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                    >
                        Add Widget
                    </button>
                </div>
            </div>
        </div>
    );
}
