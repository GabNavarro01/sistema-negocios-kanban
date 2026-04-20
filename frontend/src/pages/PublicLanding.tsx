import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Calendar, Clock, User, Phone, Scissors, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import CalendarPicker from '../components/CalendarPicker';

const ExpandableCard = ({ service, onSelect, activeId, setActiveId, isSelected }: any) => {
  const isActive = activeId === service.id || isSelected;

  return (
    <motion.div
      layout
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 22, 
        mass: 1
      }}
      onMouseEnter={() => !isSelected && setActiveId(service.id)}
      onClick={() => onSelect(service)}
      className={`relative h-[250px] md:h-[500px] rounded-[30px] md:rounded-[40px] overflow-hidden cursor-pointer border-4 md:border-8 border-[#6b1421] shadow-2xl bg-black ${isSelected ? 'w-full h-[150px] md:h-[500px]' : isActive ? 'md:flex-[4]' : 'md:flex-1'} group`}
    >
      <img 
        src={service.image} 
        alt={service.name} 
        className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-[1500ms] ease-out group-hover:scale-110" 
      />
      <div className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out bg-black/40 group-hover:bg-black/20`} />
      
      {/* Centered Name - Always visible and centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
        <h3 className="text-white font-black text-xl md:text-4xl uppercase tracking-[0.2em] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-none">
          {service.name}
        </h3>
        <motion.div 
          initial={false}
          animate={{ width: isActive ? '60px' : '30px' }}
          className="mt-4 h-1.5 md:h-2 bg-[#f5f1e8] rounded-full shadow-lg" 
        />
      </div>

      {/* Decorative Gradient for selection state */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#6b1421]/60 via-transparent to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

const PublicLanding: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [activeCardId, setActiveCardId] = useState<number>(2);
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, scheduleRes] = await Promise.all([api.get('/services'), api.get('/schedule')]);
        setServices(servicesRes.data);
        setSchedule(scheduleRes.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const fetchSlots = async (date: string, serviceId: number) => {
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/availability?target_date=${date}&service_id=${serviceId}`);
      setAvailableSlots(data.available_slots);
    } catch (e) { setAvailableSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedService) fetchSlots(date, selectedService.id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val ? '+' + val.substring(0, 2) + (val.length > 2 ? ' ' + val.substring(2, 4) : '') + (val.length > 4 ? '-' + val.substring(4, 9) : '') + (val.length > 9 ? '-' + val.substring(9, 13) : '') : '';
    setClientPhone(formatted);
    setPhoneError(val.length > 0 && val.length < 10 ? 'Número incompleto' : '');
  };

  const handleSubmit = async () => {
    if (clientPhone.replace(/\D/g, '').length < 10) return setPhoneError('Número inválido');
    try {
      const duration = selectedService.duration_minutes || 30;
      const startD = new Date(`${selectedDate}T${selectedTime}`);
      const endD = new Date(startD.getTime() + duration * 60000);
      await api.post('/appointments', { client_name: clientName, client_phone: clientPhone, service_id: selectedService.id, date: selectedDate, start_time: selectedTime + ':00', end_time: endD.toTimeString().split(' ')[0].substring(0, 5) + ':00', notes: '' });
      alert('¡Turno reservado con éxito!');
      window.location.reload();
    } catch (e) { alert('Error al reservar el turno.'); }
  };

  const pokemonServices = [
    { id: 1, name: "Corte", image: "/assets/normal_cut.png" },
    { id: 2, name: "Corte + Barba", image: "/assets/Shop.png" },
    { id: 3, name: "Tintura", image: "/assets/tintura.png" }
  ];

  const Logo = () => (
    <div className="relative flex flex-col items-center mb-6 md:mb-12">
      <div className="absolute -top-8 md:-top-16 opacity-10"><Scissors size={80} className="text-[#6b1421] md:w-[180px] md:h-[180px] rotate-45" /></div>
      <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-none text-[#6b1421] relative z-10">MELION</h1>
      <div className="flex items-center gap-3 md:gap-6 w-full justify-center relative z-10">
        <div className="h-[2px] md:h-[3px] flex-1 bg-[#6b1421] opacity-30" />
        <h2 className="text-xl md:text-5xl font-light italic tracking-[0.4em] text-[#6b1421]">BARBER</h2>
        <div className="h-[2px] md:h-[3px] flex-1 bg-[#6b1421] opacity-30" />
      </div>
      <p className="text-[7px] md:text-xs font-black tracking-[0.4em] md:tracking-[0.6em] text-[#6b1421] opacity-40 mt-3 md:mt-6 uppercase">Est. 2024 • Premium Experience</p>
    </div>
  );

  const resetSelection = () => {
    setShowCards(false);
    setSelectedService(null);
    setStep(1);
  };

  return (
    <div className="relative min-h-screen bg-[#f5f1e8] overflow-x-hidden font-sans">
      <div className={`fixed inset-0 z-0 transition-all duration-1000 ${selectedService ? 'md:left-[85%]' : 'md:left-1/2'}`}>
        <img src="/assets/Shop.png" className="w-full h-full object-cover" alt="Barbershop" />
        <div className="absolute inset-0 bg-[#6b1421]/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#f5f1e8]/80 md:hidden" />
      </div>

      <div className={`relative z-10 transition-all duration-700 min-h-screen flex flex-col items-center justify-center p-4 md:p-12 ${selectedService ? 'w-full md:w-[85%]' : 'w-full md:w-1/2'}`}>
        <Logo />

        {!showCards ? (
          <button onClick={() => setShowCards(true)} className="mt-8 md:mt-12 px-10 md:px-16 py-4 md:py-6 bg-[#6b1421] text-white rounded-full font-black text-xl md:text-2xl tracking-widest border-4 border-[#6b1421] shadow-2xl hover:scale-105 transition-transform uppercase">
            Elegir Turno
          </button>
        ) : (
          <div className={`flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start w-full max-w-[1400px]`}>
            <div className={`w-full transition-all duration-700 ${selectedService ? 'md:w-[450px]' : 'flex-1'}`}>
              <div className={`${selectedService ? 'flex' : 'grid grid-cols-2 md:flex'} gap-4 md:gap-6`}>
                <AnimatePresence>
                  {pokemonServices.map((s) => {
                    if (selectedService && selectedService.id !== s.id) return null;
                    return <ExpandableCard key={s.id} service={s} activeId={activeCardId} setActiveId={setActiveCardId} onSelect={setSelectedService} isSelected={!!selectedService} />;
                  })}
                  {!selectedService && (
                    <motion.div 
                      layout
                      onClick={resetSelection}
                      className="md:hidden flex flex-col items-center justify-center h-[250px] rounded-[30px] border-4 border-[#6b1421] bg-[#6b1421]/10 text-[#6b1421] shadow-xl active:scale-95 transition-transform"
                    >
                      <ArrowLeft size={40} className="mb-2" />
                      <span className="font-black uppercase tracking-widest text-[12px]">Volver</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {selectedService && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 25 }} className="w-full flex-1 bg-white/60 backdrop-blur-xl rounded-[40px] md:rounded-[50px] border-4 md:border-8 border-[#6b1421] p-6 md:p-12 shadow-2xl">
                  <h3 className="text-xl md:text-4xl font-black text-[#6b1421] mb-6 md:mb-10 border-b-2 md:border-b-4 border-[#6b1421] pb-2 uppercase tracking-tighter flex items-center gap-3">
                    {step === 1 && <><Calendar size={24} className="md:w-[40px] md:h-[40px]" /> Seleccionar el día</>}
                    {step === 2 && <><Clock size={24} className="md:w-[40px] md:h-[40px]" /> Elige el horario</>}
                    {step === 3 && <><User size={24} className="md:w-[40px] md:h-[40px]" /> Tus datos</>}
                  </h3>

                  {step === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><CalendarPicker selectedDate={selectedDate} onDateSelect={(d) => { handleDateSelect(d); setStep(2); }} schedule={schedule} /></motion.div>}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loadingSlots ? [1,2,3,4].map(i => <div key={i} className="h-14 md:h-16 bg-gray-200 animate-pulse rounded-2xl" />) : (
                          availableSlots.map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 md:py-4 text-xs md:text-base font-black rounded-2xl border-2 md:border-4 transition-all ${selectedTime === time ? 'bg-[#6b1421] border-[#6b1421] text-white shadow-2xl' : 'bg-white border-gray-100 text-gray-600 hover:border-[#6b1421]'}`}>{time}</button>)
                        )}
                      </div>
                      <div className="flex gap-4 md:gap-6 mt-8 md:mt-10">
                         <button onClick={() => setStep(1)} className="flex-1 py-4 md:py-5 font-black text-[#6b1421] border-2 md:border-4 border-[#6b1421] rounded-2xl hover:bg-[#6b1421]/10 uppercase tracking-widest text-[10px] md:text-sm">Atrás</button>
                         <button onClick={() => setStep(3)} disabled={!selectedTime} className="flex-[2] py-4 md:py-5 font-black bg-[#6b1421] text-white rounded-2xl disabled:opacity-30 uppercase tracking-widest text-[10px] md:text-sm shadow-xl shadow-[#6b1421]/30">Siguiente</button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-sm font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                          <span>Tu Nombre <span className="text-[#6b1421]">*Obligatorio</span></span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} md:size={24} />
                          <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm md:text-lg" placeholder="Tu nombre..." />
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-sm font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                          <span>Tu Teléfono <span className="text-[#6b1421]">*Obligatorio</span></span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} md:size={24} />
                          <input type="tel" value={clientPhone} onChange={handlePhoneChange} className={`w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-gray-50 border-2 md:border-4 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm md:text-lg transition-colors ${phoneError ? 'border-red-400' : 'border-gray-100'}`} placeholder="+54 11 ..." />
                        </div>
                        {phoneError && <p className="text-red-500 text-[10px] font-bold flex items-center gap-2 ml-1 mt-1"><AlertCircle size={14} /> {phoneError}</p>}
                      </div>
                      <div className="flex gap-4 md:gap-6 mt-10 md:mt-12">
                         <button onClick={() => setStep(2)} className="flex-1 py-4 md:py-5 font-black text-[#6b1421] border-2 md:border-4 border-[#6b1421] rounded-2xl uppercase tracking-widest text-[10px] md:text-sm">Atrás</button>
                         <button onClick={handleSubmit} disabled={!clientName || !clientPhone || !!phoneError} className="flex-[2] py-4 md:py-5 font-black bg-[#6b1421] text-white rounded-2xl shadow-xl shadow-[#6b1421]/30 uppercase tracking-widest text-[10px] md:text-sm">Confirmar</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {(showCards && (selectedService || window.innerWidth >= 768)) && (
          <button onClick={resetSelection} className="fixed bottom-6 right-6 md:bottom-16 md:right-16 flex items-center gap-0 hover:gap-4 px-5 md:px-6 py-4 md:py-5 bg-[#6b1421] text-white rounded-full shadow-2xl transition-all duration-300 group z-50 border-2 md:border-4 border-white/20">
            <ArrowLeft size={24} md:size={30} className="flex-shrink-0" />
            <span className="w-0 group-hover:w-20 md:group-hover:w-24 overflow-hidden transition-all duration-300 font-black uppercase tracking-widest text-[10px] md:text-sm">Volver</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PublicLanding;
