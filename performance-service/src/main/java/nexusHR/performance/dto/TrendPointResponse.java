package nexusHR.performance.dto;
import java.math.BigDecimal;
public record TrendPointResponse(Integer reviewYear, Integer reviewQuarter, BigDecimal averageRating) {}
