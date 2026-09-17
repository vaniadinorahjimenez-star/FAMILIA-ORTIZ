import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Heart, 
  Maximize2, 
  X,
  Share2,
  Clock,
  Dog,
  MessageCircle,
  Tag,
  Search,
  Filter,
  User,
  Check
} from 'lucide-react';
import { FamilyPhoto, FamilyUserId, ChildId } from '../types';
import { soundFX } from '../utils/audio';
import { FAMILY_USERS } from '../utils/familyUsers';
import { compressImage } from '../utils/imageCompressor';

interface FamilyPhotoAlbumViewProps {
  photos: FamilyPhoto[];
  onAddPhoto: (photo: FamilyPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onReactPhoto: (photoId: string, emoji: string) => void;
  onShareToChat?: (photo: FamilyPhoto) => void;
  activeUser?: FamilyUserId;
}

export const FamilyPhotoAlbumView: React.FC<FamilyPhotoAlbumViewProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onReactPhoto,
  onShareToChat,
  activeUser = 'mama',
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<FamilyPhoto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state for new photo upload
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<FamilyPhoto['category']>('familia');
  const [uploadedBy, setUploadedBy] = useState<FamilyUserId>(activeUser);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un formato de imagen válido (JPG, PNG o WebP).');
      return;
    }

    setUploadError('');
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      setImageDataUrl(compressed.dataUrl);
      soundFX.playCheck();
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageDataUrl(event.target?.result as string);
        soundFX.playCheck();
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUrl) {
      setUploadError('Debes subir o tomar una foto para el álbum.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Escribe un título para este recuerdo.');
      return;
    }
    if (!description.trim()) {
      setUploadError('Escribe una descripción de lo que vivieron ese día.');
      return;
    }

    const uProfile = FAMILY_USERS[uploadedBy];
    const newPhoto: FamilyPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      date,
      timestamp: new Date().toISOString(),
      imageDataUrl,
      uploadedBy,
      uploadedByName: uProfile ? `${uProfile.name} ${uProfile.avatarEmoji}` : 'Familia 👨‍👩‍👧‍👧',
      category,
      reactions: { '❤️': 1 },
    };

    onAddPhoto(newPhoto);
    soundFX.playCelebration();

    // Reset & close
    setTitle('');
    setDescription('');
    setImageDataUrl('');
    setUploadError('');
    setIsUploadModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta foto del álbum familiar?')) {
      onDeletePhoto(id);
      soundFX.playPop();
      if (zoomedPhoto?.id === id) {
        setZoomedPhoto(null);
      }
    }
  };

  // Filter photos
  const filteredPhotos = photos.filter((p) => {
    if (filterUser !== 'all' && p.uploadedBy !== filterUser) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchDate = p.date.includes(q);
      if (!matchTitle && !matchDesc && !matchDate) return false;
    }
    return true;
  });

  const categoryLabels: Record<string, { label: string; emoji: string }> = {
    familia: { label: 'Familia', emoji: '👨‍👩‍👧‍👧' },
    paseo_luna: { label: 'Paseo con Luna', emoji: '🐩' },
    viaje: { label: 'Salida / Viaje', emoji: '🚗' },
    logro: { label: 'Logro o Escuela', emoji: '🌟' },
    recuerdo: { label: 'Recuerdo Especial', emoji: '💖' },
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Diario y Galería en Tiempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wide">
              Álbum de Recuerdos Familiares 📸✨
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 mt-1 max-w-xl leading-relaxed">
              El espacio especial donde Mamá, Regina, Romina, Papá y Nan suben sus fotos favoritas y cuentan cómo fue su día para recordarlo siempre.
            </p>
          </div>

          <button
            id="open-upload-family-photo-btn"
            onClick={() => {
              setUploadedBy(activeUser);
              setIsUploadModalOpen(true);
              soundFX.playPop();
            }}
            className="px-5 py-3 bg-white text-purple-900 hover:bg-pink-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-pink-600" />
            <span>+ Agregar Foto de Hoy</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, recuerdo o fecha..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          {/* Member filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">👥 Todos los miembros</option>
            <option value="mama">👩 Mamá</option>
            <option value="regina">💜 Regina</option>
            <option value="romina">🌸 Romina</option>
            <option value="papa">👨 Papá</option>
            <option value="nan">👮‍♀️ Nan</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">🏷️ Todas las categorías</option>
            <option value="familia">👨‍👩‍👧‍👧 Familia</option>
            <option value="paseo_luna">🐩 Paseo con Luna</option>
            <option value="viaje">🚗 Salida / Viaje</option>
            <option value="logro">🌟 Logro / Escuela</option>
            <option value="recuerdo">💖 Recuerdo Especial</option>
          </select>
        </div>
      </div>

      {/* Grid of Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 mx-auto flex items-center justify-center mb-3 text-3xl">
            📸
          </div>
          <h3 className="text-lg font-bold font-['Fredoka',sans-serif] text-slate-800 mb-1">
            No hay fotos en esta vista
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {searchTerm || filterUser !== 'all' || filterCategory !== 'all'
              ? 'No encontramos fotos con esos filtros. Intenta restablecer la búsqueda.'
              : '¡Comiencen a subir fotos familiares, del parque con Luna, o de sus actividades favoritas con una bonita descripción!'}
          </p>
          <button
            onClick={() => {
              setUploadedBy(activeUser);
              setIsUploadModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Subir la primera foto familiar</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => {
            const catInfo = categoryLabels[photo.category || 'familia'] || categoryLabels.familia;
            return (
              <div
                key={photo.id}
                onClick={() => setZoomedPhoto(photo)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-pink-300 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={photo.imageDataUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white flex items-center gap-1 shadow-xs">
                        <span>{catInfo.emoji}</span>
                        <span>{catInfo.label}</span>
                      </span>
                    </div>

                    {/* Date Pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 flex items-center gap-1 shadow-xs">
                        <Calendar className="w-3 h-3 text-pink-600" />
                        <span>{photo.date}</span>
                      </span>
                    </div>

                    {/* Delete and Expand buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(photo.id, e)}
                        className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 bg-black/60 text-white rounded-full">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-purple-500" />
                        {photo.uploadedByName || 'Familia'}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                      {photo.title}
                    </h4>

                    {/* Description of that day */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                        "{photo.description}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Reactions & Share */}
                <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  {/* Reactions */}
                  <div className="flex items-center gap-1">
                    {['❤️', '👏', '🌟', '🐩', '😍'].map((emoji) => {
                      const count = photo.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReactPhoto(photo.id, emoji);
                            soundFX.playPop();
                          }}
                          className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            count > 0
                              ? 'bg-pink-50 border border-pink-200 text-pink-700 font-bold'
                              : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Share to chat button */}
                  {onShareToChat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareToChat(photo);
                        soundFX.playChime();
                      }}
                      className="text-purple-600 hover:text-purple-800 font-bold text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                      title="Compartir en el Chat Familiar"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Al chat</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Subir Foto Familiar y Descripción del Día */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-3.5 sm:p-4 shadow-2xl border border-slate-100 overflow-hidden space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg">
                  📸
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Fredoka',sans-serif] leading-tight">
                    Agregar Foto al Álbum Familiar
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Guarda la foto y escribe qué hicieron de especial ese día.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-2">
              {uploadError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-xl font-bold">
                  {uploadError}
                </div>
              )}

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                {/* Left: Photo picker + who uploads */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imageDataUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 h-28 bg-slate-100">
                      <img
                        src={imageDataUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageDataUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full cursor-pointer"
                        title="Quitar foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Foto lista</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
                        <Camera className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {isCompressing ? 'Procesando imagen...' : 'Toca para tomar foto o elegir'}
                      </p>
                      <span className="mt-1 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-2xs">
                        Abrir Cámara / Galería 📷
                      </span>
                    </div>
                  )}

                  {/* Uploaded By */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      ¿Quién sube este recuerdo?
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      {(['mama', 'regina', 'romina', 'papa', 'nan'] as FamilyUserId[]).map((uid) => {
                        const profile = FAMILY_USERS[uid];
                        const isSelected = uploadedBy === uid;
                        return (
                          <button
                            key={uid}
                            type="button"
                            onClick={() => setUploadedBy(uid)}
                            className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{profile.avatarEmoji}</span>
                            <span>{profile.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Title, Description, Date & Category */}
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                      Título del Recuerdo *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Tarde con Lunita"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                      Descripción de ese día *
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Qué hicieron, qué dijo Regina, piruetas de Romina..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                        Categoría
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="familia">👨‍👩‍👧‍👧 Familia</option>
                        <option value="paseo_luna">🐩 Paseo con Luna</option>
                        <option value="viaje">🚗 Salida</option>
                        <option value="logro">🌟 Logro</option>
                        <option value="recuerdo">💖 Recuerdo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCompressing || !imageDataUrl}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Guardar en el Álbum</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto con Historia Completa (Low-height & non-scrolling) */}
      {zoomedPhoto && (
        <div 
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-2"
          >
            {/* Left: Photo */}
            <div className="relative bg-slate-950 flex items-center justify-center max-h-[220px] sm:max-h-[360px] min-h-[160px]">
              <img
                src={zoomedPhoto.imageDataUrl}
                alt={zoomedPhoto.title}
                className="max-h-[220px] sm:max-h-[360px] max-w-full object-contain"
              />
              <button
                onClick={() => setZoomedPhoto(null)}
                className="absolute top-2.5 right-2.5 p-1 bg-black/60 hover:bg-black text-white rounded-full sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Story details */}
            <div className="p-3 sm:p-4 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {zoomedPhoto.date}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold truncate">
                      Por {zoomedPhoto.uploadedByName}
                    </span>
                    <button
                      onClick={() => setZoomedPhoto(null)}
                      className="hidden sm:inline-flex p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black font-['Fredoka',sans-serif] text-slate-900 leading-tight">
                  {zoomedPhoto.title}
                </h3>

                <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-2 mt-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-pink-700 block mb-0.5">
                    Cómo fue ese día:
                  </span>
                  <p className="text-xs text-slate-800 leading-snug line-clamp-4 whitespace-pre-wrap">
                    {zoomedPhoto.description}
                  </p>
                </div>
              </div>

              {/* Reactions & actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {['❤️', '👏', '🌟', '🐩', '😍'].map((emoji) => {
                    const count = zoomedPhoto.reactions?.[emoji] || 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReactPhoto(zoomedPhoto.id, emoji);
                          soundFX.playPop();
                        }}
                        className="px-1.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-pink-100 text-slate-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-[10px]">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  {onShareToChat && (
                    <button
                      onClick={() => {
                        onShareToChat(zoomedPhoto);
                        soundFX.playChime();
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(zoomedPhoto.id, e)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
