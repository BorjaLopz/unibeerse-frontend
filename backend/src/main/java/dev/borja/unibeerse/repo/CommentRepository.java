package dev.borja.unibeerse.repo;

import dev.borja.unibeerse.model.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBeerIdOrderByCreatedAtAscIdAsc(Long beerId);
}
