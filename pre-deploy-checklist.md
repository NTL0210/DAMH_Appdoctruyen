# Pre-Deployment Checklist

Kiểm tra các mục sau trước khi deploy lên Railway:

## ✅ Code Checklist

- [ ] Tất cả dependencies đã được thêm vào `package.json`
- [ ] File `.gitignore` đã được tạo (không commit `.env`, `node_modules`)
- [ ] Script `start` trong `package.json` đã đúng: `"start": "node server.js"`
- [ ] Code sử dụng `process.env.PORT` thay vì hardcode port
- [ ] Code sử dụng `process.env.MONGODB_URI` để kết nối database
- [ ] Tất cả environment variables được đọc từ `process.env`

## ✅ Environment Variables Cần Thiết

Chuẩn bị các giá trị sau để nhập vào Railway:

### Bắt buộc:
- [ ] `PORT` = 3000
- [ ] `NODE_ENV` = production
- [ ] `MONGODB_URI` = (Railway sẽ tự động inject từ MongoDB service)
- [ ] `JWT_SECRET` = (tạo chuỗi ngẫu nhiên ít nhất 32 ký tự)

### Tùy chọn:
- [ ] `CORS_ORIGIN` = * (hoặc domain Flutter app)
- [ ] `LOG_LEVEL` = info
- [ ] `REDIS_URL` = (nếu dùng Redis)
- [ ] `GOOGLE_CLIENT_ID` = (nếu dùng Google OAuth)
- [ ] `GOOGLE_CLIENT_SECRET` = (nếu dùng Google OAuth)

## ✅ Database Checklist

- [ ] Đã tạo MongoDB service trên Railway
- [ ] Đã lấy connection string từ Railway
- [ ] Đã test kết nối MongoDB từ local (optional)

## ✅ Security Checklist

- [ ] JWT_SECRET đã được thay đổi từ giá trị mặc định
- [ ] Không commit file `.env` lên Git
- [ ] CORS được cấu hình đúng (không dùng `*` trong production nếu có thể)
- [ ] Rate limiting đã được enable
- [ ] Helmet middleware đã được enable

## ✅ Testing Checklist

- [ ] Backend chạy được trên local với `npm start`
- [ ] Health endpoint `/health` trả về 200 OK
- [ ] Comics endpoint `/comics?page=1` trả về data
- [ ] Genres endpoint `/genres` trả về data
- [ ] API docs `/api-docs` hiển thị đúng

## ✅ Git Checklist (nếu deploy từ GitHub)

- [ ] Repository đã được tạo trên GitHub
- [ ] Code đã được push lên GitHub
- [ ] Branch `main` hoặc `master` tồn tại
- [ ] File `.gitignore` đã được commit

## ✅ Post-Deployment Checklist

Sau khi deploy, kiểm tra:

- [ ] Deployment status = "Success" trên Railway
- [ ] Logs không có error nghiêm trọng
- [ ] Public domain đã được generate
- [ ] Health endpoint hoạt động: `https://your-app.railway.app/health`
- [ ] Comics endpoint hoạt động: `https://your-app.railway.app/comics?page=1`
- [ ] API docs hoạt động: `https://your-app.railway.app/api-docs`

## ✅ Flutter App Update

- [ ] Đã update `_baseUrl` trong `lib/data/services/comic_service.dart`
- [ ] Đã test Flutter app với backend mới
- [ ] API calls từ Flutter app thành công

## 🔧 Useful Commands

### Test local trước khi deploy:
```bash
cd comic-backend-api
npm install
npm start
```

### Test endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Comics
curl http://localhost:3000/comics?page=1

# Genres
curl http://localhost:3000/genres
```

### Generate JWT Secret:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 📝 Notes

- Railway free tier: $5 credit/month
- MongoDB free tier: 512MB storage
- Auto-deploy khi push code mới lên GitHub
- Logs có thể xem trong Railway dashboard
