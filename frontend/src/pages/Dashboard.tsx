import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ScheduleConfig from '../components/ScheduleConfig';
import { X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ start_time: '', end_time: '' });

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/barber/appointments');
      setAppointments(data);
    } catch (e) {
      console.error(e);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: string, serviceId: number) => {
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/availability?target_date=${date}&service_id=${serviceId}`);
      setAvailableSlots(data.available_slots);
    } catch (e) {
      console.error(e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Configuración de WebSocket para actualizaciones en tiempo real
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
    console.log("Conectando WebSocket a:", wsUrl);
    
    let socket: WebSocket;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => console.log("WebSocket Conectado ✅");

      socket.onmessage = (event) => {
        console.log("Mensaje recibido:", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_APPOINTMENT') {
          fetchAppointments();
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.5;
            audio.play();
          } catch (e) {
            console.log("No se pudo reproducir el sonido");
          }
        }
      };

      socket.onclose = () => {
        console.log("WebSocket desconectado. Reintentando en 3s...");
        setTimeout(connectWS, 3000);
      };

      socket.onerror = (err) => {
        console.error("Error en WebSocket:", err);
      };
    };

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdateAppointment = async (id: number, updateData: any) => {
    // Optimistic update
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updateData } : app));

    try {
      await api.patch(`/barber/appointments/${id}`, updateData);
    } catch (e) {
      console.error("Update failed", e);
      fetchAppointments();
    }
  };

  const handleDragEnd = async (appointmentId: number, newDate: string, newStatus: string) => {
    handleUpdateAppointment(appointmentId, { date: newDate, status: newStatus });
  };

  const openEditModal = (app: any) => {
    setEditingAppointment(app);
    setEditForm({
      start_time: app.start_time.substring(0, 5),
      end_time: app.end_time.substring(0, 5)
    });
    fetchAvailableSlots(app.date, app.service_id);
  };

  const handleSelectSlot = (time: string) => {
    const duration = editingAppointment?.service?.duration_minutes || 30;
    const startD = new Date(`2000-01-01T${time}`);
    const endD = new Date(startD.getTime() + duration * 60000);
    const endTime = endD.toTimeString().split(' ')[0].substring(0, 5);
    
    setEditForm({
      start_time: time,
      end_time: endTime
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    await handleUpdateAppointment(editingAppointment.id, {
      start_time: editForm.start_time + ':00',
      end_time: editForm.end_time + ':00'
    });
    setEditingAppointment(null);
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden font-sans">
      {/* Sidebar de Configuración - Oscuro para Contraste */}
      <aside className="w-80 bg-gray-900 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/40">M</div>
          <h1 className="text-xl font-black text-white tracking-tight">MELION<span className="text-primary">BARBER</span></h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScheduleConfig isDark={true} />
        </div>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal - Claro pero Definido */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Gestión de Turnos Semanales</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">Nicanor</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-tighter">Barbero Principal</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold">N</div>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <KanbanBoard
              appointments={appointments}
              onDragEnd={handleDragEnd}
              onUpdate={handleUpdateAppointment}
              onEdit={openEditModal}
            />
          )}
        </div>
      </main>

      {/* Edit Modal (Light Mode) */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Modificar Horario</h2>
                <p className="text-white/70 text-xs mt-1">Ajuste manual del turno</p>
              </div>
              <button onClick={() => setEditingAppointment(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Seleccionar Nuevo Horario de Inicio</label>
                
                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleSelectSlot(time)}
                        className={`py-2 text-xs font-black rounded-xl border-2 transition-all ${
                          editForm.start_time === time 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="col-span-3 py-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-xs font-bold italic">No hay otros horarios disponibles</p>
                      </div>
                    )}
                  </div>
                )}

                {editForm.start_time && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Resumen del Cambio</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">
                      {editingAppointment?.service?.name}: <span className="text-primary">{editForm.start_time} - {editForm.end_time}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">({editingAppointment?.service?.duration_minutes} min de duración)</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingAppointment(null)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={!editForm.start_time}
                  className="flex-[2] bg-primary hover:bg-primary-hover disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all"
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
