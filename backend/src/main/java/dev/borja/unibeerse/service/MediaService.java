package dev.borja.unibeerse.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Guarda en disco las fotos que sube el administrador (nginx las sirve en /media/). */
@Service
public class MediaService {

    private static final long MAX_BYTES = 1_500_000;
    private static final Pattern NAME = Pattern.compile("^/media/[0-9a-f-]{36}\\.(webp|jpg|png)$");

    private final Path dir;

    public MediaService(@Value("${app.media.dir}") String dir) {
        this.dir = Path.of(dir).toAbsolutePath().normalize();
    }

    /** Valida (por los primeros bytes, no por el nombre ni el Content-Type) y devuelve la ruta publica "/media/xxx.ext". */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el archivo");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen pesa demasiado (max 1,5 MB)");
        }
        try {
            byte[] bytes = file.getBytes();
            String ext = detectExtension(bytes);
            if (ext == null) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Solo se admiten WebP, JPEG o PNG");
            }
            Files.createDirectories(dir);
            String name = UUID.randomUUID() + "." + ext;
            Files.write(dir.resolve(name), bytes);
            return "/media/" + name;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Borra una imagen subida. Ignora rutas que no sean de /media/ (las estaticas del frontend no se tocan). */
    public void delete(String publicPath) {
        if (publicPath == null || !NAME.matcher(publicPath).matches()) {
            return;
        }
        try {
            Files.deleteIfExists(dir.resolve(publicPath.substring("/media/".length())));
        } catch (IOException ignored) {
            // no es critico
        }
    }

    static String detectExtension(byte[] b) {
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "webp";
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "png";
        }
        return null;
    }
}
