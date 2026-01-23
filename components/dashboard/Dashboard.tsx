'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { useDashboardStore } from '@/store/useDashboardStore';
import { WidgetCard } from './WidgetCard';
import { AddWidgetModal } from './AddWidgetModal';
import { useState, useEffect } from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const { widgets, setWidgets } = useDashboardStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = widgets.findIndex((w) => w.id === active.id);
            const newIndex = widgets.findIndex((w) => w.id === over.id);
            setWidgets(arrayMove(widgets, oldIndex, newIndex));
        }
    }

    // Prevent hydration error by ensuring content is only rendered when mounted on client
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 transition-colors duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 max-w-7xl mx-auto gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
                            F
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Finance Dashboard</h1>
                    </div>
                    <p className="text-muted-foreground ml-1">Monitor your assets and markets in real-time</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(widgets));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href", dataStr);
                            downloadAnchorNode.setAttribute("download", "dashboard_config.json");
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                        }}
                        className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border text-sm font-medium px-4 hidden sm:block"
                        title="Export Config"
                    >
                        Export
                    </button>
                    <label className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border text-sm font-medium px-4 cursor-pointer hidden sm:block" title="Import Config">
                        Import
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    try {
                                        const imported = JSON.parse(event.target?.result as string);
                                        if (Array.isArray(imported)) {
                                            setWidgets(imported);
                                        }
                                    } catch (err) {
                                        console.error("Failed to parse config", err);
                                        alert("Invalid configuration file");
                                    }
                                };
                                reader.readAsText(file);
                            }}
                        />
                    </label>
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-2 bg-card text-card-foreground pl-4 pr-5 py-2.5 rounded-full font-medium transition-all border border-border hover:border-emerald-500/50 active:scale-95 shadow-sm"
                    >
                        <div className="bg-emerald-500 rounded-full p-1 text-white group-hover:scale-110 transition-transform">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                        <span>Add Widget</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={widgets.map(w => w.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                            {widgets.map((widget) => (
                                <WidgetCard key={widget.id} widget={widget} />
                            ))}

                            {widgets.length === 0 && (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/30 text-muted-foreground animate-in fade-in zoom-in duration-500">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                        <Plus size={32} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-xl font-medium mb-2 opacity-80">Your dashboard is empty</p>
                                    <p className="text-sm opacity-60 mb-6">Start by adding some widgets to track your favorite assets.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline underline-offset-4"
                                    >
                                        Create your first widget
                                    </button>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </main>

            <AddWidgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
