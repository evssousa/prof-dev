
import React from 'react';
import { Subject, View } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject, view: View) => void;
  index: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onSelect, index }) => {
  return (
    <div
      className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div>
        <div className="flex items-center mb-4">
          <div className="p-3 bg-purple-500/20 rounded-lg mr-4 text-purple-400">
            {subject.icon}
          </div>
          <h3 className="text-xl font-bold text-white">{subject.name}</h3>
        </div>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed min-h-[60px]">{subject.description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
        <button
          onClick={() => onSelect(subject, View.Chat)}
          className="flex-1 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm"
        >
          Conversar com Professor
        </button>
        <button
          onClick={() => onSelect(subject, View.Practice)}
          className="flex-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300 text-sm"
        >
          Modo Praticar
        </button>
      </div>
    </div>
  );
};
