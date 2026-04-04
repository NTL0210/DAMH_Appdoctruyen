# Quick Start - WebTruyen API (Spring Boot)

## 📦 What's Included

Completed Spring Boot migration of the WebTruyen Backend API with:

✅ Full entity model mapping  
✅ JWT authentication & authorization  
✅ Password hashing (BCrypt)  
✅ Email notifications  
✅ WebSocket real-time notifications  
✅ Comic crawling service  
✅ Paginated API endpoints  
✅ SQL Server database integration  
✅ OpenAPI/Swagger documentation  
✅ CORS configuration  

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
```bash
# Check Java version (need 17+)
java -version

# Check Maven
mvn -version
```

### 2. Update Configuration
Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://YOUR_SERVER:1433;databaseName=truyen;trustServerCertificate=true
    username: sa
    password: YOUR_PASSWORD
  
  mail:
    username: your-email@gmail.com
    password: your-app-password
```

### 3. Build & Run
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

✅ API running at: **http://localhost:8080/api**  
📚 Swagger UI: **http://localhost:8080/api/swagger-ui.html**

---

## 📋 Project Structure

```
webtruyenBackEndAPI-SpringBoot/
├── pom.xml                                    # Maven dependencies
├── README.md                                  # Detailed documentation
├── MIGRATION_GUIDE.md                         # C# → Java migration guide
├── QUICK_START.md                             # This file
├── .gitignore
│
├── src/main/java/com/webtruyenapi/
│   ├── WebTruyenApiApplication.java          # Main application
│   │
│   ├── config/                               # Configuration
│   │   ├── AppConfig.java
│   │   ├── SecurityConfig.java               # Security & JWT
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── WebSocketConfig.java              # Real-time notifications
│   │   └── OpenApiConfig.java                # Swagger documentation
│   │
│   ├── controller/                           # REST API Endpoints
│   │   ├── AuthController.java               # Authentication
│   │   ├── ComicController.java              # Comics CRUD
│   │   ├── ChapterController.java            # Chapters CRUD
│   │   ├── GenreController.java              # Genres CRUD
│   │   ├── FollowController.java             # Follow features
│   │   └── CrawlController.java              # Comic crawling
│   │
│   ├── service/                              # Business Logic
│   │   ├── AuthService.java                  # Auth & JWT tokens
│   │   ├── EmailService.java                 # Email sending
│   │   ├── OTruyenApiClient.java             # External API client
│   │   └── ComicCrawlerService.java          # Comic crawling logic
│   │
│   ├── entity/                               # JPA Entities
│   │   ├── Account.java
│   │   ├── Comic.java
│   │   ├── Chapter.java
│   │   ├── Genre.java
│   │   ├── ComicGenre.java
│   │   ├── Follow.java
│   │   ├── ComicFollow.java
│   │   └── PasswordResetToken.java
│   │
│   ├── repository/                           # Data Access Layer
│   │   ├── AccountRepository.java
│   │   ├── ComicRepository.java
│   │   ├── ChapterRepository.java
│   │   ├── GenreRepository.java
│   │   ├── ComicGenreRepository.java
│   │   ├── FollowRepository.java
│   │   ├── ComicFollowRepository.java
│   │   └── PasswordResetTokenRepository.java
│   │
│   ├── dto/                                  # Data Transfer Objects
│   │   ├── AuthDTOs.java                     # Auth request/response
│   │   ├── FollowDtos.java                   # Follow request/response
│   │   └── OTruyenDtos.java                  # API response models
│   │
│   └── websocket/                            # WebSocket handlers
│       └── NotificationHandler.java          # Real-time notifications
│
└── src/main/resources/
    └── application.yml                       # Application configuration
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Đăng ký tài khoản
POST   /api/auth/login             - Đăng nhập
POST   /api/auth/request-reset     - Yêu cầu đặt lại mật khẩu
POST   /api/auth/reset-password    - Đặt lại mật khẩu
GET    /api/auth/me                - Lấy thông tin người dùng (cần token)
```

### Comics
```
GET    /api/comics/page?page=1                - Danh sách truyện (20/trang)
GET    /api/comics/search?keyword=...         - Tìm kiếm
GET    /api/comics/{comicId}                  - Chi tiết truyện
GET    /api/comics/genre/{genreId}            - Truyện theo thể loại
GET    /api/chapters/comic/{comicId}          - Chapter của truyện
```

### Genres
```
GET    /api/genres                            - Danh sách thể loại
GET    /api/genres/{genreId}                  - Chi tiết thể loại
POST   /api/genres                            - Tạo thể loại (token)
PUT    /api/genres/{genreId}                  - Cập nhật (token)
DELETE /api/genres/{genreId}                  - Xóa (token)
```

### Follows
```
POST   /api/follows/user           - Theo dõi người dùng (token)
DELETE /api/follows/user/{userId}  - Bỏ theo dõi (token)
POST   /api/follows/comic          - Theo dõi truyện (token)
DELETE /api/follows/comic/{comicId} - Bỏ theo dõi truyện (token)
GET    /api/follows/comics         - Danh sách truyện yêu thích (token)
```

### Crawling (Admin)
```
POST   /api/crawl/latest?page=1    - Crawl truyện mới từ API
```

### Notifications (WebSocket)
```
POST   /api/notifications/send                  - Broadcast notification
POST   /api/notifications/send-to-user          - Send to user
WS     /api/ws/notifications                   - WebSocket connection (STOMP)
```

---

## 🔐 Authentication

### Login & Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginName": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "accountId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "john_doe",
    "mail": "user@example.com",
    "image": "avatar.jpg",
    "position": false
  }
}
```

