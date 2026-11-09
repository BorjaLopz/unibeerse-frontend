package dev.borja.unibeerse.repo;

import dev.borja.unibeerse.model.Beer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeerRepository extends JpaRepository<Beer, Long> {
    List<Beer> findAllByOrderByIdAsc();
}
