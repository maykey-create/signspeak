import React, { useEffect } from 'react';
import { useCamera } from '../contexts/CameraContext';
import { Camera, CameraOff, Loader2, AlertCircle } from 'lucide-react';

const CameraView: React.FC = () => {
  const { isActive, videoRef, error, startCamera, stopCamera, isLoading } = useCamera();

  useEffect(() => {
    return () => {
      if (isActive) {
        stopCamera();
      }
    };
  }, [isActive, stopCamera]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Camera Feed</h2>
          <div className="flex items-center space-x-2">
            {isActive && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            )}
            <button
              onClick={isActive ? stopCamera : startCamera}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isActive ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2 inline" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2 inline" />
                  Start Camera
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative aspect-video bg-slate-100">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Camera Access Error</p>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {isActive && (
              <div className="absolute inset-0">
                {/* Hand tracking overlay */}
                <div className="absolute top-4 left-4">
                  <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>ASL Recognition Active</span>
                    </div>
                  </div>
                </div>
                
                {/* Lip reading overlay */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Lip Reading Active</span>
                    </div>
                  </div>
                </div>
                
                {/* Processing indicator */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-purple-500/80 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">Camera Not Active</p>
              <p className="text-sm text-slate-500">Click "Start Camera" to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;