package com.webtruyenapi.service.admin;

import com.webtruyenapi.dto.admin.UserManagementDTO;
import com.webtruyenapi.entity.Account;
import com.webtruyenapi.entity.AccountStatus;
import com.webtruyenapi.entity.Role;
import com.webtruyenapi.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AccountRepository accountRepository;

    public Page<UserManagementDTO> getUsers(int page, int size){

        Pageable pageable = PageRequest.of(page,size);

        return accountRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public Page<UserManagementDTO> searchUsers(String email,int page,int size){

        Pageable pageable = PageRequest.of(page,size);

        return accountRepository
                .findByMailContainingIgnoreCase(email,pageable)
                .map(this::convertToDTO);
    }

    public void banUser(String accountId){

        Account account = accountRepository.findById(accountId)
                .orElseThrow();

        account.setStatus(AccountStatus.BANNED);

        accountRepository.save(account);
    }

    public void unbanUser(String accountId){

        Account account = accountRepository.findById(accountId)
                .orElseThrow();

        account.setStatus(AccountStatus.ACTIVE);

        accountRepository.save(account);
    }

    public void deleteUser(String accountId){

        accountRepository.deleteById(accountId);

    }

    public void changeRole(String accountId, Role role){

        Account account = accountRepository.findById(accountId)
                .orElseThrow();

        account.setRole(role);

        accountRepository.save(account);
    }

    private UserManagementDTO convertToDTO(Account account){

        return new UserManagementDTO(
                account.getAccountId(),
                account.getMail(),
                account.getUserName(),
                account.getRole().name(),
                account.getStatus().name()
        );
    }

}