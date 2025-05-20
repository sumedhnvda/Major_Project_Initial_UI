import React, { useState } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (recording: Blob) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const id = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setTimerId(id as unknown as number);

    // In a real implementation, you would start actual audio recording here
    // For now, this is just a UI demonstration
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Clear timer
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    // In a real implementation, you would stop the recording and get the audio blob
    // For demonstration, we're creating a mock blob
    const mockAudioBlob = new Blob([], { type: 'audio/webm' });
    onRecordingComplete(mockAudioBlob);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-cream-50 rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-700 font-medium">Record your voice</h3>
        <span className="text-light-red-500 font-mono">
          {formatTime(recordingTime)}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        {isRecording ? (
          <>
            <button 
              className="w-12 h-12 bg-light-red-100 hover:bg-light-red-200 rounded-full flex items-center justify-center transition-colors"
              onClick={resetRecording}
            >
              <RotateCcw className="h-5 w-5 text-light-red-500" />
            </button>
            
            <button 
              className="w-14 h-14 bg-light-red-500 hover:bg-light-red-600 rounded-full flex items-center justify-center transition-colors"
              onClick={stopRecording}
            >
              <Square className="h-5 w-5 text-white" fill="white" />
            </button>
          </>
        ) : (
          <button 
            className="w-14 h-14 bg-light-red-500 hover:bg-light-red-600 rounded-full flex items-center justify-center transition-colors"
            onClick={startRecording}
          >
            <Mic className="h-6 w-6 text-white" />
          </button>
        )}
      </div>
      
      {isRecording && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="w-1.5 bg-light-red-400 rounded-full animate-sound-wave" 
                style={{ 
                  height: '16px',
                  animationDelay: `${i * 0.15}s` 
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;