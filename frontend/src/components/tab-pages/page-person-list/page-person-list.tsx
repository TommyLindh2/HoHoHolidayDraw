import { Component, Fragment, h, State } from '@stencil/core';
import { BackendClient } from '../../../services/backendClient';
import * as models from '../../../models';
import { DEFAULT_PROFILE_PICTURE } from '../../../config';

@Component({
    tag: 'page-person-list',
    styleUrl: 'page-person-list.scss',
    // shadow: true,
})
export class PagePersonList {
    @State()
    private persons: models.Person[] = [];

    @State()
    private isLoading: boolean = true;

    private get client(): BackendClient {
        return BackendClient.GetInstance();
    }

    public async componentDidLoad() {
        this.persons = await this.client
            .GetPersons()
            .finally(() => (this.isLoading = false));
    }

    public render() {
        return (
            <Fragment>
                <ion-header>
                    <ion-toolbar color="primary">
                        <ion-title>Persons</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    {this.renderLoader()}
                    {this.renderPersonList()}
                </ion-content>
            </Fragment>
        );
    }

    private renderPersonList = () => {
        if (this.isLoading) {
            return;
        }

        return <ion-list>{this.persons.map(this.renderItem)}</ion-list>;
    };

    private renderLoader = () => {
        if (!this.isLoading) {
            return;
        }

        return <ion-spinner name="dots"></ion-spinner>;
    };

    private renderItem = (person: models.Person) => {
        const pictureUrl = person?.pictureUrl || DEFAULT_PROFILE_PICTURE;

        return (
            <ion-item href={`/profile/${person.id}`} key={person.name}>
                <ion-avatar>
                    <img
                        alt={`Profile picture of ${person?.name}`}
                        src={pictureUrl}
                    />
                </ion-avatar>
                <ion-label>{person.name}</ion-label>
            </ion-item>
        );
    };
}
