package tp.tpSpringBatch.job;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.test.context.SpringBatchTest;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.junit.jupiter.api.Test;

import tp.tpSpringBatch.AbstractBasicActiveTestJob;
import tp.tpSpringBatch.config.AutomaticSpringBootBatchJobRepositoryConfig;
import tp.tpSpringBatch.job.java.ProductsCsvToConsoleWithCompositeJobConfig;
import tp.tpSpringBatch.processor.ProductPriceAnalyticsProcessor;
import tp.tpSpringBatch.processor.SimpleUppercaseProductProcessor;
import tp.tpSpringBatch.reader.java.MyCsvFileProductReaderConfig;
import tp.tpSpringBatch.writer.java.MyConsoleProductWriterConfig;

@Configuration
@EnableAutoConfiguration
@Import({AutomaticSpringBootBatchJobRepositoryConfig.class,
	ProductsCsvToConsoleWithCompositeJobConfig.class,
	MyCsvFileProductReaderConfig.class,
	MyConsoleProductWriterConfig.class,
	SimpleUppercaseProductProcessor.class,
	ProductPriceAnalyticsProcessor.class})
class FromCsvToConsoleWithCompositeTestConfig {
}

@SpringBatchTest
@SpringBootTest(classes = { FromCsvToConsoleWithCompositeTestConfig.class })
@ActiveProfiles(profiles = {})
public class TestFromCsvToConsoleWithCompositeJob extends AbstractBasicActiveTestJob {

	@Override
	public JobParametersBuilder initJobParametersWithBuilder(JobParametersBuilder b) {
		return b.addString("inputFilePath", "data/input/csv/products.csv");
	}

	private double total(JobExecution je, String category) {
		StepExecution se = je.getStepExecutions().iterator().next();
		return se.getExecutionContext().getDouble(ProductPriceAnalyticsProcessor.totalKey(category));
	}

	/** Le job relancé donne les MÊMES totaux : le processeur avec état est @StepScope (pas de cumul entre exécutions). */
	@Test
	public void totalsAreNotCumulatedBetweenTwoExecutions() throws Exception {
		JobExecution first = jobLauncherTestUtils.launchJob(initJobParameters());
		JobExecution second = jobLauncherTestUtils.launchJob(initJobParameters());
		assertEquals("COMPLETED", first.getExitStatus().getExitCode());
		assertEquals("COMPLETED", second.getExitStatus().getExitCode());
		// categories mises en majuscules par le 1er processeur du composite, puis cumulées par le 2e
		assertEquals(4.0, total(first, "ALIMENT"), 1e-9);    // 2.2 + 1.8
		assertEquals(20.45, total(first, "VETEMENT"), 1e-9); // 7.7 + 12.75
		assertEquals(total(first, "ALIMENT"), total(second, "ALIMENT"), 1e-9);
		assertEquals(total(first, "VETEMENT"), total(second, "VETEMENT"), 1e-9);
	}
}
