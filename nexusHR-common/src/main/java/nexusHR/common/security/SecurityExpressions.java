package nexusHR.common.security;

public final class SecurityExpressions {
  private SecurityExpressions() {}

  public static final String TENANT_ADMIN = "hasAnyRole('SUPER_ADMIN','ADMIN','HR')";
  public static final String TENANT_ADMIN_OR_IT = "hasAnyRole('SUPER_ADMIN','ADMIN','HR','IT_ADMIN')";
  public static final String PAYROLL_OPS = "hasAnyRole('SUPER_ADMIN','ADMIN','HR','PAYROLL')";
  public static final String MANAGEMENT = "hasAnyRole('SUPER_ADMIN','ADMIN','HR','MANAGER','PAYROLL')";
  public static final String WORKFORCE = "hasAnyRole('SUPER_ADMIN','ADMIN','HR','MANAGER','PAYROLL','EMPLOYEE')";
  public static final String ANALYTICS =
      "hasAnyRole('SUPER_ADMIN','ADMIN','HR','MANAGER','PAYROLL','EXECUTIVE')";
  public static final String EXECUTIVE_READ = "hasAnyRole('SUPER_ADMIN','ADMIN','HR','EXECUTIVE')";
}
