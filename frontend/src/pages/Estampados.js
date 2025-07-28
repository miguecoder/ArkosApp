import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Image, Upload } from 'lucide-react';
import { estampadosAPI } from '../services/api';
import toast from 'react-hot-toast';

const Estampados = () => {
  const [estampados, setEstampados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadEstampados();
  }, []);

  const loadEstampados = async () => {
    try {
      setLoading(true);
      const response = await estampadosAPI.getAll();
      setEstampados(response.data);
    } catch (error) {
      console.error('Error al cargar estampados:', error);
      toast.error('Error al cargar los estampados');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('codigo', data.codigo);
      formData.append('descripcion', data.descripcion);
      if (selectedImage) {
        formData.append('imagen', selectedImage);
      }

      if (editingId) {
        await estampadosAPI.update(editingId, formData);
        toast.success('Estampado actualizado correctamente');
      } else {
        await estampadosAPI.create(formData);
        toast.success('Estampado creado correctamente');
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      setSelectedImage(null);
      setImagePreview(null);
      loadEstampados();
    } catch (error) {
      console.error('Error al guardar estampado:', error);
      toast.error('Error al guardar el estampado');
    }
  };

  const handleEdit = (estampado) => {
    setEditingId(estampado.id);
    setValue('codigo', estampado.codigo);
    setValue('descripcion', estampado.descripcion);
    if (estampado.imagen_url) {
      setImagePreview(`http://localhost:5000${estampado.imagen_url}`);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estampado?')) {
      try {
        await estampadosAPI.delete(id);
        toast.success('Estampado eliminado correctamente');
        loadEstampados();
      } catch (error) {
        console.error('Error al eliminar estampado:', error);
        toast.error('Error al eliminar el estampado');
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
    setSelectedImage(null);
    setImagePreview(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Image className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-2 md:mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Estampados</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Estampado
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Estampado' : 'Nuevo Estampado'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  {...register('codigo', { required: 'El código es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: EST001"
                />
                {errors.codigo && (
                  <p className="text-red-500 text-sm mt-1">{errors.codigo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  {...register('descripcion')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del estampado"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Estampado
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir archivo</span>
                      <input
                        id="image-upload"
                        name="imagen"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 60MB</p>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg border"
                  />
                </div>
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

      {/* Lista de estampados */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Lista de Estampados</h2>
          
          {estampados.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay estampados registrados</p>
          ) : (
            <div>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Imagen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estampados.map((estampado) => (
                      <tr key={estampado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estampado.imagen_url ? (
                            <img
                              src={`http://localhost:5000${estampado.imagen_url}`}
                              alt={estampado.codigo}
                              className="w-16 h-16 object-contain border rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {estampado.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {estampado.descripcion || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(estampado)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(estampado.id)}
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
                {estampados.map((estampado) => (
                  <div key={estampado.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {estampado.imagen_url ? (
                          <img
                            src={`http://localhost:5000${estampado.imagen_url}`}
                            alt={estampado.codigo}
                            className="w-12 h-12 object-contain border rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {estampado.codigo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {estampado.descripcion || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(estampado)}
                          className="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(estampado.id)}
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

export default Estampados; 