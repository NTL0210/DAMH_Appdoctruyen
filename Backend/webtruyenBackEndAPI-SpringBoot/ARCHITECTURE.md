# Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│  Web Browser | Mobile App | Desktop Client | 3rd Party Service         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMMUNICATION LAYER                                   │
│  HTTP/REST API Endpoints | WebSocket (STOMP) | JSON/XML                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT APPLICATION LAYER                          │
│  (Embedded Tomcat Server - Port 8080)                                    │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway / Routing                         │   │
│  │  Dispatcher Servlet → Spring DispatcherServlet                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Authentication & Authorization                      │   │
│  │  • JwtAuthenticationFilter (JWT Token Validation)               │   │
│  │  • SecurityFilterChain (CORS, Authorization)                    │   │
│  │  • CustomUserDetailsService (User loading)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    REST Controllers                              │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
│  │  │ AuthCtrl   │ │ ComicCtrl  │ │ ChapterCtrl│ │ GenreCtrl  │   │   │
│  │  ├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤   │   │
│  │  │ FollowCtrl │ │ CrawlCtrl  │ │            │ │            │   │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  WebSocket / STOMP Handler                              │   │   │
│  │  │  NotificationHandler (@MessageMapping)                 │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Business Logic Services                             │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │   │
│  │  │ AuthService  │ │EmailService  │ │CrawlService │             │   │
│  │  ├──────────────┤ ├──────────────┤ ├──────────────┤             │   │
│  │  │ JWT Token    │ │SMTP Sender   │ │API Client   │             │   │
│  │  │ BCrypt Hash  │ │Async Mail    │ │Sync Comics  │             │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │            Data Access Layer (Repositories)                      │   │
│  │  Spring Data JPA - JpaRepository Interface                       │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ AccountRepository  │ ComicRepository  │ ChapterRepository│   │   │
│  │  │ GenreRepository    │ FollowRepository │ etc.             │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  • JPQL Queries  • Custom Query Methods  • Pagination           │   │
│  │  • Lazy/Eager Loading  • Transaction Management                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              ORM Layer (JPA/Hibernate)                           │   │
│  │  Entity Management → Query Translation → SQL Generation          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Configuration & Infrastructure                      │   │
│  │  • Database Connection Pool (HikariCP)                          │   │
│  │  • Transaction Management (PlatformTransactionManager)          │   │
│  │  • Dependency Injection (ApplicationContext)                    │   │
│  │  • WebSocket Configuration (STOMP Broker)                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │         Microsoft SQL Server (SQL Server 2019+)                 │   │
│  │                                                                   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │   │
│  │  │   account    │ │   comics     │ │   chapters   │             │   │
│  │  │   table      │ │   table      │ │   table      │             │   │
│  │  │              │ │              │ │              │             │   │
│  │  │ • accountId  │ │ • comicId    │ │ • id         │             │   │
│  │  │ • mail       │ │ • name       │ │ • comicId    │             │   │
│  │  │ • password   │ │ • slug       │ │ • chapterIdx │             │   │
│  │  │ • userName   │ │ • status     │ │ • content    │             │   │
│  │  │ • image      │ │ • thumbUrl   │ │ • createdAt  │             │   │
│  │  │              │ │ • updatedAt  │ │ • updatedAt  │             │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │   │
│  │                                                                   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │   │
│  │  │   genres     │ │comic_genres  │ │   follows    │             │   │
│  │  │   table      │ │   junction   │ │   table      │             │   │
│  │  │              │ │              │ │              │             │   │
│  │  │ • genreId    │ │ • comicId    │ │ • followId   │             │   │
│  │  │ • name       │ │ • genreId    │ │ • accountId  │             │   │
│  │  │              │ │              │ │ • followedId │             │   │
│  │  │              │ │              │ │ • createdAt  │             │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │   │
│  │                                                                   │   │
│  │  ┌──────────────────────┐ ┌──────────────────────┐             │   │
│  │  │  comic_follows       │ │password_reset_tokens │             │   │
│  │  │  table               │ │ table                │             │   │
│  │  │                      │ │                      │             │   │
│  │  │ • comicFollowId      │ │ • tokenId            │             │   │
│  │  │ • accountId          │ │ • email              │             │   │
│  │  │ • comicId            │ │ • otp                │             │   │
│  │  │ • createdAt          │ │ • expiredAt          │             │   │
│  │  └──────────────────────┘ └──────────────────────┘             │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  Indexes: (FK relationships, search optimization)       │   │   │
│  │  │  Constraints: (PK, FK, Unique, Not Null)                │   │   │
│  │  │  Transactions: (ACID compliance)                          │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                    │
│                                                                            │
│  ┌──────────────────────┐ ┌──────────────────────┐                      │
│  │   OTruyen API        │ │   Gmail SMTP Service │                      │
│  │   (Comic Data Source)│ │   (Email Sending)    │                      │
│  │                      │ │                      │                      │
│  │ • List Endpoint      │ │ • Host: smtp.gmail   │                      │
│  │ • Detail Endpoint    │ │ • Port: 587 (TLS)    │                      │
│  │ • Chapter Sync       │ │ • Auth: OAuth/AppPwd │                      │
│  └──────────────────────┘ └──────────────────────┘                      │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
         User Request
              ↓
    ┌─────────────────────┐
    │   HTTP Request      │
    │ (REST/WebSocket)    │
    └──────────┬──────────┘
               ↓
    ┌─────────────────────────────────┐
    │  DispatcherServlet              │
    │  (Spring Framework Router)      │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Security Filter Chain          │
    │  • CORS Check                   │
    │  • JWT Validation               │
    │  • Authorization Check          │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Route to appropriate Controller│
    │  (e.g., AuthController)         │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Controller Action Method       │
    │  (Mapping HTTP → Java method)   │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Inject Dependencies            │
    │  (ServiceImpl instances)         │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Execute Business Logic         │
    │  (Service Methods)              │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Database Operations            │
    │  (Repository interface)         │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  ORM Translation                │
    │  (JPA → SQL)                    │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  SQL Execution                  │
    │  (SQL Server Query)             │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Database Result Set            │
    │  (SQL Server Response)          │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  ORM Mapping                    │
    │  (ResultSet → Java Objects)     │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Service Processing             │
    │  (Business Logic)               │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  Prepare Response               │
    │  (DTO Conversion)               │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  JSON Serialization             │
    │  (Object → JSON)                │
    └──────────┬──────────────────────┘
               ↓
    ┌─────────────────────────────────┐
    │  HTTP Response                  │
    │  (Status + Body)                │
    └──────────┬──────────────────────┘
               ↓
         User Response
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN SEQUENCE DIAGRAM                        │
└─────────────────────────────────────────────────────────────────┘

 Client                  Controller              Service           DB
   │                         │                      │               │
   │──(1) POST /login────────>│                      │               │
   │  {email, password}       │                      │               │
   │                          │                      │               │
   │                          │─(2) Authenticate─────>│               │
   │                          │                      │               │
   │                          │                      │─(3) Query─────>│
   │                          │                      │   findByMail   │
   │                          │                      │                │
   │<─────────────────────────<─────Account Data──────<───{Account}──│
   │                          │                      │               │
   │                          │─(4) Verify Password──>│               │
   │                          │  BCrypt.compare      │               │
   │                          │                      │               │
   │                          │<─(5) Password Valid──│               │
   │<─────────────────────────<─(6) Generate Token──<─┘               │
   │  {token, user_info}      │                                       │
   │                          │                                       │

