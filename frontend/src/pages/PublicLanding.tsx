import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Calendar, Clock, User, Phone, Scissors, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import CalendarPicker from '../components/CalendarPicker';

const ExpandableCard = ({ service, onSelect, activeId, setActiveId, isSelected }: any) => {
  const isActive = activeId === service.id;

  return (
    <motion.div
      layout
      onMouseEnter={() => !isSelected && setActiveId(service.id)}
      onClick={() => onSelect(service)}
      className={`relative h-[500px] rounded-[30px] overflow-hidden cursor-pointer border-4 border-[#6b1421] transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl ${isActive ? 'flex-[4]' : 'flex-1'} group`}
    >
      <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" />
      <div className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${isActive ? 'bg-gradient-to-t from-[#6b1421] via-transparent to-transparent opacity-90' : 'bg-black/40 group-hover:bg-black/20'}`} />
      <div className={`absolute inset-0 p-8 flex flex-col justify-end transition-all duration-[1000ms] ease-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{service.name}</h3>
            <p className="text-[#f5f1e8] font-bold mt-2 opacity-80">{service.description}</p>
          </div>
          <span className="text-2xl font-black text-[#f5f1e8] border-2 border-[#f5f1e8] px-4 py-1 rounded-full">{service.price}</span>
        </div>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <span className="text-white font-black text-2xl uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr] drop-shadow-lg">{service.name}</span>
      </div>
    </motion.div>
  );
};

