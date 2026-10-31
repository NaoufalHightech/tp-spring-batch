package tp.compl;
import org.springframework.batch.item.file.LineMapper;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.file.transform.*;
/** Format hybride : un CSV (;) dont deux colonnes se décomposent (positions fixes, sous-délimiteur "!"). */
public class PersonWithNumAndAddressLineMapper implements LineMapper<PersonWithNumAndAddress> {
  @Override
  public PersonWithNumAndAddress mapLine(String line, int lineNumber) throws Exception {
    var main = new DelimitedLineTokenizer();
    main.setDelimiter(";");
    main.setNames("id","firstName","lastName","age","active","socialSecurityNumber","address");
    FieldSet fs = main.tokenize(line);

    var ssnTok = new FixedLengthTokenizer();
    ssnTok.setNames("genre","anneeNaissance","numMoisNaissance","numDepartementNaissance","numCommuneNaissance","numOrdreNaissance","clef");
    ssnTok.setColumns(new Range(1,1), new Range(2,3), new Range(4,5), new Range(6,7), new Range(8,10), new Range(11,13), new Range(14,15));
    var ssnMapper = new BeanWrapperFieldSetMapper<SocialSecurityNumber>();
    ssnMapper.setTargetType(SocialSecurityNumber.class);
    SocialSecurityNumber ssn = ssnMapper.mapFieldSet(ssnTok.tokenize(fs.readString("socialSecurityNumber")));

    var addrTok = new DelimitedLineTokenizer();
    addrTok.setDelimiter("!");
    addrTok.setNames("countryCode","zip","town","street","number","complements");
    var addrMapper = new BeanWrapperFieldSetMapper<Address>();
    addrMapper.setTargetType(Address.class);
    Address addr = addrMapper.mapFieldSet(addrTok.tokenize(fs.readString("address")));

    var p = new PersonWithNumAndAddress();
    p.setId(fs.readLong("id")); p.setFirstName(fs.readString("firstName")); p.setLastName(fs.readString("lastName"));
    p.setAge(fs.readInt("age")); p.setActive(fs.readBoolean("active"));
    p.setSocialSecurityNumber(ssn); p.setAddress(addr);
    return p;
  }
}
