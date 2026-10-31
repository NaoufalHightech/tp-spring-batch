package tp.bank;

import static org.hamcrest.Matchers.closeTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import tp.bank.dao.BankTransactionRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class BankJobTest {

	@Autowired MockMvc mockMvc;
	@Autowired BankTransactionRepository repository;

	@Test
	void jobLoadsCsvIntoDatabaseAndAnalyticsAccumulate() throws Exception {
		// 1er lancement par l'API REST
		mockMvc.perform(get("/startJob")).andExpect(status().isOk()).andExpect(content().string("\"COMPLETED\""));
		System.out.println("RESULT1 lignes en base = " + repository.count());
		assertEquals(8, repository.count());
		double debitInDb = repository.findAll().stream().filter(t -> t.getTransactionType().equals("D")).mapToDouble(t -> t.getAmount()).sum();
		System.out.println("RESULT2 somme des débits en base = " + debitInDb);
		assertEquals(937.15, debitInDb, 1e-9);
		mockMvc.perform(get("/analytics")).andExpect(jsonPath("$.totalDebit").value(closeTo(937.15, 1e-6))).andExpect(jsonPath("$.totalCredit").value(closeTo(4700.0, 1e-6)));
		System.out.println("RESULT3 après le 1er lancement : totalDebit=937.15 totalCredit=4700.0");

		// 2e lancement : même fichier. Le processeur d'analyse est un singleton avec état : les totaux S'ADDITIONNENT.
		mockMvc.perform(get("/startJob")).andExpect(status().isOk());
		assertEquals(8, repository.count());   // les 8 mêmes id : mises à jour, pas de doublon en base
		mockMvc.perform(get("/analytics")).andExpect(jsonPath("$.totalDebit").value(closeTo(1874.3, 1e-6))).andExpect(jsonPath("$.totalCredit").value(closeTo(9400.0, 1e-6)));
		System.out.println("RESULT4 après le 2e lancement : totalDebit=1874.3 totalCredit=9400.0 (le double : état conservé entre deux exécutions)");
	}
}
