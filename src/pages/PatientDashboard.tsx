import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, Minus, ClipboardList } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- Mock Data ---
const initialSessions = [
    { id: '1', date: '2026-02-01', motorScore: 45, stressLevel: 8 },
    { id: '2', date: '2026-02-05', motorScore: 50, stressLevel: 7 },
    { id: '3', date: '2026-02-12', motorScore: 52, stressLevel: 5 },
    { id: '4', date: '2026-02-19', motorScore: 58, stressLevel: 4 },
    { id: '5', date: '2026-02-26', motorScore: 65, stressLevel: 3 },
];

export default function PatientDashboard() {
    useParams();
    const [sessions, setSessions] = useState(initialSessions);
    const [newMotorScore, setNewMotorScore] = useState<string>('');
    const [newStressLevel, setNewStressLevel] = useState<string>('5');
    const [newDate, setNewDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [manualTrend, setManualTrend] = useState<string | null>(null);

    // Logic for status indicators
    const latestSession = sessions[sessions.length - 1];
    const previousSession = sessions[sessions.length - 2];

    let calculatedTrend = 'stagnation';
    if (latestSession && previousSession) {
        if (latestSession.motorScore > previousSession.motorScore + 2) calculatedTrend = 'amelioration';
        else if (latestSession.motorScore < previousSession.motorScore - 2) calculatedTrend = 'fatigue';
    }

    const activeTrend = manualTrend !== null ? manualTrend : calculatedTrend;

    const handleTrendClick = (trend: string) => {
        if (manualTrend === trend) {
            setManualTrend(null);
        } else {
            setManualTrend(trend);
        }
    };

    const handleAddData = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMotorScore || !newDate || !newStressLevel) return;

        const newSession = {
            id: Math.random().toString(),
            date: newDate,
            motorScore: Number(newMotorScore),
            stressLevel: Number(newStressLevel)
        };

        const updatedSessions = [...sessions, newSession].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setSessions(updatedSessions);
        setNewMotorScore('');
    };

    const chartData = sessions.map(s => ({
        ...s,
        formattedDate: format(parseISO(s.date), 'dd MMM', { locale: fr })
    }));

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

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
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors">
                                    <PlusCircle size={18} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Collecte des données</h2>
                            </div>

                            <form onSubmit={handleAddData} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 pl-1">Date de la séance</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 pl-1">Score moteur (0-100)</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        placeholder="Ex: 65"
                                        value={newMotorScore}
                                        onChange={(e) => setNewMotorScore(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1.5 pl-1 pr-1">
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">Niveau de stress</label>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{newStressLevel}/10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="10"
                                        value={newStressLevel}
                                        onChange={(e) => setNewStressLevel(e.target.value)}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                                        <span>Détendu</span>
                                        <span>Très stressé</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    Enregistrer la séance
                                </button>
                            </form>
                        </div>

                        {/* Session Progression */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex-1 min-h-[300px] transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-colors">
                                    <ClipboardList size={18} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Progression récente</h2>
                            </div>

                            <div className="overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="pb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                                            <th className="pb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Score</th>
                                            <th className="pb-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Stress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {[...sessions].reverse().slice(0, 5).map((session) => (
                                            <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                                    {format(parseISO(session.date), 'dd MMM yyyy', { locale: fr })}
                                                </td>
                                                <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                                                    <span className="bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 px-2 py-1 rounded inline-block min-w-[36px] text-center transition-colors">
                                                        {session.motorScore}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[36px] ${session.stressLevel <= 3 ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
                                                        session.stressLevel <= 6 ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                                                            'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {session.stressLevel}/10
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Visualizations */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col">

                        {/* Motor Performance Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full transition-colors duration-300">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Performances motrices</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Évolution du score sur les dernières séances</p>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMotor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-700/50" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                            className="dark:fill-slate-400"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            domain={[0, 'dataMax + 10']}
                                            className="dark:fill-slate-400"
                                        />
                                        <Tooltip content={<CustomTooltip unit="pts" />} />
                                        <Line
                                            type="monotone"
                                            dataKey="motorScore"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: 'currentColor', stroke: '#3b82f6' }}
                                            className="text-white dark:text-slate-900"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Stress Level Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex-1 min-h-[300px] transition-colors duration-300">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Niveau de stress perçu</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Auto-évaluation du patient (0-10)</p>
                            </div>
                            <div className="h-[250px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-700/50" />
                                        <XAxis
                                            dataKey="formattedDate"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                            className="dark:fill-slate-400"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            domain={[0, 10]}
                                            ticks={[0, 2, 4, 6, 8, 10]}
                                            className="dark:fill-slate-400"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                            content={<CustomTooltip unit="/ 10" colorHex="#8b5cf6" />}
                                        />
                                        <Bar
                                            dataKey="stressLevel"
                                            fill="#8b5cf6"
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Subcomponents ---
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
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-500/20',
            activeRing: 'ring-2 ring-emerald-500 ring-offset-2',
            inactiveClass: 'opacity-50 grayscale border-slate-100 dark:border-slate-800'
        },
        orange: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-500/20',
            activeRing: 'ring-2 ring-amber-500 ring-offset-2',
            inactiveClass: 'opacity-50 grayscale border-slate-100 dark:border-slate-800'
        },
        red: {
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            text: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-200 dark:border-rose-500/20',
            activeRing: 'ring-2 ring-rose-500 ring-offset-2',
            inactiveClass: 'opacity-50 grayscale border-slate-100 dark:border-slate-800'
        }
    };

    const scheme = colorMap[color];

    return (
        <button onClick={onClick} className={`
      w-full text-left relative p-5 rounded-2xl border transition-all duration-500 ease-out flex items-center gap-4 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      ${active ? `${scheme.border} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] scale-[1.02]` : scheme.inactiveClass}
    `}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${scheme.bg} ${scheme.text} transition-colors`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-bold text-lg leading-tight transition-colors ${active ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>
            </div>

            {active && (
                <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${scheme.bg} border-2 border-white animate-pulse`}></div>
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
