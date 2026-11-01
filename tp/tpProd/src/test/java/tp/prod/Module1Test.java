package tp.prod;

import static org.assertj.core.api.Assertions.*;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.launch.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class Module1Test {
  @Autowired JdbcTemplate jdbc; @Autowired JobOperator jobOperator; @Autowired JobRepository repo; @Autowired Job firstJob;

  JobParameters params(String runDate) { return new JobParametersBuilder().addString("runDate", runDate).toJobParameters(); }
  String unique() { return "run-" + System.nanoTime(); }

  @BeforeEach void reset() { FirstJobConfig.gate = new CountDownLatch(0); }

  @Test void le_schema_batch_est_dans_postgresql() {
    String db = jdbc.queryForObject("select current_database() || ' / ' || split_part(version(),' ',1) || ' ' || split_part(version(),' ',2)", String.class);
    List<String> tables = jdbc.queryForList("select table_name from information_schema.tables where table_schema='public' and table_name like 'batch\\_%' order by 1", String.class);
    List<String> seqs = jdbc.queryForList("select sequence_name from information_schema.sequences where sequence_name like 'batch\\_%' order by 1", String.class);
    assertThat(tables).contains("batch_job_instance","batch_job_execution","batch_job_execution_params","batch_job_execution_context","batch_step_execution","batch_step_execution_context");
    System.out.println("RESULT_SCHEMA base=" + db + " tables=" + tables + " sequences=" + seqs);
  }

  @Test void un_job_laisse_des_traces_dans_les_tables() throws Exception {
    JobExecution ex = jobOperator.start(firstJob, params(unique()));
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    Integer steps = jdbc.queryForObject("select count(*) from batch_step_execution where job_execution_id=?", Integer.class, ex.getId());
    String status = jdbc.queryForObject("select status || '/' || exit_code from batch_job_execution where job_execution_id=?", String.class, ex.getId());
    Integer prm = jdbc.queryForObject("select count(*) from batch_job_execution_params where job_execution_id=?", Integer.class, ex.getId());
    assertThat(steps).isEqualTo(1); assertThat(prm).isEqualTo(1);
    System.out.println("RESULT_TRACES jobExecution=" + ex.getId() + " statut_en_base=" + status + " steps=" + steps + " params=" + prm);
  }

  @Test void meme_parametres_meme_instance() throws Exception {
    JobParameters p = params(unique());
    JobExecution first = jobOperator.start(firstJob, p);
    assertThat(first.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    assertThatThrownBy(() -> jobOperator.start(firstJob, p)).isInstanceOf(JobInstanceAlreadyCompleteException.class);
    JobExecution other = jobOperator.start(firstJob, params(unique()));
    assertThat(other.getJobInstance().getId()).isNotEqualTo(first.getJobInstance().getId());
    System.out.println("RESULT_INSTANCE même runDate relancé = JobInstanceAlreadyCompleteException ; runDate différent = instance " + other.getJobInstance().getId());
  }

  @Test void deux_lancements_simultanes_un_seul_passe() throws Exception {
    JobParameters p = params(unique());
    FirstJobConfig.gate = new CountDownLatch(1);               // le 1er lancement reste « en cours »
    AtomicReference<JobExecution> running = new AtomicReference<>();
    Thread t = new Thread(() -> { try { running.set(jobOperator.start(firstJob, p)); } catch (Exception e) { throw new RuntimeException(e); } });
    t.start();
    for (int i = 0; i < 100 && repo.findRunningJobExecutions("firstJob").isEmpty(); i++) Thread.sleep(50);
    assertThat(repo.findRunningJobExecutions("firstJob")).hasSize(1);
    assertThatThrownBy(() -> jobOperator.start(firstJob, p)).isInstanceOf(JobExecutionAlreadyRunningException.class);
    FirstJobConfig.gate.countDown();
    t.join(10000);
    assertThat(running.get().getStatus()).isEqualTo(BatchStatus.COMPLETED);
    System.out.println("RESULT_CONCURRENT 2e lancement des mêmes paramètres pendant que le 1er tourne = JobExecutionAlreadyRunningException (lu en base)");
  }

  @org.junit.jupiter.api.Disabled("Hypothèse infirmée à l'exécution : la copie périmée est resynchronisée avant l'écriture. Voir MODULE_1.md §3.4")
  @Test void verrouillage_optimiste_sur_la_ligne_d_execution() throws Exception {
    JobExecution done = jobOperator.start(firstJob, params(unique()));
    JobExecution copieA = repo.getJobExecution(done.getId());     // 2 « instances d'application » lisent la même ligne
    JobExecution copieB = repo.getJobExecution(done.getId());
    Integer v0 = jdbc.queryForObject("select version from batch_job_execution where job_execution_id=?", Integer.class, done.getId());
    repo.update(copieA);                                          // A écrit : version + 1
    Integer v1 = jdbc.queryForObject("select version from batch_job_execution where job_execution_id=?", Integer.class, done.getId());
    assertThat(v1).isEqualTo(v0 + 1);
    assertThatThrownBy(() -> repo.update(copieB)).isInstanceOf(OptimisticLockingFailureException.class);   // B lisait l'ancienne version
    System.out.println("RESULT_OPTIMISTE version " + v0 + " -> " + v1 + " ; la 2e écriture (version périmée) = OptimisticLockingFailureException");
  }
}
