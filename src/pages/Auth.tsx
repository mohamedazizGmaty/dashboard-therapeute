import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';

export default function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setError('Vérifiez votre boîte mail pour confirmer votre inscription !');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row transition-colors duration-500 text-slate-900 shadow-none">

            {/* Left Side: Branding/Visual (Always Blue) */}
            <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-center p-20 bg-blue-600 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.2)_0%,transparent_70%)]" />
                </div>

                <div className="absolute top-12 left-12 z-20 h-24 overflow-hidden">
                    <img src="/logo-white.png" alt="Synapsia" className="h-full object-contain object-left" />
                </div>

                <div className="relative z-10 space-y-8">

                    <div className="space-y-4">
                        <h1 className="text-6xl font-black text-white tracking-tighter leading-tight uppercase">
                            Synapsia <br />
                            <span className="text-blue-200">Physio</span> <br />
                            Dashboard
                        </h1>
                        <p className="text-blue-100 text-xl font-medium max-w-md opacity-80 leading-relaxed">
                            Plateforme de gestion avancée pour les professionnels de la santé et du sport.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-10">
                        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <h3 className="text-white font-bold text-2xl mb-1">100%</h3>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Sécurisé</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <h3 className="text-white font-bold text-2xl mb-1">Live</h3>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Synchronisation</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form (Forced Light Mode) */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative overflow-hidden bg-white">
                <div className="w-full max-w-md space-y-10 relative z-10">

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                            {isLogin ? 'Bon retour parmi nous' : 'Créer un compte'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isLogin ? 'Accédez à votre tableau de bord thérapeutique.' : 'Rejoignez les experts de la rééducation.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <Activity size={18} className="rotate-45" /> {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-2 group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Dr. Jean Dupont"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Adresse Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="nom@cabinet.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Se connecter' : 'Créer un compte'}
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-6">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            {isLogin ? "Pas encore de compte ? Créer une session" : "Déjà membre ? Se connecter"}
                        </button>
                    </div>

                    <div className="pt-20 text-center flex items-center justify-center gap-2">
                        <div className="h-[1px] w-12 bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Synapsia v2.0</span>
                        <div className="h-[1px] w-12 bg-slate-200" />
                    </div>
                </div>

                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/50 blur-[120px] pointer-events-none" />
            </div>
        </div>
    );
}
