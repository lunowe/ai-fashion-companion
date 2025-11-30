import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

// Icons
import { Shirt, Stars, Wand2, ListChecks, Settings, UserCircle, LogOut, Sun, Moon, Laptop, User } from "lucide-react";

// Components
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SettingsModal } from "@/components/SettingsModal";

// Dropdown Menu Imports
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

// --- Main App Component ---
export default function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppLayout />
        </ThemeProvider>
    );
}

// --- Internal Layout Component (Has access to Theme Context) ---
function AppLayout() {
    const { logout } = useAuth();
    const { setTheme } = useTheme(); // This now works because it's inside ThemeProvider

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState<"profile" | "settings" | null>(null);

    const openSettings = (tab: "profile" | "settings") => {
        setSettingsTab(tab);
        setSettingsOpen(true);
    };

    // Desktop Nav Link Style
    const desktopLinkCls = ({ isActive }: { isActive: boolean }) =>
        `flex px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`;

    // Mobile Bottom Nav Item Style
    const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`;

    return (
        <div className="flex flex-col min-h-dvh bg-background">
            {/* --- Header (Top Bar) --- */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center w-full h-14 px-4">
                    <div className="flex items-center mr-auto">
                        <Wand2 className="w-5 h-5 mr-2 text-primary" />
                        <span className="text-xl font-semibold tracking-tight">FitFlow</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4 mx-6">
                        <NavLink to="/clothing" className={desktopLinkCls}>
                            <Shirt className="w-4 h-4 mr-2" /> Clothes
                        </NavLink>
                        <NavLink to="/styles" className={desktopLinkCls}>
                            <Stars className="w-4 h-4 mr-2" /> Styles
                        </NavLink>
                        <NavLink to="/generate" className={desktopLinkCls}>
                            <Wand2 className="w-4 h-4 mr-2" /> Generator
                        </NavLink>
                        <NavLink to="/outfits" className={desktopLinkCls}>
                            <ListChecks className="w-4 h-4 mr-2" /> Outfits
                        </NavLink>
                    </nav>

                    {/* Right Side Actions (Desktop Only) */}
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserCircle className="w-6 h-6" />
                                        <span className="sr-only">Toggle user menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onClick={() => openSettings("profile")}>
                                        <User className="w-4 h-4 mr-2" />
                                        Profile & Style
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => openSettings("settings")}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings & Billing
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Sun className="text-muted-foreground w-4 h-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                            <Moon className="text-muted-foreground absolute w-4 h-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                            <span className="ml-2">Theme</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                                    <Sun className="w-4 h-4 mr-2" /> Light
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                                    <Moon className="w-4 h-4 mr-2" /> Dark
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                                    <Laptop className="w-4 h-4 mr-2" /> System
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => logout()}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="container flex-1 py-6 mx-auto pb-24 md:pb-6">
                <Outlet />
            </main>

            {/* --- Mobile Bottom Navigation --- */}
            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
                <div className="grid grid-cols-5 h-full">
                    <NavLink to="/clothing" className={mobileLinkCls}>
                        <Shirt className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Clothes</span>
                    </NavLink>

                    <NavLink to="/styles" className={mobileLinkCls}>
                        <Stars className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Styles</span>
                    </NavLink>

                    <NavLink to="/generate" className={mobileLinkCls}>
                        <Wand2 className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Create</span>
                    </NavLink>

                    <NavLink to="/outfits" className={mobileLinkCls}>
                        <ListChecks className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Outfits</span>
                    </NavLink>

                    <button
                        onClick={() => {
                            setSettingsTab(null);
                            setSettingsOpen(true);
                        }}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Settings</span>
                    </button>
                </div>
            </div>

            <Toaster />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} defaultTab={settingsTab} />
        </div>
    );
}
