import { apiURL } from '../config';
import * as models from '../models';
import * as errors from '../errors';

import { HttpClient, HttpMethod } from './httpClient';

/** Fired on `window` after any successful create/update/delete. */
export const DATA_CHANGED_EVENT = 'hhdDataChanged';

export class BackendClient extends HttpClient {
    constructor(apiUrl: string) {
        super(apiUrl);
    }

    static _instance: BackendClient;

    public static GetInstance(): BackendClient {
        if (!BackendClient._instance) {
            BackendClient._instance = new BackendClient(apiURL);
        }
        return BackendClient._instance;
    }

    private request = async <T>(
        method: HttpMethod,
        uri: string,
        options?: { params?: Record<string, string>; body?: unknown }
    ): Promise<T> => {
        const response = await this.PerformRequest(
            method,
            uri,
            { params: options?.params },
            options?.body
        );
        if (!response.ok) {
            throw await errors.ResponseError.From(response);
        }

        if (method !== 'GET') {
            window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
        }

        return response.status === 204 ? (undefined as T) : response.json();
    };

    public GetPersons = async (): Promise<models.Person[]> => {
        const resp = await this.request<{ persons: models.Person[] }>(
            'GET',
            'api/person'
        );
        return resp.persons;
    };

    public GetPersonById = (id: number): Promise<models.Person> =>
        this.request('GET', `api/person/${id}`);

    public CreatePerson = (person: models.PersonInput): Promise<models.Person> =>
        this.request('POST', 'api/person', { body: person });

    public UpdatePerson = (
        id: number,
        update: models.PersonUpdate
    ): Promise<models.Person> =>
        this.request('PUT', `api/person/${id}`, { body: update });

    public DeletePerson = (id: number): Promise<void> =>
        this.request('DELETE', `api/person/${id}`);

    public GetGroups = async (): Promise<models.Group[]> => {
        const resp = await this.request<{ groups: models.Group[] }>(
            'GET',
            'api/group'
        );
        return resp.groups;
    };

    public GetGroupById = (id: number): Promise<models.Group> =>
        this.request('GET', `api/group/${id}`);

    public CreateGroup = (group: models.GroupInput): Promise<models.Group> =>
        this.request('POST', 'api/group', { body: group });

    public UpdateGroup = (
        id: number,
        update: Partial<models.GroupInput>
    ): Promise<models.Group> =>
        this.request('PUT', `api/group/${id}`, { body: update });

    public DeleteGroup = (id: number): Promise<void> =>
        this.request('DELETE', `api/group/${id}`);

    public GetPersonByGroupId = async (
        groupId: number
    ): Promise<models.Person[]> => {
        const resp = await this.request<{ persons: models.Person[] }>(
            'GET',
            `api/group/${groupId}/person`
        );
        return resp.persons;
    };

    /** Same seed on the same group members always gives the same result. */
    public GetDraw = (
        groupId: number,
        seed?: string
    ): Promise<models.DrawResult> =>
        this.request('GET', `api/group/${groupId}/draw`, {
            params: seed ? { seed } : undefined,
        });
}
