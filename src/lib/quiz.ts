export type ProfileId = (typeof QUESTIONS)[0]["options"][number]["id"] | "internato";
export type GoalId = "entender" | "revisar" | "questoes" | "caso";
export type DifficultyId = "inicio" | "tempo" | "entender" | "lembrar" | "aplicar";
export type Answers = { profile?: ProfileId; goal?: GoalId; difficulty?: DifficultyId };

export const QUESTIONS = [
  { id: "profile", title: "Em que momento você está?", options: [
    { id: "vestibular", label: "Estou estudando para entrar em medicina." },
    { id: "ingressante", label: "Vou começar a faculdade de medicina." },
    { id: "estudante", label: "Já estou cursando medicina." },
    { id: "pre_residencia", label: "Estou prestando residência médica." },
    { id: "formado", label: "Já sou formado em medicina." },
    { id: "fora_area_medica", label: "Não pertenço à área médica." },
  ]},
  { id: "goal", title: "O que você precisa fazer agora?", options: [
    { id: "entender", label: "Entender melhor um conteúdo." },
    { id: "revisar", label: "Revisar para uma prova." },
    { id: "questoes", label: "Praticar questões." },
    { id: "caso", label: "Treinar meu raciocínio com um caso clínico." },
  ]},
  { id: "difficulty", title: "O que mais dificulta seus estudos hoje?", options: [
    { id: "inicio", label: "Não sei por onde começar." },
    { id: "tempo", label: "Tenho pouco tempo e preciso definir prioridades." },
    { id: "entender", label: "Tenho dificuldade para entender alguns conteúdos." },
    { id: "lembrar", label: "Estudo, mas tenho dificuldade para lembrar depois." },
    { id: "aplicar", label: "Entendo a teoria, mas tenho dificuldade nas questões ou nos casos." },
  ]},
] as const;

export type QuestionId = (typeof QUESTIONS)[number]["id"];
export type ToolId = "questoes" | "casos" | "estudo" | "anatomia" | "referencias";
export type StudyStep = { title: string; text: string; tool_id: ToolId; tool: string };

const GOAL_CONTENT: Record<GoalId, { title: string; intro: string; feature: "questoes" | "casos" | "estudo" }> = {
  entender: { title: "Entenda o conteúdo e coloque a teoria em prática.", intro: "Comece pelos conceitos que precisa esclarecer, explore uma explicação e pratique com uma atividade relacionada.", feature: "estudo" },
  revisar: { title: "Pratique para a prova e revise o que gerar dúvida.", intro: "Use a prática para orientar sua revisão, em vez de tentar reler todo o conteúdo de uma vez.", feature: "questoes" },
  questoes: { title: "Treine questões e revise o raciocínio das respostas.", intro: "Tente responder, confira a justificativa e retome os conceitos que gerarem dúvida.", feature: "questoes" },
  caso: { title: "Pratique seu raciocínio com casos clínicos.", intro: "Explore uma situação educacional, organize as informações e revise os fundamentos que sustentam seu raciocínio.", feature: "casos" },
};

const GOAL_LABEL: Record<GoalId, string> = { entender: "entender melhor um conteúdo", revisar: "revisar para uma prova", questoes: "praticar questões", caso: "treinar seu raciocínio com casos clínicos" };
const DIFF_LABEL: Record<DifficultyId, string> = { inicio: "não sabe por onde começar", tempo: "tem pouco tempo", entender: "tem dificuldade para entender alguns conteúdos", lembrar: "tem dificuldade para lembrar depois", aplicar: "tem dificuldade para aplicar a teoria nas questões ou nos casos" };
const PROFILE_LABEL: Record<ProfileId, string> = {
  vestibular: "Como você está se preparando para entrar em medicina",
  ingressante: "Antes de começar a faculdade de medicina",
  estudante: "Como estudante de medicina",
  internato: "No internato",
  pre_residencia: "Na preparação para a residência",
  formado: "Com a formação em medicina concluída",
  fora_area_medica: "Como você está fora da área médica",
};
const TOPIC: Record<ProfileId, string> = {
  vestibular: "um tema que você precisa revisar",
  ingressante: "um conteúdo introdutório do curso de medicina",
  estudante: "um conteúdo da sua disciplina atual",
  internato: "um tema relacionado a uma situação que você encontrou no internato",
  pre_residencia: "um conteúdo prioritário para sua prova de residência",
  formado: "um tema médico que você quer aprofundar",
  fora_area_medica: "um tema introdutório que você quer estudar",
};

