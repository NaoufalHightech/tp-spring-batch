package tp.bank.config;

import java.util.List;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.LineMapper;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.support.CompositeItemProcessor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.transaction.PlatformTransactionManager;

import tp.bank.model.BankTransaction;
import tp.bank.processor.BankTransactionAnalyticsItemProcessor;
import tp.bank.processor.BankTransactionItemProcessor;

@Configuration
public class SpringBatchConfig {

	@Bean
	public Job bankJob(JobRepository jobRepository, Step stepLoadData) {
		return new JobBuilder("bankJob", jobRepository)
				.start(stepLoadData)
				.build();
	}

	@Bean
	public Step stepLoadData(JobRepository jobRepository, PlatformTransactionManager transactionManager,
			ItemReader<BankTransaction> reader,
			@Qualifier("compositeItemProcessor") ItemProcessor<BankTransaction, BankTransaction> processor,
			ItemWriter<BankTransaction> writer) {
		return new StepBuilder("stepLoadData", jobRepository)
				.<BankTransaction, BankTransaction>chunk(100, transactionManager)   // 100 éléments par transaction
				.reader(reader)
				.processor(processor)
				.writer(writer)
				.build();
	}

	@Bean
	public FlatFileItemReader<BankTransaction> flatFileItemReader(@Value("${input.file}") Resource inputFile) {
		FlatFileItemReader<BankTransaction> reader = new FlatFileItemReader<>();
		reader.setName("flatFileItemReader");   // obligatoire : sert à mémoriser la position pour la reprise
		reader.setLinesToSkip(1);               // on saute la ligne d'en-tête
		reader.setResource(inputFile);
		reader.setLineMapper(lineMapper());
		return reader;
	}

	@Bean
	public LineMapper<BankTransaction> lineMapper() {
		DefaultLineMapper<BankTransaction> lineMapper = new DefaultLineMapper<>();
		DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
		tokenizer.setDelimiter(",");
		tokenizer.setStrict(false);
		tokenizer.setNames("id", "accountNumber", "strTransactionDate", "transactionType", "amount");
		lineMapper.setLineTokenizer(tokenizer);
		BeanWrapperFieldSetMapper<BankTransaction> fieldSetMapper = new BeanWrapperFieldSetMapper<>();
		fieldSetMapper.setTargetType(BankTransaction.class);
		lineMapper.setFieldSetMapper(fieldSetMapper);
		return lineMapper;
	}

	/** Enchaîne les deux processeurs : le résultat du 1er devient l'entrée du 2e. */
	@Bean
	public ItemProcessor<BankTransaction, BankTransaction> compositeItemProcessor(
			BankTransactionItemProcessor dateProcessor, BankTransactionAnalyticsItemProcessor analyticsProcessor) {
		CompositeItemProcessor<BankTransaction, BankTransaction> composite = new CompositeItemProcessor<>();
		composite.setDelegates(List.of(dateProcessor, analyticsProcessor));
		return composite;
	}
}
