package tp.tpSpringBatch.job.java;

import java.util.List;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.CompositeItemProcessor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import tp.tpSpringBatch.model.Product;
import tp.tpSpringBatch.processor.ProductPriceAnalyticsProcessor;
import tp.tpSpringBatch.processor.SimpleUppercaseProductProcessor;

/*
 * Complément de formation : CompositeItemProcessor = enchaînement de plusieurs processeurs
 * (le résultat du 1er devient l'entrée du 2e, etc.). Le composite est lui-même un ItemProcessor.
 */
@Configuration
@Profile("!xmlJobConfig")
public class ProductsCsvToConsoleWithCompositeJobConfig extends MyAbstractJobConfig {

	@Bean
	public Job fromCsvToConsoleWithCompositeJob(@Qualifier("csvToConsoleWithComposite") Step step1) {
		return new JobBuilder("fromCsvToConsoleWithCompositeJob", jobRepository).start(step1).build();
	}

	@Bean
	@Qualifier("upperThenAnalytics")
	public ItemProcessor<Product, Product> upperThenAnalyticsProcessor(
			SimpleUppercaseProductProcessor upperProcessor, ProductPriceAnalyticsProcessor analyticsProcessor) {
		var composite = new CompositeItemProcessor<Product, Product>();
		composite.setDelegates(List.of(upperProcessor, analyticsProcessor)); // ordre = ordre d'exécution
		return composite;
	}

	@Bean
	@Qualifier("csvToConsoleWithComposite")
	public Step stepCsvToConsoleWithComposite(@Qualifier("csv") ItemReader<Product> reader,
			@Qualifier("console") ItemWriter<Product> writer,
			@Qualifier("upperThenAnalytics") ItemProcessor<Product, Product> compositeProcessor) {
		return new StepBuilder("stepCsvToConsoleWithComposite", jobRepository)
				.<Product, Product>chunk(5, batchTxManager)
				.reader(reader)
				.processor(compositeProcessor)
				.writer(writer)
				.build();
	}
}
