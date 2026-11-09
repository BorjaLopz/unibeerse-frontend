package dev.borja.unibeerse.web;

import dev.borja.unibeerse.model.Beer;
import dev.borja.unibeerse.repo.BeerRepository;
import dev.borja.unibeerse.service.MediaService;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class BeerController {

    public record BeerInput(String brand, String name, String style, BigDecimal abv, String country,
                            BigDecimal score, String notes) {}

    private static final CacheControl SHORT_CACHE = CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic();

    private final BeerRepository beers;
    private final MediaService media;

    public BeerController(BeerRepository beers, MediaService media) {
        this.beers = beers;
        this.media = media;
    }

    // ---- Publico ----

    /** Todo el catalogo de una vez (unos pocos cientos de cervezas): el navegador filtra y ordena al instante. */
    @GetMapping("/api/beers")
    public ResponseEntity<List<Beer>> list() {
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(beers.findAllByOrderByIdAsc());
    }

    @GetMapping("/api/beers/{id}")
    public ResponseEntity<Beer> get(@PathVariable Long id) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(b);
    }

    // ---- Administrador ----

    @PostMapping("/api/admin/beers")
    @ResponseStatus(HttpStatus.CREATED)
    public Beer create(@RequestBody BeerInput in) {
        Beer b = new Beer();
        apply(b, in);
        return beers.save(b);
    }

    @PutMapping("/api/admin/beers/{id}")
    @Transactional
    public Beer update(@PathVariable Long id, @RequestBody BeerInput in) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(b, in);
        return beers.save(b);
    }

    @DeleteMapping("/api/admin/beers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        beers.delete(b);
        media.delete(b.image);
        media.delete(b.thumb);
    }

    /** Sube/reemplaza la foto (el navegador ya la envia reducida y en WebP). */
    @PostMapping("/api/admin/beers/{id}/image")
    @Transactional
    public Beer uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Beer b = beers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String path = media.store(file);
        String oldImage = b.image;
        String oldThumb = b.thumb;
        b.image = path;
        b.thumb = null; // una sola imagen: el frontend usa "image" cuando no hay miniatura
        Beer saved = beers.save(b);
        media.delete(oldImage);
        media.delete(oldThumb);
        return saved;
    }

    private static String text(String v, String field, int max, boolean required) {
        String t = v == null ? "" : v.trim();
        if (required && t.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " es obligatorio");
        }
        if (t.length() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " no puede pasar de " + max + " caracteres");
        }
        return t;
    }

    private static BigDecimal range(BigDecimal v, String field, double min, double max, int scale) {
        if (v == null) {
            return null;
        }
        if (v.doubleValue() < min || v.doubleValue() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " debe estar entre " + min + " y " + max);
        }
        return v.setScale(scale, java.math.RoundingMode.HALF_UP);
    }

    static void apply(Beer b, BeerInput in) {
        if (in == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cuerpo vacio");
        }
        b.name = text(in.name(), "El nombre", 200, true);
        b.brand = text(in.brand(), "La marca", 120, false);
        b.style = text(in.style(), "El estilo", 100, false);
        b.country = text(in.country(), "El pais", 200, false);
        b.notes = text(in.notes(), "Los comentarios", 1000, false);
        b.abv = range(in.abv(), "La graduacion", 0, 99.9, 1);
        b.score = range(in.score(), "La nota", 0, 10, 1);
    }
}
