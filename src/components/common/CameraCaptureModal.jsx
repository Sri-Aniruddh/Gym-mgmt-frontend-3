import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import Modal from './Modal';

/**
 * CameraCaptureModal Component
 * Provides a live camera view with camera flipping (front/back), snapshot preview,
 * square center-cropping, and confirmation for member profile photos.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {() => void} onClose - Modal close handler
 * @param {(dataUri: string) => Promise<void> | void} onCapture - Called with the compressed base64 JPEG
 * @param {string} [title="Take Live Profile Photo"] - Custom modal title
 */
const CameraCaptureModal = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Live Profile Photo'
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('user'); // 'user' (front/selfie) or 'environment' (back)
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop active camera stream tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  // Check if device has multiple cameras (e.g. mobile front & rear)
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      })
      .catch(() => {});
  }, []);

  // Start or restart camera stream
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    setIsCameraReady(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or environment. Please use HTTPS or localhost.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => setIsCameraReady(true))
            .catch((err) => {
              console.warn('[Camera] Autoplay rejected:', err);
              setIsCameraReady(true);
            });
        };
      }
    } catch (err) {
      console.error('[Camera] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect a webcam or upload a photo instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another app. Please close other camera apps and retry.');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
    }
  }, [facingMode, stopStream]);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCameraError(null);
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Toggle front / back camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture frame from video to canvas
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video || !isCameraReady) return;

    try {
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      // Create an offscreen canvas
      const canvas = document.createElement('canvas');
      const size = Math.min(videoWidth, videoHeight);
      const targetSize = Math.min(600, size);

      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // If user facing (selfie), mirror horizontally so snapshot matches mirror preview
      if (facingMode === 'user') {
        ctx.translate(targetSize, 0);
        ctx.scale(-1, 1);
      }

      // Center crop square
      const startX = (videoWidth - size) / 2;
      const startY = (videoHeight - size) / 2;

      ctx.drawImage(video, startX, startY, size, size, 0, 0, targetSize, targetSize);

      // Export as high-quality compressed JPEG data URI
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);

      // Stop camera stream while reviewing snapshot
      stopStream();
    } catch (err) {
      console.error('[Camera] Capture error:', err);
      setCameraError('Failed to capture frame. Please try again.');
    }
  };

  // Retake photo: discard snapshot and restart camera
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm photo: pass dataUri to callback
  const handleConfirm = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      await onCapture(capturedImage);
      onClose();
    } catch (err) {
      console.error('[Camera] Confirm capture failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Main View Area */}
        <div className="relative w-full aspect-square max-w-[360px] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-rose-300 mb-1">Camera Error</p>
              <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedImage ? (
            // Captured Snapshot Preview
            <img
              src={capturedImage}
              alt="Captured profile"
              className="w-full h-full object-cover"
            />
          ) : (
            // Live Video Stream
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {!isCameraReady && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white">
                  <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
                  <span className="text-xs font-medium text-slate-300">Starting camera...</span>
                </div>
              )}

              {/* Viewfinder Circle / Overlay Guide */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/30 pointer-events-none" />

              {/* Flip camera button */}
              {(hasMultipleCameras || true) && isCameraReady && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  title="Switch Camera (Front / Back)"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full mt-5 flex items-center justify-center gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isProcessing ? 'Uploading...' : 'Use This Photo'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={!isCameraReady}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CameraCaptureModal;

