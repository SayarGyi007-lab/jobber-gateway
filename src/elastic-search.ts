import { winstonLogger } from "@sayargyi007-lab/jobber-shared";
import { Logger } from "winston";
import { config } from "@gateway/config";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGateway elastic search', 'debug')

class ElasticSearch {
    private elasticSearchClient: Client

    constructor() {
        this.elasticSearchClient = new Client({
            node: `${config.ELASTIC_SEARCH_URL}`
        })
    }

    public async checkConnection(): Promise<void> {
        let retries = 5
        let delay = 2000

        while (retries > 0) {
            try {
                const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({})
                log.info(`Gateway elasticsearch service: ${health.status}`)
                return;
            } catch (error) {
                log.error(`Elasticsearch connection failed. Retrying in ${delay / 1000}s`);
                log.log('error', 'Gateway Elasticsearch checkConnection() method:', error)

                await new Promise((resolve) => setTimeout(resolve, delay));

                retries -= 1;
                delay *= 2; // exponential backoff
            }
        }
        throw new Error('Elasticsearch connection failed after max retries at gateway');
    }
}

export const elastcisearch: ElasticSearch = new ElasticSearch()