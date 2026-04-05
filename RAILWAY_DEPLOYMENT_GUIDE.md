# Hướng Dẫn Deploy Backend lên Railway

## Bước 1: Chuẩn Bị

### 1.1. Tạo tài khoản Railway
1. Truy cập https://railway.app
2. Đăng ký tài khoản (có thể dùng GitHub để đăng nhập nhanh)
3. Xác nhận email

### 1.2. Cài đặt Railway CLI (Tùy chọn)
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Hoặc dùng npm
npm install -g @railway/cli
```

## Bước 2: Tạo Project trên Railway

### 2.1. Tạo Project mới
1. Đăng nhập vào Railway: https://railway.app
2. Click "New Project"
3. Chọn "Deploy from GitHub repo" (khuyến nghị) hoặc "Empty Project"

### 2.2. Nếu chọn GitHub:
1. Kết nối GitHub account của bạn
2. Chọn repository chứa code backend
3. Railway sẽ tự động detect và deploy

### 2.3. Nếu chọn Empty Project:
1. Click "New" → "Empty Service"
2. Đặt tên service (ví dụ: "comic-backend-api")

## Bước 3: Thêm MongoDB Database

### 3.1. Thêm MongoDB vào Project
1. Trong project Railway, click "New" → "Database" → "Add MongoDB"
2. Railway sẽ tự động tạo MongoDB instance
3. Sau khi tạo xong, click vào MongoDB service
4. Vào tab "Variables" để xem connection string

### 3.2. Lấy MongoDB Connection String
Railway sẽ tự động tạo các biến:
- `MONGO_URL` hoặc `MONGODB_URI`: Connection string đầy đủ
- Format: `mongodb://mongo:PASSWORD@HOST:PORT`

## Bước 4: Cấu Hình Environment Variables

### 4.1. Vào Backend Service
1. Click vào service backend của bạn
2. Chọn tab "Variables"

### 4.2. Thêm các biến môi trường sau:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database - Railway sẽ tự động inject MONGO_URL
# Nhưng backend của bạn dùng MONGODB_URI, nên cần thêm:
MONGODB_URI=${{MongoDB.MONGO_URL}}

# JWT Secret - TẠO MỚI, KHÔNG DÙNG GIÁ TRỊ MẶC ĐỊNH!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# CORS - Thêm domain Flutter app của bạn sau
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info

# Redis (Optional - có thể bỏ qua hoặc thêm Redis service)
# REDIS_URL=redis://...

# Google OAuth (Optional - nếu muốn dùng)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=https://your-railway-domain.railway.app/auth/google/callback
```

### 4.3. Cách thêm biến:
- Click "New Variable"
- Nhập tên biến (ví dụ: `JWT_SECRET`)
- Nhập giá trị
- Click "Add"

### 4.4. Liên kết MongoDB với Backend:
Railway có tính năng "Reference Variables":
1. Khi thêm biến `MONGODB_URI`
2. Chọn "Reference" thay vì "Text"
3. Chọn MongoDB service → `MONGO_URL`
4. Railway sẽ tự động inject connection string

## Bước 5: Deploy Code

### Phương án A: Deploy từ GitHub (Khuyến nghị)

#### 5.1. Push code lên GitHub
```bash
cd comic-backend-api

# Khởi tạo git nếu chưa có
git init

# Thêm remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Commit và push
git add .
git commit -m "Initial commit for Railway deployment"
git push -u origin main
```

#### 5.2. Kết nối với Railway
1. Trong Railway service, click "Settings"
2. Chọn "Connect Repo"
3. Chọn repository của bạn
4. Railway sẽ tự động deploy khi có commit mới

### Phương án B: Deploy bằng Railway CLI

```bash
cd comic-backend-api

# Đăng nhập Railway CLI
railway login

# Link với project
railway link

