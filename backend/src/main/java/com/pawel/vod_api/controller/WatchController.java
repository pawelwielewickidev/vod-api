package com.pawel.vod_api.controller;

import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.repository.MovieRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/watch")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class WatchController {

    private final EpisodeRepository episodeRepository;
    private final MovieRepository movieRepository;

    @GetMapping("/{episodeId}")
    public void streamVideo(@PathVariable Long episodeId, HttpServletRequest request, HttpServletResponse response) {
        System.out.println("DEBUG: Próba streamowania dla ID: " + episodeId);

        Episode episode = episodeRepository.findById(episodeId)
                .orElseGet(() -> {
                    System.out.println("DEBUG: NIE ZNALEZIONO ODCINKA W BAZIE!");
                    return null;
                });

        if (episode == null) {
            response.setStatus(404);
            return;
        }

        String remoteUrl = episode.getVideoFilePath();
        System.out.println("DEBUG: Link z bazy to: " + remoteUrl);

        if (remoteUrl == null || remoteUrl.isEmpty()) {
            System.out.println("DEBUG: LINK JEST PUSTY!");
            response.setStatus(404);
            return;
        }
        try {
            URL url = new URL(remoteUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();


            String rangeHeader = request.getHeader("Range");
            if (rangeHeader != null) {
                connection.setRequestProperty("Range", rangeHeader);
            }

            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setRequestProperty("Referer", "https://shinden.pl/");


            response.setStatus(connection.getResponseCode());
            response.setHeader("Accept-Ranges", "bytes");

            connection.getHeaderFields().forEach((header, values) -> {
                if (header != null && !header.equalsIgnoreCase("Transfer-Encoding")) {
                    response.setHeader(header, values.get(0));
                }
            });

            // Pompowanie bajtów
            try (InputStream is = connection.getInputStream();
                 OutputStream os = response.getOutputStream()) {
                is.transferTo(os);
            }
        } catch (Exception e) {
            response.setStatus(416);
        }
    }
}
