package nexusHR.payroll.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nexusHR.payroll.enums.PayslipStatus;

@Entity
@Table(name = "payslips")
@Getter
@Setter
@NoArgsConstructor
public class Payslip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String payslipNumber;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false, length = 32)
    private String employeeCode;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private Integer payYear;

    @Column(nullable = false)
    private Integer payMonth;

    @Column(nullable = false)
    private Integer workingDays;

    @Column(nullable = false)
    private Integer unpaidLeaveDays = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal hraAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal transportAllowance;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal otherAllowance;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal grossPay;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pfDeduction;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal professionalTax;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal incomeTax;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal leaveDeduction;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal netPay;

    @Column(nullable = false, length = 8)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PayslipStatus status = PayslipStatus.GENERATED;

    @Column(length = 255)
    private String generatedBy;

    @Column(nullable = false)
    private Instant generatedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (generatedAt == null) {
            generatedAt = now;
        }
        createdAt = now;
        updatedAt = now;
    }
    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
