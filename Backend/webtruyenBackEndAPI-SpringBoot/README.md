# WebTruyen API - Spring Boot Migration

Đây là phiên bản migration của **WebTruyen Backend API** từ ASP.NET Core sang **Java Spring Boot 3.2**.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (thay thế Entity Framework Core)
- **Spring Security** + **JWT** (thay thế Microsoft.AspNetCore.Authentication.JwtBearer)
- **Spring WebSocket** (thay thế SignalR)
- **SQL Server** (MSSQL JDBC)
- **Swagger/OpenAPI** (tương đương Swashbuckle.AspNetCore)
- **Maven**

## Thuộc tính công nghệ được chuyển đổi

| C# .NET | Java Spring Boot |
|---------|-----------------|
| ASP.NET Core | Spring Boot |
| Entity Framework Core | JPA/Hibernate |
| DbContext | JpaRepository |
| BCrypt.Net-Next | spring-security-crypto |
| JWT Bearer Token | JJWT (io.jsonwebtoken) |
| SignalR | Spring WebSocket + STOMP |
| SMTP (System.Net.Mail) | JavaMail |
| HttpClient | RestTemplate |
| Swashbuckle.AspNetCore | springdoc-openapi |
| CORS Policy | @CrossOrigin / SecurityFilterChain |

## Cấu trúc thư mục

```
src/main/java/com/webtruyenapi/
├── config/              # Configuration classes
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── WebSocketConfig.java
│   ├── OpenApiConfig.java
│   └── AppConfig.java
├── controller/          # REST Controllers
│   ├── AuthController.java
│   ├── ComicController.java
│   ├── GenreController.java
│   ├── FollowController.java
│   ├── ChapterController.java
│   └── CrawlController.java
├── service/            # Business Logic Services
│   ├── AuthService.java
│   ├── EmailService.java
│   ├── OTruyenApiClient.java
│   └── ComicCrawlerService.java
├── repository/         # Data Access Layer (JPA Repositories)
│   ├── AccountRepository.java
│   ├── ComicRepository.java
│   ├── ChapterRepository.java
│   ├── GenreRepository.java
│   ├── FollowRepository.java
│   └── ...
├── entity/            # JPA Entity Classes (Models)
│   ├── Account.java
│   ├── Comic.java
│   ├── Chapter.java
│   ├── Genre.java
│   ├── Follow.java
│   └── ...
├── dto/               # Data Transfer Objects
│   ├── AuthDTOs.java
│   ├── FollowDtos.java
│   └── OTruyenDtos.java
├── websocket/         # WebSocket Handler (for Notifications)
│   └── NotificationHandler.java
└── WebTruyenApiApplication.java
```

## Installation & Setup

### Yêu cầu
- Java 17 trở lên
- Maven 3.6 trở lên
- SQL Server (hoặc thay đổi connection string)

### Cài đặt

1. **Clone hoặc copy project vào IDE**

2. **Cập nhật `application.yml`** với thông tin SQL Server của bạn:
   ```yaml
   spring:
     datasource:
       url: jdbc:sqlserver://YOUR_SERVER:1433;databaseName=truyen;trustServerCertificate=true
       username: sa
       password: YOUR_PASSWORD
   ```

3. **Cập nhật Email/Gmail settings**:
   ```yaml
   spring:
     mail:
       username: your-email@gmail.com
       password: your-app-password  # Use Gmail App Password
   ```

4. **Build project**:
   ```bash
   mvn clean install
   ```

5. **Run application**:
   ```bash
   mvn spring-boot:run
   ```

   Hoặc jar file:
   ```bash
   java -jar target/webtruyenapi-1.0.0.jar
   ```

- API sẽ chạy tại: **http://localhost:8080/api**
- Swagger UI: **http://localhost:8080/api/swagger-ui.html**
- WebSocket: **ws://localhost:8080/api/ws/notifications**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/request-reset` - Yêu cầu đặt lại mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### Comics
- `GET /api/comics/page?page=1` - Danh sách truyện (phân trang, 20 truyện/trang)
- `GET /api/comics/search?keyword=...` - Tìm kiếm truyện
- `GET /api/comics/{comicId}` - Chi tiết truyện
- `GET /api/comics/genre/{genreId}` - Truyện theo thể loại

### Chapters
- `GET /api/chapters/{chapterId}` - Chi tiết chapter
- `GET /api/chapters/comic/{comicId}` - Danh sách chapter của truyện

### Genres
- `GET /api/genres` - Danh sách thể loại
- `GET /api/genres/{genreId}` - Chi tiết thể loại

### Follows
- `POST /api/follows/user` - Theo dõi người dùng
- `DELETE /api/follows/user/{followedId}` - Bỏ theo dõi
- `POST /api/follows/comic` - Theo dõi truyện
- `DELETE /api/follows/comic/{comicId}` - Bỏ theo dõi truyện

