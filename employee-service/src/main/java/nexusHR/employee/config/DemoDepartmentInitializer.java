package nexusHR.employee.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.employee.service.TenantDepartmentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoDepartmentInitializer implements ApplicationRunner {
    private final TenantDepartmentService tenantDepartmentService;

    @Value("${app.demo.tenant-id:1}")
    private long demoTenantId;

    @Override
    public void run(ApplicationArguments args) {
        tenantDepartmentService.seedDepartmentsForTenant(demoTenantId);
        log.info("Demo departments ready for tenant {}", demoTenantId);
    }
}
