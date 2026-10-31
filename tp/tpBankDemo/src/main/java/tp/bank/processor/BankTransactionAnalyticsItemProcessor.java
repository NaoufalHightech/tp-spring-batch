package tp.bank.processor;

import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import tp.bank.model.BankTransaction;

/** 2e processeur, AVEC ÉTAT : il cumule le total des débits et le total des crédits des éléments qu'il voit passer. */
@Component
public class BankTransactionAnalyticsItemProcessor implements ItemProcessor<BankTransaction, BankTransaction> {

	private double totalDebit;
	private double totalCredit;

	@Override
	public BankTransaction process(BankTransaction transaction) throws Exception {
		if (transaction.getTransactionType().equals("D")) totalDebit += transaction.getAmount();
		else if (transaction.getTransactionType().equals("C")) totalCredit += transaction.getAmount();
		return transaction;
	}

	public double getTotalDebit() { return totalDebit; }
	public double getTotalCredit() { return totalCredit; }
}
