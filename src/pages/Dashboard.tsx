import { Activity } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                    <Activity size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Tableau de bord principal</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg transition-colors duration-300">
                    Nouveau tableau de bord global en cours de construction. Veuillez me fournir la description du nouveau tableau de bord.
                </p>
            </div>
        </div>
    );
}
