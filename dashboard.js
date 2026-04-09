
(function(){
  function openTasks(status){
    PROM.state.dashboard.selectedStatus = status;
    PROM.state.dashboard.selectedTaskIndex = 0;
    renderStatusChips();
    renderTaskCarousel();
    updateActionButton();
    PROM.save();
  }

  function pulseKpiButton(btn){
    if(!btn) return;
    btn.classList.add('kpi-pressed');
    setTimeout(function(){ btn.classList.remove('kpi-pressed'); }, 180);
  }

  function countOpenBySector(sector){
    return PROM.state.tasks.filter(t => {
      return t.setor === sector && PROM.openStatuses().includes(t.status);
    }).length;
  }

  function renderCardKpis(){
    const upgr = countOpenBySector('UPGR');
    const upa = countOpenBySector('UPA');
    document.getElementById('kpiUPGR').textContent = upgr;
    document.getElementById('kpiUPA').textContent = upa;
    document.getElementById('dashboardMainNumber').textContent = upgr + upa;
  }

  function fillAreaFilter(){
    const select = document.getElementById('areaFilter');
    const sector = PROM.state.dashboard.selectedSector;
    const areas = sector ? (PROM.state.areasBySector[sector] || []) : [];
    const current = PROM.state.dashboard.selectedArea || '';
    select.innerHTML = '<option value="">Todas as áreas</option>' + areas.map(a => `<option value="${a}">${a}</option>`).join('');
    select.value = areas.includes(current) ? current : '';
    if(!areas.includes(current)) PROM.state.dashboard.selectedArea = '';
  }

  function statusCounts(){
    const sector = PROM.state.dashboard.selectedSector;
    const area = PROM.state.dashboard.selectedArea;
    const result = {};
    PROM.openStatuses().forEach(status => {
      result[status] = PROM.state.tasks.filter(t => {
        if(sector && t.setor !== sector) return false;
        if(area && t.area !== area) return false;
        return t.status === status;
      }).length;
    });
    return result;
  }

  function renderStatusGrid(){
    const box = document.getElementById('statusGrid');
    const counts = statusCounts();
    box.innerHTML = PROM.openStatuses().map(status => `
      <button class="status-btn" data-status="${status}" type="button">
        <strong>${counts[status] || 0}</strong>
        <span>${PROM.STATUS_LABELS[status]}</span>
      </button>
    `).join('');
    box.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', () => openTasks(btn.dataset.status));
    });
  }

  function renderStatusChips(){
    const row = document.getElementById('statusChipRow');
    row.innerHTML = PROM.openStatuses().map(status => `
      <button class="status-chip ${PROM.state.dashboard.selectedStatus === status ? 'active' : ''}" data-chip-status="${status}" type="button">
        ${PROM.STATUS_LABELS[status]}
      </button>
    `).join('');
    row.querySelectorAll('[data-chip-status]').forEach(btn => {
      btn.addEventListener('click', () => openTasks(btn.dataset.chipStatus));
    });
  }

  function filteredTasks(){
    const sector = PROM.state.dashboard.selectedSector;
    const area = PROM.state.dashboard.selectedArea;
    const status = PROM.state.dashboard.selectedStatus;
    return PROM.state.tasks.filter(t => {
      if(sector && t.setor !== sector) return false;
      if(area && t.area !== area) return false;
      if(status && t.status !== status) return false;
      return true;
    });
  }

  function taskCardHtml(task){
    const total = (Number(task.horasPreparacao) + Number(task.horasExecucao)).toFixed(1);
    return `
      <div class="task-card">
        <div class="task-header">
          <div class="task-title">${task.title}</div>
          <div class="task-badge">${task.status.replaceAll('_', ' ')}</div>
        </div>
        <div class="task-grid">
          <div class="task-info"><label>SETOR</label><div>${task.setor}</div></div>
          <div class="task-info"><label>ÁREA</label><div>${task.area}</div></div>
          <div class="task-info"><label>MÁQUINA</label><div>${task.maquina}</div></div>
          <div class="task-info"><label>TIPO</label><div>${task.tipo}</div></div>
          <div class="task-info"><label>CRITICIDADE</label><div>${task.criticidade}</div></div>
          <div class="task-info"><label>MATERIAL</label><div>${task.material}</div></div>
          <div class="task-info"><label>PREPARAÇÃO</label><div>${task.horasPreparacao}h</div></div>
          <div class="task-info"><label>EXECUÇÃO</label><div>${task.horasExecucao}h</div></div>
          <div class="task-info"><label>TOTAL</label><div>${total}h</div></div>
          <div class="task-info"><label>RESPONSÁVEL</label><div>${task.responsavel}</div></div>
        </div>
        <div class="task-actions">
          <button class="change-btn" data-task="${task.id}" data-next="aberta" type="button">Aberta</button>
          <button class="change-btn alt" data-task="${task.id}" data-next="em_atendimento" type="button">Em atendimento</button>
          <button class="change-btn alt" data-task="${task.id}" data-next="aguardando_material" type="button">Aguardando material</button>
          <button class="change-btn alt" data-task="${task.id}" data-next="aguardando_parada" type="button">Aguardando parada</button>
          <button class="change-btn alt" data-task="${task.id}" data-next="aguardando_preparacao" type="button">Aguardando preparação</button>
          <button class="change-btn alt" data-task="${task.id}" data-next="nao_concluida" type="button">Não concluída</button>
        </div>
      </div>
    `;
  }

  function renderTaskDots(total, idx){
    const box = document.getElementById('taskDots');
    box.innerHTML = '';
    for(let i=0;i<total;i++){
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === idx ? ' active' : '');
      dot.addEventListener('click', function(){
        PROM.state.dashboard.selectedTaskIndex = i;
        renderTaskCarousel();
      });
      box.appendChild(dot);
    }
  }

  function bindTaskActions(track){
    track.querySelectorAll('[data-task][data-next]').forEach(btn => {
      btn.addEventListener('click', function(){
        const id = btn.dataset.task;
        const next = btn.dataset.next;
        const task = PROM.state.tasks.find(t => t.id === id);
        if(task){
          task.status = next;
          PROM.save();
          renderCardKpis();
          renderStatusGrid();
          renderStatusChips();
          renderTaskCarousel();
          updateActionButton();
        }
      });
    });
  }

  function renderTaskCarousel(){
    const track = document.getElementById('taskCarouselTrack');
    const list = filteredTasks();
    if(!list.length){
      track.innerHTML = '<div class="task-card"><div class="task-title">Nenhuma pendência encontrada neste status.</div></div>';
      document.getElementById('taskDots').innerHTML = '';
      return;
    }
    PROM.state.dashboard.selectedTaskIndex = Math.max(0, Math.min(list.length - 1, PROM.state.dashboard.selectedTaskIndex));
    track.innerHTML = list.map(taskCardHtml).join('');
    track.style.transform = 'translateX(-' + (PROM.state.dashboard.selectedTaskIndex * 100) + '%)';
    Array.from(track.children).forEach(child => child.style.minWidth = '100%');
    renderTaskDots(list.length, PROM.state.dashboard.selectedTaskIndex);
    bindTaskActions(track);
    PROM.save();
  }

  function updateActionButton(){
    document.getElementById('btnOpenStatusList').textContent = 'Ver lista: ' + PROM.STATUS_LABELS[PROM.state.dashboard.selectedStatus];
  }

  function selectSector(sector){
    PROM.state.dashboard.selectedSector = sector;
    PROM.state.dashboard.selectedArea = '';
    PROM.state.dashboard.selectedStatus = 'aberta';
    PROM.state.dashboard.selectedTaskIndex = 0;

    const titleEl = document.getElementById('selectedSectorName');
    if(titleEl) titleEl.textContent = sector;

    const sectorFilter = document.getElementById('sectorFilter');
    if(sectorFilter) sectorFilter.value = sector;

    fillAreaFilter();
    renderStatusGrid();
    renderStatusChips();
    renderTaskCarousel();
    updateActionButton();

    const dashboardSection = document.getElementById('dashboardSection');
    if(dashboardSection){
      dashboardSection.scrollIntoView({behavior:'smooth', block:'start'});
    }
    PROM.save();
  }

  window.addEventListener('DOMContentLoaded', function(){
    renderCardKpis();

    document.getElementById('btnDashboardUPGR').addEventListener('click', function(){ pulseKpiButton(this); selectSector('UPGR'); });
    document.getElementById('btnDashboardUPA').addEventListener('click', function(){ pulseKpiButton(this); selectSector('UPA'); });
    document.getElementById('btnAbrirDashboard').addEventListener('click', function(){
      document.getElementById('dashboardSection').scrollIntoView({behavior:'smooth', block:'start'});
    });

    document.getElementById('sectorFilter').addEventListener('change', function(){
      PROM.state.dashboard.selectedSector = this.value;
      PROM.state.dashboard.selectedArea = '';
      PROM.state.dashboard.selectedStatus = 'aberta';
      PROM.state.dashboard.selectedTaskIndex = 0;
      document.getElementById('selectedSectorName').textContent = this.value || 'Selecione UPGR ou UPA no card acima';
      fillAreaFilter();
      renderStatusGrid();
      renderStatusChips();
      renderTaskCarousel();
      updateActionButton();
      PROM.save();
    });

    document.getElementById('areaFilter').addEventListener('change', function(){
      PROM.state.dashboard.selectedArea = this.value;
      PROM.state.dashboard.selectedTaskIndex = 0;
      renderStatusGrid();
      renderStatusChips();
      renderTaskCarousel();
      updateActionButton();
      PROM.save();
    });

    document.getElementById('taskPrev').addEventListener('click', function(){
      PROM.state.dashboard.selectedTaskIndex = Math.max(0, PROM.state.dashboard.selectedTaskIndex - 1);
      renderTaskCarousel();
    });

    document.getElementById('taskNext').addEventListener('click', function(){
      const total = filteredTasks().length;
      PROM.state.dashboard.selectedTaskIndex = Math.min(Math.max(total - 1, 0), PROM.state.dashboard.selectedTaskIndex + 1);
      renderTaskCarousel();
    });

    renderStatusGrid();
    renderStatusChips();
    renderTaskCarousel();
    updateActionButton();
  });

  PROM.selectSector = selectSector;
})();
