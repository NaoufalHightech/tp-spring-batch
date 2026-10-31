package tp.compl;
public class Person {
  private String firstName, lastName; private int age; private boolean active;
  public Person() {}
  public Person(String f, String l, int a, boolean act){firstName=f;lastName=l;age=a;active=act;}
  public String getFirstName(){return firstName;} public void setFirstName(String v){firstName=v;}
  public String getLastName(){return lastName;} public void setLastName(String v){lastName=v;}
  public int getAge(){return age;} public void setAge(int v){age=v;}
  public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
  @Override public String toString(){return firstName+" "+lastName+" ("+age+")";}
}
