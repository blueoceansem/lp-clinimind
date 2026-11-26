export type ProfileId = "vestibular" | "estudante" | "internato" | "pre_residencia";
export type GoalId = "entender" | "revisar" | "questoes" | "caso";
export type DifficultyId = "inicio" | "tempo" | "entender" | "lembrar" | "aplicar";
export type Answers = { profile?: ProfileId; goal?: GoalId; difficulty?: DifficultyId };

export const QUESTIONS = [
  { id: "profile", title: "Em que momento você está?", options: [
    { id: "vestibular", label: "Estou estudando para entrar em medicina." },
    { id: "estudante", label: "Já estou cursando medicina." },
    { id: "internato", label: "Estou no internato." },
    { id: "pre_residencia", label: "Estou me preparando para a prova de residência." },
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

const GOAL_CONTENT: Record<GoalId, { title: string; intro: string; feature: "questoes" | "casos" | "estudo" }> = {
  entender: { title: "Entenda o conteúdo e coloque a teoria em prática.", intro: "Comece pelos conceitos que precisa esclarecer, explore uma explicação e pratique com uma atividade relacionada.", feature: "estudo" },
  revisar: { title: "Pratique para a prova e revise o que gerar dúvida.", intro: "Use a prática para orientar sua revisão, em vez de tentar reler todo o conteúdo de uma vez.", feature: "questoes" },
  questoes: { title: "Treine questões e revise o raciocínio das respostas.", intro: "Tente responder, confira a justificativa e retome os conceitos que gerarem dúvida.", feature: "questoes" },
  caso: { title: "Pratique seu raciocínio com casos clínicos.", intro: "Explore uma situação educacional, organize as informações e revise os fundamentos que sustentam seu raciocínio.", feature: "casos" },
};

const GOAL_LABEL: Record<GoalId, string> = { entender: "entender melhor um conteúdo", revisar: "revisar para uma prova", questoes: "praticar questões", caso: "treinar seu raciocínio com casos clínicos" };
const DIFF_LABEL: Record<DifficultyId, string> = { inicio: "não sabe por onde começar", tempo: "tem pouco tempo", entender: "tem dificuldade para entender alguns conteúdos", lembrar: "tem dificuldade para lembrar depois", aplicar: "tem dificuldade para aplicar a teoria nas questões ou nos casos" };
const PROFILE_LABEL: Record<ProfileId, string> = { vestibular: "Como você está se preparando para entrar em medicina", estudante: "Como estudante de medicina", internato: "No internato", pre_residencia: "Na preparação para a residência" };

type Step = { title: string; text: string };
const DIFF_STEPS: Record<DifficultyId, Step[]> = {
  inicio: [
    { title: "Escolha um assunto para começar", text: "Siga uma sequência inicial do estudo guiado na plataforma, em vez de tentar cobrir tudo de uma vez." },
    { title: "Pratique uma atividade relacionada", text: "Responda uma questão ou explore um caso sobre o assunto escolhido." },
    { title: "Retome o que precisa de atenção", text: "Revise os pontos que geraram dúvida e consulte as referências para aprofundar." },
  ],
  tempo: [
    { title: "Pratique questões do conteúdo da prova", text: "Escolha o assunto na plataforma e tente responder antes de consultar a explicação." },
    { title: "Confira o raciocínio das respostas", text: "Observe quais conceitos você conseguiu explicar e quais ainda geraram dúvida." },
    { title: "Revise os fundamentos dessas dúvidas", text: "Retome o conteúdo e consulte as referências para aprofundar o que precisa de atenção." },
  ],
  entender: [
    { title: "Comece pelos conceitos", text: "Explore a explicação do conteúdo e as referências antes de partir para a prática." },
    { title: "Visualize o que está estudando", text: "Use a anatomia 3D ou o estudo guiado para relacionar os conceitos." },
    { title: "Aplique em uma atividade", text: "Responda uma questão ou explore um caso para verificar o que ficou claro." },
  ],
  lembrar: [
    { title: "Tente recuperar o conteúdo", text: "Antes de reler, responda questões sobre o assunto e veja o que você lembra." },
    { title: "Confira as explicações", text: "Compare suas respostas com as justificativas e anote o que esqueceu." },
    { title: "Pratique de novo", text: "Volte ao assunto com novas atividades para fixar o que precisou revisar." },
  ],
  aplicar: [
    { title: "Pratique uma questão ou um caso", text: "Escolha o assunto e tente organizar seu raciocínio antes de ver a resposta." },
    { title: "Compare o raciocínio", text: "Confira a justificativa e identifique em que ponto a teoria não se conectou ao problema." },
    { title: "Revise o fundamento", text: "Retome o conceito nas referências e pratique novamente com outra atividade." },
  ],
};

export function buildRecommendation(a: Required<Answers>) {
  const g = GOAL_CONTENT[a.goal];
  const id = `rec_${a.goal}_${a.difficulty}`;
  const context = `${PROFILE_LABEL[a.profile]}, você quer ${GOAL_LABEL[a.goal]} e informou que ${DIFF_LABEL[a.difficulty]}. ${g.intro}`;
  return { id, title: g.title, context, steps: DIFF_STEPS[a.difficulty], feature: g.feature, outsideTarget: a.profile === "vestibular" };
}
