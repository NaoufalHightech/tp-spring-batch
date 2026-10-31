package tp.tpSpringBatch.job;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.batch.test.context.SpringBatchTest;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import tp.tpSpringBatch.AbstractBasicActiveTestJob;
import tp.tpSpringBatch.config.AutomaticSpringBootBatchJobRepositoryConfig;
import tp.tpSpringBatch.job.java.ParallelFlowsJobConfig;

@Configuration
@EnableAutoConfiguration
@Import({AutomaticSpringBootBatchJobRepositoryConfig.class, ParallelFlowsJobConfig.class})
class ParallelFlowsTestConfig {
}

@SpringBatchTest
@SpringBootTest(classes = { ParallelFlowsTestConfig.class })
@ActiveProfiles(profiles = {})
public class TestParallelFlowsJob extends AbstractBasicActiveTestJob {

	@Override
	public void postJobCheckings() {
		List<String> executed = List.copyOf(ParallelFlowsJobConfig.EXECUTED_STEPS);
		assertEquals(4, executed.size(), "les 4 steps doivent avoir été exécutés : " + executed);
		// step4 est toujours le dernier : il attend la fin des deux flows
		assertTrue(executed.get(3).startsWith("step4@"), "step4 doit être exécuté en dernier : " + executed);
		// step1 et step3 appartiennent à des flows différents : ils tournent dans des threads différents
		String t1 = threadOf(executed, "step1"), t3 = threadOf(executed, "step3");
		Set<String> flowThreads = executed.stream().filter(s -> !s.startsWith("step4")).map(s -> s.split("@")[1]).collect(Collectors.toSet());
		assertTrue(!t1.equals(t3), "flow1 et flow2 doivent s'exécuter dans des threads différents : " + executed);
		assertEquals(2, flowThreads.size(), "2 threads pour les 2 flows : " + executed);
		// dans un même flow, step1 puis step2 restent séquentiels et dans le même thread
		assertEquals(t1, threadOf(executed, "step2"));
		assertTrue(executed.indexOf(prefixed(executed, "step1")) < executed.indexOf(prefixed(executed, "step2")));
	}

	private static String prefixed(List<String> l, String step) {
		return l.stream().filter(s -> s.startsWith(step + "@")).findFirst().orElseThrow();
	}

	private static String threadOf(List<String> l, String step) {
		return prefixed(l, step).split("@")[1];
	}
}
