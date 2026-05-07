package com.pawel.vod_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiEnrichmentService {

    private final RestTemplate restTemplate;
    // Tworzymy ObjectMapper ręcznie
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key}")
    private String openAiApiKey;

    public record AiResult(String description, String tags) {}

    public AiResult enrichContent(String title, String originalSynopsis) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        String systemPrompt = "Jesteś ekspertem od filmów i seriali anime. Twoim zadaniem jest przetłumaczyć i uatrakcyjnić opis na język POLSKI (max 3-4 zdania). " +
                "Następnie wygeneruj od 3 do 6 celnych tagów w języku POLSKIM, oddzielonych przecinkami (np. 'Mroczne, Magia, Shounen, Tajemnica, Akcja'). " +
                "Odpowiedz WYŁĄCZNIE w formacie JSON o strukturze: {\"description\": \"...\", \"tags\": \"...\"}";

        String userPrompt = "Tytuł: " + title + "\nOryginalny opis: " + (originalSynopsis != null ? originalSynopsis : "Brak opisu, wymyśl coś chwytliwego na podstawie tytułu.");

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo-1106",
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int maxRetries = 3;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.println("🤖 Wzywam OpenAI dla: " + title + " (Próba " + attempt + "/" + maxRetries + ")...");
                Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String contentJson = (String) message.get("content");

                JsonNode rootNode = objectMapper.readTree(contentJson);
                String plDescription = rootNode.path("description").asText();
                String plTags = rootNode.path("tags").asText();

                return new AiResult(plDescription, plTags);

            } catch (HttpClientErrorException e) {
                System.err.println("🔥 BŁĄD OPENAI (Status " + e.getStatusCode() + "): " + e.getResponseBodyAsString());

                // Wyłapujemy błąd 429 Too Many Requests
                if (e.getStatusCode().value() == 429) {
                    System.err.println("⚠️ Limit zapytań OpenAI osiągnięty! Odczekuję 25 sekund i próbuję ponownie...");
                    try { Thread.sleep(25000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    return new AiResult(originalSynopsis, null); // Inny błąd - np. błędny klucz
                }
            } catch (Exception e) {
                System.err.println("❌ Nieznany błąd AI: " + e.getMessage());
                return new AiResult(originalSynopsis, null);
            }
        }

        System.err.println("❌ Poddaję się. Nie udało się przetłumaczyć '" + title + "' z powodu limitów.");
        return new AiResult(originalSynopsis, null);
    }
}