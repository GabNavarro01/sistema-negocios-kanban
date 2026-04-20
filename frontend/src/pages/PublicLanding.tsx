import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Calendar, Clock, User, Phone, Mail, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import CalendarPicker from '../components/CalendarPicker';

const ExpandableCard = ({ service, onSelect, activeId, setActiveId, isSelected }: any) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = activeId === service.id || isSelected;
  const showText = isActive || isMobile;

  return (
    <motion.div
      layout
      transition={{ 
        type: 'spring', 
        stiffness: 150, 
        damping: 25, 
        mass: 1
      }}
      onMouseEnter={() => !isSelected && setActiveId(service.id)}
      onClick={() => onSelect(service)}
      className={`relative h-[250px] md:h-[500px] rounded-[30px] md:rounded-[40px] overflow-hidden cursor-pointer border-4 md:border-8 border-[#6b1421] shadow-2xl bg-black ${isSelected ? 'w-full h-[150px] md:h-[500px]' : isActive ? 'md:flex-[4]' : 'md:flex-1'} group`}
    >
      <motion.img 
        layout
        src={service.image} 
        alt={service.name} 
        className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-[1500ms] ease-out group-hover:scale-110" 
      />
      <motion.div layout className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out bg-black/40 group-hover:bg-black/20`} />
      
      {/* Centered Name */}
      <AnimatePresence>
        {showText && (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none"
          >
            <motion.div layout className="flex flex-col items-center">
              <motion.h3 layout className="text-white font-black text-xl md:text-4xl uppercase tracking-[0.2em] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight text-center">
                {service.name.includes(' + ') ? (
                  <>
                    <span className="block">{service.name.split(' + ')[0]}</span>
                    <span className="block text-[0.8em] opacity-80 mt-1">+ {service.name.split(' + ')[1]}</span>
                  </>
                ) : (
                  service.name
                )}
              </motion.h3>
              <motion.div 
                layout
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                className="mt-4 h-1.5 md:h-2 bg-[#f5f1e8] rounded-full shadow-lg" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Gradient for selection state */}
      {isSelected && (
        <motion.div layout className="absolute inset-0 bg-gradient-to-t from-[#6b1421]/60 via-transparent to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

const PublicLanding: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [services, setServices] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [activeCardId, setActiveCardId] = useState<number>(2);
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('54');
  const [contactPreference, setContactPreference] = useState<'email' | 'phone'>('phone');
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handlePhonePartChange = (part: 'prefix' | 'area' | 'part1' | 'part2', value: string) => {
    const clean = value.replace(/\D/g, '');
    let prefix = clientPhone.slice(0, 2);
    let area = clientPhone.slice(2, 4);
    let part1 = clientPhone.slice(4, 8);
    let part2 = clientPhone.slice(8, 12);

    if (part === 'prefix') prefix = clean.slice(0, 2);
    if (part === 'area') area = clean.slice(0, 2);
    if (part === 'part1') part1 = clean.slice(0, 4);
    if (part === 'part2') part2 = clean.slice(0, 4);

    const newPhone = prefix + area + part1 + part2;
    setClientPhone(newPhone);
    
    // Auto focus next
    if (part === 'prefix' && clean.length === 2) document.getElementById('phone-area')?.focus();
    if (part === 'area' && clean.length === 2) document.getElementById('phone-part1')?.focus();
    if (part === 'part1' && clean.length === 4) document.getElementById('phone-part2')?.focus();
  };

  const handleSubmit = async () => {
    if (contactPreference === 'email') {
      if (!clientEmail.toLowerCase().includes('@') || !clientEmail.toLowerCase().endsWith('.com')) {
        alert('El email es incorrecto.\nEjemplo: usuario@ejemplo.com');
        return;
      }
    } else {
      if (clientPhone.length < 12) {
        alert('El teléfono es incorrecto.\nFormato requerido: +54 11 1234 5678 (12 dígitos)');
        return;
      }
    }
    
    if (!clientName) return alert('Por favor, ingresa tu nombre');
    
    try {
      const duration = selectedService.duration_minutes || 30;
      const startD = new Date(`${selectedDate}T${selectedTime}`);
      const endD = new Date(startD.getTime() + duration * 60000);
      await api.post('/appointments', { 
        client_name: clientName, 
        client_phone: contactPreference === 'phone' ? clientPhone : null, 
        client_email: contactPreference === 'email' ? clientEmail : null,
        service_id: selectedService.id, 
        date: selectedDate, 
        start_time: selectedTime + ':00', 
        end_time: endD.toTimeString().split(' ')[0].substring(0, 5) + ':00', 
        notes: '' 
      });
      setIsSuccess(true);
    } catch (e) { alert('Error al reservar el turno.'); }
  };

  const pokemonServices = [
    { id: 2, name: "Corte + Barba", image: "/assets/Shop.png" },
    { id: 1, name: "Corte", image: "/assets/normal_cut.png" },
    { id: 3, name: "Tintura", image: "/assets/tintura.png" }
  ];

  const Logo = () => (
    <div className="relative flex flex-col items-center mb-6 md:mb-12">
      <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-none text-[#6b1421] relative z-10">MELION</h1>
      <div className="flex items-center gap-3 md:gap-6 w-full justify-center relative z-10">
        <div className="h-[2px] md:h-[3px] flex-1 bg-[#6b1421] opacity-30" />
        <h2 className="text-xl md:text-5xl font-light italic tracking-[0.4em] text-[#6b1421]">BARBER</h2>
        <div className="h-[2px] md:h-[3px] flex-1 bg-[#6b1421] opacity-30" />
      </div>
    </div>
  );

  const resetSelection = () => {
    setShowCards(false);
    setSelectedService(null);
    setStep(1);
  };

  return (
    <div className="relative min-h-screen bg-[#f5f1e8] overflow-x-hidden font-sans">
      <div className={`fixed inset-0 z-0 transition-all duration-1000 ${selectedService ? 'md:left-[60%]' : 'md:left-1/2'}`}>
        <img src="/assets/Shop.png" className="w-full h-full object-cover" alt="Barbershop" />
        <div className="absolute inset-0 bg-[#6b1421]/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#f5f1e8]/80 md:hidden" />
      </div>

      <div className={`relative z-10 transition-all duration-700 min-h-screen flex flex-col items-center justify-center p-4 md:p-12 ${selectedService ? 'w-full md:w-[60%]' : 'w-full md:w-1/2'}`}>
        <Logo />

        {!showCards ? (
          <button onClick={() => setShowCards(true)} className="mt-8 md:mt-12 px-10 md:px-16 py-4 md:py-6 bg-[#6b1421] text-white rounded-full font-black text-xl md:text-2xl tracking-widest border-4 border-[#6b1421] shadow-2xl hover:scale-105 transition-transform uppercase">
            Elegir Turno
          </button>
        ) : (
          <div className={`flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start w-full max-w-[1400px]`}>
            <div className={`w-full transition-all duration-700 ${selectedService ? 'md:w-[450px]' : 'flex-1'}`}>
              {!selectedService && (
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden md:block text-[#6b1421] font-black uppercase tracking-[0.3em] text-3xl text-center mb-12"
                >
                  Elige tu servicio
                </motion.h2>
              )}
              <div className="grid grid-cols-1 md:flex gap-4 md:gap-6">
                <AnimatePresence>
                  {pokemonServices
                    .filter(s => !selectedService || s.id === selectedService.id)
                    .map((s) => (
                      <ExpandableCard 
                        key={s.id} 
                        service={s} 
                        activeId={activeCardId} 
                        setActiveId={setActiveCardId} 
                        onSelect={setSelectedService} 
                        isSelected={!!selectedService} 
                      />
                    ))
                  }
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedService && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }} 
                  className="w-full flex-1 bg-white/60 backdrop-blur-xl rounded-[40px] md:rounded-[50px] border-4 md:border-8 border-[#6b1421] p-6 md:p-12 shadow-2xl overflow-hidden"
                >
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 md:space-y-6">
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest ml-1">
                          Tu Nombre <span className="text-[#6b1421] font-black">*Obligatorio</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3 md:py-4 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm md:text-lg" placeholder="Tu nombre..." />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest ml-1">
                          Tu Método de Contacto <span className="text-[#6b1421] font-black">*Obligatorio</span>
                        </label>
                        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                          <button 
                            onClick={() => setContactPreference('phone')}
                            className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${contactPreference === 'phone' ? 'bg-white text-[#6b1421] shadow-md scale-[1.02]' : 'text-gray-400'}`}
                          >
                            <Phone size={14} className="inline-block mr-2 mb-0.5" /> Teléfono
                          </button>
                          <button 
                            onClick={() => setContactPreference('email')}
                            className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${contactPreference === 'email' ? 'bg-white text-[#6b1421] shadow-md scale-[1.02]' : 'text-gray-400'}`}
                          >
                            <Mail size={14} className="inline-block mr-2 mb-0.5" /> Email
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {contactPreference === 'email' ? (
                          <motion.div 
                            key="email-input"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-2"
                          >
                            <div className="relative">
                              <Mail className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3 md:py-4 bg-gray-50 border-2 md:border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm md:text-lg" placeholder="email@ejemplo.com" />
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="phone-input"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-2"
                          >
                            {isMobile ? (
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">+</span>
                                <input 
                                  type="tel" 
                                  placeholder="54 11 1234 5678"
                                  maxLength={12}
                                  value={clientPhone}
                                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                  className="w-full pl-16 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 w-full max-w-none mx-auto">
                                 <div className="flex-1 relative">
                                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+</span>
                                   <input id="phone-prefix" maxLength={2} type="text" value={clientPhone.slice(0, 2)} onChange={e => handlePhonePartChange('prefix', e.target.value)} className="w-full pl-6 pr-0.5 py-4 bg-gray-50 border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm text-center tabular-nums" />
                                 </div>
                                 <input id="phone-area" placeholder="XX" maxLength={2} type="text" value={clientPhone.slice(2, 4)} onChange={e => handlePhonePartChange('area', e.target.value)} className="flex-1 px-0.5 py-4 bg-gray-50 border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm text-center tabular-nums" />
                                 <input id="phone-part1" placeholder="XXXX" maxLength={4} type="text" value={clientPhone.slice(4, 8)} onChange={e => handlePhonePartChange('part1', e.target.value)} className="flex-[2] px-0.5 py-4 bg-gray-50 border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm text-center tabular-nums" />
                                 <input id="phone-part2" placeholder="XXXX" maxLength={4} type="text" value={clientPhone.slice(8, 12)} onChange={e => handlePhonePartChange('part2', e.target.value)} className="flex-[2] px-0.5 py-4 bg-gray-50 border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold text-sm text-center tabular-nums" />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-4 md:gap-6 mt-6 md:mt-8">
                         <button onClick={() => setStep(2)} className="flex-1 py-3 md:py-4 font-black text-[#6b1421] border-2 md:border-4 border-[#6b1421] rounded-2xl uppercase tracking-widest text-[10px] md:text-xs">Atrás</button>
                         <button onClick={handleSubmit} disabled={!clientName || (contactPreference === 'email' ? !clientEmail : clientPhone.length < 4)} className="flex-[2] py-3 md:py-4 font-black bg-[#6b1421] text-white rounded-2xl shadow-xl shadow-[#6b1421]/30 uppercase tracking-widest text-[10px] md:text-xs">Confirmar</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      <AnimatePresence>
        {(showCards && (selectedService || isMobile)) && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={resetSelection} 
            className={`fixed bottom-6 right-6 md:bottom-12 transition-all duration-700 z-50 flex items-center gap-0 hover:gap-4 px-5 md:px-6 py-4 md:py-5 bg-[#6b1421] text-white rounded-full shadow-2xl group border-2 md:border-4 border-white/20 ${selectedService ? 'md:right-[40%] md:mr-8' : 'md:right-[50%] md:mr-8'}`}
          >
            <ArrowLeft className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8" />
            <span className="w-0 group-hover:w-20 md:group-hover:w-24 overflow-hidden transition-all duration-300 font-black uppercase tracking-widest text-[10px] md:text-sm">Volver</span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#f5f1e8] p-10 md:p-14 rounded-[40px] md:rounded-[60px] shadow-2xl text-center max-w-sm w-full border-[8px] md:border-[12px] border-[#6b1421] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#6b1421]/10" />
              
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute inset-0 bg-[#6b1421] rounded-full shadow-lg shadow-[#6b1421]/40"
                />
                <svg className="absolute inset-0 w-full h-full p-6 md:p-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "circOut" }}
                    d="M20 6L9 17L4 12"
                  />
                </svg>
              </div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-2xl md:text-4xl font-black text-[#6b1421] uppercase tracking-tighter mb-4"
              >
                ¡Turno Agendado!
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-600 font-bold text-sm md:text-base mb-10 px-4"
              >
                Tu reserva se ha completado con éxito. ¡Nos vemos pronto en la barbería!
              </motion.p>

              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={() => window.location.reload()}
                className="w-full py-4 md:py-5 bg-[#6b1421] text-white font-black rounded-2xl md:rounded-3xl uppercase tracking-[0.2em] shadow-xl shadow-[#6b1421]/30 hover:bg-[#8b1a2b] active:scale-95 transition-all text-[10px] md:text-xs"
              >
                Entendido
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicLanding;
