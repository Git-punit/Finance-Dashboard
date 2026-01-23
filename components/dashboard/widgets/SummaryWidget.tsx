import { Widget } from '@/store/useDashboardStore';

interface SummaryWidgetProps {
    data: any;
    widget: Widget;
}

export function SummaryWidget({ data, widget }: SummaryWidgetProps) {
    let displayValue: string | number = '---';

    // Extract deep value if needed
    if (data) {
        if (widget.dataKey) {
            // Simple dot notation traversal
            const keys = widget.dataKey.split('.');
            let value = data;
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            displayValue = value !== undefined ? value : 'N/A';
        } else if (data.value) {
            displayValue = data.value;
        }
    }

    // Robust number parsing & formatting
    let formatted = displayValue;
    const parsed = parseFloat(String(displayValue));

    if (!isNaN(parsed) && typeof displayValue !== 'boolean') {
        const formatType = widget.format || 'number';

        if (formatType === 'currency-usd') {
            formatted = parsed.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        } else if (formatType === 'currency-inr') {
            formatted = parsed.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
        } else if (formatType === 'percentage') {
            formatted = parsed.toFixed(2) + '%';
        } else {
            formatted = parsed.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <span
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 truncate max-w-full px-2"
                title={String(displayValue)}
            >
                {formatted}
            </span>
            <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                {widget.symbol} Price
            </span>
        </div>
    );
}
