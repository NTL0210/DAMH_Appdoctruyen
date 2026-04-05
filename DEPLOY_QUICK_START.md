# 🚀 Quick Start: Deploy lên Railway

## Bước 1: Tạo JWT Secret

```powershell
# Chạy script này để tạo JWT secret
.\generate-jwt-secret.ps1

# Hoặc dùng lệnh này:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy JWT secret để dùng ở bước 4.

## Bước 2: Đăng nhập Railway

1. Truy cập: https://railway.app
2. Đăng ký/Đăng nhập (dùng GitHub nhanh nhất)

## Bước 3: Tạo Project

1. Click "New Project"
2. Chọn "Deploy from GitHub repo" (nếu code đã ở GitHub)
   - HOẶC chọn "Empty Project" (nếu chưa có GitHub)

## Bước 4: Thêm MongoDB

1. Click "New" → "Database" → "Add MongoDB"
2. Đợi MongoDB khởi động (1-2 phút)

## Bước 5: Thêm Backend Service

### Nếu dùng GitHub:
1. Kết nối GitHub repo
2. Railway tự động deploy

### Nếu chưa có GitHub:
1. Click "New" → "Empty Service"
2. Đặt tên: "comic-backend-api"
3. Settings → Deploy → Upload folder này (nén .zip)

## Bước 6: Cấu hình Environment Variables

Click vào Backend service → Tab "Variables" → Thêm:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=<paste-jwt-secret-từ-bước-1>
CORS_ORIGIN=*
LOG_LEVEL=info
```

**Lưu ý:** Với `MONGODB_URI`, chọn "Reference" và link đến MongoDB service.

## Bước 7: Generate Domain

1. Backend service → Settings → Networking
2. Click "Generate Domain"
3. Copy domain (ví dụ: `comic-api-production.railway.app`)

## Bước 8: Test API

```bash
# Thay YOUR_DOMAIN bằng domain Railway của bạn
curl https://YOUR_DOMAIN.railway.app/health
curl https://YOUR_DOMAIN.railway.app/comics?page=1
```

Mở browser: `https://YOUR_DOMAIN.railway.app/api-docs`

## Bước 9: Update Flutter App

Mở `lib/data/services/comic_service.dart`:

```dart
class ComicService {
  static const String _baseUrl = 'https://YOUR_DOMAIN.railway.app';
  // ...
}
```

## ✅ Xong!

Backend của bạn đã chạy trên Railway! 🎉

---

## 📚 Tài liệu chi tiết

- Xem `RAILWAY_DEPLOYMENT_GUIDE.md` để biết thêm chi tiết
- Xem `pre-deploy-checklist.md` để kiểm tra trước khi deploy

## 🆘 Gặp vấn đề?

1. Xem logs trong Railway: Service → Deployments → Click deployment → View logs
2. Kiểm tra environment variables đã đúng chưa
3. Đảm bảo MongoDB service đang chạy
4. Xem troubleshooting trong `RAILWAY_DEPLOYMENT_GUIDE.md`

## 💰 Chi phí

- Free tier: $5 credit/tháng
- Đủ cho development và testing
- Upgrade nếu cần: $5/month (Hobby plan)
