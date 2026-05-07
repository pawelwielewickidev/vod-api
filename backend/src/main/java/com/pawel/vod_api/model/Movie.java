package com.pawel.vod_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;
    private Integer releaseDate;
    private String thumbnailPath;
    private String videoFilePath;
    @Column(length = 500)
    private String backgroundPath;
    private String logoPath;

    @Column(length = 500)
    private String tags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<Watchlist> watchlistedByProfile = new ArrayList<>();

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Episode> episodes = new ArrayList<>();

    @Column(name = "shinden_series_url")
    private String shindenSeriesUrlsRaw;

    public List<String> getShindenSeriesUrls() {
        if (this.shindenSeriesUrlsRaw == null || this.shindenSeriesUrlsRaw.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(this.shindenSeriesUrlsRaw.split(","));
    }

}
