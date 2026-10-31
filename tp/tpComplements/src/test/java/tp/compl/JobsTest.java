package tp.compl;
import static org.assertj.core.api.Assertions.*;
import java.util.List;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.DefaultJobParametersValidator;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.*;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.batch.item.support.ListItemWriter;
import org.springframework.batch.item.support.CompositeItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

/** PDF §III.1.3-1.4, §III.2, §IV.2.2, §IV.3, §IV.7.1, §II.2.1 */
@SpringBootTest
class JobsTest {
  @Autowired JobRepository repo; @Autowired JobLauncher launcher; @Autowired PlatformTransactionManager tx; @Autowired DataSource ds;

  static List<Person> people() { return List.of(new Person("Jean","Bon",41,true), new Person("Axelle","Aire",12,true), new Person("Alain","Therieur",42,false)); }

  Job job(String name, ItemReader<Person> r, ItemProcessor<Person,Person> p, ItemWriter<Person> w, boolean retry, JobExecutionListener l) {
    var sb = new StepBuilder(name+"Step", repo).<Person,Person>chunk(2, tx).reader(r);
    if (p != null) sb.processor(p);
    var s = sb.writer(w);
    Step step = retry ? s.faultTolerant().retryLimit(3).retry(MyProcessException.class).build() : s.build();
    var jb = new JobBuilder(name, repo).start(step);
    if (l != null) jb.listener(l);
    return jb.build();
  }
  JobParameters unique() { return new JobParametersBuilder().addLong("timeStampOfJobInstance", System.nanoTime()).toJobParameters(); }

