# Migration Guide: C# ASP.NET Core → Java Spring Boot

## Tổng quan Migration

Project này đã được chuyển đổi đầy đủ từ **ASP.NET Core 8.0** sang **Java Spring Boot 3.2.0**.

### Timeline
- **Ngôn ngữ gốc**: C# (.NET 8.0)
- **Ngôn ngữ target**: Java (Spring Boot 3.2.0, JDK 17)
- **Database**: SQL Server (không thay đổi)
- **Thời điểm migration**: 2024

---

## Mapping Công nghệ Trực tiếp

### Framework Core
| ASP.NET Core | Spring Boot | Chú thích |
|---|---|---|
| ASP.NET Core Host | Spring Boot Application | Chạy embedded Tomcat |
| Startup.cs / Program.cs | WebTruyenApiApplication.java | Main entry point |
| WebApi Controllers | @RestController | REST endpoints |
| Middleware | Filter/Interceptor | Request/Response processing |

### Database & ORM
| Entity Framework | JPA/Hibernate | Chú thích |
|---|---|---|
| DbContext | JpaRepository | Data access layer |
| DbSet<T> | JpaRepository<T, ID> | Entity sets |
| IQueryable | Query methods | Database queries |
| Migrations | Hibernate DDL | Schema management |
| Include() | fetch join @Query | Eager loading |

```csharp
// C# Entity Framework
var comic = await _context.Comics
    .Include(c => c.ComicGenres)
        .ThenInclude(cg => cg.Genre)
    .FirstOrDefaultAsync(c => c.ComicId == id);
```

```java
// Java JPA - automatic or custom repositories
Optional<Comic> comic = comicRepository.findById(id);
```

### Authentication & Authorization
| ASP.NET | Spring Boot | Chú thích |
|---|---|---|
| JwtBearer scheme | JJWT library | Token generation & validation |
| AddAuthentication() | SecurityFilterChain | Authentication config |
| [Authorize] | @Secured/@PreAuthorize | Method-level security |
| Claims Principal | SecurityContextHolder | User context |

```csharp
// C# .NET
app.UseAuthentication();
app.UseAuthorization();

[Authorize]
public IActionResult ProtectedEndpoint() { }
```

```java
// Java Spring Boot
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authz -> authz
            .anyRequest().authenticated());
        return http.build();
    }
}

@PostMapping
public ResponseEntity<?> protectedEndpoint() { }
```

### Real-time Communication
| ASP.NET | Spring Boot | Chú thích |
|---|---|---|
| SignalR Hub | WebSocket Config | Real-time connection |
| HubContext | SimpMessagingTemplate | Send messages |
| MapHub() | @EnableWebSocketMessageBroker | Register endpoint |

```csharp
// C# SignalR
public class NotificationHub : Hub {
    public async Task SendNotification(string message) {
        await Clients.All.SendAsync("ReceiveNotification", message);
    }
}
```

```java
// Java WebSocket
@Controller
public class NotificationHandler {
    @MessageMapping("/notifications/send")
    @SendTo("/topic/notifications")
    public Map<String, Object> sendNotification(Map<String, Object> message) {
        return message;
    }
}
```

### Dependency Injection
| ASP.NET | Spring Boot | Chú thích |
|---|---|---|
| AddScoped | @Service | Service lifecycle |
| AddSingleton | @Component | Singleton lifecycle |
| AddTransient | @Prototype | New instance per request |
| InjectionContainer | ApplicationContext | DI container |

```csharp
// C# .NET
builder.Services.AddScoped<AuthService>();
builder.Services.AddSingleton<ICache, MemoryCache>();

// Usage in controller
public class AuthController {
    public AuthController(AuthService authService) { }
}
```

```java
// Java Spring Boot
@Service
public class AuthService { }

@Component
public class MemoryCache implements ICache { }

// Usage in controller - automatic injection
@RestController
public class AuthController {
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
}
```

### Configuration Management
| ASP.NET | Spring Boot | Chú thích |
|---|---|---|
| appsettings.json | application.yml/properties | Configuration file |
| IConfiguration | @Value / @ConfigurationProperties | Config properties |
| GetConnectionString() | spring.datasource.url | Database connection |

```json
// appsettings.json
{
  "Jwt": {
    "Key": "secret",
    "Issuer": "MyApp"
  }
}
```

```yaml
# application.yml
jwt:
  key: secret
  issuer: MyApp
```

### Email Service
| ASP.NET | Spring Boot | Chú thích |
|---|---|---|
| SmtpClient | JavaMailSender | SMTP client |
| MailMessage | SimpleMailMessage | Email message |
| SendMailAsync() | send() | Send operation |

```csharp
// C# .NET
using var smtp = new SmtpClient("smtp.gmail.com", 587);
var message = new MailMessage(from, to, subject, body);
await smtp.SendMailAsync(message);
```

```java
// Java Spring
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
```

---

## Entity Model Migration

