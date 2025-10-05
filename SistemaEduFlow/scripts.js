// ===================================================================
// 1. SETUP E VARIÁVEIS GLOBAIS
// ===================================================================
const $ = id => document.getElementById(id);
let users = [], currentUser = null, turmas = [], alunos = [], atividades = [], entregas = [];

// ===================================================================
// 2. PERSISTÊNCIA DE DADOS (LocalStorage)
// ===================================================================
const generateUniqueId = () => Date.now() + Math.floor(Math.random() * 1000);

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('turmas', JSON.stringify(turmas));
    localStorage.setItem('alunos', JSON.stringify(alunos));
    localStorage.setItem('atividades', JSON.stringify(atividades));
    localStorage.setItem('entregas', JSON.stringify(entregas));
}

function loadData() {
    // Carrega os dados guardados. Se não existirem, inicia com dados padrão.
    const storedUsers = localStorage.getItem('users');
    const storedAlunos = localStorage.getItem('alunos');

    if (!storedUsers || !storedAlunos) {
        // Se for a primeira vez que a aplicação corre, cria dados de exemplo.
        const prof = { email: 'prof@unip.br', password: '123456', name: 'Prof. Ana', role: 'professor' };
        const joao = { email: 'joaosilva@unip.br', password: '123456', name: 'João Silva', role: 'aluno' };
        const maria = { email: 'mariaisabel@unip.br', password: '123456', name: 'Maria Isabel', role: 'aluno' };
        
        users = [prof, joao, maria];
        
        const turmaExemploId = generateUniqueId();
        turmas = [{ id: turmaExemploId, turmaNome: "ADS 2025", turmaDisciplina: "Eng. de Software", turmaAnoSemestre: "2025/2" }];

        alunos = [
            { id: generateUniqueId(), alunoNome: "João Silva", alunoMatricula: "123456", alunoEmail: "joaosilva@unip.br", alunoTurma: turmaExemploId },
            { id: generateUniqueId(), alunoNome: "Maria Isabel", alunoMatricula: "123456", alunoEmail: "mariaisabel@unip.br", alunoTurma: turmaExemploId }
        ];
        saveData(); // Guarda os dados iniciais
    } else {
        // Se já existirem dados, apenas os carrega
        users = JSON.parse(storedUsers);
        alunos = JSON.parse(storedAlunos);
        turmas = JSON.parse(localStorage.getItem('turmas') || '[]');
        atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
        entregas = JSON.parse(localStorage.getItem('entregas') || '[]');
    }
}


// ===================================================================
// 3. AUTENTICAÇÃO E NAVEGAÇÃO
// ===================================================================
$('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('emailInput').value.trim();
    const pass = $('passwordInput').value.trim();
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        loadDashboard();
    } else {
        $('errorMsg').textContent = 'Email ou RA incorretos.';
        $('errorMsg').style.display = 'block';
    }
});

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    window.location.reload(); // Recarrega a página para garantir que tudo seja limpo
}

function loadDashboard() {
    $('loginPage').style.display = 'none';
    $('dashboardPage').style.display = 'block';
    const userProfile = alunos.find(a => a.alunoEmail === currentUser.email);
    const displayName = (currentUser.role === 'professor') ? currentUser.name : (userProfile?.alunoNome || currentUser.name);
    $('userName').textContent = displayName;
    $('userEmail').textContent = currentUser.email;
    $('userAvatar').textContent = displayName.charAt(0).toUpperCase();
    buildMenu();
    showSection('dashboardSection', document.querySelector('.menu-item'));
}

