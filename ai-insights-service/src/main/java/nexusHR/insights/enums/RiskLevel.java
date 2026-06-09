package nexusHR.insights.enums;
public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH;

    public static RiskLevel fromScore(int score) {
        if (score >= 67) {
            return HIGH;
        }
        if (score >= 34) {
            return MEDIUM;
        }
        return LOW;
    }
}
