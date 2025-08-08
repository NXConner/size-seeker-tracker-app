"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
function CommunityFeatures({ onBack }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: onBack, className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back to Dashboard" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800 dark:text-gray-200", children: "Community Features" }), (0, jsx_runtime_1.jsx)("div", {})] }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold", children: "Community Features Coming Soon" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Connect with the community, share progress, and get support from fellow users." })] }) })] }));
}
exports.default = CommunityFeatures;
