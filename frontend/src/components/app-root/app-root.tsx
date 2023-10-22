import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  // shadow: true,
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route-redirect from="/" to="/tab/home"></ion-route-redirect>
          <ion-route url="/tab" component="app-tabs">
            <ion-route url="/home" component="tab-home">
              <ion-route component="page-home"></ion-route>
            </ion-route>
            <ion-route url="/draw" component="tab-draw">
              <ion-route component="page-group-list"></ion-route>
            </ion-route>
            <ion-route url="/person" component="tab-person">
              <ion-route component="page-person-list"></ion-route>
            </ion-route>
          </ion-route>
          <ion-route url="/profile/:personId" component="page-profile"></ion-route>
          <ion-route url="/draw/:groupId" component="page-draw"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    );
  }
}
