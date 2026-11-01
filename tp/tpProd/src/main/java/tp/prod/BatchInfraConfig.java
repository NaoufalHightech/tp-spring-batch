package tp.prod;

import org.springframework.batch.core.configuration.annotation.EnableJdbcJobRepository;
import org.springframework.context.annotation.Configuration;

/** isolationLevelForCreate : on garde la valeur par défaut (SERIALIZABLE), qui protège contre deux lancements simultanés.
 * Le JobRepository est persisté dans PostgreSQL : c'est lui qui rend le batch reprenable et verrouillable. */
@Configuration
@EnableJdbcJobRepository(
    dataSourceRef = "dataSource",
    transactionManagerRef = "transactionManager",
    tablePrefix = "BATCH_")
public class BatchInfraConfig { }
