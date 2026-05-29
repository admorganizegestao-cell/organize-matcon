import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const areas = [
  { id: 'gestao', label: 'Gestão de Negócios', icone: '🏢' },
  { id: 'marketing', label: 'Marketing e Growth', icone: '📈' },
  { id: 'vendas', label: 'Vendas', icone: '💰' },
  { id: 'cultura', label: 'Cultura e Liderança', icone: '👥' },
  { id: 'cliente', label: 'Experiência do Cliente', icone: '⭐' },
]

const perguntas = [
  { id: 1, area: 'gestao', texto: 'Nosso modelo de negócios está claro em todos seus componentes: clientes, proposta de valor, canais, relacionamento, receitas, recursos, parceiros, atividades e estrutura de custos.' },
  { id: 2, area: 'gestao', texto: 'Nossa diretoria dedica a maior parte do tempo à estratégia, pensando nos próximos passos da empresa no mercado.' },
  { id: 3, area: 'gestao', texto: 'Nossa liderança monitora ativamente as tendências que podem afetar nosso segmento, nacional e internacionalmente.' },
  { id: 4, area: 'gestao', texto: 'A empresa tem estratégias claras para gerenciar e compartilhar conhecimento entre os colaboradores.' },
  { id: 5, area: 'gestao', texto: 'Possuímos indicadores estratégicos e temos pessoas responsáveis por acompanhá-los constantemente.' },
  { id: 6, area: 'gestao', texto: 'Tomamos decisões estratégicas tendo em vista a sustentabilidade e saúde financeira da empresa.' },
  { id: 7, area: 'gestao', texto: 'Todas as informações geradas pela empresa estão organizadas e de fácil acesso na nossa ferramenta de gestão.' },
  { id: 8, area: 'gestao', texto: 'Temos clareza sobre nossos concorrentes, diferenciais competitivos e market share.' },
  { id: 9, area: 'gestao', texto: 'Nossa estrutura societária e financeira estaria pronta para receber investimento e acelerar crescimento.' },
  { id: 10, area: 'marketing', texto: 'Temos uma estratégia clara de crescimento do negócio.' },
  { id: 11, area: 'marketing', texto: 'As lideranças buscam constantemente novas oportunidades e atuam nelas para o crescimento da empresa.' },
  { id: 12, area: 'marketing', texto: 'Buscamos melhorar constantemente os resultados dos canais de aquisição e novas formas de captar clientes.' },
  { id: 13, area: 'marketing', texto: 'Todas as comunicações da empresa estão alinhadas com as diretrizes da nossa marca.' },
  { id: 14, area: 'marketing', texto: 'Temos métodos claros para identificar potenciais clientes (leads) para otimizar captação e conversão.' },
  { id: 15, area: 'marketing', texto: 'A diretoria e colaboradores seguem as diretrizes da marca em todas as interações com o público.' },
  { id: 16, area: 'marketing', texto: 'Possuímos ações que reforçam o posicionamento e diretrizes da marca para colaboradores e clientes.' },
  { id: 17, area: 'marketing', texto: 'Utilizamos ferramentas de marketing para analisar ranqueamento no Google, audiência em mídias sociais e conversão do funil.' },
  { id: 18, area: 'marketing', texto: 'Temos domínio dos nossos principais indicadores de marketing: visitas, CPL, CAC, LTV e demais.' },
  { id: 19, area: 'vendas', texto: 'Temos etapas bem estruturadas do processo de vendas e trabalhamos para melhorar conversões em cada etapa.' },
  { id: 20, area: 'vendas', texto: 'Nossa equipe comercial é bem estruturada e trabalha em sinergia com a área de marketing.' },
  { id: 21, area: 'vendas', texto: 'Temos rituais e rotinas para acompanhar indicadores de vendas e melhorar constantemente a taxa de conversão.' },
  { id: 22, area: 'vendas', texto: 'Temos metas de vendas bem definidas e as acompanhamos constantemente com o time.' },
  { id: 23, area: 'vendas', texto: 'Sabemos o que fazer durante o mês para conseguir atingir as metas e conquistar objetivos.' },
  { id: 24, area: 'vendas', texto: 'Conseguimos ter previsibilidade de vendas acompanhando os indicadores e atuando para atingir objetivos.' },
  { id: 25, area: 'vendas', texto: 'Temos estrutura de remuneração clara e efetiva com comissionamento, incentivos e bonificações para a equipe.' },
  { id: 26, area: 'vendas', texto: 'Sabemos com clareza qual é o nosso perfil ideal de cliente, com alta lucratividade e boa aderência ao produto.' },
  { id: 27, area: 'vendas', texto: 'Temos um CRM que concentra todas as informações dos clientes desde o primeiro contato até o fechamento.' },
  { id: 28, area: 'cultura', texto: 'Recontrataríamos com entusiasmo boa parte dos nossos colaboradores pela segunda vez.' },
  { id: 29, area: 'cultura', texto: 'Temos um processo seletivo eficiente e conseguimos os melhores talentos para a empresa.' },
  { id: 30, area: 'cultura', texto: 'Todos os colaboradores se encaixam em nossa cultura e compartilham nossos valores fundamentais.' },
  { id: 31, area: 'cultura', texto: 'Nossos valores fundamentais são claros e estamos contratando, recompensando e demitindo em torno deles.' },
  { id: 32, area: 'cultura', texto: 'Nossos líderes constantemente dão feedbacks e falam o que realmente importa, buscando melhorar resultados e cultura.' },
  { id: 33, area: 'cultura', texto: 'Conseguimos reter os melhores talentos do mercado para potencializar os resultados da empresa.' },
  { id: 34, area: 'cultura', texto: 'Todas as lideranças possuem rituais com seus liderados para acompanhar e promover o desenvolvimento deles.' },
  { id: 35, area: 'cultura', texto: 'Todos os líderes estão sempre se capacitando, buscando aplicar e difundir conhecimentos em prol do negócio.' },
  { id: 36, area: 'cultura', texto: 'Todos os colaboradores sabem qual é o objetivo/missão da empresa a curto, médio e longo prazo.' },
  { id: 37, area: 'cultura', texto: 'Caso os líderes precisassem se ausentar, a empresa funcionaria normalmente sem a presença deles.' },
  { id: 38, area: 'cultura', texto: 'Temos estrutura de partnership que incentiva, retém e reconhece os colaboradores chave da operação.' },
  { id: 39, area: 'cliente', texto: 'Sabemos exatamente quais dores dos clientes a nossa empresa resolve.' },
  { id: 40, area: 'cliente', texto: 'A maioria dos nossos clientes voltam a comprar conosco.' },
  { id: 41, area: 'cliente', texto: 'Medimos e acompanhamos constantemente a satisfação dos nossos clientes com produtos/serviços.' },
  { id: 42, area: 'cliente', texto: 'Todos os colaboradores estão empenhados em promover uma boa experiência para os clientes.' },
  { id: 43, area: 'cliente', texto: 'Nossos clientes costumam indicar ou recomendar a nossa empresa.' },
  { id: 44, area: 'cliente', texto: 'Temos mapeada toda a jornada dos clientes e usamos isso para melhorar constantemente a experiência deles.' },
  { id: 45, area: 'cliente', texto: 'Ouvimos constantemente as dores dos clientes para lançar novas soluções e melhorar as atuais.' },
  { id: 46, area: 'cliente', texto: 'Se dobrássemos a quantidade de clientes, nosso produto consegue atender mantendo a boa experiência atual.' },
]

