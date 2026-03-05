import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, AlertCircle, Bell, ChevronRight, Loader2 } from 'lucide-react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 0,
        newThisWeek: 0,
        sessionsToday: 0,
        recoveryRate: 0,
        fatigueAlerts: 0,
        nextAppointment: null as any
    });
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const today = format(new Date(), 'yyyy-MM-dd');
            const nowTime = format(new Date(), 'HH:mm:ss');
            const startOfCurrentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

            // 1. Fetch Patients Stats
            const { data: patients, error: patientsError } = await supabase
                .from('patients')
                .select('id, status, created_at');
            if (patientsError) throw patientsError;

            const totalPatients = patients?.length || 0;
            const newThisWeek = patients?.filter(p => p.created_at >= startOfCurrentWeek).length || 0;
            const fatigueAlerts = patients?.filter(p => p.status.toLowerCase() === 'fatigue').length || 0;

            const improvingCount = patients?.filter(p => p.status.toLowerCase() === 'amélioration').length || 0;
            const recoveryRate = totalPatients > 0 ? Math.round((improvingCount / totalPatients) * 100) : 0;

            // 2. Fetch Today's Appointments
            const { data: todaysAppts, error: apptsError } = await supabase
                .from('appointments')
                .select(`id, start_time, end_time, status, type, patient_id, patients (name)`)
                .eq('date', today)
                .order('start_time');
            if (apptsError) throw apptsError;

            const sessionsToday = todaysAppts?.length || 0;
            const nextAppointment = todaysAppts?.find(a => a.start_time >= nowTime && a.status !== 'Annulé') || null;

            // 3. Fetch Month's Appointments for Calendar
            const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
            const endOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');

            const { data: monthAppts, error: monthError } = await supabase
                .from('appointments')
                .select('id, date, status')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);
            if (monthError) throw monthError;

            setAppointments(monthAppts || []);
            setStats({
                totalPatients,
                newThisWeek,
                sessionsToday,
                recoveryRate,
                fatigueAlerts,
                nextAppointment
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 custom-scrollbar pb-12 transition-colors duration-500">
            <div className="max-w-7xl mx-auto p-8 space-y-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-200 dark:border-blue-500/20 shadow-sm">Cabinet Actif</span>
                            <span className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{format(new Date(), 'EEEE d MMMM, yyyy', { locale: fr })}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
                            Synapsia <span className="text-blue-600 dark:text-blue-500">Physio</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg">
                            Suivi patient de précision et optimisation thérapeutique.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm relative group">
                            <Bell size={22} className="group-hover:scale-110 transition-transform" />
                            {stats.fatigueAlerts > 0 && (
                                <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                            )}
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
                        <button
                            onClick={() => navigate('/patients')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 dark:bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-300 shadow-xl shadow-blue-600/20 dark:shadow-blue-500/10">
                            <Users size={18} />
                            <span>Accéder aux Patients</span>
                        </button>
                    </div>
                </header>

                {/* Main Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Patients Actifs"
                        value={stats.totalPatients.toString()}
                        subtitle={`+${stats.newThisWeek} nouveaux cette semaine`}
                        icon={<Users size={24} />}
                        trend={stats.newThisWeek > 0 ? `+ ${stats.newThisWeek}` : undefined}
                        color="blue"
                    />
                    <StatCard
                        title="Séances Aujourd'hui"
                        value={stats.sessionsToday.toString()}
                        subtitle={stats.nextAppointment ? `Prochaine à ${stats.nextAppointment.start_time.substring(0, 5)}` : 'Aucune session à venir'}
                        icon={<Calendar size={24} />}
                        color="indigo"
                    />
                    <StatCard
                        title="Taux de Récupération"
                        value={`${stats.recoveryRate}%`}
                        subtitle="Patients en amélioration"
                        icon={<Activity size={24} />}
                        color="amber"
                    />
                    <StatCard
                        title="Alertes Fatigue"
                        value={stats.fatigueAlerts.toString()}
                        subtitle="Nécessite révision"
                        icon={<AlertCircle size={24} />}
                        color="rose"
                        isTextValue
                    />
                </div>

                {/* Session Planning Section */}
                <div className="space-y-8 bg-white/70 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/20">
                    <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800/50 pb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Planning des Séances</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Organisation Thérapeutique</p>
                        </div>
                        <button
                            onClick={() => navigate('/agenda')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-slate-950 transition-all duration-300 shadow-sm"
                        >
                            Planning Complet <ChevronRight size={14} />
                        </button>
                    </div>

                    <PremiumCalendar appointments={appointments} />
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, trend, color, isTextValue }: any) {
    const colorStyles: any = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
    };

    return (
        <div className="bg-white/90 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-7 rounded-[2.2rem] space-y-5 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 hover:-translate-y-1 transition-all duration-500 group shadow-lg shadow-slate-200/40 dark:shadow-black/10">
            <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 border ${colorStyles[color]}`}>
                    {React.cloneElement(icon, { strokeWidth: 2.5 })}
                </div>
                {trend && (
                    <div className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center gap-1.5 shadow-sm border border-blue-100 dark:border-blue-500/20">
                        <Activity size={12} className="rotate-45" /> {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest pt-1">{title}</p>
                <h3 className={`font-black tracking-tight uppercase leading-none ${isTextValue ? 'text-3xl' : 'text-4xl'} text-slate-900 dark:text-white`}>
                    {value}
                </h3>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold">{subtitle}</p>
            </div>
        </div>
    );
}

function PremiumCalendar({ appointments }: { appointments: any[] }) {
    const today = new Date();
    const currentMonthStr = format(today, 'MMMM yyyy', { locale: fr });
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); // 0 is Sunday

    // Adjust so Monday is the first day (offset calculation)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Map appointments to days
    const appointmentsByDay = appointments.reduce((acc, appt) => {
        const day = parseInt(format(parseISO(appt.date), 'd'), 10);
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const currentDay = today.getDate();

    return (
        <div className="w-full space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none capitalize">
                        {currentMonthStr.split(' ')[0]} <span className="text-slate-300 dark:text-slate-700">{currentMonthStr.split(' ')[1]}</span>
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Gestion du planning clinique.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button className="px-4 py-2 rounded-lg text-[10px] font-black bg-blue-600 text-white uppercase tracking-widest shadow-lg shadow-blue-500/20">Cabinet</button>
                        <button className="px-4 py-2 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Domicile</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-6 sm:gap-y-8 text-center bg-slate-100/30 dark:bg-slate-800/20 p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                {dayNames.map(day => (
                    <div key={day} className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{day}</div>
                ))}

                {/* Empty slots for days before the 1st of the month */}
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-12 sm:h-16" />
                ))}

                {days.map(day => {
                    const hasAppointments = appointmentsByDay[day] > 0;
                    const isToday = day === currentDay;

                    return (
                        <div
                            key={day}
                            className={`
                                h-12 sm:h-16 flex flex-col items-center justify-center text-sm font-black transition-all cursor-pointer group relative
                            `}
                        >
                            {hasAppointments && !isToday && (
                                <div className="absolute top-0 right-1/4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                            )}
                            <span className={`
                                w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl transition-all duration-300
                                ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110' :
                                    hasAppointments ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20' :
                                        'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 group-hover:text-slate-800 dark:group-hover:text-white'}
                            `}>
                                {day < 10 ? `0${day}` : day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
