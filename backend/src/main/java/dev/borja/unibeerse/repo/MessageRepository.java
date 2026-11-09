package dev.borja.unibeerse.repo;

import dev.borja.unibeerse.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {}
