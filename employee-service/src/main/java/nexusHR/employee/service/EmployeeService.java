package nexusHR.employee.service;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.EmploymentStatus;
import nexusHR.common.tenant.TenantContext;
import nexusHR.employee.dto.DepartmentResponse;
import nexusHR.employee.dto.EmployeeProfileUpdateRequest;
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
        Long tenantId = TenantContext.requireTenantId();
        return employeeRepository.findAllByTenantId(tenantId).stream().map(this::toResponse).toList();
    }
    @Transactional(readOnly = true)
    public EmployeeResponse findById(Long id) {
        return toResponse(getEmployee(id));
    }
    @Transactional(readOnly = true)
    public EmployeeResponse findMyProfile(Long userId, String email) {
        Long tenantId = TenantContext.requireTenantId();
        if (userId != null) {
            return employeeRepository
                    .findByTenantIdAndUserId(tenantId, userId)
                    .map(this::toResponse)
                    .orElseGet(() -> findByEmail(email));
        }
        return findByEmail(email);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse findByEmail(String email) {
        Long tenantId = TenantContext.requireTenantId();
        return employeeRepository
                .findByTenantIdAndEmail(tenantId, email.toLowerCase().trim())
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No employee profile linked to this account"));
    }
    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        validateUniqueFields(null, request, tenantId);
        Employee employee = new Employee();
        employee.setTenantId(tenantId);
        applyRequest(employee, request);
        return toResponse(employeeRepository.save(employee));
    }
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = getEmployee(id);
        validateUniqueFields(id, request, employee.getTenantId());
        applyRequest(employee, request);
        return toResponse(employee);
    }
    @Transactional
    public EmployeeResponse updateMyProfile(Long userId, String email, EmployeeProfileUpdateRequest request) {
        Employee employee = resolveOwnedEmployee(userId, email);
        employee.setPhone(request.phone() != null ? request.phone().trim() : null);
        return toResponse(employee);
    }
    private Employee resolveOwnedEmployee(Long userId, String email) {
        Long tenantId = TenantContext.requireTenantId();
        if (userId != null) {
            return employeeRepository
                    .findByTenantIdAndUserId(tenantId, userId)
                    .orElseGet(() -> employeeRepository
                            .findByTenantIdAndEmail(tenantId, email.toLowerCase().trim())
                            .orElseThrow(() ->
                                    new ApiException(HttpStatus.NOT_FOUND, "No employee profile linked to this account")));
        }
        return employeeRepository
                .findByTenantIdAndEmail(tenantId, email.toLowerCase().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No employee profile linked to this account"));
    }
    @Transactional
    public EmployeeResponse updateMyProfile(String email, EmployeeProfileUpdateRequest request) {
        return updateMyProfile(null, email, request);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = getEmployee(id);
        employeeRepository.delete(employee);
    }
    @Transactional(readOnly = true)
    public List<DepartmentResponse> findAllDepartments() {
        Long tenantId = TenantContext.requireTenantId();
        return departmentRepository.findAllByTenantId(tenantId).stream().map(this::toDepartmentResponse).toList();
    }

    private Employee getEmployee(Long id) {
        Long tenantId = TenantContext.requireTenantId();
        return employeeRepository
                .findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
    private void validateUniqueFields(Long currentId, EmployeeRequest request, Long tenantId) {
        employeeRepository.findByTenantIdAndEmployeeCode(tenantId, request.employeeCode()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Employee code already exists");
            }
        });
        employeeRepository.findByTenantIdAndUserId(tenantId, request.userId()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "User already linked to an employee");
            }
        });
        employeeRepository.findByTenantIdAndEmail(tenantId, request.email().toLowerCase().trim()).ifPresent(existing -> {
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
        if (employee.getTenantId() == null && employee.getDepartment() != null) {
            employee.setTenantId(employee.getDepartment().getTenantId());
        }
        employee.setHireDate(request.hireDate());
        employee.setEmploymentStatus(
                request.employmentStatus() != null ? request.employmentStatus() : EmploymentStatus.ACTIVE);
    }

    private Department resolveDepartment(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        Department department = departmentRepository
                .findById(departmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
        Long tenantId = TenantContext.requireTenantId();
        if (!tenantId.equals(department.getTenantId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department not found");
        }
        return department;
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
                employee.isOnboardingCompleted(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }
    private DepartmentResponse toDepartmentResponse(Department department) {
        return new DepartmentResponse(
                department.getId(), department.getCode(), department.getName(), department.getDescription());
    }
}
