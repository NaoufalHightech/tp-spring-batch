package tp.compl;
public class Employee extends Person {
  private Long id; private String function; private double salary;
  public Employee(){}
  public Employee(String f,String l,int a,String fn,double s){super(f,l,a,true);function=fn;salary=s;}
  public Long getId(){return id;} public void setId(Long v){id=v;}
  public String getFunction(){return function;} public void setFunction(String v){function=v;}
  public double getSalary(){return salary;} public void setSalary(double v){salary=v;}
}
