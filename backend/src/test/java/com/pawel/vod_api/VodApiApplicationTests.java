package com.pawel.vod_api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Aktywacja profilu 'test'
class VodApiApplicationTests {

	@Test
	void contextLoads() {
		// Ten test sprawdza, czy kontekst Springa wstaje
		// przy użyciu konfiguracji z application-test.properties.
	}
}
