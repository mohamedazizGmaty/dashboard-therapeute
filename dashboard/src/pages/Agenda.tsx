import React from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle } from 'lucide-react';

export default function Agenda() {
    const upcomingAppointments = [
        { id: '1', patient: 'Martin, Lucas', time: '09:00 - 09:45', type: 'Séance de suivi', status: 'Confirmé' },
        { id: '2', patient: 'Dubois, Sophie', time: '10:00 - 10:45', type: 'Bilan initial', status: 'Confirmé' },
        { id: '3', patient: 'Bernard, Elodie', time: '11:15 - 12:00', type: 'Séance de suivi', status: 'En attente' },
        { id: '4', patient: 'Gmaty, Mohamed Aziz', time: '14:30 - 15:15', type: 'Séance de suivi', status: 'Confirmé' },
        { id: '5', patient: 'Leroux, Antoine', time: '16:00 - 16:45', type: 'Renforcement', status: 'Annulé' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mon Agenda</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aperçu de la journée et prochains rendez-vous.</p>
                </div>

                {/* Quick Stats Dashboard */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard icon={<CalendarIcon size={24} />} title="Rendez-vous" value="8" subtitle="Aujourd'hui" color="blue" />
                    <StatCard icon={<Users size={24} />} title="Nouveaux" value="2" subtitle="Bilans initiaux" color="emerald" />
                    <StatCard icon={<CheckCircle size={24} />} title="Terminés" value="3" subtitle="Dans la journée" color="indigo" />
                    <StatCard icon={<Clock size={24} />} title="Prochain" value="14:30" subtitle="Mohamed Aziz" color="amber" />
                </section>

                {/* Upcoming Appointments List */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <CalendarIcon size={18} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Planning de la journée</h2>
                    </div>

                    <div className="space-y-4">
                        {upcomingAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50 transition-all group">
                                <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-100 dark:border-slate-800 pr-6">
                                    <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{appt.time.split(' - ')[0]}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{appt.time.split(' - ')[1]}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{appt.patient}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{appt.type}</p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${appt.status === 'Confirmé' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                        appt.status === 'En attente' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                            'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                        }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
