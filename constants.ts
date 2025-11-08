import React from 'react';
import { Subject, Difficulty, ChangelogEntry } from './types';
import { CodeBracketIcon, PuzzlePieceIcon, CommandLineIcon, BeakerIcon, DevicePhoneMobileIcon, CircleStackIcon } from './components/Icons';

export const SUBJECTS: Subject[] = [
  {
    id: 'logic',
    name: 'Lógica de Programação',
    description: 'Conceitos fundamentais, variáveis, condicionais, laços e funções em JavaScript.',
    // FIX: Use React.createElement instead of JSX syntax to prevent parsing errors in a .ts file.
    icon: React.createElement(PuzzlePieceIcon, { className: "w-8 h-8" }),
    topics: ['Variáveis e Tipos de Dados', 'Operadores', 'Estruturas Condicionais (if/else)', 'Estruturas de Repetição (for/while)', 'Funções', 'Arrays', 'Objetos Simples']
  },
  {
    id: 'web',
    name: 'Programação Web',
    description: 'Crie interfaces com HTML, CSS, JavaScript e mergulhe no ecossistema React.',
    // FIX: Use React.createElement instead of JSX syntax to prevent parsing errors in a .ts file.
    icon: React.createElement(CodeBracketIcon, { className: "w-8 h-8" }),
    topics: ['HTML Semântico', 'CSS (Flexbox, Grid)', 'Manipulação do DOM com JS', 'Eventos', 'Componentes React', 'Estado (useState)', 'Props', 'Hooks (useEffect)']
  },
  {
    id: 'oop',
    name: 'Prog. Orientada a Objetos',
    description: 'Abstração, encapsulamento, herança e polimorfismo com JavaScript, Node e Express.',
    // FIX: Use React.createElement instead of JSX syntax to prevent parsing errors in a .ts file.
    icon: React.createElement(CommandLineIcon, { className: "w-8 h-8" }),
    topics: ['Classes e Objetos', 'Herança', 'Polimorfismo', 'Encapsulamento', 'Setup de Servidor Node.js', 'Rotas com Express', 'Middlewares']
  },
  {
    id: 'database',
    name: 'Banco de Dados',
    description: 'Aprenda a modelar e consultar bancos de dados com SQL, SQLite, MySQL e PostgreSQL.',
    icon: React.createElement(CircleStackIcon, { className: "w-8 h-8" }),
    topics: ['Modelagem de Dados', 'SQL (SELECT, INSERT, UPDATE, DELETE)', 'JOINs', 'Agregação (GROUP BY)', 'Chaves Primárias e Estrangeiras', 'SQLite vs MySQL vs PostgreSQL']
  },
  {
    id: 'testing',
    name: 'Qualidade e Teste de Software',
    description: 'Garanta a qualidade do seu código com testes unitários, de integração e TDD usando Jest.',
    // FIX: Use React.createElement instead of JSX syntax to prevent parsing errors in a .ts file.
    icon: React.createElement(BeakerIcon, { className: "w-8 h-8" }),
    topics: ['Tipos de Teste', 'Testes Unitários', 'Matchers do Jest', 'Testando Funções', 'Mocks e Spies', 'Test-Driven Development (TDD)', 'Testes de Componentes React']
  },
  {
    id: 'mobile',
    name: 'Desenvolvimento Mobile',
    description: 'Construa aplicativos para iOS e Android com React Native, componentes e navegação.',
    // FIX: Use React.createElement instead of JSX syntax to prevent parsing errors in a .ts file.
    icon: React.createElement(DevicePhoneMobileIcon, { className: "w-8 h-8" }),
    topics: ['Componentes Nativos (View, Text)', 'Estilização com StyleSheet', 'Componentes de Input', 'Listas (FlatList)', 'Navegação (React Navigation)', 'Estado Global']
  },
];

export const DIFFICULTIES = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.Hardcore];

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v1.4.0',
    date: '07/11/2025',
    description: `Grande atualização de funcionalidades! As novidades do dia incluem:
• **Modo Hardcore:** Novo modo de desafio para 'Lógica de Programação' com testes de código em tempo real e dificuldade progressiva.
• **Editor de Código Avançado:** O modo Hardcore agora conta com um editor com destaque de sintaxe e indentação automática.
• **Melhorias na IA:** O Prof. DEV agora foca estritamente nos tópicos da disciplina e tem uma personalidade mais definida.
• **Nova Disciplina:** Adicionamos a disciplina de 'Banco de Dados' ao currículo.
• **Log de Modificações:** Agora você pode ver todas as atualizações aqui mesmo!`,
  },
  {
    version: 'v1.0.1',
    date: '15/08/2025',
    description: 'Pequenos ajustes de texto: Título atualizado para "Prof. Dev" e créditos com link para o criador adicionados no rodapé.',
  },
  {
    version: 'v1.0.0',
    date: '01/06/2025',
    description: 'Lançamento da plataforma! Bem-vindo ao Prof. Dev, seu novo assistente de estudos. 🚀',
  },
];