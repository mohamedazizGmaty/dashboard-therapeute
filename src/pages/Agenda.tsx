import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, PlusCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

interface AppointmentType {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    type: string;
    status: string;
    patient_id: string;
    patients: { name: string } | { name: string }[];
}

export default function Agenda() {
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newStartTime, setNewStartTime] = useState('09:00');
    const [newEndTime, setNewEndTime] = useState('09:45');
    const [newType, setNewType] = useState('Séance de suivi');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch Patients for the dropdown
            const { data: patientsData, error: patientsError } = await supabase
                .from('patients')
                .select('id, name')
                .order('name');
            if (patientsError) throw patientsError;
            setPatients(patientsData || []);

            // Fetch upcoming appointments
            const today = format(new Date(), 'yyyy-MM-dd');
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select(`
                    id, date, start_time, end_time, type, status, patient_id,
                    patients (name)
                `)
                .gte('date', today)
                .order('date')
                .order('start_time');

            if (appointmentsError) throw appointmentsError;
            setAppointments(appointmentsData || []);

        } catch (error) {
            console.error('Error fetching agenda data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId || !newDate || !newStartTime || !newEndTime) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utilisateur non authentifié');

            const { error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: selectedPatientId,
                    date: newDate,
                    start_time: newStartTime,
                    end_time: newEndTime,
                    type: newType,
                    status: 'Prévu',
                    user_id: user.id
                }]);

            if (error) throw error;

            // Refresh and close
            fetchData();
            setIsAddModalOpen(false);

        } catch (error) {
            console.error('Error creating appointment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate dynamic stats based on today's appointments
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todaysAppointments = appointments.filter(a => a.date === todayStr);
    const completedCount = todaysAppointments.filter(a => a.status.toLowerCase() === 'terminé').length;
    const initialBilansCount = todaysAppointments.filter(a => a.type.toLowerCase() === 'bilan initial').length;

    // Find next appointment
    const nowTime = format(new Date(), 'HH:mm:ss');
    const nextAppt = todaysAppointments.find(a => a.start_time >= nowTime && a.status !== 'Annulé');

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mon Agenda</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aperçu de la journée et prochains rendez-vous.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Nouveau Rendez-vous
                    </button>
                </div>

                {/* Quick Stats Dashboard */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard icon={<CalendarIcon size={24} />} title="Rendez-vous" value={todaysAppointments.length.toString()} subtitle="Aujourd'hui" color="blue" />
                    <StatCard icon={<Users size={24} />} title="Nouveaux" value={initialBilansCount.toString()} subtitle="Bilans initiaux" color="emerald" />
                    <StatCard icon={<CheckCircle size={24} />} title="Terminés" value={completedCount.toString()} subtitle="Dans la journée" color="indigo" />
                    <StatCard
                        icon={<Clock size={24} />}
                        title="Prochain"
                        value={nextAppt ? nextAppt.start_time.substring(0, 5) : '--:--'}
                        subtitle={nextAppt ? (Array.isArray(nextAppt.patients) ? nextAppt.patients[0]?.name : nextAppt.patients?.name) || 'Aucun' : 'Aucun'}
                        color="amber"
                    />
                </section>

                {/* Upcoming Appointments List */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <CalendarIcon size={18} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Planning à venir</h2>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Aucun rendez-vous prévu. Pensez à en ajouter !
                            </div>
                        ) : (
                            appointments.map(appt => (
                                <div key={appt.id} className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all group">
                                    <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-200 dark:border-slate-700 pr-6">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                                            {format(parseISO(appt.date), 'dd MMM', { locale: fr })}
                                        </span>
                                        <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{appt.start_time.substring(0, 5)}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{appt.end_time.substring(0, 5)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {Array.isArray(appt.patients) ? appt.patients[0]?.name : appt.patients?.name || 'Inconnu'}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{appt.type}</p>
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${appt.status === 'Prévu' || appt.status === 'Confirmé' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                            appt.status === 'Terminé' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                                                'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add Appointment Modal */}
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
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Planifier un rdv</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mon Agenda</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                                    >
                                        <PlusCircle size={20} className="rotate-45" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddAppointment} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Patient</label>
                                        <select
                                            required
                                            value={selectedPatientId}
                                            onChange={(e) => setSelectedPatientId(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium appearance-none"
                                        >
                                            <option value="" disabled>Sélectionner un patient...</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Début</label>
                                            <input
                                                type="time"
                                                required
                                                value={newStartTime}
                                                onChange={(e) => setNewStartTime(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Fin</label>
                                            <input
                                                type="time"
                                                required
                                                value={newEndTime}
                                                onChange={(e) => setNewEndTime(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Type de séance</label>
                                        <select
                                            required
                                            value={newType}
                                            onChange={(e) => setNewType(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium appearance-none"
                                        >
                                            <option value="Séance de suivi">Séance de suivi</option>
                                            <option value="Bilan initial">Bilan initial</option>
                                            <option value="Renforcement">Renforcement</option>
                                            <option value="Thérapie manuelle">Thérapie manuelle</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            'Planifier'
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

function StatCard({ icon, title, value, subtitle, color }: { icon: React.ReactNode, title: string, value: string, subtitle: string, color: 'blue' | 'emerald' | 'indigo' | 'amber' }) {
    const colorMap = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    };
    const scheme = colorMap[color];

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5 transition-colors duration-300">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${scheme.bg} ${scheme.text} transition-colors`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">{value}</h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
            </div>
        </div>
    );
}
