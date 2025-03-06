import { useState, useEffect } from "react";

export function useLocalImage(image: File) {
    const [url, setUrl] = useState<string>("");
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const objectUrl = URL.createObjectURL(image);
        setUrl(objectUrl);

        const img = new Image();
        img.onload = () => {
            setDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };
        img.src = objectUrl;

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [image]);

    return { url, dimensions };
}