### C# Entity Pattern
```csharp
[Table("account")]
public class Account {
    [Key]
    [Column("account_id")]
    public string AccountId { get; set; } = Guid.NewGuid().ToString();
    
    [Column("mail")]
    public string Mail { get; set; }
    
    public virtual ICollection<Follow> Follows { get; set; }
}
```

### Java JPA Pattern
```java
@Entity
@Table(name = "account")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    @Id
    @Column(name = "account_id", length = 36)
    private String accountId;
    
    @Column(name = "mail", nullable = false, unique = true)
    private String mail;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<Follow> follows = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        if (this.accountId == null) {
            this.accountId = UUID.randomUUID().toString();
        }
    }
}
```

---

## Service Layer Migration

### C# Service Pattern
```csharp
public class AuthService {
    private readonly IConfiguration _config;
    
    public AuthService(IConfiguration config) {
        _config = config;
    }
    
    public string HashPassword(string password) {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
```

### Java Service Pattern
```java
@Service
@Slf4j
public class AuthService {
    @Value("${jwt.key}")
    private String jwtKey;
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
}
```

---

## Controller Migration

### C# Controller Pattern
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    private readonly AuthService _auth;
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req) {
        if (_context.Accounts.Any(a => a.Mail == req.Mail))
            return BadRequest(new { message = "Email already exists" });
            
        var account = new Account { ... };
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Registration successful", account });
    }
    
    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser() {
        var userId = User.FindFirst("userId")?.Value;
        // ...
    }
}
```

### Java Controller Pattern
```java
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest req) {
        if (accountRepository.existsByMail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Email already exists"));
        }
        
        Account account = new Account();
        // ...
        accountRepository.save(account);
        
        return ResponseEntity.ok(Map.of(
            "message", "Registration successful",
            "account", account
        ));
    }
    
    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        // ...
    }
}
```

---

## Data Access Migration

### C# LINQ Pattern
```csharp
// Pagination
var comics = await _context.Comics
    .OrderByDescending(c => c.UpdatedAt)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// Search
var result = await _context.Comics
    .Where(c => c.Name.Contains(keyword))
    .ToListAsync();

// Join
var comics = await _context.ComicGenres
    .Where(cg => cg.GenreId == genreId)
    .Select(cg => cg.Comic)
    .ToListAsync();
```

### Java JPA Pattern
```java
// Pagination
Pageable pageable = PageRequest.of(page - 1, pageSize);
Page<Comic> comics = comicRepository.findAllByOrderByUpdatedAtDesc(pageable);

// Search - Custom query
@Query("SELECT c FROM Comic c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
List<Comic> searchByName(@Param("keyword") String keyword);

// Or method name
List<Comic> findByNameContainingIgnoreCase(String keyword);

// Join
List<Comic> comics = comicRepository.findByComicGenres_GenreId(genreId);
```

---

## Error Handling & Logging

### C# Pattern
```csharp
private readonly ILogger<AuthController> _logger;

[Authorize]
[HttpPost("upload-avatar")]
public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarRequest req) {
    try {
        var accountId = User.FindFirst("accountId")?.Value;
        if (accountId == null) 
            return Unauthorized();
            
        _logger.LogInformation("Uploading avatar for: {0}", accountId);
        // ...
    } catch (Exception ex) {
        _logger.LogError(ex, "Error uploading avatar");
        return StatusCode(500, new { message = "Internal server error" });
    }
}
```

### Java Pattern
```java
@Slf4j  // Lombok annotation for SLF4J logger
@RestController
public class AuthController {
    
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestBody UploadAvatarRequest req) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String accountId = (String) auth.getPrincipal();
            
            log.info("Uploading avatar for: {}", accountId);
            // ...
        } catch (Exception ex) {
            log.error("Error uploading avatar", ex);
            return ResponseEntity.status(500)
                .body(Map.of("message", "Internal server error"));
        }
    }
}
```

---

## Async Operations

### C# Async/Await Pattern
```csharp
public async Task<IActionResult> GetComics() {
    var comics = await _context.Comics
        .OrderByDescending(c => c.UpdatedAt)
        .ToListAsync();
    return Ok(comics);
}

public async Task<bool> SendEmailAsync(string to, string subject, string body) {
    await smtp.SendMailAsync(message);
    return true;
}
```

### Java Pattern (Blocking or Reactive)
```java
// Blocking approach (most common in Spring Boot)
@GetMapping
public ResponseEntity<List<Comic>> getComics() {
    List<Comic> comics = comicRepository.findAllByOrderByUpdatedAtDesc();
    return ResponseEntity.ok(comics);
}

// For truly async operations
public CompletableFuture<Boolean> sendEmailAsync(String to, String subject, String body) {
    return CompletableFuture.supplyAsync(() -> {
        emailService.sendEmail(to, subject, body);
        return true;
    });
}

