import { useEffect, useState } from 'react';

export default function usePhotoPreview(file, initialUrl = null) {
    const [preview, setPreview] = useState(initialUrl);
    useEffect(() => {
        if (!file) {
            setPreview(initialUrl);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file, initialUrl]);
    return preview;
}
