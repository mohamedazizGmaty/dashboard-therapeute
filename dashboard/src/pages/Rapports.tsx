import { FileText, Download } from 'lucide-react';

export default function Rapports() {
    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center">

                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                    <FileText size={40} />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Rapports & Analyses</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg transition-colors duration-300">
                    Cette section abritera des analyses détaillées, des statistiques globales de votre cabinet et des options d'export PDF pour vos dossiers patients.
                </p>

                <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center gap-2 mt-4 transition-colors duration-300">
                    <Download size={18} />
                    Bientôt disponible
                </button>

            </div>
        </div>
    );
}
