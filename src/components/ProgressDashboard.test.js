"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const ProgressDashboard_1 = __importDefault(require("@/components/ProgressDashboard"));
jest.mock('@/utils/imageStorage', () => ({
    imageStorage: {
        getAllImages: jest.fn().mockResolvedValue([]),
    },
}));
jest.mock('@/utils/secureStorage', () => ({
    secureStorage: {
        getItem: jest.fn().mockResolvedValue([]),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));
describe('ProgressDashboard', () => {
    it('renders and shows title', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ProgressDashboard_1.default, { onBack: () => { } }));
        // Title appears early
        expect(react_1.screen.getByText('Progress Dashboard')).toBeInTheDocument();
        // Wait for loading to finish
        await (0, react_1.waitFor)(() => expect(react_1.screen.queryByText('Loading progress data...')).not.toBeInTheDocument());
        // Tabs present
        expect(react_1.screen.getByText('Overview')).toBeInTheDocument();
        expect(react_1.screen.getByText('Trends')).toBeInTheDocument();
        expect(react_1.screen.getByText('Goals')).toBeInTheDocument();
        expect(react_1.screen.getByText('Analytics')).toBeInTheDocument();
    });
});
