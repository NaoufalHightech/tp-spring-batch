package tp.tpSpringBatch.job.java;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.FlowBuilder;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.flow.Flow;
import org.springframework.batch.core.job.flow.support.SimpleFlow;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.task.SimpleAsyncTaskExecutor;

/*
 * Complément de formation : exécution de plusieurs "flows" EN PARALLÈLE (split),
 * puis enchaînement d'un step final une fois les deux flows terminés.
 *
 *   flow1 : step1 -> step2        flow2 : step3
 *          \____ en parallèle (split) ____/
 *                      |
 *                    step4
 *
 * Différence avec les partitions : ici ce sont des étapes DIFFÉRENTES qui s'exécutent en parallèle ;
 * avec une partition, c'est le MÊME step qui s'exécute sur des plages de données différentes.
 */
@Configuration
@Profile("!xmlJobConfig")
public class ParallelFlowsJobConfig extends MyAbstractJobConfig {

	/** trace "nom du step @ nom du thread" (utile pour vérifier le parallélisme, thread-safe) */
	public static final Queue<String> EXECUTED_STEPS = new ConcurrentLinkedQueue<>();

	private Step printThreadStep(String stepName) {
		return new StepBuilder(stepName, jobRepository)
				.tasklet((contribution, chunkContext) -> {
					EXECUTED_STEPS.add(stepName + "@" + Thread.currentThread().getName());
					System.out.println(">>>>> " + stepName + " execute par le thread " + Thread.currentThread().getName());
					return RepeatStatus.FINISHED;
				}, batchTxManager)
				.build();
	}

	@Bean(name = "parallelFlowsJob")
	public Job parallelFlowsJob() {
		Flow flow1 = new FlowBuilder<SimpleFlow>("flow1").start(printThreadStep("step1")).next(printThreadStep("step2")).build();
		Flow flow2 = new FlowBuilder<SimpleFlow>("flow2").start(printThreadStep("step3")).build();
		return new JobBuilder("parallelFlowsJob", jobRepository)
				.start(flow1)
				.split(new SimpleAsyncTaskExecutor("flows-")) // les flows suivants (add) s'exécutent en parallèle de flow1
				.add(flow2)
				.next(printThreadStep("step4")) // exécuté seulement quand flow1 ET flow2 sont terminés
				.end()
				.build();
	}
}
