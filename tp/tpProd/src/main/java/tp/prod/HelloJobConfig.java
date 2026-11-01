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
public class HelloJobConfig {
  private static final Logger log = LoggerFactory.getLogger(HelloJobConfig.class);

  /** Compteur et verrou partagés : uniquement pour les démonstrations des tests. */
  public static final AtomicInteger EXECUTIONS = new AtomicInteger();
  public static volatile CountDownLatch gate = new CountDownLatch(0);

  @Bean
  Tasklet helloTasklet() {
    return (contribution, chunkContext) -> {
      EXECUTIONS.incrementAndGet();
      log.info("Bonjour depuis le step {}", contribution.getStepExecution().getStepName());
      gate.await();                       // en production : le vrai traitement
      return RepeatStatus.FINISHED;
    };
  }

  @Bean
  Step helloStep(JobRepository jobRepository, PlatformTransactionManager tx, Tasklet helloTasklet) {
    return new StepBuilder("helloStep", jobRepository).tasklet(helloTasklet, tx).build();
  }

  @Bean
  Job helloJob(JobRepository jobRepository, Step helloStep) {
    return new JobBuilder("helloJob", jobRepository).start(helloStep).build();
  }
}
