package com.webtruyenapi.repository;

import com.webtruyenapi.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByMail(String mail);
    Optional<Account> findByUserName(String userName);

    long countByCreatedAtAfter(LocalDateTime date);
    Page<Account> findByMailContainingIgnoreCase(String email, Pageable pageable);

    List<Account> findByStatusTrue();
    boolean existsByMail(String mail);
}
