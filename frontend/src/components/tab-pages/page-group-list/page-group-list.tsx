import { Component, Fragment, h, State } from '@stencil/core';
import { BackendClient } from '../../../services/backendClient';
import * as models from '../../../models';

@Component({
    tag: 'page-group-list',
    styleUrl: 'page-group-list.scss',
    // shadow: true,
})
export class PageGroupList {
    @State()
    private groups: models.Group[] = [];

    @State()
    private isLoading: boolean = true;

    private get client(): BackendClient {
        return BackendClient.GetInstance();
    }

    public async componentDidLoad() {
        this.groups = await this.client
            .GetGroups()
            .finally(() => (this.isLoading = false));
    }

    public render() {
        return (
            <Fragment>
                <ion-header>
                    <ion-toolbar color="primary">
                        <ion-title>Group to draw</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    {this.renderLoader()}
                    {this.renderGroupList()}
                </ion-content>
            </Fragment>
        );
    }

    private renderGroupList = () => {
        if (this.isLoading) {
            return;
        }

        return <ion-list>{this.groups.map(this.renderItem)}</ion-list>;
    };

    private renderLoader = () => {
        if (!this.isLoading) {
            return;
        }

        return <ion-spinner name="dots"></ion-spinner>;
    };

    private renderItem = (group: models.Person) => {
        return (
            <ion-item href={`/draw/${group.id}`} key={group.name}>
                <ion-icon name="people-outline" slot="start" />
                <ion-label>{group.name}</ion-label>
            </ion-item>
        );
    };
}
