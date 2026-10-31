package tp.compl;
import org.springframework.batch.item.ItemProcessor;
public class FilterPersonByAgeProcessor implements ItemProcessor<Person,Person> {
  @Override public Person process(Person p) { return p.getAge() < 18 ? null : p; } // null = élément filtré
}
