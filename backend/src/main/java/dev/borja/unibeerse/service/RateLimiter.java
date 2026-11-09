package dev.borja.unibeerse.service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/** Limitador de ventana deslizante en memoria (suficiente para una sola instancia). */
public class RateLimiter {

    private final int max;
    private final long windowNanos;
    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimiter(int max, Duration window) {
        this.max = max;
        this.windowNanos = window.toNanos();
    }

    /** true si la peticion cabe en el limite (y la cuenta); false si hay que rechazarla. */
    public boolean tryAcquire(String key) {
        long now = System.nanoTime();
        Deque<Long> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > windowNanos) {
                q.pollFirst();
            }
            if (q.size() >= max) {
                return false;
            }
            q.addLast(now);
            return true;
        }
    }
}
