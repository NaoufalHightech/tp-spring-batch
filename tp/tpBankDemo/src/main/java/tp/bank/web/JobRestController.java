package tp.bank.web;

import java.util.Map;

import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import tp.bank.processor.BankTransactionAnalyticsItemProcessor;

@RestController
public class JobRestController {

	private final JobLauncher jobLauncher;
	private final Job job;
	private final BankTransactionAnalyticsItemProcessor analytics;

	public JobRestController(JobLauncher jobLauncher, Job job, BankTransactionAnalyticsItemProcessor analytics) {
		this.jobLauncher = jobLauncher;
		this.job = job;
		this.analytics = analytics;
	}

	/** Déclenche le job. Le paramètre startAt change à chaque appel : chaque lancement est une nouvelle JobInstance. */
	@GetMapping("/startJob")
	public BatchStatus load() throws Exception {
		JobParameters jobParameters = new JobParametersBuilder()
				.addLong("startAt", System.currentTimeMillis())
				.toJobParameters();
		JobExecution jobExecution = jobLauncher.run(job, jobParameters);
		while (jobExecution.isRunning()) {
			System.out.println("... job en cours d'exécution");
			Thread.sleep(200);
		}
		return jobExecution.getStatus();
	}

	@GetMapping("/analytics")
	public Map<String, Double> analytics() {
		return Map.of("totalDebit", analytics.getTotalDebit(), "totalCredit", analytics.getTotalCredit());
	}
}
