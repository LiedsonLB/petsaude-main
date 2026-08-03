import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Mapa from './pages/Mapa';
import Analise from './pages/Analise';
import Alertas from './pages/Alertas';
import Importar from './pages/Importar';
import Relatorios from './pages/Relatorios';
import Pesquisadores from './pages/Pesquisadores';
import Prevencao from './pages/Prevencao';
import Vulnerabilidade from './pages/Vulnerabilidade';
import Configuracoes from './pages/Configuracoes';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import AppLayout from './components/Applayout';
import LandingPage from './pages/Index';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas (sem layout) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/app" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />

          {/* Rotas Protegidas (com layout - Sidebar + Topbar) */}
          <Route path="/dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/mapa" element={
            <AppLayout>
              <Mapa />
            </AppLayout>
          } />
          <Route path="/analise" element={
            <AppLayout>
              <Analise />
            </AppLayout>
          } />
          <Route path="/alertas" element={
            <AppLayout>
              <Alertas />
            </AppLayout>
          } />
          <Route path="/importar" element={
            <AppLayout>
              <Importar />
            </AppLayout>
          } />
          <Route path="/relatorios" element={
            <AppLayout>
              <Relatorios />
            </AppLayout>
          } />
          <Route path="/pesquisadores" element={
            <AppLayout>
              <Pesquisadores />
            </AppLayout>
          } />
          <Route path="/prevencao" element={
            <AppLayout>
              <Prevencao />
            </AppLayout>
          } />
          <Route path="/vulnerabilidade" element={
            <AppLayout>
              <Vulnerabilidade />
            </AppLayout>
          } />
          <Route path="/configuracoes" element={
            <AppLayout>
              <Configuracoes />
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;