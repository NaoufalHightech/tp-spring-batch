package tp.prod;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.infrastructure.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class FirstJobConfig {
  private static final Logger log = LoggerFactory.getLogger(FirstJobConfig.class);

  /** Compteur et verrou partagés : uniquement pour les démonstrations des tests. */
  public static final AtomicInteger EXECUTIONS = new AtomicInteger();
  public static volatile CountDownLatch gate = new CountDownLatch(0);

  @Bean
  Tasklet firstTasklet() {
    return (contribution, chunkContext) -> {
      EXECUTIONS.incrementAndGet();
      log.info("Bonjour depuis le step {}", contribution.getStepExecution().getStepName());
      gate.await();                       // en production : le vrai traitement
      return RepeatStatus.FINISHED;
    };
  }

  @Bean
  Step firstStep(JobRepository jobRepository, PlatformTransactionManager tx, Tasklet firstTasklet) {
    return new StepBuilder("firstStep", jobRepository).tasklet(firstTasklet, tx).build();
  }

  @Bean
  Job firstJob(JobRepository jobRepository, Step firstStep) {
    return new JobBuilder("firstJob", jobRepository).start(firstStep).build();
  }
}
