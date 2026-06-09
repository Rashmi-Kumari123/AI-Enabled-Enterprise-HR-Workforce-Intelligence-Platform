package nexusHR.insights.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.huggingface.HuggingfaceChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
@Configuration
public class AiModelConfig {
    @Bean(name = "openAiChatModel")
    @ConditionalOnProperty(name = "app.ai.openai.enabled", havingValue = "true")
    ChatModel openAiChatModel(
            @Value("${spring.ai.openai.api-key}") String apiKey,
            @Value("${spring.ai.openai.chat.options.model}") String model,
            @Value("${spring.ai.openai.chat.options.temperature:0.2}") double temperature) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENAI_API_KEY is required when app.ai.openai.enabled=true");
        }
        OpenAiApi openAiApi = OpenAiApi.builder().apiKey(apiKey).build();
        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(OpenAiChatOptions.builder()
                        .model(model)
                        .temperature(temperature)
                        .build())
                .build();
    }
    @Bean(name = "huggingFaceChatModel")
    @ConditionalOnProperty(name = "app.ai.huggingface.enabled", havingValue = "true")
    ChatModel huggingFaceChatModel(
            @Value("${spring.ai.huggingface.api-key}") String apiKey,
            @Value("${spring.ai.huggingface.chat.options.model}") String model) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("HUGGINGFACE_API_KEY is required when app.ai.huggingface.enabled=true");
        }
        return new HuggingfaceChatModel(apiKey, model);
    }
}
