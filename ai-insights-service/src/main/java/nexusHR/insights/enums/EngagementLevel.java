package nexusHR.insights.enums;
public enum EngagementLevel {
    LOW,
    MODERATE,
    HIGH;

    public static EngagementLevel fromScore(int score) {
        if (score >= 70) {
            return HIGH;
        }
        if (score >= 40) {
            return MODERATE;
        }
        return LOW;
    }
}
