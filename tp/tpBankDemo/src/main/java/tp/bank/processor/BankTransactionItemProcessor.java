package tp.bank.processor;

import java.text.SimpleDateFormat;

import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import tp.bank.model.BankTransaction;

/** 1er processeur : convertit la date lue en texte (jour/mois/année heure:minute) en vraie date. */
@Component
public class BankTransactionItemProcessor implements ItemProcessor<BankTransaction, BankTransaction> {

	@Override
	public BankTransaction process(BankTransaction transaction) throws Exception {
		// un SimpleDateFormat n'est pas sûr entre plusieurs threads : on en crée un par appel
		SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
		transaction.setTransactionDate(dateFormat.parse(transaction.getStrTransactionDate()));
		return transaction;
	}
}
