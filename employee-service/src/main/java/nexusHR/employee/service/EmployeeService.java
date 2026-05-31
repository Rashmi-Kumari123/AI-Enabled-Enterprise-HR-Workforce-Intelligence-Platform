package nexusHR.employee.service;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.EmploymentStatus;
import nexusHR.employee.dto.DepartmentResponse;
import nexusHR.employee.dto.EmployeeRequest;
import nexusHR.employee.dto.EmployeeResponse;
import nexusHR.employee.entity.Department;
import nexusHR.employee.entity.Employee;
import nexusHR.employee.exception.ApiException;
import nexusHR.employee.repository.DepartmentRepository;
import nexusHR.employee.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }
    @Transactional(readOnly = true)
    public EmployeeResponse findById(Long id) {
        return toResponse(getEmployee(id));
    }
    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        validateUniqueFields(null, request);
        Employee employee = new Employee();
        applyRequest(employee, request);
        return toResponse(employeeRepository.save(employee));
    }
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = getEmployee(id);
        validateUniqueFields(id, request);
        applyRequest(employee, request);
        return toResponse(employee);
    }
    @Transactional
    public void delete(Long id) {
        Employee employee = getEmployee(id);
        employeeRepository.delete(employee);
    }
    @Transactional(readOnly = true)
    public List<DepartmentResponse> findAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toDepartmentResponse).toList();
    }
    private Employee getEmployee(Long id) {
        return employeeRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
    private void validateUniqueFields(Long currentId, EmployeeRequest request) {
        employeeRepository.findByEmployeeCode(request.employeeCode()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Employee code already exists");
            }
        });
        employeeRepository.findByUserId(request.userId()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "User already linked to an employee");
            }
        });
        employeeRepository.findByEmail(request.email().toLowerCase().trim()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
            }
        });
    }
    private void applyRequest(Employee employee, EmployeeRequest request) {
        employee.setUserId(request.userId());
        employee.setEmployeeCode(request.employeeCode().trim());
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(request.email().toLowerCase().trim());
        employee.setPhone(request.phone());
        employee.setDepartment(resolveDepartment(request.departmentId()));
        employee.setHireDate(request.hireDate());
        employee.setEmploymentStatus(
                request.employmentStatus() != null ? request.employmentStatus() : EmploymentStatus.ACTIVE);
    }

    private Department resolveDepartment(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        return departmentRepository
                .findById(departmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
    }

    private EmployeeResponse toResponse(Employee employee) {
        Department department = employee.getDepartment();
        return new EmployeeResponse(
                employee.getId(),
                employee.getUserId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                department != null ? department.getId() : null,
                department != null ? department.getName() : null,
                employee.getHireDate(),
                employee.getEmploymentStatus(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }
    private DepartmentResponse toDepartmentResponse(Department department) {
        return new DepartmentResponse(
                department.getId(), department.getCode(), department.getName(), department.getDescription());
    }
}