function buildMenu() {
    const menu = $('menuContainer');
    const professorItems = [ { id: 'dashboardSection', label: 'Dashboard', icon: '📊' }, { id: 'turmasSection', label: 'Turmas', icon: '📚' }, { id: 'alunosSection', label: 'Alunos', icon: '👨‍🎓' }, { id: 'atividadesSection', label: 'Atividades', icon: '📋' }, { id: 'notasSectionProfessor', label: 'Avaliar Entregas', icon: '✅' } ];
    const alunoItems = [ { id: 'dashboardSection', label: 'Dashboard', icon: '📊' }, { id: 'atividadesAlunoSection', label: 'Minhas Atividades', icon: '📋' }, { id: 'notasAlunoSection', label: 'Minhas Notas', icon: '⭐' } ];
    const items = (currentUser.role === 'professor') ? professorItems : alunoItems;
    menu.innerHTML = items.map(item => `<div class="menu-item" onclick="showSection('${item.id}', this)">${item.icon} ${item.label}</div>`).join('');
}

function showSection(id, menuItemElement) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    $(id).classList.add('active');
    if (menuItemElement) menuItemElement.classList.add('active');
    const sectionLoaders = { turmasSection: loadTurmas, alunosSection: loadAlunos, atividadesSection: loadAtividades, notasSectionProfessor: loadEntregas, atividadesAlunoSection: loadAtividadesAluno, notasAlunoSection: loadNotasAluno, dashboardSection: loadStats };
    if (sectionLoaders[id]) sectionLoaders[id]();
}

