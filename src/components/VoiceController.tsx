import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { parseVoiceCommand, ParsedVoiceAction } from '../data/voiceGrammar';

interface VoiceControllerProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onExecuteCommand: (action: ParsedVoiceAction) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  isListening,
  setIsListening,
  onExecuteCommand
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [simulatedInput, setSimulatedInput] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // If final result
      if (event.results[event.results.length - 1].isFinal) {
        handleTrigger(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          // already started or stopped
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // already active
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // already stopped
      }
    }
  }, [isListening]);

  const handleTrigger = (spoken: string) => {
    if (!spoken.trim()) return;
    const action = parseVoiceCommand(spoken);
    setLastActionMessage(action.humanDescription);
    onExecuteCommand(action);
    setTranscript('');
    setTimeout(() => {
      setLastActionMessage(null);
    }, 4500);
  };

  const handleQuickSimulator = (cmd: string) => {
    setTranscript(cmd);
    handleTrigger(cmd);
  };

  return (
    <div className="w-full bg-[#161513] border-b border-[#2a2723] px-4 sm:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Voice Status & Soundwave Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`p-2 rounded-full ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-neutral-800 text-neutral-400'}`}>
            {isListening ? <Volume2 className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Voice Trigger System</span>
              {isListening && (
                <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Listening... Speak now
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              {transcript ? `"${transcript}"` : lastActionMessage || 'Try speaking or clicking sample commands below'}
            </p>
          </div>
        </div>

        {/* Right: Quick Recruiter Voice Command Pills */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end text-xs">
          <span className="text-[11px] text-neutral-500 mr-1 hidden lg:inline">Quick Commands:</span>
          <button
            onClick={() => handleQuickSimulator('Switch to Client')}
            className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
          >
            "Switch to Client"
          </button>
          <button
            onClick={() => handleQuickSimulator('Go to Kitchen')}
            className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
          >
            "Go to Kitchen"
          </button>
          <button
            onClick={() => handleQuickSimulator('Generate Japandi spec')}
            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
          >
            "Generate Japandi spec"
          </button>
          <button
            onClick={() => handleQuickSimulator('Add Italian Marble')}
            className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
          >
            "Add Italian Marble"
          </button>
          <button
            onClick={() => handleQuickSimulator('Export BOQ')}
            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            "Export BOQ"
          </button>
        </div>
      </div>

      {/* Action Toast when a command executes */}
      {lastActionMessage && (
        <div className="mt-2 py-1.5 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Voice Action Dispatched:</strong> {lastActionMessage}</span>
        </div>
      )}
    </div>
  );
};
