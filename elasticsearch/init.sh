#!/bin/sh

# Đợi elasticsearch sẵn sàng
until curl -s http://elasticsearch:9200 >/dev/null; do
  echo "Đợi Elasticsearch..."
  sleep 2
done

# Gọi script khởi tạo index
# node init-indexes.js
