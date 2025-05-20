import React, { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import TextInput from './TextInput';
import AudioVisualizer from './AudioVisualizer';
import { Play, Pause, SkipBack, RotateCcw } from 'lucide-react';

const DemoSection = () => {
  const [aiActive, setAiActive] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

useEffect(() => {
  const handleSwitchToText = () => {
    setShowTextInput(true);
    resetDemo();
  };
  const handleSwitchToVoice = () => {
    setShowTextInput(false);
    resetDemo();
  };

  window.addEventListener('switchToTextInput', handleSwitchToText);
  window.addEventListener('switchToVoiceInput', handleSwitchToVoice);

  return () => {
    window.removeEventListener('switchToTextInput', handleSwitchToText);
    window.removeEventListener('switchToVoiceInput', handleSwitchToVoice);
  };
}, []);

  const handleRecordingComplete = (recording: Blob) => {
    setUserTranscript("This is what I understood from your voice input. In a real implementation, this would be the actual transcription of your speech.");
    setTimeout(() => {
      setAiActive(true);
      setAiResponse("This is a simulated response from the Tulu language AI. In a real application, this would be the transcribed and processed audio response from your model.");
      setIsPlaying(true);
      // Restrict animation bubble to 5 seconds
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    }, 1500);
  };

  const handleSendMessage = (message: string) => {
    setUserTranscript(message);
    setTimeout(() => {
      setAiActive(true);
      setAiResponse(`This is a simulated response to your message: "${message}". In a real application, this would be the AI-generated response.`);
      setIsPlaying(true);
      // Restrict animation bubble to 5 seconds
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    }, 1000);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const replayResponse = () => {
    setIsPlaying(false); // Stop animation bubble before replay
    setIsReplaying(true);
    // Simulate replay duration
    setTimeout(() => {
      setIsReplaying(false);
      setIsPlaying(true); // Resume animation bubble after replay
      // Restrict animation bubble to 5 seconds after replay
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    }, 2000);
  };

  const resetDemo = () => {
    setAiActive(false);
    setAiResponse(null);
    setIsPlaying(false);
    setUserTranscript(null);
    setIsReplaying(false);
  };

  const toggleInputMode = () => {
    setShowTextInput(!showTextInput);
    resetDemo();
  };

  return (
    <section id="demo" className="py-16 md:py-24 bg-cream-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Try It Yourself</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Experience our Tulu language AI model in action. You can either speak directly to the AI 
              or use the text input for a text-to-text conversation.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex justify-end mb-4">
              <button 
                onClick={toggleInputMode}
                className="text-sm text-light-red-500 hover:text-light-red-600 transition-colors underline"
              >
                {showTextInput ? 'Switch to Voice Input' : 'Switch to Text Input'}
              </button>
            </div>
            
            {showTextInput ? (
              <TextInput onSendMessage={handleSendMessage} />
            ) : (
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            )}

            {userTranscript && (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-gray-400 text-sm">Your Input</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="bg-cream-50 rounded-lg p-4">
                  <p className="text-gray-700">{userTranscript}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-gray-400 text-sm">AI Response</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <div className="flex items-center gap-8 mb-6">
              <div className="flex-1">
                {aiActive ? (
                  <div className="flex flex-col">
                    <div className="bg-cream-100 rounded-lg p-4 mb-3">
                      <p className="text-gray-700">{aiResponse}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-8 h-8 bg-cream-200 hover:bg-cream-300 rounded-full flex items-center justify-center transition-colors"
                        onClick={resetDemo}
                      >
                        <SkipBack className="h-4 w-4 text-gray-700" />
                      </button>
                      
                      <button 
                        className="w-10 h-10 bg-light-red-500 hover:bg-light-red-600 rounded-full flex items-center justify-center transition-colors"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </button>

                      <button 
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isReplaying 
                            ? 'bg-light-red-200 text-light-red-500'
                            : 'bg-cream-200 hover:bg-cream-300 text-gray-700'
                        }`}
                        onClick={replayResponse}
                        disabled={isReplaying}
                      >
                        <RotateCcw className={`h-4 w-4 ${isReplaying ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-cream-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-400">
                      {showTextInput ? 'Send a message to see the AI response' : 'Record your voice to see the AI response'}
                    </p>
                  </div>
                )}
              </div>

              <AudioVisualizer isActive={aiActive} isPaused={!isPlaying || isReplaying} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;