import { apiURL } from '../config';
import * as models from '../models';
import * as errors from '../errors';

import { HttpClient } from './httpClient';

export class BackendClient extends HttpClient {
  constructor(apiUrl: string) {
    super(apiUrl);
  }

  static _instance: BackendClient;

  public static GetInstance() {
    if (!BackendClient._instance) {
      BackendClient._instance = new BackendClient(apiURL);
    }
    return BackendClient._instance;
  }

  public GetPeople = async (): Promise<models.People[]> => {
    const response = await this.PerformRequest('GET', 'api/people');
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json().then(resp => resp.people);
  };

  public GetPeopleById = async (id: number): Promise<models.People> => {
    const response = await this.PerformRequest('GET', `api/people/${id}`);
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json();
  };
}
