import React, { useState, useRef } from 'react';
import { Subject, Difficulty, QuizQuestion, HardcoreChallenge } from '../types';
import { getQuizQuestions, getHardcoreChallenge } from '../services/geminiService';
import { ArrowUturnLeftIcon } from './Icons';
import { DIFFICULTIES } from '../constants';
import { CodeBlock, parseAndRenderText, highlightJsKeywords } from './CodeBlock';

interface PracticeModeProps {
  subject: Subject;
  onBack: () => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ subject, onBack }) => {
  const [mode, setMode] = useState<'select' | 'quiz' | 'hardcore' | 'result'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [challenge, setChallenge] = useState<HardcoreChallenge | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  
  // State for Hardcore mode
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string; }[] | null>(null);
  const [isTestingCode, setIsTestingCode] = useState(false);
  const [hardcoreLevel, setHardcoreLevel] = useState(1);
  const textAreaRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea

  const handleStart = async (difficulty: Difficulty) => {
    setIsLoading(true);
    setMode('select'); 
    
    if (difficulty === Difficulty.Hardcore) {
      setHardcoreLevel(1);
      setUserCode('');
      setTestResults(null);
      const challengeData = await getHardcoreChallenge(subject, 1);
      if (challengeData) {
        // Pre-fill code with function signature for better UX
        setUserCode(`${challengeData.functionSignature} {\n  // Escreva seu código aqui\n}`);
      }
      setChallenge(challengeData);
      setMode('hardcore');
    } else {
      const quizQuestions = await getQuizQuestions(subject, difficulty, subject.topics);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setScore(0);
      setMode('quiz');
    }
    setIsLoading(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (index === questions[currentQuestionIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setMode('result');
    }
  };

  const handleRestart = () => {
    setMode('select');
    setQuestions([]);
    setChallenge(null);
  };

  const handleTestCode = async () => {
    if (!challenge || isTestingCode) return;
    setIsTestingCode(true);
  
    const results = [];
    const functionName = challenge.functionSignature.match(/function\s+([a-zA-Z0-9_]+)/)?.[1];
  
    if (!functionName) {
      setTestResults([{ passed: false, message: "💥 Erro Interno: Não foi possível analisar o nome da função." }]);
      setIsTestingCode(false);
      return;
    }
  
    for (const testCase of challenge.testCases) {
      try {
        // FIX: Construct a self-contained script that defines and executes the user's function,
        // ensuring the return value is captured correctly.
        const codeToRun = `
          ${userCode};
          return ${functionName}(${JSON.stringify(testCase.input).slice(1, -1)});
        `;
        
        const func = new Function(codeToRun);
        const output = func();
        const expected = testCase.output;
  
        const passed = JSON.stringify(output) === JSON.stringify(expected);
  
        results.push({
          passed,
          message: `Input: ${JSON.stringify(testCase.input)} -> ${passed ? '✅' : `❌ (Esperado: ${JSON.stringify(expected)}, Recebido: ${JSON.stringify(output)})`}`,
        });
  
      } catch (error: any) {
        results.push({
          passed: false,
          message: `Input: ${JSON.stringify(testCase.input)} -> 💥 Erro de execução: ${error.message}`,
        });
      }
    }
    setTestResults(results);
    setIsTestingCode(false);
  };

  const handleNextChallenge = async () => {
      setIsLoading(true);
      const nextLevel = hardcoreLevel + 1;
      setHardcoreLevel(nextLevel);
      setUserCode('');
      setTestResults(null);
      const challengeData = await getHardcoreChallenge(subject, nextLevel);
      if (challengeData) {
        setUserCode(`${challengeData.functionSignature} {\n  // Escreva seu código aqui\n}`);
      }
      setChallenge(challengeData);
      setIsLoading(false);
  };

  const handleIndentation = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();

        const { value, selectionStart, selectionEnd } = e.currentTarget;

        // Find the start of the current line to get its indentation
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const currentLine = value.substring(lineStart, selectionStart);
        const currentIndentation = currentLine.match(/^\s*/)?.[0] || '';

        // Check if the current line ends with '{' to add extra indentation
        let newIndentation = currentIndentation;
        if (currentLine.trim().endsWith('{')) {
            newIndentation += '  '; // Add two spaces
        }

        const newValue =
            value.substring(0, selectionStart) +
            '\n' +
            newIndentation +
            value.substring(selectionEnd);

        setUserCode(newValue);

        // Use the ref to safely set the cursor position after the state update
        setTimeout(() => {
            if (textAreaRef.current) {
                const newCursorPosition = selectionStart + 1 + newIndentation.length;
                textAreaRef.current.selectionStart = newCursorPosition;
                textAreaRef.current.selectionEnd = newCursorPosition;
            }
        }, 0);
    }
  };
  
  const renderSelectionScreen = () => (
    <div className="text-center animate-fade-in-down">
      <h2 className="text-3xl font-bold mb-2">Modo de Prática: {subject.name}</h2>
      <p className="text-gray-400 mb-8">Escolha um nível de dificuldade para começar.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
        {DIFFICULTIES.map(diff => {
          const isHardcore = diff === Difficulty.Hardcore;
          const isHardcoreDisabled = isHardcore && subject.id !== 'logic';

          return (
            <button
              key={diff}
              onClick={() => handleStart(diff)}
              disabled={isHardcoreDisabled}
              className={`p-6 bg-gray-800/50 border border-purple-500/30 rounded-lg transition-all duration-300 ${isHardcoreDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1'}`}
              title={isHardcoreDisabled ? 'Em desenvolvimento para esta disciplina' : ''}
            >
              <h3 className="text-xl font-bold text-white">{diff}</h3>
              {isHardcoreDisabled && (
                <p className="text-xs text-gray-400 mt-1">Em desenvolvimento</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!questions || questions.length === 0) return null;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <p className="text-sm text-gray-400 mb-2">Questão {currentQuestionIndex + 1} de {questions.length} | Pontuação: {score}</p>
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
          <div className="text-lg mb-6 prose prose-invert text-white max-w-none">{parseAndRenderText(currentQuestion.question)}</div>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-colors duration-200 text-gray-200 border-gray-600 hover:bg-gray-700";
              if (showFeedback) {
                if (index === currentQuestion.answer) {
                  buttonClass = "w-full text-left p-4 rounded-lg border-2 border-green-500 bg-green-500/20 text-white cursor-not-allowed";
                } else if (index === selectedAnswer) {
                  buttonClass = "w-full text-left p-4 rounded-lg border-2 border-red-500 bg-red-500/20 text-white cursor-not-allowed";
                } else {
                  buttonClass += " cursor-not-allowed opacity-60";
                }
              }
              return (
                <button key={index} onClick={() => handleAnswerSelect(index)} className={buttonClass} disabled={showFeedback}>
                  <div className="prose prose-invert prose-sm text-white max-w-none">{parseAndRenderText(option)}</div>
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-purple-500/30 animate-fade-in">
              <h4 className="font-bold text-purple-400 mb-2">Explicação:</h4>
              <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
              <button onClick={handleNextQuestion} className="w-full mt-4 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultados'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderHardcoreChallenge = () => {
    if (!challenge) return null;
    const allTestsPassed = testResults && testResults.every(r => r.passed);

    return (
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Desafio Hardcore! (Nível: {hardcoreLevel})</h2>
            <div className="prose prose-invert text-white max-w-none">
              <p>{challenge.description}</p>
              <CodeBlock code={challenge.functionSignature} />
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-2">Sua Solução:</h3>
            <div className="relative font-mono text-sm leading-6">
                <pre aria-hidden="true" className="p-4 rounded-md bg-gray-900 border border-gray-700 min-h-[200px] overflow-auto">
                    <code className="block whitespace-pre-wrap">{highlightJsKeywords(userCode)}</code>
                </pre>
                <textarea
                    ref={textAreaRef}
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    onKeyDown={handleIndentation}
                    spellCheck="false"
                    className="absolute top-0 left-0 w-full h-full p-4 rounded-md bg-transparent text-transparent caret-white border-none focus:ring-0 resize-none font-mono leading-6"
                />
            </div>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={handleTestCode} 
                disabled={isTestingCode}
                className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600">
                {isTestingCode ? 'Testando...' : 'Testar Código'}
            </button>
            {allTestsPassed && (
                <button 
                    onClick={handleNextChallenge}
                    className="flex-1 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors animate-pulse">
                    Próximo Desafio
                </button>
            )}
        </div>

        {testResults && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Resultados:</h3>
                <ul className="space-y-1 font-mono text-sm">
                    {testResults.map((result, index) => (
                        <li key={index} className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            {result.message}
                        </li>
                    ))}
                </ul>
            </div>
        )}

         <div className="prose prose-invert text-white max-w-none bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white text-lg">Casos de Teste Visíveis</h3>
          <ul className="text-sm">
            {challenge.testCases.map((test, index) => (
              <li key={index}>
                <strong>Input:</strong> <code>{JSON.stringify(test.input)}</code>, <strong>Output Esperado:</strong> <code>{JSON.stringify(test.output)}</code>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={handleRestart} className="w-full mt-6 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
          Desistir e Voltar
        </button>
      </div>
    );
  };

  const renderResultScreen = () => (
    <div className="text-center max-w-md mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold mb-4">Resultados</h2>
      <p className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{score} / {questions.length}</p>
      <p className="text-lg text-gray-300 mb-8">{score > questions.length / 2 ? 'Excelente trabalho! Você está no caminho certo.' : 'Não desanime! A prática leva à perfeição.'}</p>
      <button onClick={handleRestart} className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
        Praticar Novamente
      </button>
    </div>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="text-center flex flex-col items-center justify-center p-8">
            <div className="flex items-center justify-center space-x-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-0"></span>
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></span>
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-400"></span>
             </div>
             <p className="mt-4 text-gray-400">Gerando seu desafio... A IA está pensando!</p>
        </div>
      );
    }

    switch (mode) {
      case 'quiz': return renderQuiz();
      case 'hardcore': return renderHardcoreChallenge();
      case 'result': return renderResultScreen();
      case 'select':
      default:
        return renderSelectionScreen();
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 mb-8 text-purple-400 hover:text-purple-300 transition-colors self-start">
        <ArrowUturnLeftIcon className="w-5 h-5" />
        Voltar para seleção
      </button>
      {renderBody()}
    </div>
  );
};

export default PracticeMode;