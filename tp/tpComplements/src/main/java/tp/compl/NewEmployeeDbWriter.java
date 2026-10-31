package tp.compl;
import javax.sql.DataSource;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.jdbc.support.GeneratedKeyHolder;
/** Writer personnalisé : écrit dans 2 tables, la 2e a besoin de la clé auto-incrémentée de la 1re. */
public class NewEmployeeDbWriter implements ItemWriter<Employee> {
  private final NamedParameterJdbcTemplate jdbc;
  public NewEmployeeDbWriter(DataSource ds){ jdbc = new NamedParameterJdbcTemplate(ds); }
  @Override public void write(Chunk<? extends Employee> chunk) {
    for (Employee e : chunk) {
      var holder = new GeneratedKeyHolder();
      jdbc.update("INSERT INTO person(first_name,last_name,age,is_active) VALUES (:f,:l,:a,:act)",
          new MapSqlParameterSource().addValue("f",e.getFirstName()).addValue("l",e.getLastName()).addValue("a",e.getAge()).addValue("act",e.isActive()),
          holder, new String[]{"id"});
      e.setId(holder.getKey().longValue());
      jdbc.update("INSERT INTO functions(id,function,salary) VALUES (:id,:fn,:s)",
          new MapSqlParameterSource().addValue("id",e.getId()).addValue("fn",e.getFunction()).addValue("s",e.getSalary()));
    }
  }
}
