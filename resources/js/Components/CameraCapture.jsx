import { useEffect, useId, useRef, useState } from 'react';

function cameraError(error) {
    if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(error?.name)) {
        return 'Camera permission was denied. Allow camera access in your browser settings, then retry. You can also upload a photo.';
    }
    if (['NotFoundError', 'DevicesNotFoundError', 'OverconstrainedError'].includes(error?.name)) {
        return 'No available camera was found. Connect a camera or upload a photo instead.';
    }
    if (['NotReadableError', 'TrackStartError'].includes(error?.name)) {
        return 'The camera is unavailable or being used by another app. Close that app and retry, or upload a photo.';
    }
    return 'Unable to start the camera. Check your browser permissions or upload a photo instead.';
}

/** Mount only while open. Own the stream independently of the video element's lifetime. */
export default function CameraCapture({ onCapture, onClose, title = 'Capture profile photo' }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    const videoRef = useRef(null);
    const mountedRef = useRef(false);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        mountedRef.current = true;
        const previousFocus = document.activeElement;
        dialogRef.current?.focus();
        const keydown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeRef.current();
            }
            if (event.key !== 'Tab') return;
            const controls = [...(dialogRef.current?.querySelectorAll('button:not([disabled])') ?? [])];
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener('keydown', keydown);
        return () => {
            mountedRef.current = false;
            document.removeEventListener('keydown', keydown);
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        let stream = null;
        const video = videoRef.current;
        setReady(false);
        setError('');

        async function start() {
            if (window.isSecureContext === false) {
                setError('Camera access requires HTTPS (or localhost). Open this site using HTTPS, or upload a photo instead.');
                return;
            }
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('This browser does not support camera access. Use a supported browser or upload a photo instead.');
                return;
            }
            try {
                const acquired = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
                });
                if (cancelled) {
                    acquired.getTracks().forEach((track) => track.stop());
                    return;
                }
                stream = acquired;
                video.srcObject = acquired;
                await video.play();
                if (!cancelled && video.videoWidth > 0 && video.videoHeight > 0) setReady(true);
            } catch (failure) {
                stream?.getTracks().forEach((track) => track.stop());
                stream = null;
                if (!cancelled) {
                    video.srcObject = null;
                    setError(cameraError(failure));
                }
            }
        }
        start();
        return () => {
            cancelled = true;
            stream?.getTracks().forEach((track) => track.stop());
            video.srcObject = null;
        };
    }, [attempt]);

    const capture = () => {
        const video = videoRef.current;
        if (capturing || !ready || !video?.videoWidth || !video?.videoHeight) return;
        setCapturing(true);
        setError('');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas unavailable');
            const side = Math.min(video.videoWidth, video.videoHeight);
            // Match the mirrored, square live preview without stretching the portrait.
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, (video.videoWidth - side) / 2, (video.videoHeight - side) / 2,
                side, side, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (!mountedRef.current) return;
                setCapturing(false);
                if (!blob) {
                    setError('The photo could not be captured. Please retry or upload a photo.');
                    return;
                }
                onCapture(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
                onClose();
            }, 'image/jpeg', 0.9);
        } catch {
            setCapturing(false);
            setError('The photo could not be captured. Wait for the preview, then retry or upload a photo.');
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl outline-none">
                <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <h2 id={titleId} className="text-base font-bold text-slate-900">{title}</h2>
                    <button type="button" aria-label="Close camera" onClick={onClose}
                        className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">✕</button>
                </header>
                <div className="bg-slate-900 p-5">
                    <video ref={videoRef} autoPlay playsInline muted aria-label="Camera preview"
                        className="aspect-square w-full rounded-xl bg-black object-cover" style={{ transform: 'scaleX(-1)' }}
                        onLoadedData={() => setReady(Boolean(videoRef.current?.videoWidth && videoRef.current?.videoHeight))} />
                </div>
                <div className="space-y-4 px-5 py-4">
                    {error ? <p role="alert" className="text-sm text-rose-700">{error}</p>
                        : <p role="status" className="text-sm text-slate-600">{ready ? 'Position your face in the preview, then capture.' : 'Waiting for camera permission and preview…'}</p>}
                    <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancel</button>
                        {error && <button type="button" onClick={() => setAttempt((value) => value + 1)}
                            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-700">Retry camera</button>}
                        <button type="button" onClick={capture} disabled={!ready || capturing}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                            {capturing ? 'Capturing…' : 'Capture photo'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