┌─────────────────────────────────────────────────────────────────┐
│               PROTECTED ENDPOINT SEQUENCE DIAGRAM                │
└─────────────────────────────────────────────────────────────────┘

 Client          Filter              Controller           Service
   │                 │                    │                   │
   │─(1) Request────>│                    │                   │
   │  Header:        │                    │                   │
   │  Authorization: │                    │                   │
   │  Bearer TOKEN   │                    │                   │
   │                 │                    │                   │
   │                 │─(2) Extract Token──>                   │
   │                 │                    │                   │
   │                 │─(3) Validate JWT────────┐              │
   │                 │  (Signature, Expiry)    │              │
   │                 │<─ Token Valid ─────────┘              │
   │                 │                    │                   │
   │                 │─(4) Set Principal──>                   │
   │                 │  in SecurityContext│                   │
   │                 │                    │                   │
   │                 │                    │─(5) Execute Logic─>│
   │                 │                    │                   │
   │<─────────────────<─(6) Response─────<─(7) Return Result──┤
   │  {data}         │                    │                   │
   │                 │                    │                   │
```

---

## Dependency Injection Container

```
┌────────────────────────────────────────────────────────────────┐
│         Spring Application Context (Dependency Injection)       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Singleton Beans                            │ │
│  │  (Created once, shared across application)             │ │
│  │                                                         │ │
│  │  • AuthService              (Service Bean)             │ │
│  │  • EmailService             (Service Bean)             │ │
│  │  • ComicCrawlerService      (Service Bean)             │ │
│  │  • OTruyenApiClient         (Service Bean)             │ │
│  │  • AccountRepository        (JPA Repository)           │ │
│  │  • ComicRepository          (JPA Repository)           │ │
│  │  • ChapterRepository        (JPA Repository)           │ │
│  │  • ...other repositories                              │ │
│  │  • JwtTokenProvider         (Component Bean)           │ │
│  │  • JwtAuthenticationFilter  (Filter Bean)              │ │
│  │  • RestTemplate             (Configuration Bean)       │ │
│  │  • DataSource               (HikariCP Connection Pool) │ │
│  │  • EntityManagerFactory     (JPA Factory)              │ │
│  │  • TransactionManager       (PlatformTxnManager)       │ │
│  │  • WebSocketConfig          (WebSocket Setup)          │ │
│  │                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │        Autowiring / Constructor Injection               │ │
│  │                                                         │ │
│  │  @RestController                                        │ │
│  │  public class AuthController {                          │ │
│  │    private final AuthService authService;              │ │
│  │                                                         │ │
│  │    public AuthController(AuthService authService) {    │ │
│  │      // Spring automatically injects singleton bean    │ │
│  │      this.authService = authService;                  │ │
│  │    }                                                    │ │
│  │  }                                                      │ │
│  │                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Request-Response Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                    FULL REQUEST LIFECYCLE                         │
└──────────────────────────────────────────────────────────────────┘

