'use client';

import { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for the table - in a real app this would come from the API
const STOCK_DATA = [
    { company: 'Uti Silver Etf', price: 114.2, high: 114.73 },
    { company: 'Mirae Asset Mutual Fund Silver Etf', price: 114.92, high: 114.70 },
    { company: 'Sbi Fix Sr54 1842 D Reg Idcw Cf', price: 16.03, high: 16.22 },
    { company: 'Hdfc Gold Etf', price: 87.00, high: 88.21 },
    { company: 'Absl Fmurrn', price: 110.16, high: 110.16 },
    { company: 'Motilal Oswal Midcap 100 Etf', price: 60.32, high: 22.00 },
];

export function WidgetTable() {
    const [search, setSearch] = useState('');

    const filteredData = STOCK_DATA.filter(item =>
        item.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full flex flex-col h-full min-h-[300px]">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                    placeholder="Search table..."
                    className="w-full pl-9 pr-4 py-2 bg-secondary/50 rounded-lg text-sm border border-border focus:ring-1 focus:ring-primary outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                            <th className="font-medium p-2 pl-0 w-[50%]">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                                    company <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="font-medium p-2 text-right">
                                <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-foreground">
                                    price <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="font-medium p-2 text-right pr-0">
                                <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-foreground">
                                    52_week_high <ArrowUpDown size={12} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {filteredData.map((item, i) => (
                            <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                <td className="p-3 pl-0 font-medium text-foreground">{item.company}</td>
                                <td className="p-3 text-right text-muted-foreground font-mono">{item.price}</td>
                                <td className="p-3 pr-0 text-right text-muted-foreground font-mono">{item.high}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredData.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
                )}
            </div>

            <div className="mt-auto pt-4 flex justify-between items-center text-xs text-muted-foreground border-t border-border/30">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <span>{filteredData.length} items</span>
            </div>
        </div>
    );
}
