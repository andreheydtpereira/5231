
window.PROM = {
  state: {
    carouselIndex: 0,
    dashboard: {
      selectedSector: '',
      selectedArea: '',
      selectedStatus: 'aberta',
      selectedTaskIndex: 0
    },
    setores: ['UPGR', 'UPA'],
    areasBySector: {
      UPGR: ['Confecção', 'Cortadeiras'],
      UPA: ['Frisos', 'Vulcanização']
    },
    tasks: []
  }
};

(function(){
  const STORAGE_KEY = 'prometeon_51_9_3_profissional';
  const STATUS_LABELS = {
    aberta:'Abertas',
    em_atendimento:'Em atendimento',
    aguardando_material:'Aguardando material',
    aguardando_parada:'Aguardando parada',
    aguardando_preparacao:'Aguardando preparação',
    nao_concluida:'Não concluídas'
  };

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PROM.state));
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        PROM.state = Object.assign({}, PROM.state, parsed || {});
      }
    }catch(e){}
  }

  function seedIfEmpty(){
    if(PROM.state.tasks && PROM.state.tasks.length) return;
    const titles = [
      'Troca de rolamento do ventilador',
      'Ajuste de sensor de fim de curso',
      'Correção de ruído na esteira',
      'Substituição de mangueira pneumática',
      'Fixação de proteção solta',
      'Revisão em válvula de ar',
      'Troca de correia ressecada',
      'Inspeção em cilindro pneumático',
      'Ajuste em prensa hidráulica',
      'Vazamento em conexão roscada'
    ];
    const statuses = ['aberta','em_atendimento','aguardando_material','aguardando_parada','aguardando_preparacao','nao_concluida'];
    const setores = [
      ['UPGR','Confecção','LCG1'],
      ['UPGR','Cortadeiras','CTB1'],
      ['UPA','Frisos','TST1'],
      ['UPA','Vulcanização','VMI1']
    ];
    const tasks = [];
    for(let i=0;i<24;i++){
      const [setor, area, maquina] = setores[i % setores.length];
      tasks.push({
        id: 'task_' + (i + 1),
        title: titles[i % titles.length] + ' #' + (i + 1),
        setor,
        area,
        maquina,
        tipo: i % 3 === 0 ? 'Preventiva' : i % 3 === 1 ? 'Corretiva' : 'Melhoria',
        criticidade: ['Segurança','Qualidade','Produção','Normal'][i % 4],
        material: ['Material separado','Aguardando material','Não definido'][i % 3],
        horasPreparacao: ((i % 3) * 0.5).toFixed(1),
        horasExecucao: (1 + (i % 4)).toFixed(1),
        responsavel: ['Leonardo','Carlos','Mateus','Bruno','Rafael'][i % 5],
        status: statuses[i % statuses.length]
      });
    }
    PROM.state.tasks = tasks;
    save();
  }

  function openStatuses(){
    return Object.keys(STATUS_LABELS);
  }

  PROM.save = save;
  PROM.load = load;
  PROM.seedIfEmpty = seedIfEmpty;
  PROM.STATUS_LABELS = STATUS_LABELS;
  PROM.openStatuses = openStatuses;
})();
