import React, { useState, useMemo } from 'react';
import { useAgendaStore } from '../../store/stores';
import { CalendarDays, Plus, X, Edit2, Trash2, Clock, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AppointmentDrawer({ open, onClose, editItem, selectedDate }) {
  const { addAppointment, updateAppointment } = useAgendaStore();
  const [form, setForm] = useState(editItem || {
    title: '',
    description: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
  });

  const handleSave = () => {
    if (!form.title || !form.date) return;
    if (editItem?.id) {
      updateAppointment(editItem.id, form);
    } else {
      addAppointment(form);
    }
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer animate-slide">
        <div className="drawer-title">
          <span>{editItem?.id ? 'Editar' : 'Novo'} Compromisso</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Título</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Reunião de equipe" />
          </div>
          <div className="input-group">
            <label className="input-label">Descrição</label>
            <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do compromisso..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Data</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Horário</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Observações (opcional)</label>
            <textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." style={{ minHeight: 60 }} />
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{editItem?.id ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>
    </>
  );
}

function CalendarGrid({ currentMonth, appointments, onSelectDate, selectedDate }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const today = new Date();

  return (
    <div className="calendar-grid-wrapper">
      <div className="calendar-weekdays">
        {weekDays.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
      </div>
      <div className="calendar-days">
        {days.map((d, i) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(d, monthStart);
          const isToday = isSameDay(d, today);
          const isSelected = selectedDate && isSameDay(d, new Date(selectedDate + 'T12:00:00'));
          const dayAppointments = appointmentsByDate[dateStr] || [];
          const hasAppointments = dayAppointments.length > 0;

          return (
            <button
              key={i}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasAppointments ? 'has-events' : ''}`}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="calendar-day-number">{format(d, 'd')}</span>
              {hasAppointments && (
                <div className="calendar-day-dots">
                  {dayAppointments.slice(0, 3).map((_, j) => (
                    <span key={j} className="calendar-dot" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AgendaOS() {
  const { appointments, deleteAppointment } = useAgendaStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const selectedAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDate)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [appointments, selectedDate]);

  const upcomingAppointments = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments
      .filter(a => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 5);
  }, [appointments]);

  const totalThisMonth = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    return appointments.filter(a => a.date.startsWith(monthStr)).length;
  }, [appointments, currentMonth]);

  const todayCount = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(a => a.date === today).length;
  }, [appointments]);

  const formatSelectedDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return format(d, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"><CalendarDays size={20} style={{ display: 'inline', marginRight: 8 }} />AGENDA_OS</h1>
          <p className="page-subtitle">Gerencie seus compromissos e eventos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setDrawerOpen(true); }}><Plus size={14} /> Novo Compromisso</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Hoje</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--blue)' }}>{todayCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Este Mês</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--purple)' }}>{totalThisMonth}</div>
        </div>
        <div className="card">
          <div className="card-title">Total</div>
          <div className="card-value" style={{ marginTop: 8 }}>{appointments.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Próximos</div>
          <div className="card-value" style={{ marginTop: 8, color: 'var(--green)' }}>{upcomingAppointments.length}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Calendar */}
        <div className="card">
          <div className="calendar-header">
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="calendar-month-title">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
          <CalendarGrid
            currentMonth={currentMonth}
            appointments={appointments}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Day Detail */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">{formatSelectedDate(selectedDate)}</span>
            <button className="btn btn-sm btn-secondary" onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
              <Plus size={12} /> Adicionar
            </button>
          </div>

          {selectedAppointments.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <CalendarDays size={40} />
              <p>Nenhum compromisso nesta data</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedAppointments.map(apt => (
                <div key={apt.id} className="agenda-item">
                  <div className="agenda-item-time">
                    <Clock size={12} />
                    <span>{apt.time || '--:--'}</span>
                  </div>
                  <div className="agenda-item-content">
                    <p className="agenda-item-title">{apt.title}</p>
                    {apt.description && <p className="agenda-item-desc">{apt.description}</p>}
                    {apt.notes && (
                      <p className="agenda-item-notes">
                        <FileText size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {apt.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(apt); setDrawerOpen(true); }}><Edit2 size={12} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteAppointment(apt.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming */}
      <div className="section-title">Próximos Compromissos</div>
      {upcomingAppointments.length === 0 && (
        <div className="empty-state">
          <CalendarDays size={48} />
          <p>Nenhum compromisso futuro</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {upcomingAppointments.map(apt => (
          <div key={apt.id} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={14} color="var(--blue)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{apt.title}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {(() => { try { return format(new Date(apt.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR }); } catch { return apt.date; } })()} · {apt.time || '--:--'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(apt); setDrawerOpen(true); }}><Edit2 size={12} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteAppointment(apt.id)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      <AppointmentDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        editItem={editItem}
        selectedDate={selectedDate}
      />
    </div>
  );
}