### Crawl (Admin)
- `POST /api/crawl/latest?page=1` - Crawl danh sách truyện mới

### Notifications (WebSocket)
- `POST /api/notifications/send` - Gửi notification (broadcast)
- `POST /api/notifications/send-to-user` - Gửi notification cho user cụ thể
- WebSocket: `/ws/notifications` (STOMP + SockJS)

## Các thay đổi chính so với ASP.NET Core

### 1. Dependency Injection
```csharp
// C# .NET
builder.Services.AddScoped<AuthService>();
```

```java
// Java Spring Boot - tự động với @Service/@Component + @Autowired
@Service
public class AuthService { ... }
```

### 2. Database Context
```csharp
// C# .NET
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

```java
// Java Spring Boot - cấu hình trong application.yml
spring:
  datasource:
    url: jdbc:sqlserver://...
  jpa:
    hibernate:
      ddl-auto: validate
```

### 3. Entity Models
```csharp
// C# .NET - Attributes
[Table("account")]
[Column("account_id")]
public string AccountId { get; set; }
```

```java
// Java - Annotations
@Entity
@Table(name = "account")
@Column(name = "account_id")
private String accountId;
```

### 4. Controllers
```csharp
// C# .NET
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase { ... }
```

```java
// Java Spring Boot
@RestController
@RequestMapping("/api/accounts")
public class AccountController { ... }
```

### 5. Authentication & JW

T
```csharp
// C# .NET - Startup config
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(opt => { ... });
```

```java
// Java Spring Boot - SecurityConfig
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### 6. Async/Await
```csharp
// C# .NET
public async Task<IActionResult> GetComics() {
    var comics = await _context.Comics.ToListAsync();
    return Ok(comics);
}
```

```java
// Java Spring Boot - JPA handles basic queries, manual async with CompletableFuture if needed
public ResponseEntity<List<Comic>> getComics() {
    List<Comic> comics = comicRepository.findAll();
    return ResponseEntity.ok(comics);
}
```

### 7. SignalR → WebSocket
```csharp
// C# .NET
app.MapHub<NotificationHub>("/hubs/notifications");

public class NotificationHub : Hub {
    public async Task SendNotification(string message) {
        await Clients.All.SendAsync("ReceiveNotification", message);
    }
}
```

```java
// Java Spring Boot - STOMP over WebSocket
@Controller
public class NotificationHandler {
    @MessageMapping("/notifications/send")
    @SendTo("/topic/notifications")
    public Map<String, Object> sendNotification(Map<String, Object> message) {
        return message;
    }
}
```

## Email Configuration (Gmail)

1. Kích hoạt "Less secure app access" hoặc tạo **App Password**:
   - Truy cập: https://myaccount.google.com/security
   - Tạo app-specific password

2. Cập nhật `application.yml`:
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

## JWT Configuration

Cập nhật `application.yml`:
```yaml
jwt:
  key: ThisIsASecretKeyForJwtToken123456
  issuer: MyApp
  expiration: 86400000  # 24 hours in milliseconds
```

## Logging

Cập nhật log level trong `application.yml`:
```yaml
logging:
  level:
    root: INFO
    com.webtruyenapi: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

## Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn jacoco:report
```

## Troubleshooting

### 1. SQL Server Connection Error
- Kiểm tra URL: `jdbc:sqlserver://SERVER_NAME:1433;databaseName=database_name`
- Bật: `trustServerCertificate=true` nếu dùng self-signed certificate

### 2. JWT Token Expired
- Kiểm tra `jwt.expiration` trong `application.yml`

### 3. Email không gửi được
- Sử dụng App Password thay vì mật khẩu thường
- Bật SMTP authentication và TLS

### 4. CORS Issues
- Kiểm tra `allowedOrigins` trong `SecurityConfig.java`

## Future Improvements

- [ ] Thêm Unit Tests
- [ ] Thêm Integration Tests
- [ ] Redis caching
- [ ] Scheduled tasks (comic crawling)
- [ ] Pagination improvement
- [ ] Elasticsearch for better search
- [ ] Docker support
- [ ] CI/CD Pipeline

## Related Files

- Cấu hình: `src/main/resources/application.yml`
- Dependencies: `pom.xml`
- Main Application: `WebTruyenApiApplication.java`

## Support

Nếu gặp vấn đề, tham khảo:
- Spring Boot Docs: https://spring.io/projects/spring-boot
- Spring Data JPA: https://spring.io/projects/spring-data-jpa
- Spring Security: https://spring.io/projects/spring-security
- JWT Docs: https://github.com/jwtk/jjwt
