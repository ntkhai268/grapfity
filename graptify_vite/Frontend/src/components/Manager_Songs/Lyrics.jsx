import React, { useState } from "react";


const Lyrics = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lyrics">
      <h3>Lời bài hát</h3>
      <p>Như giọt sương còn vương bàn tay, giọt lệ nào lăn dài</p>
      <p>Bình minh lên hoàng hôn buông ngày vừa xuống, ngoài kia mưa rơi...</p>
      <p>Khi em đi mang theo mùa hạ, rồi mùa đông vội anh cô đơn thành lỗi và</p>
      <p>Nhìn em lớn từ cô bé giờ thiếu nữ, tự hào biết mấy</p>
      
      {expanded && (
        <>
          <p>Mong bình yên sẽ đến cùng bầu trời đã có nhau</p>
          <p>Dù chỉ là một giấc mơ, tơ duyên tình ta chắc lỡ làng</p>
          <p>Lạnh lùng ôm bằng giá, chuyện gì buồn cũng chóng qua</p>
          <p>Tựa đầu nhìn một đóa hoa</p>
        </>
      )}

      <p className="see-more" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Thu gọn" : "...Xem thêm"}
      </p>
    </div>
  );
};

export default Lyrics;
