import { Component, Fragment, h, Prop, State } from '@stencil/core';
import * as models from '../../models';
import { BackendClient } from '../../services/backendClient';
import { DEFAULT_PROFILE_PICTURE } from '../../config';

@Component({
  tag: 'page-profile',
  styleUrl: 'page-profile.scss',
  shadow: true,
})
export class PageProfile {
  @Prop() peopleId: number;
  @State() isLoading: boolean = true;
  @State() people: models.People = null;

  private get client(): BackendClient {
    return BackendClient.GetInstance();
  }

  public async componentDidLoad() {
    this.people = await this.client.GetPeopleById(this.peopleId).finally(() => (this.isLoading = false));
  }

  public render() {
    return (
      <Fragment>
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderLoader()}
      </Fragment>
    );
  }

  private renderContent = () => {
    if (this.isLoading) {
      return;
    }

    return (
      <ion-content fullscreen class="ion-padding">
        <ion-card>
          <ion-card-header>
            {this.renderPicture()}
            <h1>{this.people?.name}</h1>
          </ion-card-header>

          <ion-card-content>
            <p>A little profile here</p>
          </ion-card-content>
        </ion-card>
      </ion-content>
    );
  };

  private renderPicture = () => {
    const pictureUrl = this.people?.pictureUrl || DEFAULT_PROFILE_PICTURE;

    return (
      <ion-avatar>
        <img alt={`Profile picture of ${this.people?.name}`} src={pictureUrl} />
      </ion-avatar>
    );
  };

  private renderHeader = () => {
    return (
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/tab/people"></ion-back-button>
          </ion-buttons>
          <ion-title>Profile: {this.people?.name ?? ''}</ion-title>
        </ion-toolbar>
      </ion-header>
    );
  };

  private renderLoader = () => {
    if (!this.isLoading) {
      return;
    }

    return <ion-skeleton-text animated />;
  };
}
