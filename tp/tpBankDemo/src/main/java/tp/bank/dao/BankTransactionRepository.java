package tp.bank.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import tp.bank.model.BankTransaction;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
}
