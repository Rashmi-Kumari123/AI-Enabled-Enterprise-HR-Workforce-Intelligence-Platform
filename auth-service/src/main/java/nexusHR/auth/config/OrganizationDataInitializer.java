package nexusHR.auth.config;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.entity.SubscriptionPlan;
import nexusHR.auth.repository.OrganizationRepository;
import nexusHR.auth.repository.SubscriptionPlanRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
@Component
@Order(0)
@RequiredArgsConstructor
public class OrganizationDataInitializer implements ApplicationRunner {
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(ApplicationArguments args) {
        SubscriptionPlan starter = subscriptionPlanRepository
                .findByCode("STARTER")
                .orElseGet(() -> {
                    SubscriptionPlan plan = new SubscriptionPlan();
                    plan.setCode("STARTER");
                    plan.setName("Starter");
                    plan.setMaxSeats(50);
                    return subscriptionPlanRepository.save(plan);
                });

        if (!organizationRepository.existsBySlugIgnoreCase("nexushr")) {
            Organization organization = new Organization();
            organization.setName("NexusHR");
            organization.setSlug("nexushr");
            organization.setPlan(starter);
            organization.setSeatCount(0);
            organizationRepository.save(organization);
        }
    }
}
