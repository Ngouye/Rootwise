package sn.cryptoplatform;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/** Échoue si un module utilise le code interne d'un autre ou si des dépendances forment un cycle. */
class ModularityTests {

	static final ApplicationModules modules = ApplicationModules.of(ApiApplication.class);

	@Test
	void verifiesModularStructure() {
		modules.verify();
	}

	@Test
	void writesModuleDocumentation() {
		// Diagrammes PlantUML générés dans target/spring-modulith-docs
		new Documenter(modules).writeDocumentation();
	}

}
