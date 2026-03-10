import { winstonLogger } from "@sayargyi007-lab/jobber-shared";
import { Logger } from "winston";
import { config } from "@gateway/config";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "apiGateway elastic search",
  "debug"
);

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;

    while (!isConnected) {
      try {
        const health: ClusterHealthResponse =
          await this.elasticSearchClient.cluster.health({});

        log.info(`Elasticsearch service status: ${health.status}`);
        isConnected = true;

      } catch (error) {
        log.error("Elasticsearch connection failed, retrying in 5 seconds...");
        log.log("error", "Elasticsearch checkConnection() method:", error);

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}

export const elasticsearch: ElasticSearch = new ElasticSearch();