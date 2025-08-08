"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const useSecureStorage_1 = require("@/hooks/useSecureStorage");
jest.mock('@/utils/secureStorage', () => ({
    secureStorage: {
        getItem: jest.fn().mockResolvedValue('init'),
        setItem: jest.fn().mockResolvedValue(undefined),
    }
}));
function Dummy() {
    const { value, setValue, loading } = (0, useSecureStorage_1.useSecureStorage)('test:key', 'fallback');
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "loading..." });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { "data-testid": "val", children: value }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setValue('newval'), children: "set" })] }));
}
describe('useSecureStorage', () => {
    it('loads and updates value', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Dummy, {}));
        await (0, react_1.waitFor)(() => expect(react_1.screen.queryByText('loading...')).not.toBeInTheDocument());
        expect(react_1.screen.getByTestId('val')).toHaveTextContent('init');
        react_1.fireEvent.click(react_1.screen.getByText('set'));
        expect(react_1.screen.getByTestId('val')).toHaveTextContent('newval');
    });
});
