"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationPrevious = exports.PaginationNext = exports.PaginationLink = exports.PaginationItem = exports.PaginationEllipsis = exports.PaginationContent = exports.Pagination = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const Pagination = ({ className, ...props }) => ((0, jsx_runtime_1.jsx)("nav", { role: "navigation", "aria-label": "pagination", className: (0, utils_1.cn)("mx-auto flex w-full justify-center", className), ...props }));
exports.Pagination = Pagination;
Pagination.displayName = "Pagination";
const PaginationContent = React.forwardRef(({ className, ...props }, ref) => ((0, jsx_runtime_1.jsx)("ul", { ref: ref, className: (0, utils_1.cn)("flex flex-row items-center gap-1", className), ...props })));
exports.PaginationContent = PaginationContent;
PaginationContent.displayName = "PaginationContent";
const PaginationItem = React.forwardRef(({ className, ...props }, ref) => ((0, jsx_runtime_1.jsx)("li", { ref: ref, className: (0, utils_1.cn)("", className), ...props })));
exports.PaginationItem = PaginationItem;
PaginationItem.displayName = "PaginationItem";
const PaginationLink = ({ className, isActive, size = "icon", ...props }) => ((0, jsx_runtime_1.jsx)("a", { "aria-current": isActive ? "page" : undefined, className: (0, utils_1.cn)((0, button_1.buttonVariants)({
        variant: isActive ? "outline" : "ghost",
        size,
    }), className), ...props }));
exports.PaginationLink = PaginationLink;
PaginationLink.displayName = "PaginationLink";
const PaginationPrevious = ({ className, ...props }) => ((0, jsx_runtime_1.jsxs)(PaginationLink, { "aria-label": "Go to previous page", size: "default", className: (0, utils_1.cn)("gap-1 pl-2.5", className), ...props, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Previous" })] }));
exports.PaginationPrevious = PaginationPrevious;
PaginationPrevious.displayName = "PaginationPrevious";
const PaginationNext = ({ className, ...props }) => ((0, jsx_runtime_1.jsxs)(PaginationLink, { "aria-label": "Go to next page", size: "default", className: (0, utils_1.cn)("gap-1 pr-2.5", className), ...props, children: [(0, jsx_runtime_1.jsx)("span", { children: "Next" }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "h-4 w-4" })] }));
exports.PaginationNext = PaginationNext;
PaginationNext.displayName = "PaginationNext";
const PaginationEllipsis = ({ className, ...props }) => ((0, jsx_runtime_1.jsxs)("span", { "aria-hidden": true, className: (0, utils_1.cn)("flex h-9 w-9 items-center justify-center", className), ...props, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "More pages" })] }));
exports.PaginationEllipsis = PaginationEllipsis;
PaginationEllipsis.displayName = "PaginationEllipsis";
