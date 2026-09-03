const classes = [
  { id: 'seg-0700', day: 'SEG', date: '07 OUT', time: '07:00', name: 'Vinyasa suave', teacher: 'com Marina', spots: 3 },
  { id: 'seg-1830', day: 'SEG', date: '07 OUT', time: '18:30', name: 'Hatha essencial', teacher: 'com Joao', spots: 5 },
  { id: 'ter-1200', day: 'TER', date: '08 OUT', time: '12:00', name: 'Pausa para respirar', teacher: 'com Bia', spots: 2 },
  { id: 'qua-0700', day: 'QUA', date: '09 OUT', time: '07:00', name: 'Vinyasa suave', teacher: 'com Marina', spots: 6 },
  { id: 'qua-1900', day: 'QUA', date: '09 OUT', time: '19:00', name: 'Yoga restaurativa', teacher: 'com Joao', spots: 4 },
  { id: 'qui-1830', day: 'QUI', date: '10 OUT', time: '18:30', name: 'Hatha essencial', teacher: 'com Bia', spots: 8 },
  { id: 'sex-0700', day: 'SEX', date: '11 OUT', time: '07:00', name: 'Flow de sexta', teacher: 'com Marina', spots: 1 },
  { id: 'sab-0930', day: 'SAB', date: '12 OUT', time: '09:30', name: 'Pratica coletiva', teacher: 'com equipe M&C', spots: 7 }
];
const storageKey = 'mente-corpo-reservas';
const getReservations = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
const saveReservations = (reservations) => localStorage.setItem(storageKey, JSON.stringify(reservations));
const reservedFor = (classId) => getReservations().filter((reservation) => reservation.classId === classId).length;

function renderSchedule() {
  const grid = document.querySelector('#scheduleGrid');
  const grouped = classes.reduce((days, item) => ({ ...days, [item.day]: [...(days[item.day] || []), item] }), {});
  grid.innerHTML = Object.entries(grouped).map(([day, dayClasses]) => `
    <div class="day-column"><div class="day-header"><strong>${day}</strong><span>${dayClasses[0].date}</span></div>
      ${dayClasses.map((item) => {
        const remaining = item.spots - reservedFor(item.id);
        return `<div class="class-item"><div class="class-time">${item.time}</div><div class="class-name">${item.name}</div><div class="class-teacher">${item.teacher}</div><span class="spots ${remaining === 0 ? 'full' : ''}">${remaining === 0 ? 'Turma cheia' : `${remaining} tapetes livres`}</span></div>`;
      }).join('')}
    </div>`).join('');
}

function renderClassOptions() {
  const select = document.querySelector('#classSelect');
  select.innerHTML = '<option value="">Selecione um horario</option>' + classes.map((item) => {
    const remaining = item.spots - reservedFor(item.id);
    return `<option value="${item.id}" ${remaining === 0 ? 'disabled' : ''}>${item.day}, ${item.date} - ${item.time} · ${item.name}${remaining === 0 ? ' · lotada' : ` · ${remaining} vagas`}</option>`;
  }).join('');
}

function renderDashboard() {
  const reservations = getReservations();
  document.querySelector('#reservationCount').textContent = reservations.length;
  document.querySelector('#todayLabel').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());
  const table = document.querySelector('#reservationTable');
  if (!reservations.length) {
    table.innerHTML = '<tr class="empty-row"><td colspan="4">Ainda nao ha reservas. Elas aparecerao aqui apos o check-in.</td></tr>';
    return;
  }
  table.innerHTML = reservations.slice().reverse().map((reservation) => `<tr><td><strong>${reservation.name}</strong></td><td>${reservation.className}</td><td>${reservation.day}, ${reservation.date} · ${reservation.time}</td><td><span class="badge">Confirmada</span></td></tr>`).join('');
}

document.querySelector('#reservationForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#studentName').value.trim();
  const classId = document.querySelector('#classSelect').value;
  const message = document.querySelector('#formMessage');
  const selectedClass = classes.find((item) => item.id === classId);
  if (name.length < 3 || !selectedClass) {
    message.textContent = 'Preencha seu nome e escolha uma aula para continuar.';
    message.className = 'form-message error';
    return;
  }
  if (reservedFor(classId) >= selectedClass.spots) {
    message.textContent = 'Esta turma acabou de lotar. Escolha outro horario.';
    message.className = 'form-message error';
    renderSchedule(); renderClassOptions(); return;
  }
  const reservations = getReservations();
  reservations.push({ name, classId, className: selectedClass.name, day: selectedClass.day, date: selectedClass.date, time: selectedClass.time, createdAt: new Date().toISOString() });
  saveReservations(reservations);
  message.textContent = `Reserva confirmada para ${selectedClass.day}, ${selectedClass.date}, as ${selectedClass.time}.`;
  message.className = 'form-message success';
  event.target.reset();
  renderSchedule(); renderClassOptions(); renderDashboard();
});

document.querySelector('#clearReservations').addEventListener('click', () => {
  if (getReservations().length && window.confirm('Remover todas as reservas deste dispositivo?')) {
    saveReservations([]); renderSchedule(); renderClassOptions(); renderDashboard();
  }
});

renderSchedule(); renderClassOptions(); renderDashboard();