  @Test void retry_reussit_apres_echecs() throws Exception {
    var proc = new FlakyUppercaseProcessor(2); var out = new ListItemWriter<Person>();
    var ex = launcher.run(job("retryOk", new ListItemReader<>(people()), proc, out, true, null), unique());
    var se = ex.getStepExecutions().iterator().next();
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    assertThat(out.getWrittenItems()).hasSize(3);
    assertThat(proc.calls.get()).isGreaterThan(3);   // des éléments ont été retraités
    System.out.println("RESULT_RETRY COMPLETED, appels processeur=" + proc.calls.get() + " pour 3 éléments, écrits=" + out.getWrittenItems().size() + " rollbacks=" + se.getRollbackCount());
  }
  @Test void retry_epuise_la_limite() throws Exception {
    var proc = new FlakyUppercaseProcessor(5); var out = new ListItemWriter<Person>();
    var ex = launcher.run(job("retryKo", new ListItemReader<>(people()), proc, out, true, null), unique());
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.FAILED);
    System.out.println("RESULT_RETRY_LIMITE FAILED après " + proc.calls.get() + " appels (retryLimit=3)");
  }
  @Test void sans_retry_le_step_echoue_tout_de_suite() throws Exception {
    var proc = new FlakyUppercaseProcessor(1); var out = new ListItemWriter<Person>();
    var ex = launcher.run(job("noRetry", new ListItemReader<>(people()), proc, out, false, null), unique());
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.FAILED);
    assertThat(proc.calls.get()).isEqualTo(1);
    System.out.println("RESULT_SANS_RETRY FAILED dès le 1er échec, appels=" + proc.calls.get());
  }

  @Test void filtrage_et_composition() throws Exception {
    var comp = new CompositeItemProcessor<Person,Person>();
    comp.setDelegates(List.<ItemProcessor<Person,Person>>of(new FilterPersonByAgeProcessor(), p -> new Person(p.getFirstName(), p.getLastName().toUpperCase(), p.getAge(), p.isActive())));
    var out = new ListItemWriter<Person>();
    var ex = launcher.run(job("filter", new ListItemReader<>(people()), comp, out, false, null), unique());
    var se = ex.getStepExecutions().iterator().next();
    assertThat(se.getReadCount()).isEqualTo(3); assertThat(se.getFilterCount()).isEqualTo(1); assertThat(se.getWriteCount()).isEqualTo(2);
    assertThat(out.getWrittenItems()).extracting(Person::getLastName).containsExactly("BON","THERIEUR");
    System.out.println("RESULT_FILTRE read=3 filter=1 write=2 -> " + out.getWrittenItems());
  }

  @Test void validation_des_parametres_et_instances() throws Exception {
    var out = new ListItemWriter<Person>();
    var j = new JobBuilder("validated", repo).start(new StepBuilder("vs", repo).<Person,Person>chunk(2, tx).reader(new ListItemReader<>(people())).writer(out).build())
        .validator(new DefaultJobParametersValidator(new String[]{"inputFilePath"}, new String[]{"timeStampOfJobInstance"})).build();
    assertThatThrownBy(() -> launcher.run(j, unique())).hasMessageContaining("inputFilePath");
    var p = new JobParametersBuilder().addString("inputFilePath","a.csv").toJobParameters();
    assertThat(launcher.run(j, p).getStatus()).isEqualTo(BatchStatus.COMPLETED);
    assertThatThrownBy(() -> launcher.run(j, p)).isInstanceOf(JobInstanceAlreadyCompleteException.class);
    var p2 = new JobParametersBuilder().addString("inputFilePath","a.csv").addLong("timeStampOfJobInstance", System.nanoTime()).toJobParameters();
    assertThat(launcher.run(j, p2).getStatus()).isEqualTo(BatchStatus.COMPLETED);
    System.out.println("RESULT_VALIDATION param manquant refusé ; mêmes paramètres relancés = JobInstanceAlreadyComplete ; paramètre horodaté = nouvelle instance");
  }

  @Test void listener_et_logs() throws Exception {
    var l = new LoggingListener(); var out = new ListItemWriter<Person>();
    var step = new StepBuilder("logStep", repo).<Person,Person>chunk(2, tx).reader(new ListItemReader<>(people())).writer(out).listener((StepExecutionListener) l).build();
    var ex = launcher.run(new JobBuilder("logJob", repo).start(step).listener(l).build(), unique());
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    assertThat(l.events).hasSize(4);
    assertThat(l.events.get(2)).contains("read=3").contains("write=3");
    l.events.forEach(e -> System.out.println("RESULT_LOG " + e));
  }

  @Test void reader_delegue_et_writer_deux_tables() throws Exception {
    var jdbc = new JdbcTemplate(ds);
    jdbc.execute("CREATE TABLE person(id BIGINT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), age INT, is_active BOOLEAN)");
    jdbc.execute("CREATE TABLE functions(id BIGINT PRIMARY KEY, function VARCHAR(50), salary DOUBLE)");
    var sub = new org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder<Employee>().name("sub")
        .resource(new org.springframework.core.io.ByteArrayResource("Jean,Bon,41,dev,3000\nAxelle,Aire,33,ops,3500\n".getBytes()))
        .delimited().names("firstName","lastName","age","function","salary").targetType(Employee.class).build();
    var delegating = new DelegatingEmployeeReader(sub);
    var step = new StepBuilder("empStep", repo).<Employee,Employee>chunk(1, tx).reader(delegating).writer(new NewEmployeeDbWriter(ds)).build();
    var ex = launcher.run(new JobBuilder("empJob", repo).start(step).build(), unique());
    assertThat(ex.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    assertThat(delegating.opened && delegating.closed).isTrue();
    assertThat(jdbc.queryForObject("select count(*) from person", Integer.class)).isEqualTo(2);
    assertThat(jdbc.queryForObject("select count(*) from person p join functions f on p.id=f.id", Integer.class)).isEqualTo(2);
    System.out.println("RESULT_CUSTOM reader délégué ouvert/fermé par le step ; 2 tables liées par la clé générée (2 lignes jointes)");
  }
  static class DelegatingEmployeeReader implements ItemStreamReader<Employee> {
    final ItemStreamReader<Employee> d; boolean opened, closed;
    DelegatingEmployeeReader(ItemStreamReader<Employee> d){this.d=d;}
    public void open(ExecutionContext c){opened=true;d.open(c);} public Employee read() throws Exception {return d.read();}
    public void update(ExecutionContext c){d.update(c);} public void close(){closed=true;d.close();}
  }
}
