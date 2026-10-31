package tp.tpSpringBatch.processor;

import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import tp.tpSpringBatch.model.Product;

/*
 * Complément de formation : processeur AVEC ÉTAT (il cumule des totaux de prix par catégorie).
 *
 * PIÈGE : si ce bean était un singleton, les totaux s'additionneraient d'une exécution à l'autre
 * (le job relancé afficherait le double). Avec @StepScope, une nouvelle instance est créée pour chaque
 * exécution du step : l'état repart de zéro.
 * L'état utile est en plus publié dans l'ExecutionContext du step (persisté par le JobRepository).
 */
@Component
@StepScope
public class ProductPriceAnalyticsProcessor implements ItemProcessor<Product, Product> {

	@Value("#{stepExecution}")
	private StepExecution stepExecution;

	public static String totalKey(String category) {
		return "totalPrice." + category;
	}

	@Override
	public Product process(Product p) throws Exception {
		String key = totalKey(p.getMain_category());
		double previous = stepExecution.getExecutionContext().getDouble(key, 0.0);
		stepExecution.getExecutionContext().putDouble(key, previous + p.getPrice());
		return p; // ne modifie pas l'élément : il observe seulement
	}
}
