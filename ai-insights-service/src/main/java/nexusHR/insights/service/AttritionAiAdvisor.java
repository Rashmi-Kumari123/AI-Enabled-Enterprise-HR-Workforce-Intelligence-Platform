package nexusHR.insights.service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import nexusHR.insights.dto.AiInsightResult;
import nexusHR.insights.dto.AttritionRiskAssessment;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.enums.AiProvider;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
@Slf4j
@Service
public class AttritionAiAdvisor {
    private final Optional<ChatModel> openAiChatModel;
    private final Optional<ChatModel> huggingFaceChatModel;
    public AttritionAiAdvisor(
            @Autowired(required = false) @Qualifier("openAiChatModel") ChatModel openAiChatModel,
            @Autowired(required = false) @Qualifier("huggingFaceChatModel") ChatModel huggingFaceChatModel) {
        this.openAiChatModel = Optional.ofNullable(openAiChatModel);
        this.huggingFaceChatModel = Optional.ofNullable(huggingFaceChatModel);
    }
    public AiInsightResult generateInsights(
            EmployeeWorkforceSnapshot snapshot, AttritionRiskAssessment assessment) {
        if (openAiChatModel.isPresent()) {
            return callModel(openAiChatModel.get(), AiProvider.OPENAI, snapshot, assessment);
        }
        if (huggingFaceChatModel.isPresent()) {
            return callModel(huggingFaceChatModel.get(), AiProvider.HUGGINGFACE, snapshot, assessment);
        }
        return heuristicInsights(snapshot, assessment);
    }
    private AiInsightResult callModel(
            ChatModel chatModel,
            AiProvider provider,
            EmployeeWorkforceSnapshot snapshot,
            AttritionRiskAssessment assessment) {
        try {
            String prompt = buildPrompt(snapshot, assessment);
            String content = chatModel
                    .call(new Prompt(new UserMessage(prompt)))
                    .getResult()
                    .getOutput()
                    .getText();
            return parseModelResponse(content, provider);
        } catch (Exception ex) {
            log.warn("AI provider {} failed, falling back to heuristic insights: {}", provider, ex.getMessage());
            return heuristicInsights(snapshot, assessment);
        }
    }
    private AiInsightResult heuristicInsights(
            EmployeeWorkforceSnapshot snapshot, AttritionRiskAssessment assessment) {
        List<String> recommendations = new ArrayList<>();
        switch (assessment.riskLevel()) {
            case HIGH -> {
                recommendations.add("Schedule a stay interview within 7 days with HR and direct manager");
                recommendations.add("Review compensation, role fit, and workload with leadership");
                recommendations.add("Assign a mentor or buddy and clarify growth path for next quarter");
            }
            case MEDIUM -> {
                recommendations.add("Conduct a 1:1 check-in focused on engagement and career goals");
                recommendations.add("Review recent performance feedback and address blockers");
                recommendations.add("Monitor attendance and leave patterns over the next 30 days");
            }
            default -> {
                recommendations.add("Maintain regular feedback cadence and recognition");
                recommendations.add("Continue quarterly performance conversations");
                recommendations.add("Keep monitoring workforce signals via NexusHR dashboards");
            }
        }
        String summary = String.format(
                "%s in %s shows %s attrition risk (score %d/100). Key drivers: %s.",
                snapshot.employeeName(),
                snapshot.department() != null ? snapshot.department() : "General",
                assessment.riskLevel().name().toLowerCase(),
                assessment.riskScore(),
                String.join("; ", assessment.riskFactors()));

        return new AiInsightResult(summary, recommendations, AiProvider.HEURISTIC, false);
    }
    private String buildPrompt(EmployeeWorkforceSnapshot snapshot, AttritionRiskAssessment assessment) {
        return """
                You are an HR workforce intelligence assistant for NexusHR.
                Analyze attrition risk and respond in plain text using this exact format:

                SUMMARY: <2 sentences>
                RECOMMENDATIONS:
                - <action 1>
                - <action 2>
                - <action 3>

                Employee: %s (%s)
                Tenure months: %d
                Employment status: %s
                Performance avg: %s (%d reviews)
                Leave approved days (12m): %d, pending requests: %d
                Attendance last 30d: %d present, %d absent
                Computed risk score: %d (%s)
                Risk factors: %s
                """
                .formatted(
                        snapshot.employeeName(),
                        snapshot.department() != null ? snapshot.department() : "N/A",
                        snapshot.tenureMonths(),
                        snapshot.employmentStatus(),
                        snapshot.averagePerformanceRating() != null
                                ? snapshot.averagePerformanceRating().toString()
                                : "N/A",
                        snapshot.totalReviews(),
                        snapshot.approvedLeaveDaysLast12Months(),
                        snapshot.pendingLeaveRequests(),
                        snapshot.presentDaysLast30(),
                        snapshot.absentDaysLast30(),
                        assessment.riskScore(),
                        assessment.riskLevel(),
                        String.join("; ", assessment.riskFactors()));
    }
    private AiInsightResult parseModelResponse(String content, AiProvider provider) {
        String summary = content;
        List<String> recommendations = new ArrayList<>();

        if (content != null) {
            int summaryIdx = content.indexOf("SUMMARY:");
            int recIdx = content.indexOf("RECOMMENDATIONS:");
            if (summaryIdx >= 0 && recIdx > summaryIdx) {
                summary = content.substring(summaryIdx + 8, recIdx).trim();
                String recBlock = content.substring(recIdx + 16).trim();
                for (String line : recBlock.split("\n")) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("-")) {
                        recommendations.add(trimmed.substring(1).trim());
                    } else if (!trimmed.isBlank()) {
                        recommendations.add(trimmed);
                    }
                }
            }
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Review engagement drivers with the employee's manager");
            recommendations.add("Validate compensation and growth expectations");
            recommendations.add("Track attendance, leave, and performance trends monthly");
        }
        if (summary == null || summary.isBlank()) {
            summary = "AI-generated attrition insight based on current workforce signals.";
        }
        return new AiInsightResult(summary, recommendations, provider, true);
    }
}
