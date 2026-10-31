package tp.compl;
import java.util.*;
import org.slf4j.*;
import org.springframework.batch.core.*;
/** Listener + slf4j : une trace par exécution de job et de step (aussi mémorisée pour les tests). */
public class LoggingListener implements JobExecutionListener, StepExecutionListener {
  private static final Logger log = LoggerFactory.getLogger(LoggingListener.class);
  public final List<String> events = new ArrayList<>();
  private void rec(String s){ events.add(s); log.info(s); }
  @Override public void beforeJob(JobExecution j){ rec("JOB START "+j.getJobInstance().getJobName()+" params="+j.getJobParameters()); }
  @Override public void afterJob(JobExecution j){ rec("JOB END "+j.getStatus()+" exit="+j.getExitStatus().getExitCode()); }
  @Override public void beforeStep(StepExecution s){ rec("STEP START "+s.getStepName()); }
  @Override public ExitStatus afterStep(StepExecution s){ rec("STEP END "+s.getStepName()+" read="+s.getReadCount()+" write="+s.getWriteCount()+" filter="+s.getFilterCount()); return s.getExitStatus(); }
}
