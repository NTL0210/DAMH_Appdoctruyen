# ✅ MongoDB Đã Sẵn Sàng! - Các Bước Tiếp Theo

## 🎉 Hoàn Thành: Database Setup

MongoDB của anh đã được tạo thành công trên Railway!
- Connection: `mongodb://mongo:qtmOFRezjmcRSbrfFjPzZEGAreqvYoYN@mongodb.railway.internal:27017`
- Status: Active ✅

---

## 📝 Bước Tiếp Theo: Deploy Backend Service

### Option 1: Deploy từ GitHub (Khuyến nghị - Tự động)

#### Bước 1: Push code lên GitHub

```bash
# Mở terminal trong thư mục comic-backend-api
cd comic-backend-api

# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit for Railway deployment"

# Tạo repo trên GitHub và push
# Truy cập: https://github.com/new
# Tạo repo mới (ví dụ: comic-backend-api)
# Sau đó:
git remote add origin https://github.com/YOUR_USERNAME/comic-backend-api.git
git branch -M main
git push -u origin main
```

#### Bước 2: Deploy trên Railway

1. Quay lại Railway dashboard
2. Click "New" → "GitHub Repo"
3. Chọn repository `comic-backend-api` vừa tạo
4. Railway sẽ tự động:
   - Detect Node.js project
   - Chạy `npm install`
   - Chạy `npm start`
   - Deploy backend

#### Bước 3: Cấu hình Environment Variables

1. Click vào Backend service vừa tạo
2. Chọn tab "Variables"
3. Thêm từng biến sau:

**Cách thêm biến:**
- Click "New Variable"
- Nhập tên và giá trị
- Click "Add"

**Các biến cần thêm:**

```
PORT = 3000
```

```
NODE_ENV = production
```

```
JWT_SECRET = 44a8af24e95b89c677cbfb46aa753b3bdb9e1271195f14997977217e33daf921
```

```
CORS_ORIGIN = *
```

```
LOG_LEVEL = info
```

**Biến đặc biệt - MONGODB_URI (dùng Reference):**
1. Click "New Variable"
2. Tên: `MONGODB_URI`
3. Chọn "Reference" (không phải "Text")
4. Chọn MongoDB service → `MONGO_URL`
5. Railway sẽ tự động inject connection string

#### Bước 4: Generate Public Domain

1. Trong Backend service, chọn "Settings"
2. Scroll xuống "Networking"
3. Click "Generate Domain"
4. Railway sẽ tạo domain dạng: `comic-backend-api-production.railway.app`
5. Copy domain này!

#### Bước 5: Test Backend

```bash
# Thay YOUR_DOMAIN bằng domain Railway của bạn
curl https://YOUR_DOMAIN.railway.app/health

# Nếu thành công, sẽ trả về:
# {"success":true,"status":"healthy","timestamp":"...","uptime":...}
```

Mở browser test:
- Health: `https://YOUR_DOMAIN.railway.app/health`
- API Docs: `https://YOUR_DOMAIN.railway.app/api-docs`
- Comics: `https://YOUR_DOMAIN.railway.app/comics?page=1`

---

### Option 2: Deploy bằng Railway CLI (Nhanh hơn)

#### Bước 1: Cài Railway CLI

```powershell
# Windows PowerShell
npm install -g @railway/cli
```

#### Bước 2: Login và Deploy

```bash
cd comic-backend-api

# Login Railway
railway login

# Link với project hiện tại
railway link

# Deploy
railway up

# Thêm environment variables
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=44a8af24e95b89c677cbfb46aa753b3bdb9e1271195f14997977217e33daf921
railway variables set CORS_ORIGIN=*
railway variables set LOG_LEVEL=info

# Link MongoDB (Railway sẽ tự động inject MONGO_URL)
# Cần làm thủ công trên web UI
```

---

### Option 3: Upload trực tiếp (Không cần Git)

#### Bước 1: Nén folder

1. Vào thư mục `comic-backend-api`
2. Chọn tất cả files (KHÔNG chọn folder `node_modules` nếu có)
3. Click chuột phải → "Compress to ZIP"
4. Đặt tên: `comic-backend-api.zip`

#### Bước 2: Upload lên Railway

1. Trong Railway, click "New" → "Empty Service"
2. Đặt tên: "comic-backend-api"
3. Click vào service
4. Chọn "Settings" → "Deploy"
5. Upload file `comic-backend-api.zip`
6. Railway sẽ tự động deploy

#### Bước 3: Cấu hình Variables (giống Option 1 Bước 3)

---

## 🔍 Kiểm Tra Deployment

### Xem Logs

1. Click vào Backend service
2. Chọn tab "Deployments"
3. Click vào deployment mới nhất
4. Xem logs để kiểm tra:
   - ✅ `npm install` thành công
   - ✅ `npm start` chạy
   - ✅ "Server started successfully"
   - ✅ "MongoDB connected"

### Các lỗi thường gặp:

**Lỗi: "Cannot connect to MongoDB"**
- Kiểm tra biến `MONGODB_URI` đã được set chưa
- Đảm bảo dùng "Reference" link đến MongoDB service

**Lỗi: "Missing required environment variables"**
- Kiểm tra tất cả biến đã được thêm: PORT, NODE_ENV, MONGODB_URI, JWT_SECRET

**Lỗi: "Module not found"**
- Railway sẽ tự động chạy `npm install`
- Kiểm tra `package.json` có đầy đủ dependencies

---

## 📱 Bước Cuối: Update Flutter App

### Sau khi backend deploy thành công:

1. Copy Railway domain (ví dụ: `comic-backend-api-production.railway.app`)

2. Mở file: `lib/data/services/comic_service.dart`

3. Thay đổi:
```dart
class ComicService {
  // Thay đổi từ:
  static const String _baseUrl = 'http://localhost:3000';
  
  // Thành:
  static const String _baseUrl = 'https://comic-backend-api-production.railway.app';
  
  // ... rest of code
}
```

4. Save file và test Flutter app!

---

## 🎯 Checklist Hoàn Thành

- [x] MongoDB đã được tạo trên Railway
- [ ] Backend service đã được deploy
- [ ] Environment variables đã được cấu hình
- [ ] Public domain đã được generate
- [ ] Backend health check trả về 200 OK
- [ ] Comics API trả về data
- [ ] Flutter app đã được update với URL mới
- [ ] Flutter app kết nối thành công với backend

---

## 💡 Tips

- **Auto-deploy**: Nếu dùng GitHub, mỗi khi push code mới, Railway tự động deploy
- **Logs**: Luôn xem logs để debug nếu có lỗi
- **Free tier**: $5 credit/tháng, đủ cho development
- **Monitoring**: Xem Metrics tab để theo dõi CPU, Memory usage

---

## 🆘 Cần Giúp?

- Xem logs trong Railway dashboard
- Check `RAILWAY_DEPLOYMENT_GUIDE.md` để biết chi tiết
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

## 🚀 Sẵn Sàng Deploy?

Chọn một trong 3 options ở trên và bắt đầu! 

**Khuyến nghị**: Option 1 (GitHub) - tự động và dễ maintain nhất.
