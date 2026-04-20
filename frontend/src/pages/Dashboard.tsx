import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X, Clock, Calendar as CalendarIcon, AlertCircle, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ScheduleConfig from '../components/ScheduleConfig';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
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

  useEffect(() => {
    fetchAppointments();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
    let socket: WebSocket;
    const connectWS = () => {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_APPOINTMENT') fetchAppointments();
      };
      socket.onclose = () => setTimeout(connectWS, 3000);
    };
    connectWS();
    return () => socket?.close();
  }, [navigate]);

  const fetchAvailableSlots = async (date: string, serviceId: number) => {
    if (!date) return;
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

  const handleUpdateAppointment = async (id: number, updateData: any) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updateData } : app));
    try {
      const { data } = await api.patch(`/barber/appointments/${id}`, updateData);
      setAppointments(prev => prev.map(app => app.id === id ? data : app));
    } catch (e) {
      console.error("Update failed", e);
      fetchAppointments();
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este turno?')) return;
    setAppointments(prev => prev.filter(app => app.id !== id));
    try {
      await api.delete(`/barber/appointments/${id}`);
    } catch (e) {
      console.error("Delete failed", e);
      fetchAppointments();
    }
  };

  const openEditModal = (app: any, reschedule = false) => {
    setEditingAppointment(app);
    setIsRescheduling(reschedule);
    setSelectedDate(app.date);
    setEditForm({
      start_time: app.start_time.substring(0, 5),
      end_time: app.end_time.substring(0, 5)
    });
    fetchAvailableSlots(app.date, app.service_id);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setEditForm({ start_time: '', end_time: '' });
    if (editingAppointment) fetchAvailableSlots(date, editingAppointment.service_id);
  };

  const handleSelectSlot = (time: string) => {
    const duration = editingAppointment?.service?.duration_minutes || 30;
    const startD = new Date(`2000-01-01T${time}`);
    const endD = new Date(startD.getTime() + duration * 60000);
    const endTime = endD.toTimeString().split(' ')[0].substring(0, 5);
    setEditForm({ start_time: time, end_time: endTime });
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    const updateData: any = {
      start_time: editForm.start_time + ':00',
      end_time: editForm.end_time + ':00',
      date: selectedDate
    };
    await handleUpdateAppointment(editingAppointment.id, updateData);
    closeModal();
  };

  const closeModal = () => {
    setEditingAppointment(null);
    setIsRescheduling(false);
    setEditForm({ start_time: '', end_time: '' });
    setAvailableSlots([]);
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden font-sans relative">
      <aside className="w-80 bg-gray-900 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/40">M</div>
          <h1 className="text-xl font-black text-white tracking-tight">MELION<span className="text-primary">BARBER</span></h1>
        </div>
        <div className="flex-1 overflow-hidden"><ScheduleConfig isDark={true} /></div>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><LogOut size={18} /> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Gestión de Turnos Semanales</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right"><p className="text-sm font-bold text-gray-800">Nicanor</p><p className="text-[10px] text-primary font-black uppercase tracking-tighter">Barbero Principal</p></div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold">N</div>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
          ) : (
            <KanbanBoard appointments={appointments} onUpdate={handleUpdateAppointment} onEdit={openEditModal} onDelete={handleDeleteAppointment} onReschedule={(id, date) => openEditModal(appointments.find(a => a.id === id), true)} />
          )}
        </div>
      </main>

      {/* Modal de Edición / Reprogramación */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl border-[10px] border-primary overflow-hidden">
            <div className="bg-primary p-8 flex justify-between items-center text-white">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">{isRescheduling ? 'Reprogramar Turno' : 'Modificar Horario'}</h2>
                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                  <UserIcon size={14} /> {editingAppointment.client_name} • {editingAppointment.service?.name}
                </div>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-10 space-y-8">
              {/* Selector de Fecha (Solo visible si es reprogramación) */}
              {isRescheduling && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon size={14} /> Seleccionar Nueva Fecha
                  </label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-4 border-gray-100 rounded-3xl outline-none focus:border-primary font-bold text-lg text-gray-700 transition-all"
                  />
                </div>
              )}

              {/* Selector de Horarios */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> {isRescheduling ? 'Elegir Nuevo Horario' : 'Ajustar Hora de Inicio'}
                </label>
                
                <div className="bg-gray-50 p-6 rounded-[30px] border-4 border-gray-100">
                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-3">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-2xl" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map(time => (
                        <button key={time} onClick={() => handleSelectSlot(time)} className={`py-4 text-sm font-black rounded-2xl border-4 transition-all ${editForm.start_time === time ? 'bg-primary border-primary text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/40'}`}>{time}</button>
                      ))}
                      {availableSlots.length === 0 && <p className="col-span-4 text-center py-6 text-gray-400 font-bold italic text-sm">No hay horarios disponibles para esta fecha</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen */}
              {editForm.start_time && (
                <div className="p-6 bg-primary/5 border-4 border-primary/20 rounded-[30px] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Nuevo Horario</p>
                    <p className="text-xl font-black text-gray-900">{editForm.start_time} — {editForm.end_time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</p>
                    <p className="text-lg font-black text-gray-700">{selectedDate}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-5 rounded-[20px] transition-all uppercase tracking-widest text-xs">Cancelar</button>
                <button onClick={handleSaveEdit} disabled={!editForm.start_time || !selectedDate} className="flex-[2] bg-primary hover:bg-primary-hover disabled:opacity-30 text-white font-black py-5 rounded-[20px] shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-xs">Confirmar Reprogramación</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
