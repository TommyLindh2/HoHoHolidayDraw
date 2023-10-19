import { Component, Fragment, h, State } from '@stencil/core';
import { BackendClient } from '../../services/backendClient';
import * as models from '../../models';
import { DEFAULT_PROFILE_PICTURE } from '../../config';

@Component({
  tag: 'page-people-list',
  styleUrl: 'page-people-list.scss',
  // shadow: true,
})
export class PagePeopleList {
  @State()
  private peopleList: models.People[] = [];

  @State()
  private isLoading: boolean = true;

  private get client(): BackendClient {
    return BackendClient.GetInstance();
  }

  public async componentDidLoad() {
    this.peopleList = await this.client.GetPeople().finally(() => (this.isLoading = false));
  }

  public render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>People</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          {this.renderLoader()}
          {this.renderPeopleList()}
        </ion-content>
      </Fragment>
    );
  }

  private renderPeopleList = () => {
    if (this.isLoading) {
      return;
    }

    return <ion-list>{this.peopleList.map(this.renderItem)}</ion-list>;
  };

  private renderLoader = () => {
    if (!this.isLoading) {
      return;
    }

    return <ion-spinner name="dots"></ion-spinner>;
  };

  private renderItem = (people: models.People) => {
    const pictureUrl = people?.pictureUrl || DEFAULT_PROFILE_PICTURE;

    return (
      <ion-item href={`/profile/${people.id}`} key={people.name}>
        <ion-avatar>
          <img alt={`Profile picture of ${people?.name}`} src={pictureUrl} />
        </ion-avatar>
        <ion-label>{people.name}</ion-label>
      </ion-item>
    );
  };
}
