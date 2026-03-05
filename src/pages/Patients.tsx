import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, FileText, Activity, Loader2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

interface Patient {
    id: string;
    name: string;
    age: number;
    last_session: string;
    status: string;
    avatar: string;
}

export default function Patients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Patient Form State
    const [newName, setNewName] = useState('');
    const [newAge, setNewAge] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('name');

            if (error) throw error;
            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newAge) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utilisateur non authentifié');

            const { error } = await supabase
                .from('patients')
                .insert([{
                    name: newName,
                    age: parseInt(newAge),
                    status: 'Nouveau',
                    avatar: '0ea5e9', // default avatar color
                    last_session: new Date().toISOString(),
                    user_id: user.id
                }])
                .select();

            if (error) throw error;

            // Refresh list and close modal
            fetchPatients();
            setIsAddModalOpen(false);
            setNewName('');
            setNewAge('');
        } catch (error) {
            console.error('Error adding patient: ', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(p =>
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
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
                    >
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

                    <div className="overflow-x-auto">
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 size={32} className="text-blue-500 animate-spin" />
                                                <p className="text-slate-500 font-medium">Chargement des patients...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPatients.length > 0 ? (
                                    filteredPatients.map(patient => (
                                        <tr
                                            key={patient.id}
                                            onClick={() => navigate(`/patients/${patient.id}`)}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=${patient.avatar || '0D8ABC'}&color=fff`} alt={patient.name} />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{patient.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{patient.age} ans</td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                                                {format(new Date(patient.last_session), 'dd MMMM yyyy', { locale: fr })}
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                            Aucun patient trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Patient Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95">
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Nouveau Patient</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Création de dossier</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                                    >
                                        <PlusCircle size={20} className="rotate-45" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddPatient} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Nom Complet</label>
                                        <input
                                            type="text"
                                            required
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Ex: Dupont, Jean"
                                            className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Âge</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newAge}
                                            onChange={(e) => setNewAge(e.target.value)}
                                            placeholder="Ex: 45"
                                            className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Création en cours...
                                            </>
                                        ) : (
                                            'Créer le dossier patient'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

