package dev.borja.unibeerse.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Avisa por Telegram (opcional). Nunca falla la peticion si Telegram no responde ni escribe el token en los logs. */
@Service
public class TelegramNotifier {

    private static final Logger log = LoggerFactory.getLogger(TelegramNotifier.class);

    private final String token;
    private final String chatId;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public TelegramNotifier(@Value("${app.telegram.token:}") String token,
                            @Value("${app.telegram.chat-id:}") String chatId) {
        this.token = token;
        this.chatId = chatId;
    }

    public void send(String text) {
        if (token.isBlank() || chatId.isBlank()) {
            return;
        }
        String body = "chat_id=" + URLEncoder.encode(chatId, StandardCharsets.UTF_8)
                + "&text=" + URLEncoder.encode(text, StandardCharsets.UTF_8);
        HttpRequest req = HttpRequest.newBuilder(URI.create("https://api.telegram.org/bot" + token + "/sendMessage"))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        http.sendAsync(req, HttpResponse.BodyHandlers.discarding()).whenComplete((res, err) -> {
            if (err != null || res.statusCode() >= 300) {
                log.warn("No se pudo avisar por Telegram ({})", err != null ? err.getClass().getSimpleName() : res.statusCode());
            }
        });
    }
}
