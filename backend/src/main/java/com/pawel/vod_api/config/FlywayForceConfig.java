package com.pawel.vod_api.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayForceConfig {

    @Bean
    public Flyway flyway(DataSource dataSource) {
        System.out.println("🚀 [FLYWAY] Wymuszam ręczny start migracji...");

        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("1")
                .load();

        // Jawne wywołanie migracji w momencie tworzenia bean'a
        flyway.migrate();

        System.out.println("✅ [FLYWAY] Zakończono sprawdzanie/aktualizację bazy.");
        return flyway;
    }
}