const TOOL_NAME: Record<ToolId, string> = {
  questoes: "Simulados e questões",
  casos: "Casos clínicos",
  estudo: "Estudo guiado",
  anatomia: "Anatomia 3D",
  referencias: "Livros e referências",
};

function step(title: string, text: string, tool_id: ToolId): StudyStep {
  return { title, text, tool_id, tool: TOOL_NAME[tool_id] };
}

function primaryTool(goal: GoalId): ToolId {
  if (goal === "caso") return "casos";
  if (goal === "entender") return "estudo";
  return "questoes";
}

function practiceText(goal: GoalId, topic: string) {
  if (goal === "caso") return `Abra um caso clínico educacional sobre ${topic}. Antes de ver a solução, separe os dados apresentados e escreva qual relação precisa explicar.`;
  if (goal === "entender") return `Abra ${topic} no Estudo guiado e explique cada conceito com suas palavras antes de avançar.`;
  return `Escolha ${topic} nos Simulados e questões e responda uma atividade sem consultar o material. Guarde a alternativa que gerou dúvida.`;
}

function buildSteps(a: Required<Answers>): StudyStep[] {
  const topic = TOPIC[a.profile];
  const primary = primaryTool(a.goal);
  const plans: Record<DifficultyId, StudyStep[]> = {
    inicio: [
      step("Comece com uma sequência pronta", `No Estudo guiado, selecione ${topic} e conclua apenas a primeira explicação. Assim você tem um ponto de partida definido.`, "estudo"),
      step("Faça uma primeira verificação", practiceText(a.goal, topic), primary),
      step("Transforme a dúvida no próximo passo", "Abra a referência indicada junto à atividade e leia somente o trecho relacionado ao que você não conseguiu explicar.", "referencias"),
    ],
    tempo: [
      step("Use uma atividade para definir a prioridade", practiceText(a.goal, topic), primary),
      step("Revise apenas o que travou", "Leia a justificativa da resposta e identifique o conceito exato que faltou. Se o erro foi no raciocínio, compare os dados usados em cada etapa.", a.goal === "caso" ? "casos" : "questoes"),
      step("Consulte a fonte certa, sem reler tudo", "Abra o livro ou a referência vinculada ao conteúdo e vá direto ao fundamento da dúvida encontrada na atividade.", "referencias"),
    ],
    entender: [
      step("Construa a base do conceito", `No Estudo guiado, percorra a explicação de ${topic} e anote a relação entre causa, mecanismo e consequência.`, "estudo"),
      step("Visualize as estruturas envolvidas", "Se o conteúdo tiver relações anatômicas, gire o modelo na Anatomia 3D e localize as estruturas citadas na explicação.", "anatomia"),
      step("Teste se a explicação ficou clara", practiceText(a.goal, topic), primary),
    ],
    lembrar: [
      step("Tente lembrar antes de reler", `Nos Simulados e questões, responda uma atividade sobre ${topic} sem consultar suas anotações.`, "questoes"),
      step("Recupere o fundamento esquecido", "Na justificativa, marque o ponto que você não soube recuperar e abra a referência correspondente para revisar esse trecho.", "referencias"),
      step("Pratique o mesmo conceito de outra forma", practiceText(a.goal, topic), primary),
    ],
    aplicar: [
      step("Organize o raciocínio antes da resposta", practiceText(a.goal, topic), primary),
      step("Localize onde a teoria se desconectou", "Compare sua resposta com a justificativa e identifique se a dificuldade estava na interpretação dos dados ou no conceito usado.", a.goal === "caso" ? "casos" : "questoes"),
      step("Reforce o fundamento e tente outra atividade", "Consulte a referência indicada, resuma o conceito em uma frase e aplique-o em uma nova questão ou caso sobre o mesmo tema.", "referencias"),
    ],
  };
  return plans[a.difficulty];
}

export function isOutsideTarget(profile: string) {
  return profile === "vestibular" || profile === "fora_area_medica";
}

export function buildRecommendation(a: Required<Answers>) {
  const g = GOAL_CONTENT[a.goal];
  const id = `rec_${a.goal}_${a.difficulty}`;
  const context = `${PROFILE_LABEL[a.profile]}, você quer ${GOAL_LABEL[a.goal]} e informou que ${DIFF_LABEL[a.difficulty]}. ${g.intro}`;
  return { id, title: g.title, context, steps: buildSteps(a), feature: g.feature, outsideTarget: isOutsideTarget(a.profile) };
}