1. HTTP Request arrives at Embedded Tomcat
   └─> GET /api/comics/page?page=1

2. DispatcherServlet routes the request
   └─> Matches routing pattern → ComicController

3. Spring applies Filters (in order)
   ├─> CORS Filter (Check origin)
   ├─> Security Filter Chain
   │   ├─> JwtAuthenticationFilter (Validate token)
   │   ├─> Authorization Filter (Check permissions)
   │   └─> CSRF Filter (if enabled)
   └─> HTTP Encoding Filter

4. Controller Method Invoked
   └─> @GetMapping("/page")
       public ResponseEntity<Page<Comic>> getComicsByPage(int page)

5. Dependency Injection
   └─> Spring injects ComicRepository instance

6. Security Context Check
   └─> Verify user is authenticated (if @Secured)

7. Parameter Binding & Validation
   └─> Convert HTTP parameters to method arguments

8. Business Logic Execution
   ├─> ComicRepository.findAllByOrderByUpdatedAtDesc(Pageable)
   └─> Creates JPA Query

9. JPA/Hibernate Processing
   ├─> Parse JPQL Query
   ├─> Generate SQL: "SELECT c FROM Comic c ORDER BY c.updatedAt DESC"
   └─> Create PreparedStatement

10. Database Connection
    ├─> Get connection from HikariCP
    ├─> Execute SQL on SQL Server
    └─> Retrieve ResultSet

