import { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color'; // ✅ Fix đúng cách

function useImageColor(imageUrl: string | null): string {
  const [backgroundColor, setBackgroundColor] = useState<string>('#222');

  useEffect(() => {
    if (imageUrl) {
      const fac = new FastAverageColor();
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        fac.getColorAsync(img)
          .then(color => setBackgroundColor(color.rgb))
          .catch(err => console.error("Lỗi lấy màu từ ảnh:", err));
      };

      img.onerror = () => {
        console.error("Lỗi tải ảnh:", imageUrl);
      };

      img.src = imageUrl;
    } else {
      setBackgroundColor('#222');
    }
  }, [imageUrl]);

  return backgroundColor;
}

export default useImageColor;
