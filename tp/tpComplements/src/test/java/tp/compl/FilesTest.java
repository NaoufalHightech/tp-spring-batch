package tp.compl;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.LineMapper;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.*;
import org.springframework.batch.item.file.transform.*;
import org.springframework.core.io.ByteArrayResource;

/** PDF §II.3.3 (positions fixes) et §II.3.4 (format hybride). */
class FilesTest {
  static final String FIXED =
      "Jean                              Bon                                           41   true\n"
    + "Alain                             Therieur                                      42   false\n";

  @Test void fixedWidth() throws Exception {
    // colonnes mesurées sur le fichier réel (le PDF donne 1-24, 25-48, 49-52, 53-58 pour son fichier)
    int l = FIXED.indexOf('\n');
    FlatFileItemReader<Person> r = new FlatFileItemReaderBuilder<Person>().name("fixed")
        .resource(new ByteArrayResource(FIXED.getBytes())).targetType(Person.class)
        .fixedLength().strict(false).columns(new Range(1,34), new Range(35,80), new Range(81,84), new Range(85,90))
        .names("firstName","lastName","age","active").build();
    r.open(new ExecutionContext());
    Person p1 = r.read(), p2 = r.read();
    assertThat(p1.getFirstName()).isEqualTo("Jean"); assertThat(p1.getLastName()).isEqualTo("Bon");
    assertThat(p1.getAge()).isEqualTo(41); assertThat(p1.isActive()).isTrue();
    assertThat(p2.getLastName()).isEqualTo("Therieur"); assertThat(p2.isActive()).isFalse();
    assertThat(r.read()).isNull();
    System.out.println("RESULT_FIXED " + p1 + " | " + p2 + " (longueur ligne=" + l + ")");
  }

  @Test void hybrid() throws Exception {
    String csv = "id;firstName;lastName;age;active;socialSecurityNumber;address\n"
      + "1;Jean;Bon;41;true;101020300400518;FRA!75001!Paris!rue_xy!2!1er etage\n"
      + "2;Axelle;Aire;33;true;201020300400565;FRA!76000!Rouen!rue xy!4!1er etage\n";
    var r = new FlatFileItemReaderBuilder<PersonWithNumAndAddress>().name("hyb")
        .resource(new ByteArrayResource(csv.getBytes())).linesToSkip(1)
        .lineMapper(new PersonWithNumAndAddressLineMapper()).build();
    r.open(new ExecutionContext());
    PersonWithNumAndAddress p = r.read();
    assertThat(p.getSocialSecurityNumber().getGenre()).isEqualTo("1");
    assertThat(p.getSocialSecurityNumber().getNumDepartementNaissance()).isEqualTo("03");
    assertThat(p.getSocialSecurityNumber().getClef()).isEqualTo("18");
    assertThat(p.getAddress().getTown()).isEqualTo("Paris");
    assertThat(p.getAddress().getComplements()).isEqualTo("1er etage");
    assertThat(r.read().getAddress().getTown()).isEqualTo("Rouen");
    System.out.println("RESULT_HYBRID ssn.dept=" + p.getSocialSecurityNumber().getNumDepartementNaissance() + " town=" + p.getAddress().getTown());
  }

  @Test void lignesDeTypesDifferents_PatternMatchingCompositeLineMapper() throws Exception {
    var tokH = new DelimitedLineTokenizer(); tokH.setNames("type","date");
    var tokD = new DelimitedLineTokenizer(); tokD.setNames("type","name","amount");
    var mapper = new PatternMatchingCompositeLineMapper<Object>();
    mapper.setTokenizers(java.util.Map.of("H*", tokH, "D*", tokD));
    FieldSetMapper<Object> fsm = fs -> fs.getFieldCount() == 2 ? "ENTETE:" + fs.readString("date") : "LIGNE:" + fs.readString("name");
    mapper.setFieldSetMappers(java.util.Map.of("H*", fsm, "D*", fsm));
    mapper.afterPropertiesSet();
    assertThat(mapper.mapLine("H,2024-01-01", 1)).isEqualTo("ENTETE:2024-01-01");
    assertThat(mapper.mapLine("D,riz,3.5", 2)).isEqualTo("LIGNE:riz");
    System.out.println("RESULT_PATTERN H*->entête, D*->ligne : OK");
  }
}