# Deploy
railway up
```

### Phương án C: Deploy trực tiếp (không dùng Git)

1. Trong Railway service, chọn "Settings"
2. Chọn "Deploy"
3. Upload folder `comic-backend-api` (nén thành .zip)

## Bước 6: Kiểm Tra Deployment

### 6.1. Xem Logs
1. Trong Railway service, chọn tab "Deployments"
2. Click vào deployment mới nhất
3. Xem logs để kiểm tra lỗi

### 6.2. Lấy Public URL
1. Trong service, chọn tab "Settings"
2. Scroll xuống "Networking"
3. Click "Generate Domain"
4. Railway sẽ tạo domain dạng: `your-app.railway.app`

### 6.3. Test API
```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test comics endpoint
curl https://your-app.railway.app/comics?page=1

# Test API docs
# Mở browser: https://your-app.railway.app/api-docs
```

## Bước 7: Cập Nhật Flutter App

### 7.1. Update API URL trong Flutter
Mở file `lib/data/services/comic_service.dart`:

```dart
class ComicService {
  // Thay đổi từ localhost sang Railway domain
  static const String _baseUrl = 'https://your-app.railway.app';
  
  // ... rest of code
}
```

### 7.2. Update CORS trong Backend (nếu cần)
Nếu Flutter app của bạn chạy trên domain cụ thể, update biến `CORS_ORIGIN` trong Railway:
```
CORS_ORIGIN=https://your-flutter-app-domain.com
```

## Bước 8: Seed Database (Tùy chọn)

Nếu cần thêm dữ liệu mẫu vào MongoDB:

### 8.1. Kết nối MongoDB từ máy local
```bash
# Lấy MONGO_URL từ Railway Variables
# Ví dụ: mongodb://mongo:PASSWORD@HOST:PORT

# Dùng MongoDB Compass hoặc mongosh
mongosh "mongodb://mongo:PASSWORD@HOST:PORT"
```

### 8.2. Import dữ liệu
```bash
# Nếu có file JSON
mongoimport --uri="mongodb://mongo:PASSWORD@HOST:PORT/comic-web-platform" --collection=comics --file=comics.json --jsonArray
```

## Troubleshooting

### Lỗi: "Cannot connect to MongoDB"
- Kiểm tra biến `MONGODB_URI` đã được set đúng chưa
- Kiểm tra MongoDB service đang chạy
- Xem logs của MongoDB service

### Lỗi: "Port already in use"
- Railway tự động assign port, không cần lo
- Đảm bảo code dùng `process.env.PORT`

### Lỗi: "Module not found"
- Kiểm tra `package.json` có đầy đủ dependencies
- Railway sẽ tự động chạy `npm install`

### Lỗi CORS
- Update biến `CORS_ORIGIN` với domain Flutter app
- Hoặc tạm thời dùng `*` để test

### App crash sau khi deploy
- Xem logs trong Railway
- Kiểm tra tất cả environment variables đã được set
- Đảm bảo `JWT_SECRET` có ít nhất 32 ký tự

## Chi Phí

Railway có gói miễn phí với:
- $5 credit mỗi tháng
- Đủ cho development và testing
- Nếu cần nhiều hơn, có thể upgrade lên Hobby plan ($5/month)

## Monitoring

### Xem Metrics
1. Trong service, chọn tab "Metrics"
2. Xem CPU, Memory, Network usage

### Setup Alerts (Optional)
1. Settings → Notifications
2. Thêm webhook hoặc email để nhận thông báo khi có lỗi

## Auto-Deploy

Nếu dùng GitHub:
- Mỗi khi push code mới lên GitHub
- Railway sẽ tự động build và deploy
- Không cần làm gì thêm!

## Backup Database

### Tạo backup MongoDB
```bash
# Dùng mongodump
mongodump --uri="mongodb://mongo:PASSWORD@HOST:PORT/comic-web-platform" --out=./backup

# Restore
mongorestore --uri="mongodb://mongo:PASSWORD@HOST:PORT/comic-web-platform" ./backup/comic-web-platform
```

## Tóm Tắt Các Bước

1. ✅ Tạo tài khoản Railway
2. ✅ Tạo project mới
3. ✅ Thêm MongoDB service
4. ✅ Thêm Backend service
5. ✅ Cấu hình environment variables
6. ✅ Deploy code (GitHub/CLI/Upload)
7. ✅ Generate public domain
8. ✅ Test API endpoints
9. ✅ Update Flutter app với URL mới
10. ✅ Deploy và enjoy! 🎉

## Liên Hệ Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
