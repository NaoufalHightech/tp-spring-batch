package tp.bank.writer;

import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import tp.bank.dao.BankTransactionRepository;
import tp.bank.model.BankTransaction;

/** Writer : reçoit la liste (le « chunk ») des éléments déjà traités et l'enregistre en base. */
@Component
public class BankTransactionItemWriter implements ItemWriter<BankTransaction> {

	private final BankTransactionRepository repository;

	public BankTransactionItemWriter(BankTransactionRepository repository) {
		this.repository = repository;
	}

	@Override
	public void write(Chunk<? extends BankTransaction> chunk) throws Exception {
		repository.saveAll(chunk.getItems());
	}
}
