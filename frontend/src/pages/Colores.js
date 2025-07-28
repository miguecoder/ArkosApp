import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { coloresAPI } from '../services/api';
import toast from 'react-hot-toast';

const Colores = () => {
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadColores();
  }, []);

  const loadColores = async () => {
    try {
      setLoading(true);
      const response = await coloresAPI.getAll();
      setColores(response.data);
    } catch (error) {
      console.error('Error al cargar colores:', error);
      toast.error('Error al cargar los colores');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await coloresAPI.update(editingId, data);
        toast.success('Color actualizado correctamente');
      } else {
        await coloresAPI.create(data);
        toast.success('Color creado correctamente');
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      loadColores();
    } catch (error) {
      console.error('Error al guardar color:', error);
      toast.error('Error al guardar el color');
    }
  };

  const handleEdit = (color) => {
    setEditingId(color.id);
    setValue('nombre', color.nombre);
    setValue('codigo_hex', color.codigo_hex);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este color?')) {
      try {
        await coloresAPI.delete(id);
        toast.success('Color eliminado correctamente');
        loadColores();
      } catch (error) {
        console.error('Error al eliminar color:', error);
        toast.error('Error al eliminar el color');
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
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
          <Palette className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-2 md:mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Colores</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Color
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Color' : 'Nuevo Color'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                {...register('nombre', { required: 'El nombre es requerido' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Rojo, Azul, Verde"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código HEX
              </label>
              <input
                type="text"
                {...register('codigo_hex', { 
                  pattern: {
                    value: /^#[0-9A-F]{6}$/i,
                    message: 'Debe ser un código HEX válido (ej: #FF0000)'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#FF0000"
              />
              {errors.codigo_hex && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo_hex.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de colores */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Lista de Colores</h2>
          
          {colores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay colores registrados</p>
          ) : (
            <div>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código HEX
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {colores.map((color) => (
                      <tr key={color.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.codigo_hex || '#ccc' }}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {color.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {color.codigo_hex || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(color)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(color.id)}
                              className="text-red-600 hover:text-red-900"
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
                {colores.map((color) => (
                  <div key={color.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.codigo_hex || '#ccc' }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {color.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            {color.codigo_hex || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(color)}
                          className="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(color.id)}
                          className="p-2 text-red-600 hover:text-red-700 bg-white rounded-full shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Colores; 