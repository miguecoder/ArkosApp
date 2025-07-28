import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { preciosCombinacionesAPI } from '../services/api';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
  // Asegurar que el valor sea un número válido
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(0);
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(numAmount);
};

const formatPercentage = (value) => {
  // Asegurar que el valor sea un número válido
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return '0.0%';
  }
  return `${numValue.toFixed(1)}%`;
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await preciosCombinacionesAPI.getDashboard();
      setMetrics(response.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.ingresos_totales),
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Costos Totales',
      value: formatCurrency(metrics.costos_totales),
      icon: DollarSign,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Ganancias Totales',
      value: formatCurrency(metrics.ganancias_totales),
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Total de Ventas',
      value: metrics.total_ventas,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  const monthlyCards = [
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(metrics.ingresos_mes),
      icon: DollarSign,
      color: 'bg-green-100',
      textColor: 'text-green-700'
    },
    {
      title: 'Costos del Mes',
      value: formatCurrency(metrics.costos_mes),
      icon: DollarSign,
      color: 'bg-red-100',
      textColor: 'text-red-700'
    },
    {
      title: 'Ganancias del Mes',
      value: formatCurrency(metrics.ganancias_mes),
      icon: TrendingUp,
      color: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      title: 'Ventas del Mes',
      value: metrics.ventas_mes,
      icon: ShoppingCart,
      color: 'bg-purple-100',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Métricas Generales */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Métricas Generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métricas del Mes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Métricas del Mes Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monthlyCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Package className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Combinaciones</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.total_combinaciones}</p>
          <p className="text-sm text-gray-600 mt-1">Total de combinaciones activas</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Margen Promedio</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(metrics.promedio_margen_ganancia)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Margen de ganancia promedio</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 