11. ORM Mapping (ResultSet → Java Objects)
    └─> Hibernate maps columns to Comic entity fields

12. Return to Service Layer
    └─> Service receives Page<Comic> object

13. Response Preparation
    ├─> Convert entities to DTOs if needed
    └─> Prepare response object

14. JSON Serialization
    └─> Jackson converts Java objects to JSON

15. HTTP Response Construction
    ├─> Status: 200 OK
    ├─> Headers: Content-Type: application/json
    └─> Body: JSON array

16. Response sent to client
    └─> Client receives and parses response
```

---

## Transaction Management

```
┌────────────────────────────────────────────────────────┐
│          TRANSACTION LIFECYCLE (ACID)                  │
└────────────────────────────────────────────────────────┘

@Transactional (Spring annotation)
public Account register(RegisterRequest req) {
    BEGIN TRANSACTION
    └─ Atomicity: All or Nothing
    
    1. Check email exists
       └─ SELECT * FROM account WHERE mail = ?
    
    2. Create new Account
       └─ new Account()
    
    3. Hash password
       └─ BCrypt.hashPassword()
    
    4. Save to database
       └─ INSERT INTO account (...) VALUES (...)
    
    5. Flush changes
       └─ EntityManager.flush()
    
    6. COMMIT TRANSACTION
       └─ Consistency: DB in valid state
       └─ Isolation: Other tx can't see uncommitted data
       └─ Durability: Written to disk
}

ON EXCEPTION:
ROLLBACK TRANSACTION
└─ All changes reverted to start state
```

---

## WebSocket Real-time Flow

```
┌──────────────────────────────────────────────────────────┐
│           WEBSOCKET CONNECTION SEQUENCE                  │
└──────────────────────────────────────────────────────────┘

Client (JavaScript)          WebSocket Handler        Message Broker
   │                              │                         │
   │─── Establish Connection ────>│                         │
   │  (HTTP Upgrade Request)      │                         │
   │                              │                         │
   │                              │─ Register Endpoint ────>│
   │                              │  (/ws/notifications)    │
   │                              │                         │
   │<─── Connection Confirmed ─────                         │
   │  (HTTP 101 Switching)        │                         │
   │                              │                         │
   │─ STOMP CONNECT Frame ───────>│                         │
   │  (Initialize Session)        │                         │
   │                              │                         │
   │<─ STOMP CONNECTED ────────────                         │
   │  (Session established)       │                         │
   │                              │                         │
   │─ SUBSCRIBE /topic/notify ──>│─ Register Consumer ────>│
   │  (Join channel)              │                         │
   │                              │                         │
   │                              │<─ Confirmation ─────────│
   │<─ RECEIPT ─────────────────────                        │
   │  (Subscription confirmed)    │                         │
   │                              │                         │
   │  [Broadcast by Admin]        │                         │
   │<─ MESSAGE /topic/notify ─────<─ Publish Message ──────│
   │  {type: "newChapter", ...}   │  from Publisher        │
   │                              │                         │
   │  [Send Update]               │                         │
   │─ SEND /app/notify/update ──>│─ Process & Distribute ─>│
   │  {comicId: 123}              │  to all subscribers     │
   │                              │                         │
   │<─ MESSAGE /topic/notify ─────<─ Response to all ──────│
   │  {type: "commentAdded", ...} │  subscribers            │
   │                              │                         │
   │─ DISCONNECT ───────────────>│─ Unregister Consumer ──>│
   │  (Close connection)          │                         │
   │                              │                         │
   │<─ RECEIPT ─────────────────────                        │
   │  (Disconnection confirmed)   │                         │
   │                              │                         │
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────────────┐
│              ERROR HANDLING ARCHITECTURE                │
└────────────────────────────────────────────────────────┘

