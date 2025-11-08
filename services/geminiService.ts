import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Subject, Difficulty, HardcoreChallenge } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const funnyGreetings = [
    "E aí, dev! Pronto pra quebrar a cabeça ou o código? Ou os dois?",
    "Olá! Fui compilado especialmente para te ajudar. Ou te confundir mais. Veremos.",
    "Saudações, ser de carne e osso! O que sua lógica (ou falta dela) manda hoje?",
    "Preparado para transformar café em código? Eu já estou no meu segundo Giga de dados hoje.",
    "Oi! Vim do futuro para dizer que seu código vai funcionar. Mas só depois de alguns 'erros inesperados'.",
    "Beep boop! Acesso concedido. Qual bug vamos caçar hoje?",
    "Olá, mundo! Pronto para mais uma sessão de 'por que isso não funciona?'",
    "Iniciando protocolos de ajuda... Só não me peça para centralizar uma div. Brincadeira... ou não.",
    "Seu assistente de IA favorito chegou. Sem memory leaks, prometo!",
    "Tudo pronto para codificar? Já limpei meu cache para você."
];

export const getChatResponse = async (history: { role: string; parts: { text: string; }[] }[], newMessage: string, subject: Subject): Promise<string> => {
    try {
        // The last message is already in history, so we don't need to pass `newMessage` separately.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
                maxOutputTokens: 1000,
                systemInstruction: `Você é o "Prof. DEV", um professor de programação especialista EXCLUSIVAMENTE na disciplina de "${subject.name}". Sua personalidade é divertida, animada e informal.
SUAS REGRAS MAIS IMPORTANTES SÃO:
1. FOCO TOTAL: Você SÓ PODE responder perguntas relacionadas à disciplina de "${subject.name}" e tópicos de programação diretamente ligados a ela. É PROIBIDO responder sobre qualquer outro assunto.
2. RECUSA ENGRAÇADA: Se um aluno perguntar algo fora do tópico, você DEVE recusar a resposta com uma frase curta e engraçada, sempre direcionando de volta para o assunto principal. Exemplos de recusa: 'Opa, essa pergunta deu 404 Not Found na minha base de dados! Que tal voltarmos para ${subject.name}?', 'Isso aí já é outra stack! Meu processador só compila assuntos de ${subject.name}. Vamos tentar de novo?', 'Minha API não tem endpoint pra esse assunto. Mas tenho vários sobre ${subject.name}, qual você quer ver?'.
3. DIRETO AO PONTO: Após a primeira saudação (que já foi enviada), responda diretamente às perguntas dos alunos, sem enrolação.
4. CÓDIGO JAVASCRIPT: Formate TODO código em blocos markdown para javascript: \`\`\`javascript\n// seu código aqui\n\`\`\`.
`,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "Ops, parece que meu cérebro de silício deu uma pequena pane. Tente perguntar de outra forma.";
    }
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "O texto da pergunta. Pode conter blocos de código markdown (ex: ```javascript\\nconst a = 1;\\n```)."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "Um array com 4 strings, representando as opções de resposta. Também podem conter código em markdown.",
                        items: {
                            type: Type.STRING
                        }
                    },
                    answer: {
                        type: Type.NUMBER,
                        description: "O índice (0 a 3) da resposta correta no array de opções."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "Uma breve explicação do porquê a resposta está correta."
                    }
                }
            }
        }
    }
};

const hardcoreChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "A descrição clara e concisa do problema de programação a ser resolvido. Ex: 'Escreva uma função que receba dois números e retorne sua soma.'"
        },
        functionSignature: {
            type: Type.STRING,
            description: "A assinatura da função que o usuário deve criar. Ex: 'function somar(a, b)'"
        },
        testCases: {
            type: Type.ARRAY,
            description: "Um array de pelo menos 3 casos de teste.",
            items: {
                type: Type.OBJECT,
                properties: {
                    input: {
                        type: Type.ARRAY,
                        description: "Um array com os argumentos para a função.",
                        items: {},
                    },
                    output: {
                        description: "O resultado esperado. Pode ser qualquer tipo JSON (string, number, boolean, array, object)."
                    }
                }
            }
        }
    }
};


export const getQuizQuestions = async (subject: Subject, difficulty: Difficulty, topics: string[]): Promise<QuizQuestion[]> => {
    const prompt = `Gere 5 questões de múltipla escolha (com exatamente 4 opções cada) sobre "${subject.name}" com dificuldade "${difficulty}" para um aluno de desenvolvimento de sistemas. Foque nos seguintes tópicos: ${topics.join(', ')}. Apenas uma resposta pode ser correta. Formate todo e qualquer código, tanto nas perguntas quanto nas opções, usando blocos de código markdown (ex: \`\`\`javascript\nconst a = 1;\n\`\`\`). A resposta final deve ser um JSON válido.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // FIX: Simplified the 'contents' structure for a single text prompt.
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (data && data.questions) {
            return data.questions as QuizQuestion[];
        }
        return [];
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        // Fallback with a dummy question in case of API error
        return [
            {
                question: "Ocorreu um erro ao buscar as perguntas da API. O que você deve fazer?",
                options: ["Chorar", "Desistir", "Tentar novamente mais tarde", "Culpar o estagiário"],
                answer: 2,
                explanation: "Quando a API falha, o melhor é esperar um pouco e tentar novamente, pois pode ser um problema temporário. E não, não culpe o estagiário (pelo menos não em voz alta)."
            }
        ];
    }
};

export const getHardcoreChallenge = async (subject: Subject, level: number): Promise<HardcoreChallenge | null> => {
    const prompt = `Gere UM desafio de programação em JavaScript sobre "${subject.name}". A dificuldade do desafio deve ser ${level} em uma escala de 1 a 100 (onde 1 é trivial, como somar dois números, e 100 é um problema de algoritmo complexo). O desafio deve ser auto-contido e testável. Forneça uma descrição clara, a assinatura da função e pelo menos 3 casos de teste com entradas e saídas. A resposta deve ser um JSON válido.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // FIX: Simplified the 'contents' structure for a single text prompt.
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hardcoreChallengeSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as HardcoreChallenge;

    } catch (error) {
        console.error("Error generating hardcore challenge:", error);
        return {
            description: "Ocorreu um erro ao buscar um desafio da API. A culpa não é sua (provavelmente).",
            functionSignature: "function erro()",
            testCases: [{ input: [], output: "Tente novamente mais tarde." }]
        };
    }
};