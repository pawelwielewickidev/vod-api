package com.pawel.vod_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "playback_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"profile_id", "episode_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id", nullable = false)
    private Episode episode;

    // Gdzie użytkownik skończył oglądanie odcinka, w sekundach
    @Column(nullable = false)
    private Integer timestampSeconds;

    // Flaga, czy odcinek został obejrzany do końca, np. 90% czasu trwania
    @Column(nullable = false)
    private boolean completed = false;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}