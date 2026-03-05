import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, Minus, ClipboardList, Loader2, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

export default function PatientDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newMotorScore, setNewMotorScore] = useState<string>('');
    const [newStressLevel, setNewStressLevel] = useState<string>('5');
    const [newDate, setNewDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [manualTrend, setManualTrend] = useState<string | null>(null);
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [exercises, setExercises] = useState([
        { id: '1', name: 'Flexion du genou', completed: true },
        { id: '2', name: 'Extension de la cheville', completed: false },
        { id: '3', name: 'Squats assistés', completed: false },
    ]);

    useEffect(() => {
        if (id) {
            fetchPatientData();
        }
    }, [id]);

    const fetchPatientData = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Patient Details
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (patientError) throw patientError;
            setPatient(patientData);

            // 2. Fetch Sessions with Motor Performance and Stress Levels
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('sessions')
                .select(`
                    id,
                    date,
                    motor_performance ( score ),
                    stress_levels ( score )
                `)
                .eq('patient_id', id)
                .order('date', { ascending: true });

            if (sessionsError) throw sessionsError;

            // 3. Format data for charts
            const formattedSessions = sessionsData?.map((s: any) => ({
                id: s.id,
                date: s.date,
                motorScore: s.motor_performance?.[0]?.score || 0,
                stressLevel: s.stress_levels?.[0]?.score || 0
            })) || [];

            setSessions(formattedSessions);
        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Logic for status indicators
    const latestSession = sessions[sessions.length - 1];
    const previousSession = sessions[sessions.length - 2];

    let calculatedTrend = 'Stagnation';
    if (latestSession && previousSession) {
        if (latestSession.motorScore > previousSession.motorScore + 2) calculatedTrend = 'Amélioration';
        else if (latestSession.motorScore < previousSession.motorScore - 2) calculatedTrend = 'Fatigue';
    }

    const activeTrend = manualTrend !== null ? manualTrend.toLowerCase() : calculatedTrend.toLowerCase();

    const handleTrendClick = (trend: string) => {
        if (manualTrend === trend) {
            setManualTrend(null);
        } else {
            setManualTrend(trend);
        }
    };

    const handleAddData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMotorScore || !newDate || !newStressLevel || !id) return;

        try {
            setIsSubmitting(true);

            // 1. Insert Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .insert([{ patient_id: id, date: newDate }])
                .select()
                .single();

            if (sessionError) throw sessionError;
            const sessionId = sessionData.id;

            // 2. Insert Motor Performance
            const { error: motorError } = await supabase
                .from('motor_performance')
                .insert([{ session_id: sessionId, score: Number(newMotorScore) }]);
            if (motorError) throw motorError;

            // 3. Insert Stress Level
            const { error: stressError } = await supabase
                .from('stress_levels')
                .insert([{ session_id: sessionId, score: Number(newStressLevel) }]);
            if (stressError) throw stressError;

            // 4. Determine new status
            let newStatus = patient?.status || 'Stagnation';
            if (latestSession) {
                const newScore = Number(newMotorScore);
                if (newScore > latestSession.motorScore + 2) newStatus = 'Amélioration';
                else if (newScore < latestSession.motorScore - 2) newStatus = 'Fatigue';
                else newStatus = 'Stagnation';
            }

            // 5. Update Patient Status and Last Session
            const { error: updateError } = await supabase
                .from('patients')
                .update({
                    status: newStatus,
                    last_session: newDate
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // Reset form and refetch
            setNewMotorScore('');
            setNewDate(format(new Date(), 'yyyy-MM-dd'));
            fetchPatientData();

        } catch (error) {
            console.error('Error adding session data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const chartData = sessions.map(s => ({
        ...s,
        formattedDate: format(parseISO(s.date), 'dd MMM', { locale: fr })
    }));

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Patient Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/patients')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{patient?.name || 'Dossier Patient'}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{patient?.age} ans • Suivi depuis {format(new Date(patient?.created_at || new Date()), 'MMM yyyy', { locale: fr })}</p>
                        </div>
                    </div>
                </div>

                {/* Overall Health Indicator */}
                <section>
                    <HealthIndicator score={latestSession ? latestSession.motorScore : 0} />
                </section>

                {/* Status Indicators */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard
                        title="Amélioration"
                        subtitle="Tendance Générale"
                        icon={<TrendingUp size={24} />}
                        active={activeTrend === 'amelioration'}
                        color="green"
                        onClick={() => handleTrendClick('amelioration')}
                    />
                    <StatusCard
                        title="Stagnation"
                        subtitle="Stabilisation des acquis"
                        icon={<Minus size={24} />}
                        active={activeTrend === 'stagnation'}
                        color="orange"
                        onClick={() => handleTrendClick('stagnation')}
                    />
                    <StatusCard
                        title="Fatigue"
                        subtitle="Baisse de performance"
                        icon={<TrendingDown size={24} />}
                        active={activeTrend === 'fatigue'}
                        color="red"
                        onClick={() => handleTrendClick('fatigue')}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Data Collection & Progression */}
                    <div className="space-y-8 flex flex-col">

                        {/* Data Collection Form */}
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                                    <PlusCircle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Nouvelle séance</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Collecte des données</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddData} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Date de la séance</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Score moteur (0-100)</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        placeholder="Ex: 65"
                                        value={newMotorScore}
                                        onChange={(e) => setNewMotorScore(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-end pl-1 pr-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Niveau de stress</label>
                                        <span className="text-lg font-black text-blue-500 leading-none">{newStressLevel}<span className="text-xs text-slate-400 ml-0.5">/10</span></span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="10"
                                        value={newStressLevel}
                                        onChange={(e) => setNewStressLevel(e.target.value)}
                                        className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                        <span>Détendu</span>
                                        <span>Très stressé</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group/btn relative w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Enregistrer la séance'}
                                </button>
                            </form>
                        </div>

                        {/* Session Progression */}
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex-1 min-h-[400px]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shadow-inner">
                                    <ClipboardList size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Historique</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Progression récente</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[...sessions].reverse().slice(0, 5).map((session) => (
                                    <div key={session.id} className="group/row flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {format(parseISO(session.date), 'dd MMMM', { locale: fr })}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {format(parseISO(session.date), 'yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-lg font-black text-slate-800 dark:text-white leading-none">{session.motorScore}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-transform group-hover/row:scale-110 shadow-sm" style={{
                                                backgroundColor: session.stressLevel <= 3 ? 'rgba(16, 185, 129, 0.1)' : session.stressLevel <= 6 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                color: session.stressLevel <= 3 ? '#10b981' : session.stressLevel <= 6 ? '#f59e0b' : '#f43f5e',
                                            }}>
                                                {session.stressLevel}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Visualizations */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col">

                        {/* Motor Performance Chart */}
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Performances motrices</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Évolution du score sur les 5 dernières séances</p>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest leading-none">
                                    En hausse
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMotor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            dy={15}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            domain={[0, 'dataMax + 15']}
                                        />
                                        <Tooltip content={<CustomTooltip unit="pts" />} />
                                        <Line
                                            type="monotone"
                                            dataKey="motorScore"
                                            stroke="#3b82f6"
                                            strokeWidth={4}
                                            dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#3b82f6' }}
                                            activeDot={{ r: 8, strokeWidth: 0, fill: '#1d4ed8' }}
                                            animationDuration={2000}
                                            animationEasing="ease-in-out"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Stress Level Chart */}
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex-1 min-h-[350px] overflow-hidden">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Niveau de stress perçu</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Évaluation subjective patient (0-10)</p>
                            </div>
                            <div className="h-[250px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            dy={15}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            domain={[0, 10]}
                                            ticks={[0, 5, 10]}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'currentColor', opacity: 0.05, radius: 12 }}
                                            content={<CustomTooltip unit="/ 10" colorHex="#8b5cf6" />}
                                        />
                                        <Bar
                                            dataKey="stressLevel"
                                            fill="url(#barGradient)"
                                            radius={[12, 12, 4, 4]}
                                            animationDuration={2000}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Exercise Tracker FAB */}
                <button
                    onClick={() => setIsExerciseModalOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-300 group z-40"
                    title="Suivi des exercices"
                >
                    <PlusCircle size={32} strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black group-hover:animate-bounce">
                        {exercises.filter(e => !e.completed).length}
                    </div>
                </button>

                {/* Exercise Tracker Modal */}
                <ExerciseTrackerModal
                    isOpen={isExerciseModalOpen}
                    onClose={() => setIsExerciseModalOpen(false)}
                    exercises={exercises}
                    setExercises={setExercises}
                />

            </div>
        </div>
    );
}

