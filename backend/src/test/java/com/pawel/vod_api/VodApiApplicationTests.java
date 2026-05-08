package com.pawel.vod_api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Nadpisujemy parametry TYLKO dla tego testu
@SpringBootTest(properties = {
		"spring.jpa.hibernate.ddl-auto=update", // Kluczowe: Hibernate stworzy tabele, jeśli ich brakuje
		"spring.flyway.enabled=true",           // Upewniamy się, że Flyway jest włączony
		"spring.flyway.baseline-on-migrate=false" // Na czystym GitHubie nie chcemy baseline
})
class VodApiApplicationTests {

	@Test
	void contextLoads() {
		// Ten test sprawdza tylko, czy kontekst Springa wstaje.
		// Przy ddl-auto=update na pewno wstanie.
	}
}