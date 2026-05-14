ALTER TABLE playback_progress
    DROP CONSTRAINT IF EXISTS fk_playback_progress_movie;

ALTER TABLE playback_progress
    DROP CONSTRAINT IF EXISTS fk_playback_progress_episode;

ALTER TABLE playback_progress
    ADD CONSTRAINT fk_playback_progress_episode
        FOREIGN KEY (episode_id)
            REFERENCES episodes(id)
            ON DELETE CASCADE;