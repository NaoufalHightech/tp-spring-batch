package tp.compl;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.batch.item.ItemProcessor;
/** Échoue (MyProcessException) les `failuresPerItem` premières fois pour chaque élément, puis réussit. */
public class FlakyUppercaseProcessor implements ItemProcessor<Person,Person> {
  private final int failuresPerItem; public final AtomicInteger calls = new AtomicInteger();
  private final java.util.Map<String,Integer> seen = new java.util.HashMap<>();
  public FlakyUppercaseProcessor(int failuresPerItem){this.failuresPerItem=failuresPerItem;}
  @Override public Person process(Person p) {
    calls.incrementAndGet();
    int n = seen.merge(p.getLastName(), 1, Integer::sum);
    if (n <= failuresPerItem) throw new MyProcessException("échec simulé n°"+n+" pour "+p.getLastName());
    return new Person(p.getFirstName(), p.getLastName().toUpperCase(), p.getAge(), p.isActive());
  }
}
