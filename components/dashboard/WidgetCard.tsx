'use client';

import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, RefreshCw, GripVertical, Settings, Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { fetchWidgetData } from '@/lib/api';
import { WidgetTable } from './WidgetTable';
import { EditWidgetModal } from './EditWidgetModal';
import { SummaryWidget } from './widgets/SummaryWidget';
import dynamic from 'next/dynamic';

// Lazy load the heavy chart component
const ChartWidget = dynamic(() => import('./widgets/ChartWidget'), {
    loading: () => <div className="w-full h-[250px] animate-pulse bg-muted/20 rounded-xl" />,
    ssr: false
});

interface WidgetCardProps {
    widget: Widget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
    const { removeWidget } = useDashboardStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: widget.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const loadData = async () => {
        if (!widget.apiEndpoint) {
            // Mock data simulation
            if (widget.type === 'chart') {
                setData(undefined);
            } else {
                setData({ value: (Math.random() * 10000 + 30000) });
            }
            return;
        }
        setLoading(true);
        const result = await fetchWidgetData(widget.apiEndpoint);
        if (result) {
            setData(result);
            setError(false);
        } else {
            setError(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, widget.refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [widget.apiEndpoint, widget.refreshInterval]); // eslint-disable-line

    const renderContent = (fullScreen = false) => {
        if (loading && !data) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading data...</div>;
        if (error) return <div className="text-destructive text-sm p-4">Failed to load data</div>;

        switch (widget.type) {
            case 'summary':
                return <SummaryWidget data={data} widget={widget} />;
            case 'chart':
                // Pass className to override height in fullscreen
                return <ChartWidget data={data} className={fullScreen ? "h-full min-h-[500px]" : undefined} />;
            case 'list':
                return <WidgetTable />;
            default:
                return null;
        }
    };

    const FullScreenView = () => {
        if (!mounted || !isFullScreen) return null;

        // Use a portal to render outside the grid container to avoid transform issues
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
                <div className="w-full h-full max-w-7xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{widget.title}</h2>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                                {widget.type}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-slate-500 mr-4">
                                Auto-refresh: {widget.refreshInterval}s
                            </div>
                            <button onClick={loadData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Refresh">
                                <RefreshCw size={20} />
                            </button>
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                                title="Close Full Screen"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-hidden relative w-full h-full">
                        {renderContent(true)}
                    </div>
                </div>
            </div>
        );
    };

    // Helper using createPortal
    const Portal = ({ children }: { children: React.ReactNode }) => {
        if (typeof document === 'undefined') return null;
        return document.body ? (
            // @ts-ignore - React Portal type definition sometimes varies in environments
            require('react-dom').createPortal(children, document.body)
        ) : null;
    };

    return (
        <>
            {isFullScreen && <Portal><FullScreenView /></Portal>}

            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative p-6 rounded-2xl glass-card text-card-foreground shadow-sm group min-h-[200px] flex flex-col transition-all duration-300",
                    isDragging && "opacity-50 ring-2 ring-accent scale-105 z-50",
                    !isDragging && "hover:border-slate-600"
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 hover:bg-slate-700/50 rounded transition-colors">
                            <GripVertical size={16} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-sm tracking-wide">{widget.title}</h3>
                            <span className="text-[10px] text-muted-foreground uppercase">{widget.type}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-[10px] text-slate-500 mr-2">{widget.refreshInterval}s</div>
                        <button onClick={loadData} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-white" title="Refresh"><RefreshCw size={14} /></button>
                        <button onClick={() => setIsFullScreen(true)} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-white" title="Full Screen"><Maximize2 size={14} /></button>
                        <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-white" title="Edit"><Settings size={14} /></button>
                        <button onClick={() => removeWidget(widget.id)} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors text-slate-400" title="Remove"><X size={14} /></button>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    {renderContent(false)}
                </div>
            </div>
            <EditWidgetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} widget={widget} />
        </>
    );
}
