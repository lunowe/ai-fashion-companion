import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ChevronRight, Calendar, Cloud, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Optional: npm install date-fns
import type { HistoryEntry } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GenerationHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    onRestore: (entry: HistoryEntry) => void;
}

export default function GenerationHistory({ isOpen, onClose, history, onRestore }: GenerationHistoryProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-lg">Recent Looks</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-60">
                                    <Clock className="w-12 h-12" />
                                    <p>No recent history found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((entry, idx) => {
                                        const rawDate = entry.generated_at;
                                        const dateString =
                                            rawDate.endsWith("Z") || rawDate.includes("+") ? rawDate : `${rawDate}Z`;

                                        const dateObj = new Date(dateString);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => onRestore(entry)}
                                                className="group cursor-pointer border rounded-xl p-4 hover:border-primary/50 hover:bg-muted/30 transition-all active:scale-95"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {formatDistanceToNow(dateObj, { addSuffix: true })}
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-primary/10 text-primary hover:bg-primary/20"
                                                    >
                                                        {entry.outfits.length} Outfits
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                                    {entry.request_details.style_name && (
                                                        <p className="font-medium text-foreground">
                                                            Style: {entry.request_details.style_name}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-3 text-xs">
                                                        {entry.request_details.occasion && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />{" "}
                                                                {entry.request_details.occasion}
                                                            </span>
                                                        )}
                                                        {entry.request_details.weather && (
                                                            <span className="flex items-center gap-1">
                                                                <Cloud className="w-3 h-3" />{" "}
                                                                {entry.request_details.weather}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entry.request_details.description && (
                                                        <p className="italic text-xs pt-1 truncate">
                                                            "{entry.request_details.description}"
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <RefreshCw className="w-3 h-3 mr-1" /> Restore these looks
                                                    <ChevronRight className="w-3 h-3 ml-auto" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