const escala = [
  { valor: 0, label: 'Discordo totalmente' },
  { valor: 1, area: 'Discordo' },
  { valor: 2, label: 'Neutro' },
  { valor: 3, label: 'Concordo' },
  { valor: 4, label: 'Concordo totalmente' },
]

const classificar = (score) => {
  if (score >= 80) return { label: 'Excelente', cor: '#00A651' }
  if (score >= 60) return { label: 'Em Desenvolvimento', cor: '#3B82F6' }
  if (score >= 40) return { label: 'Frágil', cor: '#E8920A' }
  return { label: 'Crítico', cor: '#F04545' }
}

const getEstagio = (score) => {
  if (score >= 75) return { label: 'Estágio 4: Expansão', desc: 'Empresa madura com processos estruturados e crescimento consistente.' }
  if (score >= 55) return { label: 'Estágio 3: Crescimento', desc: 'Empresa em crescimento com estrutura em desenvolvimento.' }
  if (score >= 35) return { label: 'Estágio 2: Estabilização', desc: 'Empresa buscando estabilidade com oportunidades de melhoria.' }
  return { label: 'Estágio 1: Sobrevivência', desc: 'Empresa em modo reativo, necessitando reestruturação urgente.' }
}

export default function Diagnostico({ competencia }) {
  const [respostas, setRespostas] = useState({})
  const [areaAtiva, setAreaAtiva] = useState(0)
  const [tela, setTela] = useState('questionario') // questionario | gerando | resultado
  const [diagnostico, setDiagnostico] = useState(null)
  const [gerando, setGerando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('resumo')
  const [compId, setCompId] = useState(null)

  useEffect(() => { carregarDados() }, [competencia])

  async function carregarDados() {
    const { data: comp } = await supabase
      .from('competencias').select('id')
      .eq('ano', competencia.ano).eq('mes', competencia.mes).maybeSingle()
    if (!comp) return
    setCompId(comp.id)
    const salvas = localStorage.getItem(`diagnostico_resp_${comp.id}`)
    if (salvas) setRespostas(JSON.parse(salvas))
    const diag = localStorage.getItem(`diagnostico_resultado_${comp.id}`)
    if (diag) { setDiagnostico(JSON.parse(diag)); setTela('resultado') }
  }

  function responder(id, valor) {
    const novas = { ...respostas, [id]: valor }
    setRespostas(novas)
    if (compId) localStorage.setItem(`diagnostico_resp_${compId}`, JSON.stringify(novas))
  }

  const calcScore = (areaId) => {
    const ps = perguntas.filter(p => p.area === areaId)
    const respondidas = ps.filter(p => respostas[p.id] !== undefined)
    if (respondidas.length === 0) return 0
    const soma = respondidas.reduce((acc, p) => acc + respostas[p.id], 0)
    return Math.round((soma / (ps.length * 4)) * 100)
  }

  const scoreGeral = Math.round(areas.reduce((acc, a) => acc + calcScore(a.id), 0) / areas.length)
  const areaAtual = areas[areaAtiva]
  const perguntasArea = perguntas.filter(p => p.area === areaAtual?.id)
  const respondidas = perguntasArea.filter(p => respostas[p.id] !== undefined).length
  const todasRespondidas = perguntas.every(p => respostas[p.id] !== undefined)

  async function gerarDiagnostico() {
    setGerando(true)
    setTela('gerando')

    const scoresTexto = areas.map(a => `${a.icone} ${a.label}: ${calcScore(a.id)}/100`).join('\n')

    const prompt = `Você é consultor sênior da Organize Consultoria. Gere um diagnóstico empresarial completo para E&M Carvalho Material de Construção, ${meses[competencia.mes - 1]}/${competencia.ano}, Petrolina/PE.

SCORES POR DIMENSÃO (calculados pelo questionário de 46 perguntas, escala 0-4):
${scoresTexto}
Score Geral: ${scoreGeral}/100

Gere o diagnóstico em JSON com esta estrutura EXATA (sem texto fora do JSON):
{
  "resumoExecutivo": "3-4 linhas sobre a situação geral",
  "justificativaEstagio": "explicação do estágio atual",
  "proximosPassosEstagio": ["passo1", "passo2", "passo3"],
  "dimensoes": [
    {
      "id": "gestao",
      "problemas": [{"problema": "texto", "impacto": "texto", "acao": "texto"}],
      "pontosPositivos": ["texto1", "texto2"]
    }
  ],
  "proximosPassos": [
    {"prazo": "SEMANA 1-2", "responsavel": "texto", "acao": "texto"}
  ],
  "swot": {
    "forcas": ["f1","f2","f3","f4"],
    "fraquezas": ["f1","f2","f3","f4"],
    "oportunidades": ["o1","o2","o3","o4"],
    "ameacas": ["a1","a2","a3","a4"]
  },
  "gut": [
    {"problema": "texto", "g": 5, "u": 5, "t": 5, "total": 125, "nivel": "Crítico"}
  ],
  "porter": [
    {"forca": "Rivalidade entre Concorrentes", "nivel": "Alto", "score": 75, "descricao": "texto"}
  ],
  "bcg": [
    {"quadrante": "⭐ Estrela", "produto": "texto", "descricao": "texto"},
    {"quadrante": "🐄 Vaca Leiteira", "produto": "texto", "descricao": "texto"},
    {"quadrante": "❓ Interrogação", "produto": "texto", "descricao": "texto"},
    {"quadrante": "🍍 Abacaxi", "produto": "texto", "descricao": "texto"}
  ],
  "benchmarks": [
    {"indicador": "texto", "empresa": "valor", "mercado": "valor", "status": "Abaixo"}
  ],
  "missao": "texto",
  "visao": "texto",
  "valores": ["v1","v2","v3","v4","v5"],
  "okrs": {
    "financeira": ["okr1","okr2","okr3"],
    "clientes": ["okr1","okr2","okr3"],
    "processos": ["okr1","okr2","okr3"],
    "pessoas": ["okr1","okr2","okr3"]
  },
  "bsc": [
    {"perspectiva": "Financeira", "indicadores": [{"nome": "texto", "meta": "texto", "atual": "texto"}]}
  ],
  "planoAcao": [
    {"urgencia": "🔴 Urgente", "prazo": "Esta semana", "responsavel": "texto", "acao": "texto", "descricao": "texto"}
  ]
}

Use referências do setor de material de construção brasileiro. Retorne APENAS o JSON.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      const texto = data.content[0].text
      const json = JSON.parse(texto.replace(/```json|```/g, '').trim())
      setDiagnostico(json)
      if (compId) localStorage.setItem(`diagnostico_resultado_${compId}`, JSON.stringify(json))
      setTela('resultado')
      setAbaAtiva('resumo')
    } catch (e) {
      alert('Erro ao gerar diagnóstico. Tente novamente.')
      setTela('questionario')
    }
    setGerando(false)
  }

  const corScore = (score) => classificar(score).cor

  const abas = ['resumo', 'dimensoes', 'passos', 'swot', 'gut', 'porter', 'bcg', 'benchmarks', 'estrategia', 'plano']
  const abasLabel = { resumo: 'Resumo', dimensoes: 'Dimensões', passos: 'Próximos Passos', swot: 'SWOT', gut: 'GUT', porter: 'Porter', bcg: 'BCG', benchmarks: 'Benchmarks', estrategia: 'Estratégia', plano: 'Plano 90 dias' }

  // TELA GERANDO
  if (tela === 'gerando') return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
      <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Gerando diagnóstico...</div>
      <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>A IA está analisando os dados. Aguarde alguns segundos.</div>
    </div>
  )

  // TELA QUESTIONÁRIO
  if (tela === 'questionario') return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Diagnóstico Empresarial</h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>{meses[competencia.mes - 1]}/{competencia.ano} — E&M Carvalho Material de Construção</div>
        </div>
        {diagnostico && (
          <button onClick={() => setTela('resultado')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--verde)', fontSize: '13px', cursor: 'pointer', background: 'var(--verdeDim)', color: 'var(--verde)', fontWeight: 600 }}>
            Ver diagnóstico gerado →
          </button>
        )}
      </div>

      {/* PROGRESSO POR ÁREA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {areas.map((area, i) => {
          const ps = perguntas.filter(p => p.area === area.id)
          const resp = ps.filter(p => respostas[p.id] !== undefined).length
          const completa = resp === ps.length
          const ativa = i === areaAtiva
          return (
            <div key={area.id} onClick={() => setAreaAtiva(i)}
              style={{ background: ativa ? 'var(--verdeDim)' : 'var(--card)', border: `1px solid ${ativa ? 'var(--verde)' : completa ? 'rgba(0,166,81,0.3)' : 'var(--border)'}`, borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{area.icone}</div>
              <div style={{ fontSize: '11px', color: ativa ? 'var(--verde)' : 'var(--textSub)', fontWeight: ativa ? 600 : 400, marginBottom: '6px' }}>{area.label}</div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(resp/ps.length)*100}%`, background: completa ? 'var(--verde)' : 'var(--accent)', borderRadius: '2px' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--textMuted)', marginTop: '4px' }}>{resp}/{ps.length}</div>
            </div>
          )
        })}
      </div>

      {/* PERGUNTAS DA ÁREA ATIVA */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{areaAtual?.icone} {areaAtual?.label}</span>
          <span style={{ fontSize: '12px', color: 'var(--textMuted)' }}>{respondidas}/{perguntasArea.length} respondidas</span>
        </div>

        {perguntasArea.map((p, i) => (
          <div key={p.id} style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: respostas[p.id] !== undefined ? 'rgba(0,166,81,0.02)' : 'transparent' }}>
            <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '14px', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--textMuted)', marginRight: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{i + 1}.</span>
              {p.texto}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { valor: 0, label: '0 — Discordo totalmente' },
                { valor: 1, label: '1 — Discordo' },
                { valor: 2, label: '2 — Neutro' },
                { valor: 3, label: '3 — Concordo' },
                { valor: 4, label: '4 — Concordo totalmente' },
              ].map(e => (
                <button key={e.valor} onClick={() => responder(p.id, e.valor)}
                  style={{
                    padding: '7px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                    border: `1px solid ${respostas[p.id] === e.valor ? 'var(--verde)' : 'var(--border)'}`,
                    background: respostas[p.id] === e.valor ? 'var(--verdeDim)' : 'var(--card)',
                    color: respostas[p.id] === e.valor ? 'var(--verde)' : 'var(--textMuted)',
                    fontWeight: respostas[p.id] === e.valor ? 600 : 400,
                  }}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* NAVEGAÇÃO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setAreaAtiva(Math.max(0, areaAtiva - 1))} disabled={areaAtiva === 0}
          style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: areaAtiva === 0 ? 'not-allowed' : 'pointer', background: 'var(--card)', color: areaAtiva === 0 ? 'var(--textMuted)' : 'var(--textSub)' }}>
          ← Anterior
        </button>

        {areaAtiva < areas.length - 1 ? (
          <button onClick={() => setAreaAtiva(areaAtiva + 1)}
            style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer', background: 'var(--verde)', color: '#fff', fontWeight: 600 }}>
            Próxima área →
          </button>
        ) : (
          <button onClick={gerarDiagnostico} disabled={!todasRespondidas}
            style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: todasRespondidas ? 'pointer' : 'not-allowed', background: todasRespondidas ? 'var(--verde)' : 'var(--border)', color: todasRespondidas ? '#fff' : 'var(--textMuted)', fontWeight: 600 }}>
            🤖 Gerar Diagnóstico com IA
          </button>
        )}
      </div>

      {!todasRespondidas && areaAtiva === areas.length - 1 && (
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--textMuted)' }}>
          Responda todas as perguntas para gerar o diagnóstico
        </div>
      )}
    </div>
  )

  // TELA RESULTADO
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Diagnóstico Empresarial</h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>{meses[competencia.mes - 1]}/{competencia.ano} — E&M Carvalho Material de Construção</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTela('questionario')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
            ← Refazer questionário
          </button>
          <button onClick={() => window.print()}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
            🖨️ PDF
          </button>
        </div>
      </div>

      {/* SCORE GERAL */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '72px', fontWeight: 700, color: corScore(scoreGeral), fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{scoreGeral}</div>
          <div style={{ fontSize: '12px', color: 'var(--textMuted)', marginTop: '4px' }}>de 100</div>
          <div style={{ marginTop: '8px', padding: '4px 16px', borderRadius: '20px', background: corScore(scoreGeral) + '20', color: corScore(scoreGeral), fontSize: '13px', fontWeight: 600, border: `1px solid ${corScore(scoreGeral)}` }}>
            {classificar(scoreGeral).label}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--textMuted)' }}>{getEstagio(scoreGeral).label}</div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--textSub)', lineHeight: 1.7, marginBottom: '16px' }}>{diagnostico?.resumoExecutivo}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {areas.map(a => {
              const score = calcScore(a.id)
              return (
                <div key={a.id} style={{ padding: '4px 10px', borderRadius: '20px', background: corScore(score) + '15', color: corScore(score), fontSize: '12px', border: `1px solid ${corScore(score)}40` }}>
                  {a.icone} {a.label}: {score}/100
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {abas.map(a => (
          <button key={a} onClick={() => setAbaAtiva(a)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', cursor: 'pointer', background: abaAtiva === a ? 'var(--verde)' : 'var(--card)', color: abaAtiva === a ? '#fff' : 'var(--textSub)', fontWeight: abaAtiva === a ? 600 : 400 }}>
            {abasLabel[a]}
          </button>
        ))}
      </div>

      {/* RESUMO */}
      {abaAtiva === 'resumo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>DADOS DA EMPRESA</div>
            {[
              { label: 'Nome', valor: 'E&M Carvalho' },
              { label: 'Setor', valor: 'Material de Construção' },
              { label: 'Cidade', valor: 'Petrolina/PE' },
              { label: 'Período', valor: `${meses[competencia.mes - 1]}/${competencia.ano}` },
              { label: 'Score Geral', valor: `${scoreGeral}/100 — ${classificar(scoreGeral).label} — ${getEstagio(scoreGeral).label}` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <span style={{ color: 'var(--textMuted)' }}>{item.label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.valor}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>ESTÁGIO DE MATURIDADE</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{getEstagio(scoreGeral).label}</div>
            <div style={{ fontSize: '13px', color: 'var(--textSub)', lineHeight: 1.6, marginBottom: '16px' }}>{diagnostico?.justificativaEstagio}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '8px' }}>PRÓXIMOS PASSOS</div>
            {diagnostico?.proximosPassosEstagio?.map((p, i) => (
              <div key={i} style={{ padding: '8px', background: 'var(--card)', borderRadius: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--textSub)', borderLeft: '3px solid var(--verde)' }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIMENSÕES */}
      {abaAtiva === 'dimensoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {areas.map(area => {
            const score = calcScore(area.id)
            const dimDiag = diagnostico?.dimensoes?.find(d => d.id === area.id)
            return (
              <div key={area.id} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${corScore(score)}` }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{area.icone} {area.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--textSub)' }}>{classificar(score).label}</div>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: 700, color: corScore(score) }}>{score}/100</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: '16px', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', letterSpacing: '1px', marginBottom: '12px' }}>PROBLEMAS</div>
                    {dimDiag?.problemas?.map((p, i) => (
                      <div key={i} style={{ marginBottom: '10px', padding: '10px', background: 'rgba(240,69,69,0.05)', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{p.problema}</div>
                        <div style={{ fontSize: '11px', color: 'var(--textMuted)', marginBottom: '4px' }}>→ {p.impacto}</div>
                        <div style={{ fontSize: '11px', color: 'var(--verde)' }}>✓ {p.acao}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--verde)', letterSpacing: '1px', marginBottom: '12px' }}>PONTOS POSITIVOS</div>
                    {dimDiag?.pontosPositivos?.map((p, i) => (
                      <div key={i} style={{ padding: '8px 10px', background: 'rgba(0,166,81,0.05)', borderRadius: '6px', borderLeft: '3px solid var(--verde)', marginBottom: '8px', fontSize: '12px', color: 'var(--textSub)' }}>
                        ✅ {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PRÓXIMOS PASSOS */}
      {abaAtiva === 'passos' && (
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {diagnostico?.proximosPassos?.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '16px', padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', minWidth: '100px' }}>{p.prazo}</div>
              <div style={{ fontSize: '12px', color: 'var(--textMuted)', minWidth: '120px' }}>{p.responsavel}</div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>{p.acao}</div>
            </div>
          ))}
        </div>
      )}

      {/* SWOT */}
      {abaAtiva === 'swot' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'FORÇAS', cor: '#00A651', itens: diagnostico?.swot?.forcas },
            { label: 'FRAQUEZAS', cor: '#F04545', itens: diagnostico?.swot?.fraquezas },
            { label: 'OPORTUNIDADES', cor: '#3B82F6', itens: diagnostico?.swot?.oportunidades },
            { label: 'AMEAÇAS', cor: '#E8920A', itens: diagnostico?.swot?.ameacas },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', borderLeft: `4px solid ${s.cor}` }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: s.cor, letterSpacing: '1px' }}>{s.label}</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                {s.itens?.map((item, i) => (
                  <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--textSub)' }}>• {item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GUT */}
      {abaAtiva === 'gut' && (
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>
            <span>PROBLEMA</span><span>G</span><span>U</span><span>T</span><span>TOTAL</span><span>NÍVEL</span>
          </div>
          {diagnostico?.gut?.map((g, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto', gap: '8px', padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--textSub)' }}>{g.problema}</span>
              {[g.g, g.u, g.t, g.total].map((v, j) => (
                <span key={j} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: j === 3 ? 700 : 400, color: 'var(--text)', textAlign: 'center' }}>{v}</span>
              ))}
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: g.nivel === 'Crítico' ? 'rgba(240,69,69,0.1)' : g.nivel === 'Moderado' ? 'rgba(232,146,10,0.1)' : 'rgba(0,166,81,0.1)', color: g.nivel === 'Crítico' ? 'var(--danger)' : g.nivel === 'Moderado' ? 'var(--warning)' : 'var(--verde)' }}>
                {g.nivel}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PORTER */}
      {abaAtiva === 'porter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {diagnostico?.porter?.map((p, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{p.forca}</div>
                <div style={{ fontSize: '12px', color: 'var(--textSub)' }}>{p.descricao}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: p.nivel === 'Alto' ? 'var(--danger)' : p.nivel === 'Médio' ? 'var(--warning)' : 'var(--verde)' }}>{p.score}</div>
                <div style={{ fontSize: '11px', color: p.nivel === 'Alto' ? 'var(--danger)' : p.nivel === 'Médio' ? 'var(--warning)' : 'var(--verde)' }}>{p.nivel}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BCG */}
      {abaAtiva === 'bcg' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {diagnostico?.bcg?.map((b, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{b.quadrante}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>{b.produto}</div>
              <div style={{ fontSize: '12px', color: 'var(--textSub)' }}>{b.descricao}</div>
            </div>
          ))}
        </div>
      )}

      {/* BENCHMARKS */}
      {abaAtiva === 'benchmarks' && (
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>
            <span>INDICADOR</span><span>EMPRESA</span><span>MERCADO SAUDÁVEL</span><span>STATUS</span>
          </div>
          {diagnostico?.benchmarks?.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--textSub)' }}>{b.indicador}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text)' }}>{b.empresa}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--textMuted)' }}>{b.mercado}</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: b.status === 'Acima' ? 'rgba(0,166,81,0.1)' : b.status === 'Abaixo' ? 'rgba(240,69,69,0.1)' : 'rgba(59,130,246,0.1)', color: b.status === 'Acima' ? 'var(--verde)' : b.status === 'Abaixo' ? 'var(--danger)' : 'var(--accent)' }}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ESTRATÉGIA */}
      {abaAtiva === 'estrategia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'MISSÃO', texto: diagnostico?.missao },
              { label: 'VISÃO', texto: diagnostico?.visao },
              { label: 'VALORES', texto: diagnostico?.valores?.join(' / ') },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--textSub)', lineHeight: 1.6 }}>{item.texto}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>OKRs</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Financeira', itens: diagnostico?.okrs?.financeira },
                { label: 'Clientes', itens: diagnostico?.okrs?.clientes },
                { label: 'Processos', itens: diagnostico?.okrs?.processos },
                { label: 'Pessoas', itens: diagnostico?.okrs?.pessoas },
              ].map(okr => (
                <div key={okr.label}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>{okr.label}</div>
                  {okr.itens?.map((item, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--textSub)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>• {item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLANO 90 DIAS */}
      {abaAtiva === 'plano' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {diagnostico?.planoAcao?.map((p, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px', display: 'grid', gridTemplateColumns: 'auto auto auto 1fr', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px' }}>{p.urgencia}</span>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, minWidth: '100px' }}>{p.prazo}</span>
              <span style={{ fontSize: '12px', color: 'var(--textMuted)', minWidth: '120px' }}>{p.responsavel}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{p.acao}</div>
                <div style={{ fontSize: '12px', color: 'var(--textSub)' }}>{p.descricao}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}