const PublicLanding: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [activeCardId, setActiveCardId] = useState<number>(2);
  
  // Booking Form States
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
        const [servicesRes, scheduleRes] = await Promise.all([
          api.get('/services'),
          api.get('/schedule')
        ]);
        setServices(servicesRes.data);
        setSchedule(scheduleRes.data);
        console.log("Schedule loaded:", scheduleRes.data);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  const fetchSlots = async (date: string, serviceId: number) => {
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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedService) fetchSlots(date, selectedService.id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += '+' + digits.substring(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.substring(2, 4);
      if (digits.length > 4) formatted += '-' + digits.substring(4, 9);
      if (digits.length > 9) formatted += '-' + digits.substring(9, 13);
    }
    setClientPhone(formatted);

    // Basic validation
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError('Número incompleto');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async () => {
    if (clientPhone.replace(/\D/g, '').length < 10) {
      setPhoneError('Por favor ingresa un número válido');
      return;
    }

    try {
      const duration = selectedService.duration_minutes || 30;
      const startD = new Date(`${selectedDate}T${selectedTime}`);
      const endD = new Date(startD.getTime() + duration * 60000);
      const endTime = endD.toTimeString().split(' ')[0].substring(0, 5) + ':00';
      const startTime = selectedTime + ':00';

      await api.post('/appointments', {
        client_name: clientName,
        client_phone: clientPhone,
        service_id: selectedService.id,
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        notes: ''
      });
      alert('¡Turno reservado con éxito!');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error al reservar el turno.');
    }
  };

  const pokemonServices = [
    { id: 1, name: "Corte", price: "$2000", image: "/assets/normal_cut.png", description: "Corte clásico o moderno con tijera y clipper.", duration_minutes: 30 },
    { id: 2, name: "Corte + Barba", price: "$3500", image: "/assets/465811208_566941666022816_4337422192224972584_n.jpg", description: "Servicio completo de barbería y perfilado.", duration_minutes: 60 },
    { id: 3, name: "Tintura", price: "$4000", image: "/assets/tintura.png", description: "Coloración premium o cobertura de canas.", duration_minutes: 90 }
  ];

  const Logo = ({ size = "large" }: { size?: "small" | "large" }) => (
    <div className={`relative flex flex-col items-center transition-all ${size === "small" ? "mb-8 scale-75" : "mb-8"}`}>
      <div className="absolute -top-12 opacity-10">
        <Scissors size={size === "small" ? 80 : 160} className="text-[#6b1421] rotate-45" />
      </div>
      <h1 className={`${size === "small" ? "text-6xl" : "text-9xl"} font-black tracking-tighter leading-none text-[#6b1421] relative z-10`}>MELION</h1>
      <div className="flex items-center gap-4 w-full justify-center relative z-10">
        <div className="h-[2px] flex-1 bg-[#6b1421] opacity-30" />
        <h2 className={`${size === "small" ? "text-2xl" : "text-4xl"} font-light italic tracking-[0.4em] text-[#6b1421]`}>BARBER</h2>
        <div className="h-[2px] flex-1 bg-[#6b1421] opacity-30" />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#f5f1e8] overflow-x-hidden flex flex-col md:flex-row font-sans">
      <div className={`transition-all duration-700 p-6 md:p-12 flex flex-col justify-center items-center relative min-h-screen ${selectedService ? 'w-full md:w-[75%]' : 'w-full md:w-1/2'}`}>
        <Logo size={selectedService ? "small" : "large"} />

        {!showCards ? (
          <button onClick={() => setShowCards(true)} className="mt-8 px-12 py-5 bg-[#6b1421] text-white rounded-full font-black text-xl tracking-widest border-4 border-[#6b1421] shadow-2xl hover:scale-105 transition-transform uppercase">
            Elegir Turno
          </button>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-start w-full max-w-6xl">
            <div className={`flex gap-4 transition-all duration-700 h-[500px] ${selectedService ? 'w-72' : 'flex-1'}`}>
              <AnimatePresence>
                {pokemonServices.map((s) => {
                  if (selectedService && selectedService.id !== s.id) return null;
                  return <ExpandableCard key={s.id} service={s} activeId={activeCardId} setActiveId={setActiveCardId} onSelect={setSelectedService} isSelected={!!selectedService} />;
                })}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedService && (
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-white/50 backdrop-blur-md rounded-[40px] border-8 border-[#6b1421] p-8 md:p-10 shadow-2xl">
                  <h3 className="text-3xl font-black text-[#6b1421] mb-8 border-b-4 border-[#6b1421] pb-2 uppercase tracking-tighter flex items-center gap-3">
                    {step === 1 && <><Calendar className="text-accent" /> Seleccionar el día</>}
                    {step === 2 && <><Clock className="text-accent" /> Elige el horario</>}
                    {step === 3 && <><User className="text-accent" /> Tus datos</>}
                  </h3>

                  {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       <CalendarPicker selectedDate={selectedDate} onDateSelect={(d) => { handleDateSelect(d); setStep(2); }} schedule={schedule} />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loadingSlots ? [1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-2xl" />) : (
                          availableSlots.map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 text-sm font-black rounded-2xl border-4 transition-all ${selectedTime === time ? 'bg-[#6b1421] border-[#6b1421] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-600 hover:border-[#6b1421]'}`}>{time}</button>)
                        )}
                      </div>
                      <div className="flex gap-4 mt-8">
                         <button onClick={() => setStep(1)} className="flex-1 py-4 font-black text-[#6b1421] border-4 border-[#6b1421] rounded-2xl hover:bg-[#6b1421]/10 uppercase tracking-widest text-xs">Atrás</button>
                         <button onClick={() => setStep(3)} disabled={!selectedTime} className="flex-[2] py-4 font-black bg-[#6b1421] text-white rounded-2xl disabled:opacity-30 uppercase tracking-widest text-xs shadow-lg shadow-[#6b1421]/30">Siguiente</button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                          <span>Tu Nombre <span className="text-[#6b1421]">*Obligatorio</span></span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-4 border-gray-100 rounded-2xl focus:border-[#6b1421] outline-none font-bold" placeholder="Escribe tu nombre..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                          <span>Tu Teléfono <span className="text-[#6b1421]">*Obligatorio</span></span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input type="tel" value={clientPhone} onChange={handlePhoneChange} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-4 rounded-2xl focus:border-[#6b1421] outline-none font-bold transition-colors ${phoneError ? 'border-red-400' : 'border-gray-100'}`} placeholder="+54 11 ..." />
                        </div>
                        {phoneError && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 ml-2 mt-1"><AlertCircle size={12} /> {phoneError}</p>}
                        <p className="text-gray-400 text-[10px] italic ml-1">Escribe tu número con el código de área (ej: +54 11 1234-5678)</p>
                      </div>
                      <div className="flex gap-4 mt-10">
                         <button onClick={() => setStep(2)} className="flex-1 py-4 font-black text-[#6b1421] border-4 border-[#6b1421] rounded-2xl uppercase tracking-widest text-xs">Atrás</button>
                         <button onClick={handleSubmit} disabled={!clientName || !clientPhone || !!phoneError} className="flex-[2] py-4 font-black bg-[#6b1421] text-white rounded-2xl shadow-xl shadow-[#6b1421]/30 uppercase tracking-widest text-xs">Confirmar Turno</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {showCards && (
          <button onClick={() => { setShowCards(false); setSelectedService(null); setStep(1); }} className="fixed bottom-6 right-6 md:absolute md:bottom-12 md:right-12 flex items-center gap-0 hover:gap-3 px-5 py-4 bg-[#6b1421] text-white rounded-full shadow-2xl transition-all duration-300 group overflow-hidden z-50 border-4 border-white/20">
            <ArrowLeft size={24} className="flex-shrink-0" />
            <span className="w-0 group-hover:w-20 overflow-hidden transition-all duration-300 font-black uppercase tracking-widest text-xs">Volver</span>
          </button>
        )}
      </div>

      <div className={`transition-all duration-700 relative h-64 md:h-auto ${selectedService ? 'hidden md:block md:w-[25%]' : 'w-full md:w-1/2'}`}>
        <img src="/assets/Shop.png" className="w-full h-full object-cover" alt="Barbershop" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0 bg-[#6b1421]/15 mix-blend-multiply" />
      </div>
    </div>
  );
};

export default PublicLanding;
