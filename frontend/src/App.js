import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Colores from './pages/Colores';
import Proveedores from './pages/Proveedores';
import Estampados from './pages/Estampados';
import Telas from './pages/Telas';
import Combinaciones from './pages/Combinaciones';
import Ventas from './pages/Ventas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colores" element={<Colores />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/estampados" element={<Estampados />} />
            <Route path="/telas" element={<Telas />} />
            <Route path="/combinaciones" element={<Combinaciones />} />
            <Route path="/ventas" element={<Ventas />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App; 