import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    return (
        <button
            onClick={toggle}
            title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 
                  hover:bg-gray-100 dark:hover:bg-gray-800 
                  border-gray-300 dark:border-gray-600 cursor-pointer ${className}`}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm">{isDark ? "Claro" : "Oscuro"}</span>
        </button>
    );
}