Request arrives
    │
    ↓
Execute Business Logic
    │
    ├─ Success ──> Response (200 OK)
    │
    └─ Exception ──┐
                   ↓
            Is it a Custom Exception?
            │
            ├─ Yes ──> CustomExceptionHandler
            │         ├─ ResourceNotFoundException → 404
            │         ├─ UnauthorizedException → 401
            │         ├─ ValidationException → 400
            │         └─ BusinessException → 422
            │
            └─ No  ──> Spring Exception Handler
                      ├─ DataAccessException → 500
                      ├─ HttpRequestMethodNotSupportedException → 405
                      ├─ HttpMessageNotReadableException → 400
                      └─ General Exception → 500

    ↓
Create Error Response
    ├─ Status Code
    ├─ Error Message
    ├─ Timestamp
    └─ Stack Trace (if dev mode)

    ↓
Log Error
    ├─ ERROR level logging
    ├─ With stack trace
    └─ System alerts (if critical)

    ↓
Return to Client
    └─ JSON Error Response
```

---

## Database Connection Pooling (HikariCP)

```
┌──────────────────────────────────────────────────────────┐
│         CONNECTION POOL MANAGEMENT                       │
└──────────────────────────────────────────────────────────┘

Application Startup
    │
    ├─ Initialize HikariCP
    │  ├─ Max Pool Size: 10
    │  ├─ Min Idle Connections: 2
    │  ├─ Connection Timeout: 30 seconds
    │  └─ Idle Timeout: 10 minutes
    │
    └─ Create initial connections
       └─ Establish 2-10 connections to SQL Server

Runtime:

Request needs DB connection
    │
    ├─ Available connection in pool?
    │  ├─ Yes ──> Lease connection (return on use)
    │  │
    │  └─ No  ──> Check if can create new
    │            ├─ Below maxPoolSize? ──> Create new
    │            │
    │            └─ At maxPoolSize? ──> Wait for available
    │                                   (Timeout after 30s)
    │
    ├─ Execute query
    │
    └─ Return connection to pool

Idle Connection Management:
    │
    ├─ Connected for 10+ minutes?
    │  ├─ Yes ──> Close if above minIdle
    │  └─ No  ──> Keep in pool
    │
    └─ Validate connection health
       └─ Send ping query before returning from pool

Application Shutdown:
    │
    └─ Close all connections gracefully
       └─ Max 30 seconds to drain active connections
