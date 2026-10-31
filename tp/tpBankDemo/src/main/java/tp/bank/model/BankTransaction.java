package tp.bank.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

@Entity
public class BankTransaction {
	@Id
	private Long id;
	private Long accountNumber;
	private String strTransactionDate;   // la date telle qu'elle est lue dans le fichier (texte)
	@Transient                           // non persistée : calculée par le processeur à partir du texte
	private Date transactionDate;
	private String transactionType;      // "D" = débit, "C" = crédit
	private double amount;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Long getAccountNumber() { return accountNumber; }
	public void setAccountNumber(Long accountNumber) { this.accountNumber = accountNumber; }
	public String getStrTransactionDate() { return strTransactionDate; }
	public void setStrTransactionDate(String strTransactionDate) { this.strTransactionDate = strTransactionDate; }
	public Date getTransactionDate() { return transactionDate; }
	public void setTransactionDate(Date transactionDate) { this.transactionDate = transactionDate; }
	public String getTransactionType() { return transactionType; }
	public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
	public double getAmount() { return amount; }
	public void setAmount(double amount) { this.amount = amount; }

	@Override
	public String toString() {
		return "BankTransaction [id=" + id + ", accountNumber=" + accountNumber + ", date=" + strTransactionDate
				+ ", type=" + transactionType + ", amount=" + amount + "]";
	}
}
