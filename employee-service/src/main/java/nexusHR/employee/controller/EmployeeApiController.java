package nexusHR.employee.controller;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.employee.dto.DepartmentResponse;
import nexusHR.employee.service.EmployeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmployeeApiController {
    private final EmployeeService employeeService;

    @GetMapping("/api/v1/departments")
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentResponse> listDepartments() {
        return employeeService.findAllDepartments();
    }
}
