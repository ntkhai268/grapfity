#!/bin/bash

echo "⏳ Đang chờ database DB_Graptify được khởi tạo..."

MAX_TRIES=30
i=0
while [ $i -lt $MAX_TRIES ]; do
  RESULT=$(sqlcmd -S mssql -U sa -P 'nhomnaymanhNhat1!' -Q "IF DB_ID('DB_Graptify') IS NOT NULL PRINT 'EXISTS'" -h -1 -W)
  if [[ "$RESULT" == "EXISTS" ]]; then
    echo "✅ DB_Graptify đã sẵn sàng."
    break
  fi
  echo "🔁 Chưa có DB. Đợi thêm 5 giây..."
  sleep 5
  ((i++))
done

if [ $i -eq $MAX_TRIES ]; then
  echo "❌ DB_Graptify chưa sẵn sàng sau $MAX_TRIES lần thử. Thoát."
  exit 1
fi

# 🛠 Bắt đầu build và chạy backend
echo "📦 Biên dịch source..."
npm run build-src || { echo "❌ Build thất bại"; exit 1; }

echo "🚀 Chạy backend..."
npm run build