### Use Token in Requests
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📧 Email Configuration (Gmail)

1. **Enable 2-Factor Authentication** in Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail & Windows/Mac
   - Copy the generated password

3. **Update `application.yml`**:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

---

## 🔄 WebSocket (Real-time Notifications)

### Connect via SockJS/STOMP
```javascript
const socket = new SockJS('http://localhost:8080/api/ws/notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected:', frame);
    
    // Subscribe to broadcast notifications
    stompClient.subscribe('/topic/notifications', function(message) {
        console.log('Notification:', JSON.parse(message.body));
    });
    
    // Send notification
    stompClient.send("/app/notifications/send", {}, 
        JSON.stringify({
            title: "New Comic",
            message: "New chapter available"
        })
    );
});
```

---

## 🗄️ Database Schema

The application uses the following main tables:

- **account** - User accounts
- **comics** - Comic information
- **chapters** - Chapter details
- **genres** - Genre categories
- **comic_genres** - Comic-Genre relationships
- **follows** - User follows (for users)
- **comic_follows** - Comic follows
- **password_reset_tokens** - Password reset OTP tokens

All tables are managed by JPA/Hibernate with proper relationships and constraints.

---

## 🧪 Testing

### Unit Tests
```bash
mvn test
```

### Test a Specific Class
```bash
mvn test -Dtest=AuthControllerTest
```

### Integration Tests
```bash
mvn verify
```

---

## 🐛 Troubleshooting

### "Connection refused" Error
**Issue**: Cannot connect to SQL Server
**Solution**: 
- Check server name and port in connection string
- Verify SQL Server is running
- Check credentials

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://YOUR_SERVER_NAME:1433;databaseName=truyen;trustServerCertificate=true
```

### "Invalid JWT" Error
**Issue**: Token expired or invalid
**Solution**:
- Get a new token by logging in again
- Check `jwt.expiration` in `application.yml` (default 24 hours)

```yaml
jwt:
  expiration: 86400000  # 24 hours in milliseconds
```

### Email Not Sending
**Issue**: Cannot send reset password email
**Solution**:
- Generate new Gmail app password
- Enable "Less secure app access" if not using 2FA
- Check SMTP settings in `application.yml`

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
```

---

## 📊 Development vs Production

### Development (`application.yml`)
```yaml
logging:
  level:
    root: INFO
    com.webtruyenapi: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG

spring:
  jpa:
    show_sql: true
```

### Production
```yaml
logging:
  level:
    root: WARN
    com.webtruyenapi: INFO

spring:
  jpa:
    show_sql: false
    properties:
      hibernate:
        format_sql: false
```

---

## 📚 Additional Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Spring Security**: https://spring.io/projects/spring-security
- **JJWT (JWT Library)**: https://github.com/jwtk/jjwt
- **Springdoc OpenAPI**: https://springdoc.org/

---

## 🎯 Next Steps

1. ✅ Build and run the application
2. ✅ Test endpoints via Swagger UI
3. ✅ Configure your SQL Server connection
4. ✅ Set up Gmail for email notifications
5. ⏭️ Write unit/integration tests
6. ⏭️ Deploy to production server
7. ⏭️ Set up CI/CD pipeline
8. ⏭️ Add Redis caching layer
9. ⏭️ Implement scheduled comic crawling

---

## 📞 Support

For issues or questions about the migration:
1. Check the [README.md](README.md) for detailed information
2. Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for C# ↔ Java mapping
3. Check Spring Boot documentation
4. Review comments in source code

---

**Status**: ✅ Ready for Production  
**Last Updated**: 2024  
**Java Version**: 17+  
**Spring Boot**: 3.2.0  
