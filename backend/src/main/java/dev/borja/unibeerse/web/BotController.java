package dev.borja.unibeerse.web;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import dev.borja.unibeerse.model.Beer;
import dev.borja.unibeerse.repo.BeerRepository;
import dev.borja.unibeerse.service.MediaService;
import dev.borja.unibeerse.web.BeerController.BeerInput;

/**
 * API del bot de Telegram (solo accesible con la clave X-Bot-Key y solo desde la red interna de Docker:
 * nginx responde 404 a /api/bot/ desde internet).
 */
@RestController
@RequestMapping("/api/bot/beers")
public class BotController {

    public record ScoreInput(BigDecimal score) {}

    private final BeerRepository beers;
    private final MediaService media;

    public BotController(BeerRepository beers, MediaService media) {
        this.beers = beers;
        this.media = media;
    }

    private static String norm(String s) {
        return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .trim();
    }

    /** Busca por marca, nombre o estilo (sin acentos ni mayusculas; todas las palabras deben aparecer). Maximo 10. */
    @GetMapping("/search")
    public List<Beer> search(@RequestParam("q") String q) {
        String[] terms = norm(q).split("\\s+");
        return beers.findAllByOrderByIdAsc().stream()
                .filter(b -> {
                    String hay = norm(b.brand + " " + b.name + " " + b.style);
                    for (String t : terms) {
                        if (!t.isEmpty() && !hay.contains(t)) {
                            return false;
                        }
                    }
                    return true;
                })
                .limit(10)
                .toList();
    }

    /** Cervezas a las que les falta algo: what=image (sin foto) o what=score (sin nota). */
    @GetMapping("/missing")
    public List<Beer> missing(@RequestParam("what") String what) {
        boolean image = "image".equals(what);
        if (!image && !"score".equals(what)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "what debe ser image o score");
        }
        return beers.findAllByOrderByIdAsc().stream()
                .filter(b -> image ? (b.image == null || b.image.isBlank()) : b.score == null)
                .limit(50)
                .toList();
    }

    @GetMapping("/{id}")
    public Beer get(@PathVariable Long id) {
        return beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Beer create(@RequestBody BeerInput in) {
        Beer b = new Beer();
        BeerController.apply(b, in);
        return beers.save(b);
    }

    @PostMapping("/{id}/score")
    @Transactional
    public Beer score(@PathVariable Long id, @RequestBody ScoreInput in) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        BigDecimal s = in == null ? null : in.score();
        if (s != null && (s.doubleValue() < 0 || s.doubleValue() > 10)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nota debe estar entre 0 y 10");
        }
        b.score = s == null ? null : s.setScale(1, RoundingMode.HALF_UP);
        return beers.save(b);
    }

    @PostMapping("/{id}/image")
    @Transactional
    public Beer image(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String path = media.store(file);
        String oldImage = b.image;
        String oldThumb = b.thumb;
        b.image = path;
        b.thumb = null;
        Beer saved = beers.save(b);
        media.delete(oldImage);
        media.delete(oldThumb);
        return saved;
    }
}
