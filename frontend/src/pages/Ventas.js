import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Edit, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { ventasAPI, combinacionesAPI, preciosCombinacionesAPI } from '../services/api';
import toast from 'react-hot-toast';

// Función para obtener la URL base del API
const getApiBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

// Función para obtener la URL base del servidor (sin /api)
const getServerBaseUrl = () => {
    const apiUrl = getApiBaseUrl();
    return apiUrl.replace('/api', '');
};

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [combinaciones, setCombinaciones] = useState([]);
  const [combinacionesConPrecios, setCombinacionesConPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [editingVenta, setEditingVenta] = useState(null);
  
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      detalles: [{ combinacion_id: '', talla: 'M', cantidad: 1, precio_unitario: 0, subtotal: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ventasRes, combinacionesRes] = await Promise.all([
        ventasAPI.getAll(),
        combinacionesAPI.getAll()
      ]);

      // Cargar precios para cada combinación
      const combinacionesConPrecios = await Promise.all(
        combinacionesRes.data.map(async (combinacion) => {
          try {
            const precioRes = await preciosCombinacionesAPI.getByCombinacion(combinacion.id);
            return {
              ...combinacion,
              precio: precioRes.data
            };
          } catch (error) {
            return {
              ...combinacion,
              precio: null
            };
          }
        })
      );

      setVentas(ventasRes.data);
      setCombinaciones(combinacionesRes.data);
      setCombinacionesConPrecios(combinacionesConPrecios);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Filtrar detalles válidos (con combinación seleccionada)
      const items = data.detalles.filter(detalle => detalle.combinacion_id && detalle.combinacion_id !== '');
      
      if (items.length === 0) {
        toast.error('Debe seleccionar al menos una combinación');
        return;
      }

      // Preparar datos para el backend
      const ventaData = {
        fecha_venta: data.fecha_venta,
        cliente: data.cliente_nombre || 'Sin nombre',
        metodo_pago: data.metodo_pago,
        estado_venta: data.estado_venta || 'pagado',
        fecha_pago: data.fecha_pago || data.fecha_venta,
        observaciones: data.notas,
        items: items.map(item => ({
          combinacion_id: parseInt(item.combinacion_id),
          talla: item.talla || 'M',
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario)
        }))
      };

      if (editingVenta) {
        await ventasAPI.update(editingVenta.id, ventaData);
        toast.success('Venta actualizada correctamente');
      } else {
        await ventasAPI.create(ventaData);
        toast.success('Venta creada correctamente');
      }
      
      setShowModal(false);
      setEditingVenta(null);
      reset();
      loadData();
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Error al guardar la venta');
    }
  };

  const handleEdit = async (venta) => {
    try {
      // Obtener los datos completos de la venta
      const response = await ventasAPI.getById(venta.id);
      const ventaCompleta = response.data;
      
      setEditingVenta(ventaCompleta);
      reset({
        fecha_venta: ventaCompleta.fecha_venta,
        cliente_nombre: ventaCompleta.cliente || ventaCompleta.cliente_nombre,
        cliente_telefono: ventaCompleta.cliente_telefono,
        cliente_email: ventaCompleta.cliente_email,
        metodo_pago: ventaCompleta.metodo_pago,
        estado_venta: ventaCompleta.estado_venta || 'pagado',
        fecha_pago: ventaCompleta.fecha_pago || ventaCompleta.fecha_venta,
        notas: ventaCompleta.observaciones || ventaCompleta.notas,
        detalles: ventaCompleta.detalles?.map(d => ({
          combinacion_id: d.combinacion_id,
          talla: d.talla || 'M',
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal
        })) || [{ combinacion_id: '', talla: 'M', cantidad: 1, precio_unitario: 0, subtotal: 0 }]
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error loading sale details for editing:', error);
      toast.error('Error al cargar los datos de la venta para editar');
    }
  };

  const handleView = async (venta) => {
    try {
      const response = await ventasAPI.getById(venta.id);
      setSelectedVenta(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading sale details:', error);
      toast.error('Error al cargar los detalles de la venta');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      try {
        await ventasAPI.delete(id);
        toast.success('Venta eliminada correctamente');
        loadData();
      } catch (error) {
        console.error('Error deleting sale:', error);
        toast.error('Error al eliminar la venta');
      }
    }
  };

  const openModal = () => {
    setEditingVenta(null);
    reset({
      detalles: [{ combinacion_id: '', talla: 'M', cantidad: 1, precio_unitario: 0, subtotal: 0 }]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVenta(null);
    reset();
  };

  const addDetalle = () => {
    append({ combinacion_id: '', talla: 'M', cantidad: 1, precio_unitario: 0, subtotal: 0 });
  };

  const removeDetalle = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const updateDetalle = (index, field, value) => {
    const newValue = parseFloat(value) || 0;
    setValue(`detalles.${index}.${field}`, newValue);
    
    if (field === 'cantidad' || field === 'precio_unitario') {
      const cantidad = field === 'cantidad' ? newValue : watch(`detalles.${index}.cantidad`) || 0;
      const precio = field === 'precio_unitario' ? newValue : watch(`detalles.${index}.precio_unitario`) || 0;
      const subtotal = cantidad * precio;
      setValue(`detalles.${index}.subtotal`, subtotal);
    }
  };

  const getPrecioCombinacion = (combinacionId) => {
    const combinacion = combinacionesConPrecios.find(c => c.id === parseInt(combinacionId));
    return combinacion?.precio?.precio_venta ? parseFloat(combinacion.precio.precio_venta) : 0;
  };

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    const fechaVenta = watch('fecha_venta');
    
    if (estado === 'pagado') {
      setValue('fecha_pago', fechaVenta);
    } else if (estado === 'pendiente') {
      // Para ventas pendientes, establecer fecha estimada (7 días después)
      const fechaEstimada = new Date(fechaVenta);
      fechaEstimada.setDate(fechaEstimada.getDate() + 7);
      setValue('fecha_pago', fechaEstimada.toISOString().split('T')[0]);
    } else {
      // Para ventas canceladas, no establecer fecha de pago
      setValue('fecha_pago', '');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(parseFloat(amount) || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-2 md:mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
        </div>
        <button
          onClick={openModal}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </button>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Ventas Registradas</h2>
          
          {ventas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay ventas registradas</p>
          ) : (
            <div>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Productos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Productos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ventas.map((venta) => (
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(venta.fecha_venta).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {venta.cliente || 'Sin nombre'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            venta.estado_venta === 'pagado' ? 'bg-green-100 text-green-800' :
                            venta.estado_venta === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {venta.estado_venta === 'pagado' ? 'Pagado' :
                             venta.estado_venta === 'pendiente' ? 'Pendiente' :
                             'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {venta.total_productos || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {venta.combinaciones && venta.combinaciones.map((combinacion, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {combinacion.imagen_predeterminada && (
                                    <img
                                      src={`${getServerBaseUrl()}${combinacion.imagen_predeterminada.imagen_url}`}
                                      alt={`Imagen de ${combinacion.combinacion_nombre}`}
                                      className="w-14 h-14 object-cover rounded border"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="text-sm text-gray-900">
                                    <div>{combinacion.combinacion_nombre}</div>
                                    <div className="text-xs text-gray-500">Talla: {combinacion.talla}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    Cantidad: {combinacion.cantidad_total}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(venta.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(venta)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(venta)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(venta.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas para móvil y tablet */}
              <div className="lg:hidden space-y-4">
                {ventas.map((venta) => (
                  <div key={venta.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(venta.fecha_venta).toLocaleDateString('es-ES')}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            venta.estado_venta === 'pagado' ? 'bg-green-100 text-green-800' :
                            venta.estado_venta === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {venta.estado_venta === 'pagado' ? 'Pagado' :
                             venta.estado_venta === 'pendiente' ? 'Pendiente' :
                             'Cancelado'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          Cliente: {venta.cliente || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Productos: {venta.total_productos || 0}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          {formatCurrency(venta.total)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(venta)}
                            className="p-2 text-green-600 hover:text-green-700 bg-white rounded-full shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(venta)}
                            className="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(venta.id)}
                            className="p-2 text-red-600 hover:text-red-700 bg-white rounded-full shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Productos en móvil */}
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Productos:</div>
                      <div className="space-y-2">
                        {venta.combinaciones && venta.combinaciones.map((combinacion, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                            <div className="flex items-center space-x-2 flex-1">
                              {combinacion.imagen_predeterminada && (
                                <img
                                  src={`${getServerBaseUrl()}${combinacion.imagen_predeterminada.imagen_url}`}
                                  alt={`Imagen de ${combinacion.combinacion_nombre}`}
                                  className="w-10 h-10 object-cover rounded border"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {combinacion.combinacion_nombre}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Talla: {combinacion.talla} | Cantidad: {combinacion.cantidad_total}
                                </div>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de venta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
              {editingVenta ? 'Editar Venta' : 'Nueva Venta'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Venta *
                  </label>
                  <input
                    type="date"
                    {...register('fecha_venta', { required: 'La fecha es requerida' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.fecha_venta && (
                    <p className="text-red-600 text-sm mt-1">{errors.fecha_venta.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    {...register('cliente_nombre')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del cliente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    {...register('cliente_telefono')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Teléfono"
                  />
                </div>
                
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('cliente_email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    {...register('metodo_pago')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado de la Venta
                  </label>
                  <select
                    {...register('estado_venta')}
                    onChange={handleEstadoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    {...register('fecha_pago')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  {...register('notas')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalles de la Venta</h3>
                  <button
                    type="button"
                    onClick={addDetalle}
                    className="w-full sm:w-auto bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Agregar Item
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4">
                      {/* Vista móvil - campos apilados */}
                      <div className="block lg:hidden space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Combinación
                            </label>
                            <select
                              {...register(`detalles.${index}.combinacion_id`)}
                              onChange={(e) => {
                                const precio = getPrecioCombinacion(e.target.value);
                                setValue(`detalles.${index}.precio_unitario`, precio);
                                updateDetalle(index, 'precio_unitario', precio);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar</option>
                              {combinacionesConPrecios.map((combinacion) => (
                                <option key={combinacion.id} value={combinacion.id}>
                                  {combinacion.nombre}
                                </option>
                              ))}
                            </select>
                            {/* Mostrar imagen predeterminada de la combinación seleccionada */}
                            {watch(`detalles.${index}.combinacion_id`) && (
                              (() => {
                                const combinacionSeleccionada = combinacionesConPrecios.find(
                                  c => c.id === parseInt(watch(`detalles.${index}.combinacion_id`))
                                );
                                return combinacionSeleccionada?.imagen_predeterminada ? (
                                  <div className="mt-2 flex items-center space-x-2">
                                    <img
                                      src={`${getServerBaseUrl()}${combinacionSeleccionada.imagen_predeterminada.imagen_url}`}
                                      alt={`Imagen de ${combinacionSeleccionada.nombre}`}
                                      className="w-12 h-12 object-cover rounded border"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <span className="text-sm text-gray-600">
                                      {combinacionSeleccionada.nombre}
                                    </span>
                                  </div>
                                ) : null;
                              })()
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Talla
                            </label>
                            <select
                              {...register(`detalles.${index}.talla`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="XXXL">XXXL</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              {...register(`detalles.${index}.cantidad`)}
                              onChange={(e) => updateDetalle(index, 'cantidad', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio Unit.
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`detalles.${index}.precio_unitario`)}
                              onChange={(e) => updateDetalle(index, 'precio_unitario', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subtotal
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register(`detalles.${index}.subtotal`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeDetalle(index)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>

                      {/* Vista desktop - grid de 6 columnas */}
                      <div className="hidden lg:grid grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Combinación
                          </label>
                          <select
                            {...register(`detalles.${index}.combinacion_id`)}
                            onChange={(e) => {
                              const precio = getPrecioCombinacion(e.target.value);
                              setValue(`detalles.${index}.precio_unitario`, precio);
                              updateDetalle(index, 'precio_unitario', precio);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar</option>
                            {combinacionesConPrecios.map((combinacion) => (
                              <option key={combinacion.id} value={combinacion.id}>
                                {combinacion.nombre}
                              </option>
                            ))}
                          </select>
                          {/* Mostrar imagen predeterminada de la combinación seleccionada */}
                          {watch(`detalles.${index}.combinacion_id`) && (
                            (() => {
                              const combinacionSeleccionada = combinacionesConPrecios.find(
                                c => c.id === parseInt(watch(`detalles.${index}.combinacion_id`))
                              );
                              return combinacionSeleccionada?.imagen_predeterminada ? (
                                <div className="mt-2 flex items-center space-x-2">
                                  <img
                                    src={`${getServerBaseUrl()}${combinacionSeleccionada.imagen_predeterminada.imagen_url}`}
                                    alt={`Imagen de ${combinacionSeleccionada.nombre}`}
                                    className="w-12 h-12 object-cover rounded border"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <span className="text-sm text-gray-600">
                                    {combinacionSeleccionada.nombre}
                                  </span>
                                </div>
                              ) : null;
                            })()
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Talla
                          </label>
                          <select
                            {...register(`detalles.${index}.talla`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            {...register(`detalles.${index}.cantidad`)}
                            onChange={(e) => updateDetalle(index, 'cantidad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Unit.
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`detalles.${index}.precio_unitario`)}
                            onChange={(e) => updateDetalle(index, 'precio_unitario', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtotal
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`detalles.${index}.subtotal`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            readOnly
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeDetalle(index)}
                            className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingVenta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailModal && selectedVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Detalles de la Venta</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                  <p className="text-sm text-gray-900">{new Date(selectedVenta.fecha_venta).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Método de Pago:</label>
                  <p className="text-sm text-gray-900">{selectedVenta.metodo_pago}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedVenta.estado_venta === 'pagado' ? 'bg-green-100 text-green-800' :
                    selectedVenta.estado_venta === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedVenta.estado_venta === 'pagado' ? 'Pagado' :
                     selectedVenta.estado_venta === 'pendiente' ? 'Pendiente' :
                     'Cancelado'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Pago:</label>
                  <p className="text-sm text-gray-900">
                    {selectedVenta.fecha_pago ? new Date(selectedVenta.fecha_pago).toLocaleDateString('es-ES') : 'No especificada'}
                  </p>
                </div>
              </div>

              {selectedVenta.cliente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente:</label>
                  <p className="text-sm text-gray-900">{selectedVenta.cliente}</p>
                </div>
              )}

              {selectedVenta.observaciones && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observaciones:</label>
                  <p className="text-sm text-gray-900">{selectedVenta.observaciones}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalles:</label>
                <div className="space-y-2">
                  {selectedVenta.detalles?.map((detalle, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {detalle.imagen_predeterminada && (
                          <img
                            src={`${getServerBaseUrl()}${detalle.imagen_predeterminada.imagen_url}`}
                            alt={`Imagen de ${detalle.combinacion_nombre}`}
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="text-sm text-gray-900">
                          <div>{detalle.combinacion_nombre}</div>
                          <div className="text-xs text-gray-500">Talla: {detalle.talla || 'M'}</div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {detalle.cantidad} x {formatCurrency(detalle.precio_unitario)} = {formatCurrency(detalle.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedVenta.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas; 