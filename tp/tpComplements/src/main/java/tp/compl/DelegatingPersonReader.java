package tp.compl;
import org.springframework.batch.item.*;
/** Pattern « custom reader » : read() est délégué à un sous-reader ouvert/fermé via le cycle de vie ItemStream. */
public class DelegatingPersonReader implements ItemStreamReader<Person> {
  private final ItemStreamReader<Person> delegate; public boolean opened, closed;
  public DelegatingPersonReader(ItemStreamReader<Person> d){delegate=d;}
  @Override public void open(ExecutionContext ec){ opened=true; delegate.open(ec); }
  @Override public Person read() throws Exception { return delegate.read(); }
  @Override public void update(ExecutionContext ec){ delegate.update(ec); }
  @Override public void close(){ closed=true; delegate.close(); }
}
