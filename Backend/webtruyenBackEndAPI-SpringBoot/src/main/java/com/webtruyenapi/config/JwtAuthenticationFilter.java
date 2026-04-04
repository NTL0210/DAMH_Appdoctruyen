package com.webtruyenapi.config;

import com.webtruyenapi.entity.Account;
import com.webtruyenapi.repository.AccountRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private AccountRepository accountRepository;

    @Value("${jwt.key}")
    private String jwtKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {

            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && validateToken(jwt)) {

                String accountId = getAccountIdFromToken(jwt);
                String email = getEmailFromToken(jwt);
                String role = getRoleFromToken(jwt);

                Optional<Account> accountOpt = accountRepository.findById(accountId);

                if (accountOpt.isEmpty()) {

                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Account not found");

                    return;
                }

                Account account = accountOpt.get();

                // ==========================
                // CHECK TOKEN MỚI NHẤT
                // ==========================

                if (account.getCurrentToken() == null ||
                        !jwt.equals(account.getCurrentToken())) {

                    log.warn("Old session detected for user {}", accountId);

                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                    response.setContentType("application/json");

                    response.getWriter().write("""
                        {
                          "message": "Your account was logged in on another device"
                        }
                    """);

                    return;
                }

                // ==========================
                // SET ROLE
                // ==========================

                List<GrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                accountId,
                                null,
                                authorities
                        );

                authentication.setDetails(email);

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                log.info("Authenticated user {}", accountId);
            }

        } catch (Exception ex) {

            log.error("JWT Authentication error", ex);

        }

        filterChain.doFilter(request, response);
    }

    // ===============================
    // EXTRACT TOKEN
    // ===============================

    private String extractJwtFromRequest(HttpServletRequest request) {

        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) &&
                bearerToken.startsWith("Bearer ")) {

            return bearerToken.substring(7);
        }

        return null;
    }

    // ===============================
    // VALIDATE TOKEN
    // ===============================

    private boolean validateToken(String token) {

        try {

            Jwts.parser()
                    .setSigningKey(
                            Keys.hmacShaKeyFor(jwtKey.getBytes(StandardCharsets.UTF_8))
                    )
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (Exception e) {

            log.error("Invalid JWT token: {}", e.getMessage());

            return false;
        }
    }

    // ===============================
    // GET CLAIMS
    // ===============================

    private Claims getClaims(String token) {

        return Jwts.parser()
                .setSigningKey(
                        Keys.hmacShaKeyFor(jwtKey.getBytes(StandardCharsets.UTF_8))
                )
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String getAccountIdFromToken(String token) {

        Claims claims = getClaims(token);

        return claims.get("accountId", String.class);
    }

    private String getEmailFromToken(String token) {

        Claims claims = getClaims(token);

        return claims.get("email", String.class);
    }

    private String getRoleFromToken(String token) {

        Claims claims = getClaims(token);

        return claims.get("role", String.class);
    }
}