// ... (O resto do seu código, como a lógica de CRUD e sincronização, permanece aqui)
// ... Vou omitir por brevidade, mas o seu código completo deve ser mantido a partir daqui.
function openModal(title, fields, onSave) { $('modalTitle').textContent = title; const container = $('modalFields'); container.innerHTML = fields.map(f => { let inputHtml = ''; const required = f.required ? 'required' : ''; const commonAttrs = `id="mf_${f.id}" class="form-group" value="${f.value || ''}" ${required}`; switch (f.type) { case 'select': inputHtml = `<select id="mf_${f.id}" class="form-group" ${required}>${f.options.map(o => `<option value="${o.value}" ${f.value == o.value ? 'selected' : ''}>${o.text}</option>`).join('')}</select>`; break; case 'textarea': inputHtml = `<textarea id="mf_${f.id}" class="form-group" rows="4" ${required}>${f.value || ''}</textarea>`; break; case 'number': inputHtml = `<input type="number" ${commonAttrs} min="${f.min || 0}" max="${f.max}" step="${f.step || '0.1'}">`; break; default: inputHtml = `<input type="${f.type}" ${commonAttrs}>`; } return `<div class="form-group"><label for="mf_${f.id}">${f.label}</label>${inputHtml}</div>`; }).join(''); $('genericModal').classList.add('show'); $('modalForm').onsubmit = e => { e.preventDefault(); const data = {}; fields.forEach(f => data[f.id] = $(`mf_${f.id}`).value); if (onSave(data) !== false) closeModal(); }; }
const closeModal = () => $('genericModal').classList.remove('show');
const toggleSidebar = () => document.querySelector('.sidebar').classList.toggle('open');
function loadStats(){ const grid = $('statsGrid'); if (currentUser.role === 'professor') { const entregasPendentes = entregas.filter(e => e.status === 'Entregue').length; grid.innerHTML = `<div class="stat-card"><h3>Turmas</h3><div class="value">${turmas.length}</div></div> <div class="stat-card"><h3>Alunos</h3><div class="value">${alunos.length}</div></div> <div class="stat-card"><h3>Atividades</h3><div class="value">${atividades.length}</div></div> <div class="stat-card"><h3>Pendentes</h3><div class="value">${entregasPendentes}</div></div>`; } else { const alunoAtual = alunos.find(a => a.alunoEmail === currentUser.email); const minhasEntregas = alunoAtual ? entregas.filter(e => e.alunoId === alunoAtual.id) : []; const pendentes = minhasEntregas.filter(e => e.status === 'Pendente').length; const mediaGeral = minhasEntregas.length > 0 ? (minhasEntregas.reduce((acc, e) => acc + (e.nota || 0), 0) / minhasEntregas.filter(e => e.nota !== null).length || 0).toFixed(2) : 'N/A'; grid.innerHTML = `<div class="stat-card"><h3>Atividades Pendentes</h3><div class="value">${pendentes}</div></div> <div class="stat-card"><h3>Média Geral</h3><div class="value">${mediaGeral}</div></div>`; } }
function openAddTurmaModal(){ openModal('Nova Turma', [{id:'turmaNome', label:'Nome', required: true}, {id:'turmaDisciplina', label:'Disciplina', required: true}, {id:'turmaAnoSemestre', label:'Ano/Semestre', placeholder: 'Ex: 2025/1', required: true}], data => { turmas.push({...data, id: generateUniqueId()}); saveData(); loadTurmas(); loadStats(); }); }
function loadTurmas(){ const tbody = $('turmasTable').querySelector('tbody'); tbody.innerHTML = turmas.map(t => `<tr><td>${t.turmaNome}</td><td>${t.turmaDisciplina}</td><td>${t.turmaAnoSemestre}</td><td><button class="btn-small btn-edit" onclick="editTurma(${t.id})">Editar</button><button class="btn-small btn-delete" onclick="deleteTurma(${t.id})">Excluir</button></td></tr>`).join('') || '<tr><td colspan="4" class="text-center">Nenhuma turma cadastrada.</td></tr>'; }
function deleteTurma(id){ if(confirm('Tem certeza?')){ turmas = turmas.filter(t => t.id !== id); saveData(); loadTurmas(); loadStats(); } }
function editTurma(id){ const t = turmas.find(x => x.id === id); if (!t) return; openModal('Editar Turma', [{id:'turmaNome', label:'Nome', value: t.turmaNome, required: true}, {id:'turmaDisciplina', label:'Disciplina', value: t.turmaDisciplina, required: true}, {id:'turmaAnoSemestre', label:'Ano/Semestre', value: t.turmaAnoSemestre, required: true}], data => { Object.assign(t, data); saveData(); loadTurmas(); }); }
function openAddAlunoModal(){ if (turmas.length === 0) return alert('Cadastre uma turma primeiro.'); openModal('Novo Aluno', [{id:'alunoNome', label:'Nome', required: true}, {id:'alunoMatricula', label:'Matrícula (senha)', required: true}, {id:'alunoEmail', label:'Email (login)', type:'email', required: true}, {id:'alunoTurma', label:'Turma', type:'select', options: turmas.map(t=>({value: t.id, text: t.turmaNome}))}], data => { if (users.some(u => u.email === data.alunoEmail)) return alert('Este email já está em uso.'); const novoAlunoId = generateUniqueId(); alunos.push({ ...data, id: novoAlunoId }); users.push({ email: data.alunoEmail, password: data.alunoMatricula, name: data.alunoNome, role: 'aluno' }); saveData(); loadAlunos(); loadStats(); }); }
function loadAlunos() { const tbody = $('alunosTable').querySelector('tbody'); tbody.innerHTML = alunos.map(a => { const turma = turmas.find(t => t.id == a.alunoTurma); return `<tr><td>${a.alunoNome}</td><td>${a.alunoMatricula}</td><td>${a.alunoEmail}</td><td>${turma ? turma.turmaNome : 'N/A'}</td><td><button class="btn-small btn-edit" onclick="editAluno(${a.id})">Editar</button><button class="btn-small btn-delete" onclick="deleteAluno(${a.id})">Excluir</button></td></tr>`}).join('') || '<tr><td colspan="5" class="text-center">Nenhum aluno cadastrado.</td></tr>'; }
function deleteAluno(id) { if(!confirm('Tem certeza?')) return; const aluno = alunos.find(a => a.id === id); if (aluno) users = users.filter(u => u.email !== aluno.alunoEmail); alunos = alunos.filter(a => a.id !== id); saveData(); loadAlunos(); loadStats(); }
function editAluno(id) { const a = alunos.find(x => x.id === id); if (!a) return; const oldEmail = a.alunoEmail; openModal('Editar Aluno', [{id:'alunoNome', label:'Nome', value: a.alunoNome, required: true}, {id:'alunoMatricula', label:'Matrícula (senha)', value: a.alunoMatricula, required: true}, {id:'alunoEmail', label:'Email (login)', type:'email', value: a.alunoEmail, required: true}, {id:'alunoTurma', label:'Turma', type:'select', options: turmas.map(t=>({value: t.id, text: t.turmaNome})), value: a.alunoTurma}], data => { if (data.alunoEmail !== oldEmail && users.some(u => u.email === data.alunoEmail)) return alert('Email já em uso.'); Object.assign(a, data); const user = users.find(u => u.email === oldEmail); if (user) { Object.assign(user, { email: data.alunoEmail, password: data.alunoMatricula, name: data.alunoNome }); } saveData(); loadAlunos(); }); }
function openAddAtividadeModal(){ if (turmas.length === 0) return alert('Cadastre uma turma primeiro.'); openModal('Nova Atividade', [{id:'ativTitulo', label:'Título', required: true}, {id:'ativTipo', label:'Tipo', type:'select', options:[{value:'Prova',text:'Prova'},{value:'Trabalho',text:'Trabalho'}]}, {id:'ativTurma', label:'Turma', type:'select', options: turmas.map(t=>({value: t.id, text: t.turmaNome})), required: true}, {id:'ativEntrega', label:'Data de Entrega', type:'date', required: true}, {id:'ativValor', label:'Valor (0 a 10)', type:'number', required: true, min: 0, max: 10}], data => { const atividadeId = generateUniqueId(); atividades.push({...data, id: atividadeId}); alunos.filter(a => a.alunoTurma == data.ativTurma).forEach(aluno => entregas.push({ id: generateUniqueId(), atividadeId, alunoId: aluno.id, status: 'Pendente' })); saveData(); loadAtividades(); loadStats(); }); }
function loadAtividades(){ const tbody = $('atividadesTable').querySelector('tbody'); tbody.innerHTML = atividades.map(a => `<tr><td>${a.ativTitulo}</td><td>${a.ativTipo}</td><td>${turmas.find(t => t.id == a.ativTurma)?.turmaNome || '-'}</td><td>${new Date(a.ativEntrega).toLocaleDateString()}</td><td>${a.ativValor}</td><td><button class="btn-small btn-delete" onclick="deleteAtividade(${a.id})">Excluir</button></td></tr>`).join('') || '<tr><td colspan="6" class="text-center">Nenhuma atividade cadastrada.</td></tr>'; }
function deleteAtividade(id){ if(!confirm('Excluir?')) return; atividades = atividades.filter(a => a.id !== id); entregas = entregas.filter(e => e.atividadeId !== id); saveData(); loadAtividades(); }
function loadEntregas(){ const tbody = $('entregasTable').querySelector('tbody'); const paraAvaliar = entregas.filter(e => ['Entregue', 'Avaliado'].includes(e.status)); tbody.innerHTML = paraAvaliar.map(e => { const ativ = atividades.find(a => a.id === e.atividadeId); const aluno = alunos.find(a => a.id === e.alunoId); if(!ativ || !aluno) return ''; return `<tr><td>${ativ.ativTitulo}</td><td>${aluno.alunoNome}</td><td>${new Date(e.dataEntrega).toLocaleDateString()}</td><td class="status-${e.status.toLowerCase()}">${e.status}</td><td>${e.nota ?? '-'}</td><td><button class="btn-small btn-edit" onclick="avaliarEntrega(${e.id})">${e.status === 'Avaliado' ? 'Reavaliar' : 'Avaliar'}</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="text-center">Nenhuma atividade entregue.</td></tr>'; }
function avaliarEntrega(id){ const e = entregas.find(x => x.id === id); const ativ = atividades.find(a => a.id === e.atividadeId); const notaMax = parseFloat(ativ?.ativValor) || 10; openModal('Avaliar Entrega', [{id:'nota', label:`Nota (0-${notaMax})`, type:'number', value:e.nota || '', required: true, max: notaMax}, {id:'feedback', label:'Feedback', type:'textarea', value:e.feedback || ''}], data => { const notaInserida = parseFloat(data.nota); if (isNaN(notaInserida) || notaInserida > notaMax || notaInserida < 0) return alert(`A nota deve ser um número entre 0 e ${notaMax}.`); Object.assign(e, { nota: notaInserida, feedback: data.feedback, status: 'Avaliado' }); saveData(); loadEntregas(); loadStats(); }); }
function loadAtividadesAluno(){ const alunoAtual = alunos.find(a => a.alunoEmail === currentUser.email); if (!alunoAtual) return; const tbody = $('atividadesAlunoTable').querySelector('tbody'); const minhasEntregas = entregas.filter(e => e.alunoId === alunoAtual.id); tbody.innerHTML = minhasEntregas.map(e => { const ativ = atividades.find(a => a.id === e.atividadeId); if (!ativ) return ''; return `<tr><td>${ativ.ativTitulo}</td><td>${turmas.find(t => t.id == ativ.ativTurma)?.disciplina || ''}</td><td>${new Date(ativ.ativEntrega).toLocaleDateString()}</td><td class="status-${e.status.toLowerCase()}">${e.status}</td><td>${e.status === 'Pendente' ? `<button class="btn-small btn-edit" onclick="entregarAtividade(${e.id})">Entregar</button>` : '<i>Sem ações</i>'}</td></tr>`; }).join('') || '<tr><td colspan="5" class="text-center">Nenhuma atividade para você.</td></tr>'; }
function entregarAtividade(id) { if (!confirm("Entregar atividade?")) return; const entrega = entregas.find(e => e.id === id); Object.assign(entrega, { status: 'Entregue', dataEntrega: new Date().toISOString() }); saveData(); loadAtividadesAluno(); }
function loadNotasAluno() { const alunoAtual = alunos.find(a => a.alunoEmail === currentUser.email); if (!alunoAtual) return; const tbody = $('notasAlunoTable').querySelector('tbody'); const minhasAvaliadas = entregas.filter(e => e.alunoId === alunoAtual.id && e.status === 'Avaliado'); tbody.innerHTML = minhasAvaliadas.map(e => { const ativ = atividades.find(a => a.id === e.atividadeId); return `<tr><td>${ativ?.ativTitulo || ''}</td><td>${e.nota} / ${ativ?.ativValor || '-'}</td><td>${e.feedback || ''}</td></tr>`; }).join('') || '<tr><td colspan="3" class="text-center">Nenhuma nota lançada.</td></tr>'; }
async function sincronizarComPim() { if (alunos.length === 0 && turmas.length === 0) return alert("Não há dados para sincronizar."); const btn = document.querySelector('[onclick="sincronizarComPim()"]'); btn.innerHTML = 'Sincronizando...'; btn.disabled = true; const payload = { alunos: alunos.map(aluno => ({ nome: aluno.alunoNome, matricula: aluno.alunoMatricula, curso: "Análise e Desenvolvimento de Sistemas", notas: entregas.filter(e => e.alunoId === aluno.id && e.nota !== null).map(e => parseFloat(e.nota)) })), turmas: turmas.map(turma => ({ codigo: turma.turmaNome, disciplina: turma.turmaDisciplina, alunos: alunos.filter(a => a.alunoTurma === turma.id).map(a => ({ nome: a.alunoNome, matricula: a.alunoMatricula })) })) }; try { const response = await fetch('http://127.0.0.1:5000/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); const result = await response.json(); if (!response.ok) throw new Error(result.erro || "Falha na comunicação"); alert("Sucesso! Dados (alunos e turmas) sincronizados com o backend."); } catch (error) { console.error("Erro ao sincronizar:", error); alert("ERRO: Não foi possível conectar ao servidor Python.\nVerifique se o 'server.py' está em execução."); } finally { btn.innerHTML = 'Sincronizar com Backend (PIM)'; btn.disabled = false; } }
window.onload = () => { loadData(); const savedUser = sessionStorage.getItem('currentUser'); if (savedUser) { currentUser = JSON.parse(savedUser); loadDashboard(); } else { $('loginPage').style.display = 'flex'; } };

// Fim do arquivo scripts.js