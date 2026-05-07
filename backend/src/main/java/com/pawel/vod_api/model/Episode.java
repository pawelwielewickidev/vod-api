package com.pawel.vod_api.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "episodes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Episode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    private String title;

    private Integer episodeNumber;

    @Column(columnDefinition = "TEXT")
    private String videoFilePath;

    @JsonProperty("shindenUrl")
    private String shindenUrl;

    @Column(columnDefinition = "TEXT")
    private String sourceEmbedUrl;

    @Column(columnDefinition = "TEXT")
    private String epDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    @JsonIgnore
    private Movie movie;
}