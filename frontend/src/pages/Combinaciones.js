import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Package, DollarSign, X } from 'lucide-react';
import { combinacionesAPI, coloresAPI, telasAPI, proveedoresAPI, estampadosAPI, preciosCombinacionesAPI } from '../services/api';
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(parseFloat(amount) || 0);
};

const Combinaciones = () => {
  const [combinaciones, setCombinaciones] = useState([]);
  const [colores, setColores] = useState([]);
  const [telas, setTelas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [estampados, setEstampados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedCombinacion, setSelectedCombinacion] = useState(null);
  const [estampadosSeleccionados, setEstampadosSeleccionados] = useState([]);
  const [imagenesCombinacion, setImagenesCombinacion] = useState([]);
  const [imagenPredeterminada, setImagenPredeterminada] = useState(null);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [combinacionesRes, coloresRes, telasRes, proveedoresRes, estampadosRes] = await Promise.all([
        combinacionesAPI.getAll(),
        coloresAPI.getAll(),
        telasAPI.getAll(),
        proveedoresAPI.getAll(),
        estampadosAPI.getAll()
      ]);
      
      setCombinaciones(combinacionesRes.data);
      setColores(coloresRes.data);
      setTelas(telasRes.data);
      setProveedores(proveedoresRes.data);
      setEstampados(estampadosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('descripcion', data.descripcion || '');
      
      // Agregar arrays como JSON strings
      if (data.colores) {
        formData.append('color_ids', JSON.stringify(data.colores));
      }
      if (data.telas) {
        formData.append('tela_ids', JSON.stringify(data.telas));
      }
      if (data.proveedores) {
        formData.append('proveedor_ids', JSON.stringify(data.proveedores));
      }
      
      formData.append('estampados', JSON.stringify(estampadosSeleccionados));
      
      // Agregar imágenes nuevas
      const imagenesNuevas = imagenesCombinacion.filter(img => !img.isExisting);
      imagenesNuevas.forEach((imagen, index) => {
        formData.append('imagenes', imagen.file);
      });

      // Agregar información de imágenes existentes
      const imagenesExistentes = imagenesCombinacion.filter(img => img.isExisting);
      if (imagenesExistentes.length > 0) {
        formData.append('imagenes_existentes', JSON.stringify(imagenesExistentes.map(img => ({
          id: img.originalId,
          imagen_url: img.preview.replace(getServerBaseUrl(), '')
        }))));
      }

      // Establecer imagen predeterminada
      const imagenPred = imagenesCombinacion.find(img => img.id === imagenPredeterminada);
      if (imagenPred) {
        if (imagenPred.isExisting) {
          formData.append('imagen_predeterminada_existente_id', imagenPred.originalId);
        } else {
          const indexNueva = imagenesNuevas.findIndex(img => img.id === imagenPred.id);
          if (indexNueva !== -1) {
            formData.append('imagen_predeterminada_nueva_index', indexNueva);
          }
        }
      }

      if (editingId) {
        await combinacionesAPI.update(editingId, formData);
        toast.success('Combinación actualizada correctamente');
      } else {
        await combinacionesAPI.create(formData);
        toast.success('Combinación creada correctamente');
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      setEstampadosSeleccionados([]);
      setImagenesCombinacion([]);
      setImagenPredeterminada(null);
      loadData();
    } catch (error) {
      console.error('Error al guardar combinación:', error);
      toast.error('Error al guardar la combinación');
    }
  };

  const handleEdit = (combinacion) => {
    setEditingId(combinacion.id);
    setValue('nombre', combinacion.nombre);
    setValue('descripcion', combinacion.descripcion);
    setValue('colores', combinacion.color_ids || []);
    setValue('telas', combinacion.tela_ids || []);
    setValue('proveedores', combinacion.proveedor_ids || []);
    setEstampadosSeleccionados(combinacion.estampados || []);
    
    // Cargar imágenes existentes
    if (combinacion.imagenes && combinacion.imagenes.length > 0) {
      const imagenesExistentes = combinacion.imagenes.map((img, index) => ({
        id: `existing-${img.id}`,
        file: null,
                 preview: `${getServerBaseUrl()}${img.imagen_url}`,
        isExisting: true,
        originalId: img.id
      }));
      setImagenesCombinacion(imagenesExistentes);
      
      // Establecer imagen predeterminada
      const imagenPred = combinacion.imagenes.find(img => img.es_predeterminada) || combinacion.imagenes[0];
      if (imagenPred) {
        setImagenPredeterminada(`existing-${imagenPred.id}`);
      }
    } else {
      setImagenesCombinacion([]);
      setImagenPredeterminada(null);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta combinación?')) {
      try {
        await combinacionesAPI.delete(id);
        toast.success('Combinación eliminada correctamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar combinación:', error);
        toast.error('Error al eliminar la combinación');
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
    setEstampadosSeleccionados([]);
    setImagenesCombinacion([]);
    setImagenPredeterminada(null);
  };

  const addEstampado = () => {
    setEstampadosSeleccionados([...estampadosSeleccionados, {
      estampado_id: '',
      medida: '',
      ubicacion: ''
    }]);
  };

  const removeEstampado = (index) => {
    setEstampadosSeleccionados(estampadosSeleccionados.filter((_, i) => i !== index));
  };

  const updateEstampado = (index, field, value) => {
    const updated = [...estampadosSeleccionados];
    updated[index] = { ...updated[index], [field]: value };
    setEstampadosSeleccionados(updated);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));
    setImagenesCombinacion([...imagenesCombinacion, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImagenesCombinacion(imagenesCombinacion.filter(img => img.id !== imageId));
    if (imagenPredeterminada === imageId) {
      setImagenPredeterminada(null);
    }
  };

  const setDefaultImage = (imageId) => {
    setImagenPredeterminada(imageId);
  };

  const handlePriceSubmit = async (data) => {
    try {
      if (selectedCombinacion.precio) {
        await preciosCombinacionesAPI.update(selectedCombinacion.precio.id, data);
        toast.success('Precio actualizado correctamente');
      } else {
        await preciosCombinacionesAPI.create({
          ...data,
          combinacion_id: selectedCombinacion.id
        });
        toast.success('Precio creado correctamente');
      }
      setShowPriceForm(false);
      setSelectedCombinacion(null);
      loadData();
    } catch (error) {
      console.error('Error al guardar precio:', error);
      toast.error('Error al guardar el precio');
    }
  };

  const openPriceForm = async (combinacion) => {
    try {
      const precioRes = await preciosCombinacionesAPI.getByCombinacion(combinacion.id);
      setSelectedCombinacion({
        ...combinacion,
        precio: precioRes.data
      });
      if (precioRes.data) {
        setValue('costo', precioRes.data.costo);
        setValue('precio_venta', precioRes.data.precio_venta);
      } else {
        setValue('costo', '');
        setValue('precio_venta', '');
      }
      setShowPriceForm(true);
    } catch (error) {
      console.error('Error al cargar precio:', error);
      toast.error('Error al cargar el precio');
    }
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
          <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-2 md:mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Combinaciones</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Combinación
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Combinación' : 'Nueva Combinación'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la combinación"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
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
                  placeholder="Descripción de la combinación"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colores
                </label>
                <select
                  multiple
                  {...register('colores')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {colores.map((color) => (
                    <option key={color.id} value={color.id}>
                      ● {color.nombre}
                    </option>
                  ))}
                </select>
                                 {/* Vista previa de colores seleccionados */}
                 <div className="mt-2 flex flex-wrap gap-2">
                   {watch('colores')?.map((colorId) => {
                     const color = colores.find(c => c.id == colorId);
                     return color ? (
                       <div key={color.id} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                         <div 
                           className="w-4 h-4 rounded-full border border-gray-300"
                           style={{ backgroundColor: color.codigo_hex || '#ccc' }}
                         ></div>
                         <span>{color.nombre}</span>
                       </div>
                     ) : null;
                   })}
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipos de Tela
                </label>
                <select
                  multiple
                  {...register('telas')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {telas.map((tela) => (
                    <option key={tela.id} value={tela.id}>
                      {tela.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedores
                </label>
                <select
                  multiple
                  {...register('proveedores')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estampados
              </label>
              <button
                type="button"
                onClick={addEstampado}
                className="mb-3 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Agregar Estampado
              </button>
              
              {estampadosSeleccionados.map((estampado, index) => (
                <div key={index} className="border rounded-md p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Estampado {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEstampado(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div>
                       <label className="block text-xs text-gray-600 mb-1">Estampado</label>
                       <select
                         value={estampado.estampado_id}
                         onChange={(e) => updateEstampado(index, 'estampado_id', e.target.value)}
                         className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                       >
                         <option value="">Seleccionar estampado</option>
                         {estampados.map((est) => (
                           <option key={est.id} value={est.id}>
                             {est.codigo} - {est.descripcion}
                           </option>
                         ))}
                       </select>
                       {/* Vista previa del estampado seleccionado */}
                       {estampado.estampado_id && (() => {
                         const estampadoSeleccionado = estampados.find(est => est.id == estampado.estampado_id);
                         return estampadoSeleccionado ? (
                           <div className="mt-2 p-2 bg-gray-50 rounded border">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="text-xs font-medium text-gray-700">
                                 {estampadoSeleccionado.codigo} - {estampadoSeleccionado.descripcion}
                               </span>
                             </div>
                                                           {estampadoSeleccionado.imagen_url ? (
                                                                 <img 
                                   src={`${getServerBaseUrl()}${estampadoSeleccionado.imagen_url}`}
                                   alt={estampadoSeleccionado.descripcion}
                                   className="w-16 h-16 object-cover rounded border"
                                 />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                  <span className="text-xs text-gray-500">Sin imagen</span>
                                </div>
                              )}
                           </div>
                         ) : null;
                       })()}
                     </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Medida</label>
                      <input
                        type="text"
                        value={estampado.medida}
                        onChange={(e) => updateEstampado(index, 'medida', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Ej: 40x30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Ubicación</label>
                      <input
                        type="text"
                        value={estampado.ubicacion}
                        onChange={(e) => updateEstampado(index, 'ubicacion', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Ej: espalda"
                      />
                    </div>
                  </div>
                </div>
                             ))}
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Imágenes de la Combinación
               </label>
               <div className="space-y-4">
                 <div>
                   <input
                     type="file"
                     multiple
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Puedes seleccionar múltiples imágenes. La primera será la predeterminada.
                   </p>
                 </div>
                 
                 {imagenesCombinacion.length > 0 && (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {imagenesCombinacion.map((imagen) => (
                       <div key={imagen.id} className="relative group">
                         <img
                           src={imagen.preview}
                           alt="Vista previa"
                           className={`w-full h-24 object-cover rounded-lg border-2 ${
                             imagenPredeterminada === imagen.id 
                               ? 'border-blue-500' 
                               : 'border-gray-300'
                           }`}
                         />
                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                           <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                             <button
                               type="button"
                               onClick={() => setDefaultImage(imagen.id)}
                               className={`p-1 rounded ${
                                 imagenPredeterminada === imagen.id
                                   ? 'bg-blue-500 text-white'
                                   : 'bg-white text-gray-700 hover:bg-blue-500 hover:text-white'
                               }`}
                               title={imagenPredeterminada === imagen.id ? 'Imagen predeterminada' : 'Establecer como predeterminada'}
                             >
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                               </svg>
                             </button>
                             <button
                               type="button"
                               onClick={() => removeImage(imagen.id)}
                               className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                               title="Eliminar imagen"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         {imagenPredeterminada === imagen.id && (
                           <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                             Predeterminada
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
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

      {showPriceForm && selectedCombinacion && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCombinacion.precio ? 'Editar Precio' : 'Agregar Precio'} - {selectedCombinacion.nombre}
          </h2>
          <form onSubmit={handleSubmit(handlePriceSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('costo', { required: 'El costo es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.costo && (
                  <p className="text-red-500 text-sm mt-1">{errors.costo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('precio_venta', { required: 'El precio de venta es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.precio_venta && (
                  <p className="text-red-500 text-sm mt-1">{errors.precio_venta.message}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {selectedCombinacion.precio ? 'Actualizar' : 'Crear'} Precio
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPriceForm(false);
                  setSelectedCombinacion(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de combinaciones */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Lista de Combinaciones</h2>
          
          {combinaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay combinaciones registradas</p>
          ) : (
            <div>
                             {/* Vista de tabla para desktop */}
               <div className="hidden lg:block">
                 <table className="w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                         Imagen
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                         Nombre
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                         Colores
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                         Telas
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                         Proveedores
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                         Estampados
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                         Costo
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                         Precio
                       </th>
                       <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                         Acciones
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                         {combinaciones.map((combinacion) => (
                       <tr key={combinacion.id} className="hover:bg-gray-50">
                         <td className="px-2 py-4 text-center">
                           {combinacion.imagen_predeterminada && (
                             <img
                               src={`${getServerBaseUrl()}${combinacion.imagen_predeterminada.imagen_url}`}
                               alt={`Imagen de ${combinacion.nombre}`}
                               className="w-10 h-10 object-cover rounded border mx-auto"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                               }}
                             />
                           )}
                         </td>
                         <td className="px-2 py-4 text-sm font-medium text-gray-900 truncate">
                           {combinacion.nombre}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 truncate">
                           {combinacion.colores || 'N/A'}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 truncate">
                           {combinacion.telas || 'N/A'}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 truncate">
                           {combinacion.proveedores || 'N/A'}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 text-center">
                           {combinacion.estampados ? combinacion.estampados.length : 0}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 text-right">
                           {combinacion.precio ? formatCurrency(combinacion.precio.costo) : 'Sin costo'}
                         </td>
                         <td className="px-2 py-4 text-sm text-gray-500 text-right">
                           {combinacion.precio ? formatCurrency(combinacion.precio.precio_venta) : 'Sin precio'}
                         </td>
                         <td className="px-2 py-4 text-sm font-medium text-center">
                                                     <div className="flex space-x-1">
                             <button
                               onClick={() => handleEdit(combinacion)}
                               className="text-blue-600 hover:text-blue-900 p-1"
                               title="Editar"
                             >
                               <Edit className="w-3 h-3" />
                             </button>
                             <button
                               onClick={() => openPriceForm(combinacion)}
                               className="text-green-600 hover:text-green-900 p-1"
                               title="Gestionar Precio"
                             >
                               <DollarSign className="w-3 h-3" />
                             </button>
                             <button
                               onClick={() => handleDelete(combinacion.id)}
                               className="text-red-600 hover:text-red-900 p-1"
                               title="Eliminar"
                             >
                               <Trash2 className="w-3 h-3" />
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
                {combinaciones.map((combinacion) => (
                  <div key={combinacion.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {combinacion.imagen_predeterminada && (
                          <img
                            src={`${getServerBaseUrl()}${combinacion.imagen_predeterminada.imagen_url}`}
                            alt={`Imagen de ${combinacion.nombre}`}
                            className="w-16 h-16 object-cover rounded border flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {combinacion.nombre}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            {combinacion.colores && (
                              <div>Colores: {combinacion.colores}</div>
                            )}
                            {combinacion.telas && (
                              <div>Telas: {combinacion.telas}</div>
                            )}
                            {combinacion.proveedores && (
                              <div>Proveedores: {combinacion.proveedores}</div>
                            )}
                            <div>Estampados: {combinacion.estampados ? combinacion.estampados.length : 0}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(combinacion)}
                          className="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow-sm"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPriceForm(combinacion)}
                          className="p-2 text-green-600 hover:text-green-700 bg-white rounded-full shadow-sm"
                          title="Gestionar Precio"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(combinacion.id)}
                          className="p-2 text-red-600 hover:text-red-700 bg-white rounded-full shadow-sm"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Precios en móvil */}
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Precios:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <div className="text-gray-500">Costo:</div>
                          <div className="font-medium text-gray-900">
                            {combinacion.precio ? formatCurrency(combinacion.precio.costo) : 'Sin costo'}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <div className="text-gray-500">Venta:</div>
                          <div className="font-medium text-gray-900">
                            {combinacion.precio ? formatCurrency(combinacion.precio.precio_venta) : 'Sin precio'}
                          </div>
                        </div>
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

export default Combinaciones; 