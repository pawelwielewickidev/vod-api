package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.WatchdogEpisodeDto;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.repository.EpisodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EpisodeServiceTest {

    @Mock
    private EpisodeRepository episodeRepository;

    @InjectMocks
    private EpisodeService episodeService;

    private Episode existingEpisode;
    private WatchdogEpisodeDto watchdogEpisodeDto;

    @BeforeEach
    void setUp() {
        existingEpisode = new Episode();
        existingEpisode.setId(1L);
        existingEpisode.setEpisodeNumber(1);
        existingEpisode.setTitle("Test Episode");
        existingEpisode.setSourceEmbedUrl("old_embed_url");
        existingEpisode.setVideoFilePath("old_video_path");

        watchdogEpisodeDto = new WatchdogEpisodeDto(1L, "new_shinden_url", "new_embed_url", "new_video_path");
    }

    @Test
    void partialUpdate_shouldUpdateEpisode_whenEpisodeExists() {
        // given
        when(episodeRepository.findById(1L)).thenReturn(Optional.of(existingEpisode));
        when(episodeRepository.save(any(Episode.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Episode updatedEpisode = episodeService.partialUpdate(1L, watchdogEpisodeDto);

        // then
        assertNotNull(updatedEpisode);
        assertEquals("new_embed_url", updatedEpisode.getSourceEmbedUrl());
        assertEquals("new_video_path", updatedEpisode.getVideoFilePath());

        ArgumentCaptor<Episode> episodeCaptor = ArgumentCaptor.forClass(Episode.class);
        verify(episodeRepository).save(episodeCaptor.capture());
        Episode savedEpisode = episodeCaptor.getValue();

        assertEquals(1L, savedEpisode.getId());
        assertEquals("new_embed_url", savedEpisode.getSourceEmbedUrl());
        assertEquals("new_video_path", savedEpisode.getVideoFilePath());

        verify(episodeRepository, times(1)).findById(1L);
        verify(episodeRepository, times(1)).save(any(Episode.class));
    }

    @Test
    void partialUpdate_shouldThrowResourceNotFoundException_whenEpisodeDoesNotExist() {
        // given
        when(episodeRepository.findById(1L)).thenReturn(Optional.empty());

        // when & then
        assertThrows(ResourceNotFoundException.class, () -> {
            episodeService.partialUpdate(1L, watchdogEpisodeDto);
        });

        verify(episodeRepository, times(1)).findById(1L);
        verify(episodeRepository, never()).save(any(Episode.class));
    }

    @Test
    @Disabled("TODO: Enable this test after implementing syncDiscoveryData logic in EpisodeService")
    void syncDiscoveryData_shouldProcessListWithoutErrors() {
        // given
        // List<WatchdogEpisodeDto> dtoList = List.of(watchdogEpisodeDto);

        // when & then
        // assertDoesNotThrow(() -> episodeService.syncDiscoveryData(dtoList));

        // TODO: Add verification for repository calls once the method is implemented
    }
}
