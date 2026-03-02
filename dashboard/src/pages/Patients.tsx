import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, FileText, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const MOCK_PATIENTS = [
    { id: '1', name: 'Gmaty, Mohamed Aziz', age: 34, lastSession: new Date().toISOString(), status: 'Amélioration', avatar: '0D8ABC' },
    { id: '2', name: 'Dubois, Sophie', age: 42, lastSession: subDays(new Date(), 2).toISOString(), status: 'Stagnation', avatar: '10B981' },
    { id: '3', name: 'Martin, Lucas', age: 28, lastSession: subDays(new Date(), 5).toISOString(), status: 'Amélioration', avatar: 'F59E0B' },
    { id: '4', name: 'Bernard, Elodie', age: 55, lastSession: subDays(new Date(), 7).toISOString(), status: 'Fatigue', avatar: 'EF4444' },
];

export default function Patients() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredPatients = MOCK_PATIENTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mes Patients</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez votre liste de patients et consultez leurs dossiers.</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                        + Nouveau Patient
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-300">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Patient</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Âge</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Dernière Séance</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Statut Récent</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                            {filteredPatients.map(patient => (
                                <tr
                                    key={patient.id}
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=${patient.avatar}&color=fff`} alt={patient.name} />
                                            </div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-100">{patient.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{patient.age} ans</td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                                        {format(new Date(patient.lastSession), 'dd MMMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${patient.status === 'Amélioration' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                            patient.status === 'Stagnation' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                                'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}
                                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Dossier Patient">
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}
                                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Tableau de bord">
                                                <Activity size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPatients.length === 0 && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">

                            Aucun patient trouvé correspondant à votre recherche.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
