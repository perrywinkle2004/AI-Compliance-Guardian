import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RoleSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse-subtle"></div>
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/20 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/20 rounded-full blur-[120px] opacity-20"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center mb-16"
            >
                <h1 className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tighter mb-4 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    VIGIL AI
                </h1>
                <p className="text-xl text-slate-400 tracking-[0.3em] uppercase font-light">AI Compliance Platform</p>
            </motion.div>

            <div className="z-10 flex flex-col md:flex-row gap-8 items-center">
                <RoleCard
                    role="USER"
                    description="Upload documents & Generate Reports"
                    onClick={() => navigate('/login?role=user')}
                    delay={0.2}
                    color="from-blue-500 to-cyan-500"
                />
                <RoleCard
                    role="ADMIN"
                    description="System Management & Oversight"
                    onClick={() => navigate('/login?role=admin')}
                    delay={0.4}
                    color="from-purple-500 to-pink-500"
                />
            </div>

            <div className="absolute bottom-8 text-slate-600 text-sm">
                Vigil AI © 2026
            </div>
        </div>
    );
};

const RoleCard = ({ role, description, onClick, delay, color }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay, duration: 0.3 }}
        onClick={onClick}
        className="w-80 h-56 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center group hover:border-slate-500/50 transition-all duration-300 relative overflow-hidden"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

        <span className="text-3xl font-bold text-white mb-3 tracking-wider group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
            {role}
        </span>
        <span className="text-slate-400 text-sm font-light">{description}</span>
    </motion.button>
);

export default RoleSelection;