// --- Subcomponents ---
// --- Subcomponents ---
function HealthIndicator({ score }: { score: number }) {
    const [animatedScore, setAnimatedScore] = React.useState(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);
        return () => clearTimeout(timer);
    }, [score]);

    const width = 280;
    const height = 160;
    const strokeWidth = 22;
    const centerX = width / 2;
    const centerY = height - 10;
    const radius = 100;
    const circum = radius * Math.PI;
    const offset = circum - (animatedScore / 100) * circum;

    // Determine color based on score
    const getColor = (s: number) => {
        if (s < 40) return '#f43f5e'; // rose-500
        if (s < 70) return '#fbbf24'; // amber-400
        return '#10b981'; // emerald-500
    };

    const currentColor = getColor(score);

    return (
        <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:-translate-y-1 overflow-hidden">
            {/* Decorative background glow */}
            <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-10 transition-colors duration-1000"
                style={{ backgroundColor: currentColor }}
            />

            <div className="relative flex flex-col md:flex-row items-center gap-10">
                <div className="relative" style={{ width, height }}>
                    <svg width={width} height={height} className="overflow-visible">
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={currentColor} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={currentColor} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {/* Background track */}
                        <path
                            d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`}
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-100 dark:text-slate-800/50"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
                        {/* Progress Fill */}
                        <path
                            d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`}
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circum}
                            strokeDashoffset={offset}
                            style={{ filter: 'url(#glow)' }}
                            className="transition-all duration-[1500] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        />
                        {/* Indicator Dot */}
                        {animatedScore > 0 && (
                            <circle
                                cx={centerX - radius * Math.cos((animatedScore / 100) * Math.PI)}
                                cy={centerY - radius * Math.sin((animatedScore / 100) * Math.PI)}
                                r="6"
                                fill="white"
                                className="transition-all duration-[1500] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}
                            />
                        )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none transition-all duration-300 group-hover:scale-110 origin-bottom">
                                {animatedScore}
                            </span>
                            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">État de santé global</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Patient Recovery Score</p>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-slate-100 via-slate-100 to-transparent dark:from-slate-800 dark:via-slate-800" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tendance</span>
                            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                                <TrendingUp size={14} />
                                <span>+12 pts</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objectif</span>
                            <div className="text-slate-700 dark:text-slate-300 font-bold text-sm">
                                85%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExerciseTrackerModal({ isOpen, onClose, exercises, setExercises }: {
    isOpen: boolean;
    onClose: () => void;
    exercises: any[];
    setExercises: (ex: any[]) => void;
}) {
    const [newExercise, setNewExercise] = useState('');

    if (!isOpen) return null;

    const toggleExercise = (id: string) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    };

    const addExercise = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExercise.trim()) return;
        setExercises([...exercises, { id: Math.random().toString(), name: newExercise, completed: false }]);
        setNewExercise('');
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Exercices</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Programme de rééducation</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                        >
                            <PlusCircle size={20} className="rotate-45" />
                        </button>
                    </div>

                    {/* Exericse List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
                        {exercises.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-medium">Aucun exercice programmé</p>
                            </div>
                        )}
                        {exercises.map((ex) => (
                            <div key={ex.id} className="group/item flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-blue-500/20 transition-all duration-300">
                                <button
                                    onClick={() => toggleExercise(ex.id)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${ex.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500'}`}
                                >
                                    {ex.completed && <PlusCircle size={14} fill="currentColor" className="rotate-0" />}
                                </button>
                                <span className={`flex-1 font-bold text-sm transition-all duration-300 ${ex.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {ex.name}
                                </span>
                                <button
                                    onClick={() => removeExercise(ex.id)}
                                    className="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 transition-all duration-300"
                                >
                                    <PlusCircle size={16} className="rotate-45" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Exercise Form */}
                    <form onSubmit={addExercise} className="relative">
                        <input
                            type="text"
                            placeholder="Ajouter un exercice..."
                            value={newExercise}
                            onChange={(e) => setNewExercise(e.target.value)}
                            className="w-full pl-5 pr-14 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/20"
                        >
                            <PlusCircle size={20} strokeWidth={2.5} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ title, subtitle, icon, active, color, onClick }: {
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    active: boolean,
    color: 'green' | 'orange' | 'red',
    onClick?: () => void
}) {
    const colorMap = {
        green: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            border: 'border-emerald-500/20',
            glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]',
            indicator: 'bg-emerald-500'
        },
        orange: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            border: 'border-amber-500/20',
            glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]',
            indicator: 'bg-amber-500'
        },
        red: {
            bg: 'bg-rose-500/10',
            text: 'text-rose-500',
            border: 'border-rose-500/20',
            glow: 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.2)]',
            indicator: 'bg-rose-500'
        }
    };

    const scheme = colorMap[color];

    return (
        <button
            onClick={onClick}
            className={`
                group relative w-full text-left p-6 rounded-[2rem] border transition-all duration-500 ease-out flex items-center gap-5 cursor-pointer overflow-hidden
                ${active
                    ? `bg-white dark:bg-slate-900 ${scheme.border} ${scheme.glow} scale-[1.03] -translate-y-1`
                    : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-transparent opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:bg-white/80 dark:hover:bg-slate-900/80'
                }
            `}
        >
            {/* Background Accent */}
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${scheme.bg}`} />

            <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
                ${active ? `${scheme.bg} ${scheme.text} scale-110` : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                group-hover:rotate-[10deg]
            `}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 28, strokeWidth: 2.5 })}
            </div>

            <div className="flex-1">
                <h3 className={`font-bold text-xl leading-tight transition-colors duration-500 ${active ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {title}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">{subtitle}</p>
            </div>

            {active && (
                <div className="absolute top-4 right-4 flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${scheme.indicator} animate-ping`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${scheme.indicator}`} />
                </div>
            )}
        </button>
    );
}

const CustomTooltip = ({ active, payload, label, unit, colorHex }: any) => {
    if (active && payload && payload.length) {
        const defaultColor = colorHex || payload[0].stroke || payload[0].fill || '#2563eb';
        return (
            <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 dark:border-slate-200 pointer-events-none transition-colors duration-300">
                <p className="font-medium text-xs text-slate-300 dark:text-slate-500 mb-1">{label}</p>
                <p className="font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: defaultColor }}></span>
                    {payload[0].value} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">{unit}</span>
                </p>
            </div>
        );
    }
    return null;
};
