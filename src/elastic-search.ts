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
        let isConnected = false;
    while(!isConnected){
        try {
            const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
            log.info(`Noti elasticsearch service: ${health.status}`)
            isConnected = true
        } catch (error) {
            log.error('Elasticsearch connection failed, retrying');
            log.log('error','Noti Elasticsearch checkConnection() method:', error)
        }
    }
    }
}

export const elastcisearch: ElasticSearch = new ElasticSearch()