package tp.compl;
public class PersonWithNumAndAddress extends Person {
  private SocialSecurityNumber socialSecurityNumber; private Address address; private Long id;
  public Long getId(){return id;} public void setId(Long v){id=v;}
  public SocialSecurityNumber getSocialSecurityNumber(){return socialSecurityNumber;} public void setSocialSecurityNumber(SocialSecurityNumber v){socialSecurityNumber=v;}
  public Address getAddress(){return address;} public void setAddress(Address v){address=v;}
}
