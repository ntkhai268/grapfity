// src/services/songAPI.ts
import bacphanImg from "../assets/images/bacphan.jpg";
import banhmikhongImg from "../assets/images/banhmikhong.jpg";
import anhmauImg from "../assets/images/anhmau.png";

import bacphanAudio from "../assets/audio/BacPhanRapVersion-TuiHat-6184759.mp3";
import banhmikhongAudio from "../assets/audio/Bánh Mì Không.mp3";
import codangdeyeuthuongAudio from "../assets/audio/CoDangDeYeuThuong-DucAnhDuUyen-35764062.mp3";

export const fetchSongs = async () => {
  const songs = [
    {
      title: "Bạc phận",
      artist: "Jack",
      image: bacphanImg,
      audio: bacphanAudio,
    },
    {
      title: "Bánh mì không",
      artist: "Đạt G",
      image: banhmikhongImg,
      audio: banhmikhongAudio,
    },
    {
      title: "Có đáng để yêu thương",
      artist: "Du Uyên",
      image: anhmauImg,
      audio: codangdeyeuthuongAudio,
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(songs), 300);
  });
};
