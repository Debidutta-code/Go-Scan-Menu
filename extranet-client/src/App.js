import { jsx as _jsx } from "react/jsx-runtime";
import { StaffAuthProvider } from '@/modules/auth/contexts/StaffAuthContext';
import { AppRouter } from './routes';
/* ===================== APP ===================== */
function App() {
    return (_jsx(StaffAuthProvider, { children: _jsx(AppRouter, {}) }));
}
export default App;