```

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  ENTITY-RELATIONSHIP MODEL                  │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   Account    │
                        │   (User)     │
                        ├──────────────┤
                        │ • accountId  │
                        │ • mail       │◄─── Unique
                        │ • password   │
                        │ • userName   │
                        │ • image      │
                        │ • position   │
                        └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    │ (1:N)    │ (1:N)    │
                    │          │          │
        ┌───────────▼──┐  ┌───────────────▼──┐
        │  Follow      │  │ ComicFollow      │
        │  (User Rel)  │  │ (Comic Wishlist) │
        ├──────────────┤  ├──────────────────┤
        │ • followId   │  │ • comicFollowId  │
        │ • accountId  │  │ • accountId      │
        │ • followedId │  │ • comicId        │
        │ • createdAt  │  │ • createdAt      │
        └──────────────┘  └──────────┬───────┘
                                     │
                                     │ (N:1)
                                     │
                        ┌────────────▼─────────┐
                        │       Comic          │
                        │  (Story/Manga)       │
                        ├──────────────────────┤
                        │ • comicId            │
                        │ • name               │◄─── Unique
                        │ • slug               │
                        │ • originName         │
                        │ • status             │
                        │ • thumbUrl           │
                        │ • subDocquyen        │
                        │ • chaptersLatest     │
                        │ • createdAt          │
                        │ • updatedAt          │
                        │ • modifiedAt         │
                        └──────┬───────┬───────┘
                               │       │
                    ┌──────────┘       └──────────┐
                    │                             │
                    │ (1:N)                   (N:M)
                    │                             │
        ┌───────────▼──────────┐   ┌──────────────▼──────────┐
        │    Chapter           │   │   ComicGenre (Junction) │
        │  (episode/volume)    │   │                         │
        ├──────────────────────┤   ├─────────────────────────┤
        │ • id                 │   │ • id                    │
        │ • comicId            │   │ • comicId      ◄─── FK  │
        │ • slug               │   │ • genreId      ◄─── FK  │
        │ • serverName         │   └─────────────────────────┘
        │ • chapterIndex       │              │
        │ • chapterName        │              │ (N:1)
        │ • chapterTitle       │              │
        │ • chapterApiData     │   ┌──────────▼──────────┐
        │ • createdAt          │   │    Genre            │
        │ • updatedAt          │   │  (Category/Type)    │
        └──────────────────────┘   ├─────────────────────┤
                                    │ • genreId           │
                                    │ • name              │
                                    └─────────────────────┘


Other Utility Entities:

                    ┌──────────────────────────┐
                    │ PasswordResetToken       │
                    │ (Login Recovery)         │
                    ├──────────────────────────┤
                    │ • tokenId                │
                    │ • email                  │◄─── FK to Account.mail
                    │ • otp (One-Time-Pass)    │
                    │ • expiredAt              │
                    │ • createdAt              │
                    └──────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                SECURITY ARCHITECTURE                    │
└─────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ HTTPS/TLS (Encryption in Transit)
├─ Certificate Management
└─ Firewall Rules

Layer 2: Authentication
├─ JWT Token Validation
├─ Token Expiration (24h)
├─ Token Refresh Mechanism
└─ Multi-factor Authentication (future)

Layer 3: Authorization
├─ Role-based Access Control (RBAC)
├─ Method-level Security
├─ Endpoint-level Authorization
└─ Resource-level Access Control

Layer 4: Input Validation
├─ @Valid annotations
├─ Request parameter validation
├─ SQL injection prevention (JPA)
└─ XSS prevention

Layer 5: Output Security
├─ JSON serialization controls
├─ Error message masking
└─ Sensitive data filtering

Layer 6: Database Security
├─ Connection pooling
├─ Query parameterization (JPA)
├─ Encrypted passwords (BCrypt)
└─ Column-level encryption (optional)

Layer 7: Audit & Logging
├─ Request/Response logging
├─ Security event logging
├─ Access control logging
└─ Change tracking

Layer 8: Infrastructure
├─ Dependency scanning
├─ Vulnerability scanning
├─ Intrusion detection
└─ DDoS protection
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│              DEPLOYMENT TOPOLOGY                         │
└──────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │  Internet/Users │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  Load Balancer  │
                        │ (Nginx/HAProxy) │
                        └────────┬────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
    ┌────────────▼─┐  ┌─────────▼──┐  ┌────────▼─────────┐
    │ Spring Boot  │  │Spring Boot  │  │  Spring Boot     │
    │ Instance 1   │  │Instance 2   │  │  Instance 3      │
    │ (Port 8080)  │  │ (Port 8080) │  │  (Port 8080)     │
    └────────┬─────┘  └─────┬───────┘  └────────┬─────────┘
             │               │                   │
             │   (Connection Pool)               │
             └───────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  SQL Server DB  │
                    │  (Master/Slave) │
                    └─────────────────┘

Scaling Strategy:
├─ Horizontal Scaling: Add more Spring Boot instances
├─ Load Balancing: Distribute traffic
├─ Connection Pooling: Manage DB connections
├─ Caching Layer: Redis for session/data
└─ Database Replication: Master-Slave for HA
```

---

**End of Architecture Document**

This architecture provides:
- Clean separation of concerns
- Scalability and performance
- Security at multiple layers
- Maintainability and testability
- Production-ready design
