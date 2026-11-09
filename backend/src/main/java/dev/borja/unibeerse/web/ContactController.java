package dev.borja.unibeerse.web;

import dev.borja.unibeerse.model.Message;
import dev.borja.unibeerse.repo.BeerRepository;
import dev.borja.unibeerse.repo.MessageRepository;
import dev.borja.unibeerse.service.RateLimiter;
import dev.borja.unibeerse.service.TelegramNotifier;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Formulario de contacto y de "reportar un problema" (sustituye a EmailJS). Publico, con antispam. */
@RestController
public class ContactController {

    public record ContactInput(String kind, Long beerId, String name, String email, String message, String website) {}

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]{1,64}@[^@\\s]{1,190}\\.[^@\\s]{2,}$");

    private final MessageRepository messages;
    private final BeerRepository beers;
    private final TelegramNotifier telegram;
    private final RateLimiter perIp = new RateLimiter(5, Duration.ofHours(1));
    private final RateLimiter global = new RateLimiter(40, Duration.ofHours(1));

    public ContactController(MessageRepository messages, BeerRepository beers, TelegramNotifier telegram) {
        this.messages = messages;
        this.beers = beers;
        this.telegram = telegram;
    }

    @PostMapping("/api/contact")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void send(@RequestBody ContactInput in, HttpServletRequest request) {
        if (in == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        // Campo trampa: las personas no lo ven; los bots lo rellenan. Respondemos OK sin guardar nada.
        if (in.website() != null && !in.website().isBlank()) {
            return;
        }
        String ip = request.getRemoteAddr(); // con forward-headers-strategy=framework ya es la IP real del cliente
        if (!perIp.tryAcquire(ip) || !global.tryAcquire("all")) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Demasiados mensajes, prueba mas tarde");
        }
        String kind = "issue".equals(in.kind()) ? "issue" : "contact";
        String name = clean(in.name(), 100, "El nombre");
        String email = clean(in.email(), 200, "El email");
        String text = clean(in.message(), 2000, "El mensaje");
        if (!EMAIL.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email no valido");
        }
        Long beerId = in.beerId() != null && beers.existsById(in.beerId()) ? in.beerId() : null;

        Message m = new Message();
        m.kind = kind;
        m.beerId = beerId;
        m.name = name;
        m.email = email;
        m.text = text;
        messages.save(m);

        String title = kind.equals("issue") ? "🐞 Problema en Unibeerse" : "✉️ Mensaje en Unibeerse";
        telegram.send(title + (beerId != null ? " (cerveza #" + beerId + ")" : "") + "\n" + name + " <" + email + ">\n\n" + text);
    }

    private static String clean(String v, int max, String field) {
        String t = v == null ? "" : v.trim();
        if (t.isEmpty() || t.length() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " es obligatorio (max " + max + " caracteres)");
        }
        return t;
    }
}
