const BASE62_CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Mã hóa số nguyên, thêm prefix để tạo chuỗi "đẹp" hơn
export function encodeBase62WithPrefix(num: number, totalLength = 22): string {
  let encoded = "";
  const base = BASE62_CHARSET.length;

  if (num === 0) {
    encoded = BASE62_CHARSET[0];
  } else {
    while (num > 0) {
      encoded = BASE62_CHARSET[num % base] + encoded;
      num = Math.floor(num / base);
    }
  }

  // Tạo prefix "ngẫu nhiên" (dùng số hoặc ký tự tĩnh cũng được)
  const prefixLength = totalLength - encoded.length;
  const prefix = Array.from({ length: prefixLength }, () =>
    BASE62_CHARSET[Math.floor(Math.random() * base)]
  ).join('');

  return prefix + encoded;
}

// Giải mã số nguyên gốc (bỏ prefix)
export function decodeBase62WithPrefix(str: string): number {
  // Giả định phần số gốc là đoạn cuối dài nhất có thể giải mã được (tối đa 10 ký tự)
  const tail = str.slice(-10); // lấy tối đa 10 ký tự cuối
  return decodeBase62(tail);
}

// Hàm gốc giữ nguyên
export function decodeBase62(str: string): number {
  return [...str].reduce((acc, char) => {
    return acc * 62 + BASE62_CHARSET.indexOf(char);
  }, 0);
}