"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const PumpingSessionTracker_1 = __importDefault(require("@/components/PumpingSessionTracker"));
jest.mock('@/utils/secureStorage', () => ({
    secureStorage: {
        getItem: jest.fn().mockResolvedValue([]),
        setItem: jest.fn().mockResolvedValue(undefined),
    }
}));
const mockedSecure = require('@/utils/secureStorage').secureStorage;
describe('PumpingSessionTracker', () => {
    it('adds a session and saves to secureStorage', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(PumpingSessionTracker_1.default, { onBack: () => { } }));
        await (0, react_1.waitFor)(() => expect(mockedSecure.getItem).toHaveBeenCalled());
        react_1.fireEvent.click(react_1.screen.getAllByText(/Add Session|Add First Session/)[0]);
        react_1.fireEvent.change(react_1.screen.getByLabelText('Duration (minutes)'), { target: { value: '15' } });
        react_1.fireEvent.change(react_1.screen.getByLabelText('Pressure (Hg)'), { target: { value: '5' } });
        react_1.fireEvent.click(react_1.screen.getByText(/Save Session|Update Session/));
        await (0, react_1.waitFor)(() => expect(mockedSecure.setItem).toHaveBeenCalledWith('pumpingSessions', expect.any(Array)));
    });
});
