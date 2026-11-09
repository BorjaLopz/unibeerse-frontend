package dev.borja.unibeerse.web;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Le dice al frontend si la sesion actual es de administrador (solo para mostrar u ocultar el panel). */
@RestController
public class MeController {

    @GetMapping("/api/me")
    public Map<String, Boolean> me(Authentication auth) {
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return Map.of("admin", admin);
    }
}