// Or reactive with Project Reactor
public Mono<Boolean> sendEmailReactive(String to, String subject, String body) {
    return Mono.fromCallable(() -> {
        emailService.sendEmail(to, subject, body);
        return true;
    })
    .subscribeOn(Schedulers.boundedElastic());
}
```

---

## Password Hashing

### C# BCrypt
```csharp
using BCrypt.Net;

public string HashPassword(string password) {
    return BCrypt.Net.BCrypt.HashPassword(password);
}

public bool VerifyPassword(string password, string hash) {
    return BCrypt.Net.BCrypt.Verify(password, hash);
}
```

### Java BCrypt
```java
public class AuthService {
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
    
    public boolean verifyPassword(String password, String hash) {
        return passwordEncoder.matches(password, hash);
    }
}
```

---

## JWT Token Handling

### C# JWT Token
```csharp
public string GenerateJwtToken(Account account) {
    var jwtKey = _config["Jwt:Key"];
    var issuer = _config["Jwt:Issuer"];
    
    var claims = new[] {
        new Claim("accountId", account.AccountId),
        new Claim("email", account.Mail)
    };
    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(issuer, issuer, claims, 
        expires: DateTime.Now.AddDays(1), 
        signingCredentials: creds);
    
    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Java JWT Token
```java
@Service
@Slf4j
public class AuthService {
    @Value("${jwt.key}")
    private String jwtKey;
    
    @Value("${jwt.issuer}")
    private String issuer;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    public String generateJwtToken(Account account) {
        long now = System.currentTimeMillis();
        
        return Jwts.builder()
            .claim("accountId", account.getAccountId())
            .claim("email", account.getMail())
            .setIssuer(issuer)
            .setAudience(issuer)
            .setIssuedAt(new Date(now))
            .setExpiration(new Date(now + jwtExpiration))
            .signWith(Keys.hmacShaKeyFor(jwtKey.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }
}
```

---

## Database Connection String

### C# .NET
```csharp
"ConnectionStrings": {
    "DefaultConnection": "Server=DESKTOP-71DLVRD;Database=truyen;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### Java Spring Boot
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://DESKTOP-71DLVRD:1433;databaseName=truyen;trustServerCertificate=true
    username: sa
    password: password
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
```

---

## CORS Configuration

### C# ASP.NET Core
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => 
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});

app.UseCors("AllowAll");
```

### Java Spring Boot
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors().and()...
        return http.build();
    }
}
```

---

## API Documentation

### C# Swagger Config
```csharp
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebTruyen API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
});

app.UseSwagger();
app.UseSwaggerUI();
```

### Java Spring Boot Swagger
```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("WebTruyen API")
                .version("v1"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .components(new Components()
                .addSecuritySchemes("Bearer", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

URL: `http://localhost:8080/api/swagger-ui.html`

---

## Testing

### C# Unit Test Pattern
```csharp
[Fact]
public async Task Register_WithValidData_ReturnsOk() {
    var request = new RegisterRequest { Email = "test@example.com", ... };
    var result = await _controller.Register(request);
    
    Assert.IsType<OkObjectResult>(result);
}
```

### Java Unit Test Pattern
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class AuthControllerTest {
    
    @Test
    public void registerWithValidData_ReturnsOk() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        
        ResponseEntity<?> result = authController.register(request);
        
        assertEquals(HttpStatus.OK, result.getStatusCode());
    }
}
```

---

## Performance Considerations

### Database Queries
- **C#**: LINQ lazy evaluation, `.ToListAsync()` explicitly loads
- **Java**: JPA explicitly needs `.getResult()` or `.getSingleResult()`

### Caching
- **C#**: `MemoryCache`, `IDistributedCache`
- **Java**: Spring `@Cacheable`, `@CachePut`, Redis

### Connection Pooling
- **C#**: Built-in connection pooling
- **Java**: HikariCP (default in Spring Boot) or Tomcat JDBC Pool

---

## Migration Checklist

- [x] Create Maven `pom.xml` with all dependencies
- [x] Create `application.yml` configuration
- [x] Migrate all Entity/Model classes to JPA
- [x] Create JpaRepository interfaces
- [x] Migrate Services (AuthService, EmailService, etc)
- [x] Create SecurityConfig for JWT authentication
- [x] Implement JwtAuthenticationFilter
- [x] Migrate all Controllers
- [x] Create DTOs for request/response
- [x] Configure WebSocket for notifications
- [x] Implement crawling services
- [x] Add Swagger/OpenAPI documentation
- [x] Create README with setup instructions
- [ ] Write Unit Tests
- [ ] Write Integration Tests
- [ ] Performance testing & optimization
- [ ] Docker containerization
- [ ] CI/CD setup

---

## Useful Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)
- [JJWT Library](https://github.com/jwtk/jjwt)
- [Spring WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [Springdoc OpenAPI](https://springdoc.org/)

---

**Migration Status**: ✅ **COMPLETE**

Toàn bộ API đã được chuyển đổi và sẵn sàng để chạy trên Spring Boot.
