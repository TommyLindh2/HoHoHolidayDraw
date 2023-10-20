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

  public GetPersons = async (): Promise<models.Person[]> => {
    const response = await this.PerformRequest('GET', 'api/person');
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json().then(resp => resp.persons);
  };

  public GetPersonById = async (id: number): Promise<models.Person> => {
    const response = await this.PerformRequest('GET', `api/person/${id}`);
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json();
  };

  public GetGroups = async (): Promise<models.Group[]> => {
    const response = await this.PerformRequest('GET', `api/group`);
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json().then(resp => resp.groups);
  };

  public GetGroupById = async (id: number): Promise<models.Group> => {
    const response = await this.PerformRequest('GET', `api/group/${id}`);
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json();
  };

  public GetPersonByGroupId = async (groupId: number): Promise<models.Person[]> => {
    const response = await this.PerformRequest('GET', `api/group/${groupId}/person`);
    if (!response.ok) {
      throw new errors.ResponseError(response);
    }

    return response.json().then(resp => resp.persons);
  };
}
