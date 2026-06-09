package nexusHR.insights.enums;
public enum GapPriority {
    CRITICAL,
    HIGH,
    MEDIUM,
    LOW;

    public static GapPriority fromGap(double gap) {
        if (gap >= 1.5) {
            return CRITICAL;
        }
        if (gap >= 1.0) {
            return HIGH;
        }
        if (gap >= 0.5) {
            return MEDIUM;
        }
        return LOW;
    }
}
