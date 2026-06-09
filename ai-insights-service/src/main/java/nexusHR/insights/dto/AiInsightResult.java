package nexusHR.insights.dto;
import java.util.List;
import nexusHR.insights.enums.AiProvider;
public record AiInsightResult(String summary, List<String> recommendations, AiProvider provider, boolean aiEnabled) {}
