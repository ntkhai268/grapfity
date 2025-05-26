FROM node:18

WORKDIR /app

# Copy package files trước để tận dụng layer caching
COPY package.json package-lock.json* ./  
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port mà Vite dev server sử dụng (thường là 5173)
EXPOSE 5173

# Chạy dev server với hot-reload
CMD ["npm", "run", "dev"]