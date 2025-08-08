"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const card_1 = require("@/components/ui/card");
const AnimatedFeatureCard = ({ icon, title, description, onClick, color = "bg-blue-500", delay = 0 }) => {
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: {
            duration: 0.5,
            delay: delay * 0.1,
            ease: "easeOut"
        }, whileHover: {
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 }
        }, whileTap: { scale: 0.98 }, children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "p-6 cursor-pointer group relative overflow-hidden", onClick: onClick, children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent", initial: { x: '-100%' }, whileHover: { x: '100%' }, transition: { duration: 0.6 } }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 relative z-10", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: `p-3 rounded-lg ${color} text-white`, whileHover: {
                                scale: 1.1,
                                rotate: 5,
                                transition: { duration: 0.2 }
                            }, whileTap: { scale: 0.9 }, children: icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.h3, { className: "text-lg font-semibold mb-2", whileHover: { color: '#10b981' }, transition: { duration: 0.2 }, children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 text-sm", children: description })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "text-gray-400 group-hover:text-green-500", initial: { x: 0 }, whileHover: { x: 5 }, transition: { duration: 0.2 }, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "absolute inset-0 bg-green-500/20 rounded-lg", initial: { scale: 0, opacity: 0 }, whileTap: { scale: 1, opacity: 1 }, transition: { duration: 0.3 } })] }) }));
};
exports.default = AnimatedFeatureCard;
