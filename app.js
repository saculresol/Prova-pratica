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
const apiBaseUrl = (window.MENTE_CORPO_API_URL || '').replace(/\/$/, '');
const readStoredReservations = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Reservas locais inválidas. Resetando armazenamento.', error);
    localStorage.setItem(storageKey, JSON.stringify([]));
    return [];
  }
};
let reservations = readStoredReservations();
const getReservations = () => reservations;
const saveLocalReservations = (nextReservations) => {
  reservations = nextReservations;
  localStorage.setItem(storageKey, JSON.stringify(reservations));
};
const reservedFor = (classId) => reservations.filter((reservation) => reservation.classId === classId).length;
const hasReservationForStudent = (name, classId) => reservations.some((reservation) => reservation.classId === classId && reservation.name.trim().toLowerCase() === name.trim().toLowerCase());
const setFormMessage = (message, type) => {
  const formMessage = document.querySelector('#formMessage');
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = type ? `form-message ${type}` : 'form-message';
};

async function loadReservations() {
  if (!apiBaseUrl) return;
  const response = await fetch(`${apiBaseUrl}/reservas`);
  if (!response.ok) throw new Error('Não foi possível carregar as reservas.');
  reservations = await response.json();
}

async function createReservation(reservation) {
  if (!apiBaseUrl) {
    saveLocalReservations([...reservations, reservation]);
    return reservation;
  }
  const response = await fetch(`${apiBaseUrl}/reservas`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reservation)
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || 'Não foi possível confirmar a reserva.');
  const created = await response.json();
  reservations = [...reservations, created];
  return created;
}

async function clearAllReservations() {
  if (apiBaseUrl) {
    const response = await fetch(`${apiBaseUrl}/reservas`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Não foi possível limpar as reservas.');
  }
  saveLocalReservations([]);
}

function renderSchedule() {
  const grid = document.querySelector('#scheduleGrid');
  if (!grid) return;
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
  if (!select) return;
  select.innerHTML = '<option value="">Selecione um horario</option>' + classes.map((item) => {
    const remaining = item.spots - reservedFor(item.id);
    return `<option value="${item.id}" ${remaining === 0 ? 'disabled' : ''}>${item.day}, ${item.date} - ${item.time} · ${item.name}${remaining === 0 ? ' · lotada' : ` · ${remaining} vagas`}</option>`;
  }).join('');
}

function renderDashboard() {
  const countNode = document.querySelector('#reservationCount');
  const dateNode = document.querySelector('#todayLabel');
  const table = document.querySelector('#reservationTable');
  if (!countNode || !dateNode || !table) return;

  const reservations = getReservations();
  countNode.textContent = reservations.length;
  dateNode.textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());
  if (!reservations.length) {
    table.innerHTML = '<tr class="empty-row"><td colspan="4">Ainda nao ha reservas. Elas aparecerao aqui apos o check-in.</td></tr>';
    return;
  }
  table.innerHTML = reservations.slice().reverse().map((reservation) => `<tr><td><strong>${reservation.name}</strong></td><td>${reservation.className}</td><td>${reservation.day}, ${reservation.date} · ${reservation.time}</td><td><span class="badge">Confirmada</span></td></tr>`).join('');
}

document.querySelector('#reservationForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#studentName').value.trim();
  const classId = document.querySelector('#classSelect').value;
  const selectedClass = classes.find((item) => item.id === classId);
  if (name.length < 3 || !selectedClass) {
    setFormMessage('Preencha seu nome e escolha uma aula para continuar.', 'error');
    return;
  }
  if (hasReservationForStudent(name, classId)) {
    setFormMessage('Você já possui uma reserva para este horário. Escolha outra aula.', 'error');
    return;
  }
  if (reservedFor(classId) >= selectedClass.spots) {
    setFormMessage('Esta turma acabou de lotar. Escolha outro horario.', 'error');
    renderSchedule(); renderClassOptions(); return;
  }
  try {
    await createReservation({ name, classId, className: selectedClass.name, day: selectedClass.day, date: selectedClass.date, time: selectedClass.time, createdAt: new Date().toISOString() });
    setFormMessage(`Reserva confirmada para ${selectedClass.day}, ${selectedClass.date}, as ${selectedClass.time}.`, 'success');
    event.target.reset();
    renderSchedule(); renderClassOptions(); renderDashboard();
  } catch (error) {
    setFormMessage(error.message, 'error');
  }
});

document.querySelector('#clearReservations')?.addEventListener('click', async () => {
  if (getReservations().length && window.confirm('Remover todas as reservas deste dispositivo?')) {
    await clearAllReservations(); renderSchedule(); renderClassOptions(); renderDashboard();
  }
});

loadReservations().then(() => {
  if (document.querySelector('#scheduleGrid')) {
    renderSchedule();
    renderClassOptions();
  }
  if (document.querySelector('#reservationTable')) renderDashboard();
}).catch((error) => {
  console.error(error);
  setFormMessage('Não foi possível conectar ao servidor de reservas.', 'error');
  if (document.querySelector('#reservationTable')) renderDashboard();
});
