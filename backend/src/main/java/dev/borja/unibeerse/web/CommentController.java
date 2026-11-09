package dev.borja.unibeerse.web;

import dev.borja.unibeerse.model.Comment;
import dev.borja.unibeerse.repo.BeerRepository;
import dev.borja.unibeerse.repo.CommentRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CommentController {

    public record CommentInput(String text) {}

    /** Lo que ve el publico: nunca el uid ni el email del autor. */
    public record CommentView(Long id, String authorName, String text, java.time.Instant createdAt, boolean legacy, boolean mine) {}

    private final CommentRepository comments;
    private final BeerRepository beers;

    public CommentController(CommentRepository comments, BeerRepository beers) {
        this.comments = comments;
        this.beers = beers;
    }

    /** "mine" solo es true si la peticion trae el token de quien escribio el comentario. */
    private static CommentView view(Comment c, Jwt jwt) {
        boolean mine = jwt != null && c.uid != null && c.uid.equals(jwt.getSubject());
        return new CommentView(c.id, c.authorName, c.text, c.createdAt, c.uid == null, mine);
    }

    @GetMapping("/api/beers/{beerId}/comments")
    public List<CommentView> list(@AuthenticationPrincipal Jwt jwt, @PathVariable Long beerId) {
        return comments.findByBeerIdOrderByCreatedAtAscIdAsc(beerId).stream().map(c -> view(c, jwt)).toList();
    }

    @PostMapping("/api/beers/{beerId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView create(@AuthenticationPrincipal Jwt jwt, @PathVariable Long beerId, @RequestBody CommentInput in) {
        if (!beers.existsById(beerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        String text = in == null || in.text() == null ? "" : in.text().trim();
        if (text.isEmpty() || text.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comentario debe tener entre 1 y 1000 caracteres");
        }
        Comment c = new Comment();
        c.beerId = beerId;
        c.uid = jwt.getSubject();
        c.authorName = displayName(jwt);
        c.text = text;
        return view(comments.save(c), jwt);
    }

    /** Puede borrarlo su autor o un administrador. */
    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth, @AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        Comment c = comments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !jwt.getSubject().equals(c.uid)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        comments.delete(c);
    }

    /** Nombre del token de Firebase; si no tiene, la parte local del email; si tampoco, "Anonimo". */
    static String displayName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name == null || name.isBlank()) {
            String email = jwt.getClaimAsString("email");
            name = email != null && email.contains("@") ? email.substring(0, email.indexOf('@')) : "Anónimo";
        }
        name = name.trim();
        return name.length() > 100 ? name.substring(0, 100) : name;
    }
}
